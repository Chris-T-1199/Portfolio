// ==========================================================
// Animations et interactions — Boréale Média & Associés
// ==========================================================

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// ----------------------------------------------------------
// 1. Titre principal découpé en mots (apparition mot par mot)
// ----------------------------------------------------------
const heroTitle = document.querySelector('.hero h1, .contact-copy h1');

if (heroTitle) {
  const text = heroTitle.textContent.trim();
  heroTitle.setAttribute('aria-label', text);
  heroTitle.textContent = '';

  text.split(/\s+/).forEach((word, index) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.setAttribute('aria-hidden', 'true');
    span.style.setProperty('--i', index);
    span.textContent = word;
    heroTitle.append(span, ' ');
  });
}

// ----------------------------------------------------------
// 2. Apparition au défilement, en cascade
// ----------------------------------------------------------
document.querySelectorAll('.reveal').forEach((element) => {
  const siblings = Array.from(element.parentElement.children)
    .filter((child) => child.classList.contains('reveal'));
  element.style.setProperty('--delay', `${siblings.indexOf(element) * 0.12}s`);
});

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.16,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.reveal').forEach((element) => {
  revealObserver.observe(element);
});

// ----------------------------------------------------------
// 3. Défilement : en-tête compact, barre de progression,
//    parallaxe du hero et bouton « retour en haut »
// ----------------------------------------------------------
const header = document.querySelector('header');
const progressBar = document.querySelector('.scroll-progress');
const heroBg = document.querySelector('.hero-bg');
const heroContent = document.querySelector('.hero-content');
const backToTop = document.querySelector('.back-to-top');
let ticking = false;

function onScroll() {
  const scrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  header.classList.toggle('scrolled', scrollY > 40);

  if (progressBar) {
    progressBar.style.transform = `scaleX(${maxScroll > 0 ? scrollY / maxScroll : 0})`;
  }

  if (backToTop) {
    backToTop.classList.toggle('is-shown', scrollY > window.innerHeight * 0.8);
  }

  if (!reduceMotion && heroBg && scrollY < window.innerHeight * 1.2) {
    heroBg.style.translate = `0 ${scrollY * 0.35}px`;
    heroContent.style.translate = `0 ${scrollY * 0.12}px`;
    heroContent.style.opacity = Math.max(1 - scrollY / 600, 0);
  }

  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(onScroll);
    ticking = true;
  }
}, { passive: true });

onScroll();

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}

// ----------------------------------------------------------
// 4. Lien de navigation actif selon la section visible
// ----------------------------------------------------------
const navLinks = document.querySelectorAll('nav a');

navLinks.forEach((link) => {
  if (link.pathname === window.location.pathname && !link.hash) {
    link.classList.add('active');
  }
});

const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.hash === `#${entry.target.id}`);
      });
    }
  });
}, {
  rootMargin: '-45% 0px -50% 0px'
});

document.querySelectorAll('main [id]').forEach((section) => {
  spyObserver.observe(section);
});

// ----------------------------------------------------------
// 5. Effets qui suivent la souris (écrans avec souris seulement)
// ----------------------------------------------------------
if (finePointer && !reduceMotion) {
  // Cartes inclinées en 3D + halo lumineux sous le curseur
  document.querySelectorAll('.carte-service, .team-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.style.setProperty('--rx', `${(0.5 - y) * 10}deg`);
      card.style.setProperty('--ry', `${(x - 0.5) * 10}deg`);
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });

  // Halo lumineux qui suit la souris dans le hero
  const hero = document.querySelector('.hero');

  if (hero) {
    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      hero.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
  }

  // Bouton « magnétique » attiré par le curseur
  document.querySelectorAll('.btn').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.translate = `${x * 0.25}px ${y * 0.35}px`;
    });

    button.addEventListener('pointerleave', () => {
      button.style.translate = '0 0';
    });
  });
}

// ----------------------------------------------------------
// 6. Effet d'onde au clic sur les boutons
// ----------------------------------------------------------
document.querySelectorAll('.btn, form button').forEach((button) => {
  button.addEventListener('click', (event) => {
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');

    ripple.className = 'ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

    button.append(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});

// ----------------------------------------------------------
// 7. Formulaire de l'accueil : animation de confirmation
//    (il n'a pas encore de destination réelle)
// ----------------------------------------------------------
const homeForm = document.querySelector('.contact form');

if (homeForm) {
  homeForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = homeForm.querySelector('button');

    button.disabled = true;
    button.textContent = 'Envoi en cours…';

    setTimeout(() => {
      homeForm.classList.add('is-sent');
      button.textContent = 'Message envoyé ✓';
      homeForm.reset();

      setTimeout(() => {
        homeForm.classList.remove('is-sent');
        button.disabled = false;
        button.textContent = 'Envoyer';
      }, 3000);
    }, 900);
  });
}

// ----------------------------------------------------------
// 8. Formulaire de la page contact : validation en direct,
//    compteur de caractères et envoi animé
// ----------------------------------------------------------
const contactForm = document.querySelector('.formulaire-contact');

if (contactForm) {
  const fields = contactForm.querySelectorAll('.field input, .field textarea');
  const message = contactForm.querySelector('textarea');
  const counter = contactForm.querySelector('.char-count');
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const status = contactForm.querySelector('.form-status');
  const resetButton = contactForm.querySelector('.form-reset');

  function validateField(field) {
    const wrapper = field.closest('.field');
    const isValid = field.checkValidity();

    wrapper.classList.toggle('is-valid', isValid && field.value.trim() !== '');
    wrapper.classList.toggle('is-invalid', !isValid);
    return isValid;
  }

  fields.forEach((field) => {
    field.addEventListener('blur', () => validateField(field));

    // Une fois l'erreur affichée, on revalide à chaque frappe
    field.addEventListener('input', () => {
      if (field.closest('.field').classList.contains('is-invalid')) {
        validateField(field);
      }
    });
  });

  function updateCounter() {
    counter.textContent = `${message.value.length} / ${message.maxLength}`;
    counter.classList.toggle('is-near', message.value.length > message.maxLength * 0.9);
  }

  message.addEventListener('input', updateCounter);

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.classList.remove('is-shown');

    const invalidFields = Array.from(fields).filter((field) => !validateField(field));

    if (invalidFields.length > 0) {
      invalidFields[0].focus();
      return;
    }

    submitButton.classList.add('is-loading');
    submitButton.disabled = true;

    try {
      // Tant que l'identifiant Formspree n'est pas configuré, on simule l'envoi
      if (contactForm.action.includes('your-id')) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      } else {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' }
        });

        if (!response.ok) {
          throw new Error('Envoi refusé');
        }
      }

      contactForm.classList.add('is-sent');
      resetButton.focus();
    } catch (error) {
      status.textContent = "Oups, le message n'a pas pu être envoyé. Réessayez dans un instant.";
      status.classList.add('is-shown');
    } finally {
      submitButton.classList.remove('is-loading');
      submitButton.disabled = false;
    }
  });

  resetButton.addEventListener('click', () => {
    contactForm.reset();
    contactForm.classList.remove('is-sent');
    contactForm.querySelectorAll('.field').forEach((field) => {
      field.classList.remove('is-valid', 'is-invalid');
    });
    updateCounter();
    fields[0].focus();
  });
}

// ----------------------------------------------------------
// 9. Transition douce en changeant de page
// ----------------------------------------------------------
document.querySelectorAll('a[href$=".html"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (reduceMotion || link.pathname === window.location.pathname) return;

    event.preventDefault();
    document.body.classList.add('page-leave');
    setTimeout(() => {
      window.location.href = link.href;
    }, 350);
  });
});

// Si on revient avec le bouton « Précédent », on réaffiche la page
window.addEventListener('pageshow', () => {
  document.body.classList.remove('page-leave');
});


