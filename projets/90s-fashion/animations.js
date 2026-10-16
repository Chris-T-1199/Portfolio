// =============================================================
// SUPER 90s — animations
//   Ouverture (rideau), couverture animée, podium avec flashs,
//   ruban à mesurer, apparitions au défilement, curseur, bandeau.
// =============================================================
const Anim = (() => {
  const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const hasard = (min, max) => min + Math.random() * (max - min);
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // ---------- Découpage du texte ----------
  // Lettres : préserve les balises internes (ex. <em>90s</em>)
  function decouperLettres(el) {
    let i = 0;
    const parcourir = (noeud) => {
      [...noeud.childNodes].forEach((n) => {
        if (n.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          [...n.textContent].forEach((c) => {
            if (c === " ") { frag.append(" "); return; }
            const s = document.createElement("span");
            s.className = "ch";
            s.style.setProperty("--i", i++);
            s.textContent = c;
            frag.append(s);
          });
          n.replaceWith(frag);
        } else parcourir(n);
      });
    };
    el.setAttribute("aria-label", el.textContent);
    parcourir(el);
  }

  function decouperMots(el) {
    const mots = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = mots
      .map((m, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${esc(m)}</span></span>`)
      .join(" ");
  }

  // ---------- Apparitions au défilement ----------
  const CIBLES = "[data-reveal], [data-split-words], .card, .timeline li, .show, .stitch";
  const observateur = new IntersectionObserver((entries) => {
    let rang = 0;
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      // Décalage en cascade pour les éléments qui apparaissent ensemble
      if (!el.style.getPropertyValue("--delay")) el.style.setProperty("--delay", `${Math.min(rang++, 6) * 0.09}s`);
      el.classList.add("in");
      observateur.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  function observer(racine = document) {
    if (racine.matches?.(CIBLES)) brancher(racine);
    $$(CIBLES, racine).forEach(brancher);
  }
  function brancher(el) {
    if (el.dataset.observe) return;
    el.dataset.observe = "1";
    if (reduit) el.classList.add("in");
    else observateur.observe(el);
  }
  // Observe automatiquement le contenu ajouté par app.js
  new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => n.nodeType === 1 && observer(n))))
    .observe(document.body, { childList: true, subtree: true });

  // ---------- Ouverture : rideau du défilé ----------
  function intro() {
    const el = $("#intro");
    const finir = () => {
      document.body.classList.remove("is-loading");
      document.body.classList.add("ready");
    };
    if (reduit || !el) { el?.classList.add("done"); finir(); return; }
    let fini = false;
    const ouvrir = () => {
      if (fini) return;
      fini = true;
      el.classList.add("flash");
      setTimeout(() => { el.classList.add("open"); finir(); }, 140);
      setTimeout(() => el.classList.add("done"), 1700);
    };
    setTimeout(ouvrir, 1500);
    // Un clic ou une touche permet de passer l'intro
    ["click", "keydown", "wheel", "touchstart"].forEach((ev) => window.addEventListener(ev, ouvrir, { once: true, passive: true }));
  }

  // ---------- Ruban à mesurer + en-tête ----------
  function defilement() {
    const fill = $("#tape-fill"), cm = $("#tape-cm"), header = $("#site-header");
    const mast = $(".masthead"), photo = $(".cover-photos");
    let attente = false;
    const maj = () => {
      attente = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, scrollY / max) : 0;
      fill.style.width = `${p * 100}%`;
      cm.textContent = `${Math.round(p * 150)} cm`; // ruban de couturière : 150 cm
      header.classList.toggle("scrolled", scrollY > (mast?.offsetHeight || 200));
      if (!reduit && scrollY < innerHeight * 1.2) {
        if (mast) mast.style.transform = `translateY(${scrollY * 0.25}px)`;
        if (photo) photo.style.transform = `translateY(${scrollY * -0.08}px)`;
      }
    };
    addEventListener("scroll", () => { if (!attente) { attente = true; requestAnimationFrame(maj); } }, { passive: true });
    addEventListener("resize", maj);
    maj();
  }

  // ---------- Curseur personnalisé ----------
  function curseur() {
    const c = $("#cursor");
    if (!c || reduit || !matchMedia("(pointer: fine)").matches) return;
    const label = $("span", c);
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; c.classList.add("on"); }, { passive: true });
    const boucle = () => {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      c.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(boucle);
    };
    boucle();
    document.addEventListener("mouseover", (e) => {
      const cible = e.target.closest("[data-cursor]");
      c.classList.toggle("big", !!cible);
      if (cible) label.textContent = cible.dataset.cursor;
    });
    // Le curseur suit aussi dans les fenêtres modales (couche supérieure)
    document.addEventListener("mouseleave", () => c.classList.remove("on"));
  }

  // ---------- Bandeau des maisons ----------
  function bandeau(maisons) {
    const track = $("#marquee");
    if (!track) return;
    const html = maisons.map((m) => `<span>${esc(m)}</span><span class="sep">✦</span>`).join("");
    track.innerHTML = html + html; // doublé pour une boucle sans couture
  }

  // ---------- Couverture animée ----------
  function couverture(items) {
    const zone = $("#cover-photos"), nom = $("#cover-name"), dots = $("#cover-dots");
    if (!zone || !items.length) return;
    zone.innerHTML = items.map((it, i) => `<img src="${esc(it.image)}" alt="${esc(it.nom)} en couverture">`).join("");
    dots.innerHTML = items.map(() => "<i></i>").join("");
    const imgs = $$("img", zone), points = $$("i", dots);
    let i = 0;
    const montrer = (k) => {
      imgs.forEach((im, j) => im.classList.toggle("active", j === k));
      points.forEach((p, j) => p.classList.toggle("on", j === k));
      nom.classList.add("swap");
      setTimeout(() => { nom.textContent = items[k].nom; nom.classList.remove("swap"); }, 450);
      // Flash d'appareil photo à chaque nouvelle couverture
      zone.classList.remove("flash"); void zone.offsetWidth; zone.classList.add("flash");
    };
    montrer(0);
    if (!reduit) setInterval(() => { i = (i + 1) % items.length; montrer(i); }, 4800);
  }

  // ---------- Podium : défilé en perspective + paparazzis ----------
  function podium(items) {
    const zone = $("#runway-models"), runway = $("#runway");
    if (!zone || !items.length) return;
    const DUREE = 9, SLOTS = 3;
    const caption = $(".podium-caption"), nom = $("#runway-name"), maison = $("#runway-house");
    let pointeur = 0;
    const suivant = () => items[pointeur++ % items.length];

    const remplir = (slot, it) => {
      slot._item = it;
      $(".rw-body", slot).innerHTML = it.image
        ? `<img src="${esc(it.image)}" alt="">`
        : `<div class="placeholder"><span class="ph-initiales">${esc(it.initiales)}</span><span class="ph-nom">${esc(it.nom)}</span></div>`;
    };
    const legende = (slot) => {
      const it = slot._item;
      caption.classList.add("swap");
      setTimeout(() => {
        nom.textContent = it.nom;
        maison.textContent = it.maison ? `pour ${it.maison}` : "";
        caption.classList.remove("swap");
      }, 300);
    };

    const slots = Array.from({ length: SLOTS }, (_, k) => {
      const s = document.createElement("div");
      s.className = "rw-model";
      s.innerHTML = `<div class="rw-body"></div>`;
      // Décalage négatif : les mannequins sont déjà en marche au chargement
      s.style.setProperty("--walk", `${DUREE}s`);
      s.style.setProperty("--delay", `${-k * (DUREE / SLOTS)}s`);
      remplir(s, suivant());
      zone.append(s);
      if (!reduit) {
        // Arrivée au bout du podium (78 % du cycle) → mise à jour de la légende
        const phase = (k * DUREE / SLOTS) % DUREE;
        const avantFront = ((0.78 * DUREE - phase) + DUREE) % DUREE;
        setTimeout(() => legende(s), avantFront * 1000);
        s.addEventListener("animationiteration", (e) => {
          if (e.target !== s) return;
          remplir(s, suivant());
          setTimeout(() => legende(s), 0.78 * DUREE * 1000);
        });
      }
      return s;
    });
    legende(slots[SLOTS - 1]);

    // Flashs des photographes, seulement quand le podium est visible
    if (reduit) return;
    const flashes = $("#flashes");
    let visible = false;
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0.2 }).observe(runway);
    const crepiter = () => {
      if (visible && document.visibilityState === "visible") {
        const rafale = Math.random() < 0.25 ? 3 : 1;
        for (let n = 0; n < rafale; n++) {
          setTimeout(() => {
            const f = document.createElement("span");
            f.className = "flash-pop";
            const gauche = Math.random() < 0.5;
            f.style.left = `${gauche ? hasard(3, 30) : hasard(70, 97)}%`;
            f.style.top = `${hasard(35, 95)}%`;
            f.style.scale = hasard(0.5, 1.3).toFixed(2);
            f.addEventListener("animationend", () => f.remove());
            flashes.append(f);
          }, n * 90);
        }
      }
      setTimeout(crepiter, hasard(140, 700));
    };
    crepiter();
  }

  // ---------- Chronologie : glisser pour défiler ----------
  function glisser(el) {
    if (!el) return;
    let depart = null;
    el.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      depart = { x: e.clientX, s: el.scrollLeft };
      el.classList.add("dragging");
    });
    addEventListener("pointermove", (e) => { if (depart) el.scrollLeft = depart.s - (e.clientX - depart.x); });
    addEventListener("pointerup", () => { depart = null; el.classList.remove("dragging"); });
  }

  // ---------- Onglets : soulignement glissant ----------
  function soulignerOnglet(tabs) {
    if (!tabs) return;
    let ink = $(".tab-ink", tabs);
    if (!ink) { ink = document.createElement("span"); ink.className = "tab-ink"; tabs.append(ink); }
    const actif = $('.tab[aria-selected="true"]', tabs);
    if (!actif) return;
    ink.style.width = `${actif.offsetWidth}px`;
    ink.style.transform = `translateX(${actif.offsetLeft}px)`;
  }

  // ---------- Titres pleine largeur ----------
  // Ajuste la taille du titre pour qu'il occupe exactement la largeur disponible
  function ajusterTitres() {
    $$(".masthead, .footer-mast").forEach((el) => {
      el.style.fontSize = "";
      const taille = parseFloat(getComputedStyle(el).fontSize);
      const plage = document.createRange();
      plage.selectNodeContents(el);
      const largeurTexte = plage.getBoundingClientRect().width;
      if (largeurTexte) el.style.fontSize = `${Math.min(taille * (el.clientWidth / largeurTexte) * 0.985, 360)}px`;
    });
  }

  // ---------- Démarrage ----------
  ajusterTitres();
  document.fonts?.ready.then(ajusterTitres);
  addEventListener("resize", ajusterTitres);
  $$("[data-split-chars]").forEach(decouperLettres);
  $$("[data-split-words]").forEach(decouperMots);
  observer();
  intro();
  defilement();
  curseur();
  glisser($(".timeline-wrap"));

  return { bandeau, couverture, podium, soulignerOnglet, reduit };
})();
