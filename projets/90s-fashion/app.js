// =============================================================
// Supermodèles 90s — logique de l'application
// API utilisées :
//   - Wikipedia Action API  : portraits, résumés et articles complets (sans clé)
//   - Wikimedia Commons API : photothèque de chaque mannequin (sans clé)
//   - YouTube Data API v3   : vidéos de défilés, pubs, clips… (clé dans config.js)
// =============================================================

const wikiCache = {}; // id -> { image, extrait, url }
const articleCache = {}; // "lang:titre" -> sections

const $ = (sel, root = document) => root.querySelector(sel);

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

// Convertit du HTML ou des entités (&amp;, &#39;…) en texte brut
function texteBrut(str) {
  return new DOMParser().parseFromString(String(str ?? ""), "text/html").documentElement.textContent.trim();
}

// ---------- Cache local (protégé : peut être indisponible) ----------
function cacheGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw);
    if (Date.now() - t > CONFIG.CACHE_HEURES * 3600 * 1000) return null;
    return v;
  } catch { return null; }
}
function cacheSet(key, v) {
  try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), v })); } catch { /* ignoré */ }
}

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }
  return res.json();
}

function urlAvec(base, params) {
  const url = new URL(base);
  Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
  return url;
}

// ---------- API Wikipedia ----------
// Résout un titre demandé vers le titre final (normalisation + redirections)
function resolveTitles(query) {
  const map = {};
  (query.normalized || []).forEach((n) => (map[n.from] = n.to));
  (query.redirects || []).forEach((r) => (map[r.from] = r.to));
  return (title) => {
    let t = title.replace(/_/g, " ");
    t = map[t] || t;
    return map[t] || t;
  };
}

async function wikiQuery(lang, params) {
  const data = await getJson(urlAvec(`https://${lang}.wikipedia.org/w/api.php`,
    { action: "query", format: "json", origin: "*", redirects: 1, ...params }));
  const resolve = resolveTitles(data.query || {});
  const byTitle = {};
  Object.values(data.query?.pages || {}).forEach((p) => (byTitle[p.title] = p));
  return (title) => byTitle[resolve(title)];
}

async function chargerWikipedia() {
  const titres = MANNEQUINS.map((m) => m.wiki).join("|");
  const [imagesEn, textesFr] = await Promise.all([
    wikiQuery(CONFIG.WIKI_LANGUE_IMAGES, {
      prop: "pageimages", piprop: "thumbnail", pithumbsize: 800, pilimit: 50, titles: titres,
    }).catch(() => () => null),
    wikiQuery(CONFIG.WIKI_LANGUE_TEXTE, {
      prop: "extracts|pageimages", exintro: 1, explaintext: 1, exlimit: 20,
      piprop: "thumbnail", pithumbsize: 800, pilimit: 50, titles: titres,
    }).catch(() => () => null),
  ]);

  // Textes manquants en français → repli sur l'anglais
  const manquants = MANNEQUINS.filter((m) => !textesFr(m.wiki)?.extract);
  let textesEn = () => null;
  if (manquants.length) {
    textesEn = await wikiQuery("en", {
      prop: "extracts", exintro: 1, explaintext: 1, exlimit: 20,
      titles: manquants.map((m) => m.wiki).join("|"),
    }).catch(() => () => null);
  }

  MANNEQUINS.forEach((m) => {
    const img = imagesEn(m.wiki)?.thumbnail || textesFr(m.wiki)?.thumbnail;
    const fr = textesFr(m.wiki);
    const texte = fr?.extract ? fr : textesEn(m.wiki);
    const lang = fr?.extract ? CONFIG.WIKI_LANGUE_TEXTE : "en";
    wikiCache[m.id] = {
      // Une photo locale (champ « photo » dans data.js) a priorité sur Wikipedia
      image: m.photo || img?.source || null,
      extrait: texte?.extract || "",
      url: texte ? `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(texte.title.replace(/ /g, "_"))}` : null,
    };
  });
}

// Article Wikipedia complet, découpé en sections
const SECTIONS_EXCLUES = /^(références|notes( et références)?|liens externes|voir aussi|bibliographie|sources|references|notes|external links|see also|further reading|citations)$/i;

async function chargerArticle(m, lang) {
  const key = `${lang}:${m.wiki}`;
  if (articleCache[key]) return articleCache[key];
  const page = (await wikiQuery(lang, { prop: "extracts", explaintext: 1, titles: m.wiki }))(m.wiki);
  if (!page?.extract) throw new Error("Article introuvable");

  const sections = [{ niveau: 2, titre: lang === "fr" ? "Introduction" : "Introduction", lignes: [] }];
  page.extract.split("\n").forEach((ligne) => {
    const h = ligne.match(/^(={2,})\s*(.+?)\s*\1$/);
    if (h) sections.push({ niveau: h[1].length, titre: h[2], lignes: [] });
    else if (ligne.trim()) sections.at(-1).lignes.push(ligne.trim());
  });

  // Retire les sections de références (et leurs sous-sections)
  let exclusion = 0;
  const gardees = sections.filter((s) => {
    if (exclusion && s.niveau > exclusion) return false;
    exclusion = SECTIONS_EXCLUES.test(s.titre) ? s.niveau : 0;
    return !exclusion;
  });

  // Regroupe sous chaque section de niveau 2
  const groupes = [];
  gardees.forEach((s) => {
    if (s.niveau === 2 || !groupes.length) groupes.push({ ...s, sous: [] });
    else groupes.at(-1).sous.push(s);
  });
  const resultat = {
    titre: page.title,
    url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}`,
    mots: page.extract.split(/\s+/).length,
    groupes: groupes.filter((g) => g.lignes.length || g.sous.some((s) => s.lignes.length)),
  };
  articleCache[key] = resultat;
  return resultat;
}

// ---------- API Wikimedia Commons ----------
async function chercherPhotos(m, offset = 0) {
  const key = `commons:${m.wiki}:${offset}`;
  const cached = cacheGet(key);
  if (cached) return cached;
  const data = await getJson(urlAvec("https://commons.wikimedia.org/w/api.php", {
    action: "query", format: "json", origin: "*",
    generator: "search", gsrsearch: `filetype:bitmap "${m.nom}"`, gsrnamespace: 6,
    gsrlimit: 24, gsroffset: offset,
    prop: "imageinfo", iiprop: "url|extmetadata", iiurlwidth: 500, iiextmetadatafilter: "Artist|LicenseShortName|DateTimeOriginal|ImageDescription",
  }));
  const photos = Object.values(data.query?.pages || {})
    .sort((a, b) => a.index - b.index)
    .filter((p) => p.imageinfo?.[0]?.thumburl)
    .map((p) => {
      const info = p.imageinfo[0];
      const meta = info.extmetadata || {};
      return {
        miniature: info.thumburl,
        grande: info.responsiveUrls?.["2"] || info.url,
        page: info.descriptionurl,
        legende: texteBrut(meta.ImageDescription?.value) || p.title.replace(/^File:/, "").replace(/\.\w+$/, ""),
        auteur: texteBrut(meta.Artist?.value),
        licence: texteBrut(meta.LicenseShortName?.value),
        date: texteBrut(meta.DateTimeOriginal?.value).slice(0, 10),
      };
    });
  const resultat = { photos, suite: data.continue?.gsroffset ?? null };
  cacheSet(key, resultat);
  return resultat;
}

// ---------- API YouTube ----------
const ytLien = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
const liensYoutube = (requetes) => requetes
  .map((q) => `<a class="yt-link" href="${ytLien(q)}" target="_blank" rel="noopener">▶ ${escapeHtml(q)}</a>`).join("");

async function rechercherVideos(q, pageToken = null, max = CONFIG.VIDEOS_PAR_RECHERCHE) {
  const key = `yt:${q}:${pageToken || ""}:${max}`;
  const cached = cacheGet(key);
  if (cached) return cached;
  const data = await getJson(urlAvec("https://www.googleapis.com/youtube/v3/search", {
    part: "snippet", type: "video", videoEmbeddable: "true",
    maxResults: max, q, pageToken, key: CONFIG.YOUTUBE_API_KEY,
  }));
  const resultat = {
    videos: (data.items || []).map((it) => ({
      id: it.id.videoId,
      titre: texteBrut(it.snippet.title),
      chaine: texteBrut(it.snippet.channelTitle),
      miniature: it.snippet.thumbnails?.high?.url || it.snippet.thumbnails?.medium?.url,
    })),
    suite: data.nextPageToken || null,
  };
  cacheSet(key, resultat);
  return resultat;
}

const htmlVideo = (v) => `
  <div class="video">
    <button class="video-frame" data-id="${escapeHtml(v.id)}" data-cursor="Lire" aria-label="Lire : ${escapeHtml(v.titre)}">
      <img src="${escapeHtml(v.miniature)}" alt="" loading="lazy">
    </button>
    <div class="video-title">${escapeHtml(v.titre)}<small>${escapeHtml(v.chaine)}</small></div>
  </div>`;

// Vidéos de plusieurs recherches combinées (accueil, défilés mythiques)
async function afficherVideos(conteneur, recherches) {
  if (!CONFIG.YOUTUBE_API_KEY) { conteneur.innerHTML = liensYoutube(recherches); return; }
  conteneur.innerHTML = `<p class="loading">Chargement des vidéos…</p>`;
  try {
    const resultats = await Promise.all(recherches.map((q) => rechercherVideos(q)));
    const vues = new Set();
    const videos = resultats.flatMap((r) => r.videos).filter((v) => !vues.has(v.id) && vues.add(v.id));
    if (!videos.length) throw new Error("aucune vidéo trouvée");
    conteneur.innerHTML = `<div class="videos">${videos.map(htmlVideo).join("")}</div>`;
  } catch (e) {
    conteneur.innerHTML = `<p class="loading">Vidéos indisponibles (${escapeHtml(e.message)}).</p>` + liensYoutube(recherches);
  }
}

// Une recherche avec pagination « Plus de vidéos »
async function afficherVideosPaginees(conteneur, q) {
  if (!CONFIG.YOUTUBE_API_KEY) { conteneur.innerHTML = liensYoutube([q]); return; }
  conteneur.innerHTML = `<div class="videos"></div><p class="loading">Chargement des vidéos…</p>`;
  const grille = $(".videos", conteneur);
  const charger = async (token) => {
    try {
      const { videos, suite } = await rechercherVideos(q, token, 12);
      grille.insertAdjacentHTML("beforeend", videos.map(htmlVideo).join(""));
      $(".loading, .more", conteneur)?.remove();
      if (!grille.children.length) conteneur.insertAdjacentHTML("beforeend", `<p class="loading">Aucune vidéo trouvée.</p>${liensYoutube([q])}`);
      if (suite) {
        conteneur.insertAdjacentHTML("beforeend", `<button class="btn btn-outline more">Plus de vidéos</button>`);
        $(".more", conteneur).onclick = (e) => { e.target.textContent = "Chargement…"; charger(suite); };
      }
    } catch (e) {
      $(".loading, .more", conteneur)?.remove();
      conteneur.insertAdjacentHTML("beforeend", `<p class="loading">Vidéos indisponibles (${escapeHtml(e.message)}).</p>${liensYoutube([q])}`);
    }
  };
  charger(null);
}

// Lecteur intégré au clic (évite de charger des dizaines d'iframes d'un coup)
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".video-frame:not(.playing)");
  if (!btn) return;
  btn.classList.add("playing");
  btn.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(btn.dataset.id)}?autoplay=1"
    allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="Vidéo YouTube"></iframe>`;
});

// ---------- Page d'accueil ----------
let filtreGroupe = "Tous";

const initiales = (nom) => nom.split(" ").map((p) => p[0]).join("");

// Affiche typographique quand aucune photo libre de droits n'existe
const htmlPlaceholder = (m) => `
  <div class="placeholder">
    <span class="ph-initiales">${initiales(m.nom)}</span>
    <span class="ph-nom">${escapeHtml(m.nom)}</span>
    <span class="ph-note">Aucune photo libre de droits</span>
  </div>`;

function renderChips() {
  const groupes = ["Tous", ...new Set(MANNEQUINS.map((m) => m.groupe))];
  $("#chips").innerHTML = groupes
    .map((g) => `<button class="chip${g === filtreGroupe ? " active" : ""}" data-groupe="${escapeHtml(g)}">${escapeHtml(g)}</button>`)
    .join("");
}

// Minuscules sans accents : « alaia » trouve « Alaïa »
const normaliser = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function renderGrid() {
  const q = normaliser($("#search").value.trim());
  const liste = MANNEQUINS.filter((m) =>
    (filtreGroupe === "Tous" || m.groupe === filtreGroupe) &&
    (!q || normaliser([m.nom, m.pays, m.surnom, ...m.marques].join(" ")).includes(q))
  );
  $("#grid").innerHTML = liste.length
    ? liste.map((m) => {
        const img = wikiCache[m.id]?.image;
        const num = String(MANNEQUINS.indexOf(m) + 1).padStart(2, "0");
        return `
        <button class="card" data-id="${m.id}" data-cursor="Voir">
          <div class="card-img">
            ${img ? `<img src="${escapeHtml(img)}" alt="Portrait de ${escapeHtml(m.nom)}" loading="lazy">`
                  : htmlPlaceholder(m)}
            <span class="card-tag">${escapeHtml(m.groupe)}</span>
            <span class="card-num">${num}</span>
            <span class="card-cta">Lire la fiche →</span>
          </div>
          <h3>${escapeHtml(m.nom)}</h3>
          <p><span class="card-surnom">${escapeHtml(m.surnom)}</span> — ${escapeHtml(m.pays)}, ${m.naissance}</p>
        </button>`;
      }).join("")
    : `<p class="empty">Aucune mannequin ne correspond à cette recherche.</p>`;
}

const MAISONS = ["Gianni Versace", "Chanel", "Calvin Klein", "Gucci", "Prada", "Christian Dior", "Alexander McQueen",
  "Yves Saint Laurent", "Azzedine Alaïa", "Vivienne Westwood", "Valentino", "Dolce & Gabbana", "Helmut Lang",
  "Jean Paul Gaultier", "Thierry Mugler", "Isaac Mizrahi", "John Galliano"];

function renderHero() {
  const avecImage = MANNEQUINS.filter((m) => wikiCache[m.id]?.image);
  Anim.couverture(avecImage.slice(0, 8).map((m) => ({ image: wikiCache[m.id].image, nom: m.nom })));
  Anim.podium(MANNEQUINS.map((m, i) => ({
    image: wikiCache[m.id]?.image,
    nom: m.nom,
    initiales: initiales(m.nom),
    maison: m.marques[i % m.marques.length],
  })));
}

function renderTimeline() {
  $("#timeline").innerHTML = CHRONOLOGIE
    .map((c) => `<li><span class="year">${c.annee}</span><p>${escapeHtml(c.texte)}</p></li>`).join("");
}

function renderShows() {
  if (!CONFIG.YOUTUBE_API_KEY) {
    const notice = $("#api-notice");
    notice.hidden = false;
    notice.innerHTML = `Aucune clé YouTube configurée : les vidéos s'ouvrent sur YouTube. Pour les intégrer à la page,
      ajoutez une clé <strong>YouTube Data API v3</strong> dans <code>config.js</code>.`;
  }
  $("#shows").innerHTML = DEFILES.map((d, i) => `
    <article class="show">
      <div class="show-info">
        <div class="show-year">${d.annee}</div>
        <p class="show-num">Défilé n° ${String(i + 1).padStart(2, "0")}</p>
        <h3>${escapeHtml(d.titre)}</h3>
        <p>${escapeHtml(d.texte)}</p>
      </div>
      <div class="show-videos" data-index="${i}"></div>
    </article>`).join("");

  // Chargement des vidéos seulement quand la section devient visible
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      obs.unobserve(en.target);
      afficherVideos(en.target, [DEFILES[en.target.dataset.index].recherche]);
    });
  }, { rootMargin: "200px" });
  document.querySelectorAll(".show-videos").forEach((el) => obs.observe(el));
}

// ---------- Fiche mannequin ----------
let ficheCourante = null;
const ONGLETS = [
  ["apercu", "Aperçu"],
  ["carriere", "Carrière"],
  ["photos", "Photos"],
  ["videos", "Vidéos"],
];

function ouvrirFiche(id, onglet = "apercu") {
  const m = MANNEQUINS.find((x) => x.id === id);
  if (!m) return;
  ficheCourante = { m, photos: [], chargesOnglets: new Set() };
  const w = wikiCache[m.id] || {};

  $("#modal-body").innerHTML = `
    <header class="fiche-head">
      <div class="fiche-portrait">
        ${w.image ? `<img src="${escapeHtml(w.image)}" alt="Portrait de ${escapeHtml(m.nom)}">`
                  : htmlPlaceholder(m)}
        ${m.photo && m.photoCredit ? `<small class="credit">© ${escapeHtml(m.photoCredit)}</small>` : ""}
      </div>
      <div class="fiche-titre">
        <p class="nickname">« ${escapeHtml(m.surnom)} »</p>
        <h2>${escapeHtml(m.nom)}</h2>
        <dl class="facts">
          <div><dt>Pays</dt><dd>${escapeHtml(m.pays)}</dd></div>
          <div><dt>Naissance</dt><dd>${m.naissance}</dd></div>
          <div><dt>Génération</dt><dd>${escapeHtml(m.groupe)}</dd></div>
        </dl>
        <div class="tabs" role="tablist">
          ${ONGLETS.map(([k, label]) => `<button role="tab" class="tab" data-onglet="${k}" aria-selected="false">${label}</button>`).join("")}
        </div>
      </div>
    </header>
    ${ONGLETS.map(([k]) => `<section class="panel" id="panel-${k}" role="tabpanel" hidden></section>`).join("")}`;

  const modal = $("#modal");
  if (!modal.open) modal.showModal();
  modal.scrollTop = 0;
  history.replaceState(null, "", `#${m.id}`);
  changerOnglet(onglet);
}

function changerOnglet(onglet) {
  const { m, chargesOnglets } = ficheCourante;
  document.querySelectorAll("#modal .tab").forEach((t) => t.setAttribute("aria-selected", t.dataset.onglet === onglet));
  document.querySelectorAll("#modal .panel").forEach((p) => (p.hidden = p.id !== `panel-${onglet}`));
  requestAnimationFrame(() => Anim.soulignerOnglet($("#modal .tabs")));
  if (chargesOnglets.has(onglet)) return;
  chargesOnglets.add(onglet);
  const panel = $(`#panel-${onglet}`);
  ({ apercu: renderApercu, carriere: renderCarriere, photos: renderPhotos, videos: renderVideosFiche })[onglet](m, panel);
}

function renderApercu(m, panel) {
  const w = wikiCache[m.id] || {};
  const extrait = w.extrait ? w.extrait.split("\n").filter(Boolean).slice(0, 2).join(" ") : "";
  panel.innerHTML = `
    <div class="apercu">
      <div>
        <p class="resume">${escapeHtml(m.resume)}</p>
        ${extrait ? `<div class="wiki-extract"><h4>Selon Wikipedia</h4><p>${escapeHtml(extrait)}</p></div>` : ""}
        <h4>Moments marquants des années 90</h4>
        <ul class="moments">${m.moments.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
      </div>
      <aside>
        <h4>Maisons et marques</h4>
        <div class="brands">${m.marques.map((x) => `<span>${escapeHtml(x)}</span>`).join("")}</div>
        <h4>Explorer</h4>
        <div class="explore">
          <button class="btn btn-outline" data-goto="carriere">Toute sa carrière →</button>
          <button class="btn btn-outline" data-goto="photos">Photothèque →</button>
          <button class="btn btn-outline" data-goto="videos">Défilés en vidéo →</button>
        </div>
      </aside>
    </div>
    <h4>À la une en vidéo</h4>
    <div class="apercu-videos"></div>`;
  afficherVideos($(".apercu-videos", panel), m.recherches.slice(0, 1));
}

function renderCarriere(m, panel) {
  const c = CARRIERES[m.id] || {};
  const blocs = Object.entries(CATEGORIES_CARRIERE)
    .filter(([k]) => c[k]?.length)
    .map(([k, label]) => `
      <div class="carriere-bloc">
        <h4>${label}</h4>
        <ul>${c[k].map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
      </div>`).join("");

  panel.innerHTML = `
    <h3 class="panel-title">Réalisations des années 90</h3>
    <div class="carriere-grid">${blocs || `<p class="loading">Aucune donnée.</p>`}</div>
    <div class="article-head">
      <h3 class="panel-title">Biographie complète</h3>
      <div class="lang-switch" role="group" aria-label="Langue de l'article">
        <button class="chip active" data-lang="fr">Français</button>
        <button class="chip" data-lang="en">English</button>
      </div>
    </div>
    <div class="article"></div>`;

  const conteneur = $(".article", panel);
  let demande = 0;
  const afficher = async (lang) => {
    const numero = ++demande;
    panel.querySelectorAll("[data-lang]").forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    conteneur.innerHTML = `<p class="loading">Chargement de l'article Wikipedia…</p>`;
    try {
      const a = await chargerArticle(m, lang);
      // Une autre langue a été demandée entre-temps
      if (numero !== demande) return;
      const motsCles = /carri|career|défil|mannequin|model|filmo|clip|vid[eé]o|télévision|television|distinction|récompense|award|recognition/i;
      conteneur.innerHTML = `
        <p class="article-meta">Source : <a href="${escapeHtml(a.url)}" target="_blank" rel="noopener">Wikipedia — ${escapeHtml(a.titre)}</a>
          · ${a.mots.toLocaleString("fr-CA")} mots · texte sous licence CC BY-SA</p>
        ${a.groupes.map((g, i) => `
          <details ${i === 0 || motsCles.test(g.titre) ? "open" : ""}>
            <summary>${escapeHtml(g.titre)}</summary>
            ${g.lignes.map((l) => `<p>${escapeHtml(l)}</p>`).join("")}
            ${g.sous.map((s) => `
              <h${Math.min(s.niveau + 2, 6)} class="sub">${escapeHtml(s.titre)}</h${Math.min(s.niveau + 2, 6)}>
              ${s.lignes.map((l) => `<p>${escapeHtml(l)}</p>`).join("")}`).join("")}
          </details>`).join("")}`;
      // Suggère l'anglais quand l'article français est beaucoup plus court
      if (lang === "fr") {
        chargerArticle(m, "en").then((en) => {
          if (en.mots > a.mots * 1.5 && conteneur.isConnected && $("[data-lang=fr].active", panel)) {
            conteneur.insertAdjacentHTML("afterbegin",
              `<p class="notice">La version anglaise de l'article est plus détaillée (${en.mots.toLocaleString("fr-CA")} mots).
               <button class="link-btn" data-lang="en">Lire en anglais</button></p>`);
          }
        }).catch(() => {});
      }
    } catch (e) {
      if (numero !== demande) return;
      conteneur.innerHTML = `<p class="loading">Article indisponible dans cette langue (${escapeHtml(e.message)}).</p>`;
    }
  };
  panel.addEventListener("click", (e) => {
    const b = e.target.closest("[data-lang]");
    if (b) afficher(b.dataset.lang);
  });
  afficher(CONFIG.WIKI_LANGUE_TEXTE);
}

function renderPhotos(m, panel) {
  panel.innerHTML = `
    <h3 class="panel-title">Photothèque</h3>
    <p class="panel-intro">Photos libres de droits issues de Wikimedia Commons. La plupart des photos de défilés des années 90
      sont protégées par le droit d'auteur : ce sont surtout les <a href="#" data-goto="videos">vidéos</a> qui montrent cette époque.
      Cliquez sur une photo pour l'agrandir.</p>
    <div class="gallery"></div>
    <div class="gallery-more"></div>`;
  const grille = $(".gallery", panel);
  const plus = $(".gallery-more", panel);
  const fiche = ficheCourante;

  const charger = async (offset) => {
    plus.innerHTML = `<p class="loading">Chargement des photos…</p>`;
    try {
      const { photos, suite } = await chercherPhotos(m, offset);
      // La fiche a été fermée ou remplacée pendant le chargement
      if (fiche !== ficheCourante) return;
      const debut = fiche.photos.length;
      fiche.photos.push(...photos);
      grille.insertAdjacentHTML("beforeend", photos.map((p, i) => `
        <button class="gallery-item" data-photo="${debut + i}" style="--n:${i}" title="${escapeHtml(p.legende)}">
          <img src="${escapeHtml(p.miniature)}" alt="${escapeHtml(p.legende)}" loading="lazy">
          ${p.date ? `<span>${escapeHtml(p.date.slice(0, 4))}</span>` : ""}
        </button>`).join(""));
      if (!fiche.photos.length) {
        const w = wikiCache[m.id] || {};
        plus.innerHTML = `<p class="loading">Aucune photo libre de droits sur Wikimedia Commons pour ${escapeHtml(m.nom)}.</p>
          <a class="yt-link" href="https://www.google.com/search?tbm=isch&q=${encodeURIComponent(m.nom + " 90s runway")}" target="_blank" rel="noopener">Rechercher des photos sur Google Images →</a>
          ${w.url ? `<a class="yt-link" href="${escapeHtml(w.url)}" target="_blank" rel="noopener">Article Wikipedia →</a>` : ""}`;
        return;
      }
      plus.innerHTML = suite != null ? `<button class="btn btn-outline">Plus de photos</button>` : "";
      if (suite != null) $("button", plus).onclick = () => charger(suite);
    } catch (e) {
      plus.innerHTML = `<p class="loading">Photos indisponibles (${escapeHtml(e.message)}).</p>`;
    }
  };
  grille.addEventListener("click", (e) => {
    const item = e.target.closest(".gallery-item");
    if (item) ouvrirLightbox(Number(item.dataset.photo));
  });
  charger(0);
}

function categoriesVideo(m) {
  const n = m.nom.normalize("NFD").replace(/[̀-ͯ]/g, "");
  return [
    { id: "une", label: "À la une", requetes: m.recherches },
    {
      id: "defiles", label: "Fashion weeks",
      filtres: [
        { label: "Tous les défilés", q: `${n} runway 90s fashion show` },
        ...m.marques.map((b) => ({ label: b, q: `${n} ${b} runway 90s` })),
        { label: "Compilation", q: `${n} best runway moments compilation` },
      ],
    },
    { id: "pubs", label: "Campagnes et pubs", q: `${n} commercial 90s` },
    { id: "clips", label: "Clips et télé", q: `${n} music video 90s` },
    { id: "entrevues", label: "Entrevues", q: `${n} interview 90s` },
    { id: "docs", label: "Documentaires", q: `${n} supermodel documentary` },
  ];
}

function renderVideosFiche(m, panel) {
  const cats = categoriesVideo(m);
  panel.innerHTML = `
    <h3 class="panel-title">Vidéothèque</h3>
    ${CONFIG.YOUTUBE_API_KEY ? "" : `<p class="notice">Aucune clé YouTube configurée : chaque catégorie ouvre une recherche sur YouTube.
      Ajoutez une clé dans <code>config.js</code> pour lire les vidéos directement ici.</p>`}
    <div class="chips video-cats">${cats.map((c, i) => `<button class="chip${i === 0 ? " active" : ""}" data-cat="${c.id}">${escapeHtml(c.label)}</button>`).join("")}</div>
    <div class="video-filtres"></div>
    <div class="video-zone"></div>`;
  const zone = $(".video-zone", panel);
  const filtres = $(".video-filtres", panel);

  const afficherCat = (cat) => {
    panel.querySelectorAll("[data-cat]").forEach((b) => b.classList.toggle("active", b.dataset.cat === cat.id));
    filtres.innerHTML = "";
    if (cat.requetes) return afficherVideos(zone, cat.requetes);
    if (cat.q) return afficherVideosPaginees(zone, cat.q);
    filtres.innerHTML = cat.filtres.map((f, i) =>
      `<button class="chip chip-small${i === 0 ? " active" : ""}" data-filtre="${i}">${escapeHtml(f.label)}</button>`).join("");
    filtres.onclick = (e) => {
      const b = e.target.closest("[data-filtre]");
      if (!b) return;
      filtres.querySelectorAll("[data-filtre]").forEach((x) => x.classList.toggle("active", x === b));
      afficherVideosPaginees(zone, cat.filtres[b.dataset.filtre].q);
    };
    afficherVideosPaginees(zone, cat.filtres[0].q);
  };
  $(".video-cats", panel).addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]");
    if (b) afficherCat(cats.find((c) => c.id === b.dataset.cat));
  });
  afficherCat(cats[0]);
}

// ---------- Visionneuse photo ----------
let photoCourante = 0;

function ouvrirLightbox(index) {
  const photos = ficheCourante?.photos || [];
  if (!photos.length) return;
  photoCourante = (index + photos.length) % photos.length;
  const p = photos[photoCourante];
  $("#lightbox-body").innerHTML = `
    <img src="${escapeHtml(p.grande)}" alt="${escapeHtml(p.legende)}">
    <figcaption>
      <strong>${escapeHtml(p.legende.slice(0, 200))}</strong>
      <span>${[p.date, p.auteur && `© ${p.auteur.slice(0, 80)}`, p.licence].filter(Boolean).map(escapeHtml).join(" · ")}</span>
      <a href="${escapeHtml(p.page)}" target="_blank" rel="noopener">Voir sur Wikimedia Commons</a>
      <span class="counter">${photoCourante + 1} / ${photos.length}</span>
    </figcaption>`;
  const lb = $("#lightbox");
  if (!lb.open) lb.showModal();
}

// ---------- Événements ----------
$("#grid").addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (card) ouvrirFiche(card.dataset.id);
});
$("#chips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  filtreGroupe = chip.dataset.groupe;
  renderChips();
  renderGrid();
});
$("#search").addEventListener("input", renderGrid);

const modal = $("#modal");
modal.addEventListener("click", (e) => {
  if (e.target === modal || e.target.closest("#modal-close")) return modal.close();
  const tab = e.target.closest(".tab");
  if (tab) return changerOnglet(tab.dataset.onglet);
  const goto = e.target.closest("[data-goto]");
  if (goto) { e.preventDefault(); changerOnglet(goto.dataset.goto); modal.scrollTop = 0; }
});
// Arrête les vidéos en cours à la fermeture
modal.addEventListener("close", () => {
  $("#modal-body").innerHTML = "";
  ficheCourante = null;
  history.replaceState(null, "", location.pathname + location.search);
});

const lightbox = $("#lightbox");
lightbox.addEventListener("click", (e) => {
  if (e.target.closest("#lb-prev")) return ouvrirLightbox(photoCourante - 1);
  if (e.target.closest("#lb-next")) return ouvrirLightbox(photoCourante + 1);
  // La visionneuse occupe tout l'écran : un clic sur la zone vide autour de la photo la ferme
  if (e.target === lightbox || e.target.id === "lightbox-body" || e.target.closest("#lb-close")) lightbox.close();
});
document.addEventListener("keydown", (e) => {
  if (!lightbox.open) return;
  if (e.key === "ArrowLeft") ouvrirLightbox(photoCourante - 1);
  if (e.key === "ArrowRight") ouvrirLightbox(photoCourante + 1);
});

// ---------- Démarrage ----------
Anim.bandeau(MAISONS);
renderChips();
renderGrid();
renderTimeline();
renderShows();
chargerWikipedia()
  .catch((e) => console.error("Wikipedia :", e))
  .finally(() => {
    renderGrid();
    renderHero();
    // Lien direct vers une fiche : index.html#naomi
    const id = location.hash.slice(1);
    if (MANNEQUINS.some((m) => m.id === id)) ouvrirFiche(id);
  });
