const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

// Menu mobile
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen);
});

navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", false);
    });
});

// En-tête, barre de progression et bouton retour en haut
const header = document.querySelector(".site-header");
const progress = document.querySelector(".scroll-progress");
const backToTop = document.querySelector(".back-to-top");

function onScroll() {
    const scrolled = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrolled / max : 0})`;
    header.classList.toggle("scrolled", scrolled > 20);
    backToTop.classList.toggle("show", scrolled > 600);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Lien actif dans le menu selon la section visible
const sectionLinks = document.querySelectorAll(".nav-links a:not(.btn)");
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            sectionLinks.forEach((link) => {
                link.classList.toggle("current", link.getAttribute("href") === `#${entry.target.id}`);
            });
        }
    });
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));

// Texte qui s'écrit tout seul
const typed = document.querySelector(".typed");
if (typed && !reduceMotion) {
    const words = JSON.parse(typed.dataset.words);
    let wordIndex = 0;
    let charIndex = words[0].length;
    let deleting = true;

    function type() {
        const word = words[wordIndex];
        charIndex += deleting ? -1 : 1;
        typed.textContent = word.slice(0, charIndex);

        let delay = deleting ? 45 : 90;
        if (!deleting && charIndex === word.length) {
            deleting = true;
            delay = 2000;
        } else if (deleting && charIndex === 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            delay = 400;
        }
        setTimeout(type, delay);
    }
    setTimeout(type, 2500);
}

// Filtres des projets avec pastille animée
const filterGroup = document.querySelector(".filters");
const filters = document.querySelectorAll(".filter");
const projects = document.querySelectorAll(".project-card");
const pill = document.createElement("span");
pill.className = "filter-pill";
filterGroup.prepend(pill);

function movePill(button) {
    pill.style.width = `${button.offsetWidth}px`;
    pill.style.transform = `translateX(${button.offsetLeft}px)`;
}

filters.forEach((button) => {
    button.addEventListener("click", () => {
        filters.forEach((b) => b.classList.remove("active"));
        button.classList.add("active");
        movePill(button);

        const category = button.dataset.filter;
        projects.forEach((card) => {
            const matches = category === "all" || card.dataset.category === category;
            if (matches) {
                card.classList.remove("hidden");
                requestAnimationFrame(() => card.classList.remove("hiding"));
            } else {
                card.classList.add("hiding");
                setTimeout(() => {
                    if (card.classList.contains("hiding")) card.classList.add("hidden");
                }, 350);
            }
        });
    });
});

const activeFilter = document.querySelector(".filter.active");
movePill(activeFilter);
window.addEventListener("resize", () => movePill(document.querySelector(".filter.active")));
document.fonts?.ready.then(() => movePill(document.querySelector(".filter.active")));

// Apparition des éléments au défilement
const revealItems = document.querySelectorAll(".section-title, .section-lead, .about-text, .skills, .project-card, .timeline-heading, .contact");
revealItems.forEach((item) => item.classList.add("reveal"));

projects.forEach((card, i) => {
    card.style.transitionDelay = `${(i % 3) * 0.12}s`;
    // Une fois apparue, la carte réagit vite à l'inclinaison
    card.addEventListener("transitionend", (e) => {
        if (e.propertyName === "transform" && card.classList.contains("visible")) {
            card.classList.remove("reveal");
            card.style.transitionDelay = "";
        }
    });
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

revealItems.forEach((item) => revealObserver.observe(item));
document.querySelectorAll(".timeline").forEach((item) => revealObserver.observe(item));

// Compteurs animés
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.target);
        const duration = 1600;
        const start = performance.now();

        function tick(now) {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(target * eased);
            if (t < 1) requestAnimationFrame(tick);
        }
        reduceMotion ? (el.textContent = target) : requestAnimationFrame(tick);
        counterObserver.unobserve(el);
    });
}, { threshold: 0.6 });
document.querySelectorAll(".counter").forEach((el) => counterObserver.observe(el));

// Effets à la souris (ordinateur seulement)
if (finePointer && !reduceMotion) {
    // Halo qui suit le curseur
    const glow = document.querySelector(".cursor-glow");
    window.addEventListener("mousemove", (e) => {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
        glow.classList.add("active");
    });
    document.addEventListener("mouseleave", () => glow.classList.remove("active"));

    // Inclinaison 3D des cartes de projet + lueur
    projects.forEach((card) => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            card.style.setProperty("--mx", `${x * 100}%`);
            card.style.setProperty("--my", `${y * 100}%`);
            card.style.transform = `rotateX(${(0.5 - y) * 10}deg) rotateY(${(x - 0.5) * 10}deg) translateY(-6px)`;
        });
        card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });

    // Inclinaison 3D de la photo
    const photo = document.querySelector(".photo-tilt");
    const hero = document.querySelector(".hero");
    hero.addEventListener("mousemove", (e) => {
        const rect = photo.getBoundingClientRect();
        const x = (e.clientX - (rect.left + rect.width / 2)) / window.innerWidth;
        const y = (e.clientY - (rect.top + rect.height / 2)) / window.innerHeight;
        photo.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 18}deg)`;
    });
    hero.addEventListener("mouseleave", () => { photo.style.transform = ""; });

    // Boutons magnétiques
    document.querySelectorAll(".magnetic").forEach((btn) => {
        btn.addEventListener("mousemove", (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);
            btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
        });
        btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });
}

// Année du pied de page
document.getElementById("year").textContent = new Date().getFullYear();
