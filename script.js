const language = document.documentElement.lang === "ur" ? "ur" : "en";
const alumni = window.MINHAJ_ALUMNI || [];

const labels = {
  en: {
    school: "Minhaj Model School",
    viewProfile: "View profile for",
    headshotAlt: "Placeholder headshot for",
    bannerAlt: "Placeholder banner for",
    roleSeparator: " at "
  },
  ur: {
    school: "منہاج ماڈل اسکول",
    viewProfile: "پروفائل دیکھیں:",
    headshotAlt: "نمونہ پروفائل تصویر:",
    bannerAlt: "نمونہ بینر تصویر:",
    roleSeparator: "، "
  }
}[language];

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

document.querySelectorAll("[data-current-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const heroSlider = document.querySelector("[data-hero-slider]");
const heroSlides = heroSlider ? Array.from(heroSlider.querySelectorAll("[data-hero-slide]")) : [];

if (heroSlides.length > 1) {
  let activeSlideIndex = 0;

  window.setInterval(() => {
    heroSlides[activeSlideIndex].classList.remove("is-active");
    activeSlideIndex = (activeSlideIndex + 1) % heroSlides.length;
    heroSlides[activeSlideIndex].classList.add("is-active");
  }, 5000);
}

const alumniList = document.querySelector("#alumni-list");
const modal = document.querySelector("#alumni-modal");
const modalPanel = modal?.querySelector(".modal-panel");
let lastFocusedElement = null;

function translatedPerson(person) {
  return { ...person, ...person[language] };
}

function alumniCardTemplate(person) {
  const translated = translatedPerson(person);

  return `
    <button class="alumni-card" type="button" data-alumni-id="${person.id}" aria-label="${labels.viewProfile} ${translated.name}">
      <div class="alumni-photo-wrap">
        <img class="alumni-photo" src="${person.headshot}" alt="${labels.headshotAlt} ${translated.name}" loading="lazy">
      </div>
      <div class="alumni-copy">
        <h3>${translated.name}</h3>
        <p class="alumni-role">${translated.designation} · ${translated.company}</p>
        <p class="alumni-summary">${translated.summary}</p>
        <span class="alumni-school-years">${labels.school} · ${person.years}</span>
      </div>
      <span class="alumni-arrow" aria-hidden="true">→</span>
    </button>
  `;
}

if (alumniList) {
  alumniList.innerHTML = alumni.map(alumniCardTemplate).join("");

  alumniList.addEventListener("click", (event) => {
    const card = event.target.closest("[data-alumni-id]");
    if (!card) return;

    const person = alumni.find((item) => item.id === card.dataset.alumniId);
    if (person) openAlumniModal(person, card);
  });
}

function openAlumniModal(person, trigger) {
  if (!modal) return;

  const translated = translatedPerson(person);
  lastFocusedElement = trigger;

  const banner = modal.querySelector("#modal-banner");
  banner.src = person.banner;
  banner.alt = `${labels.bannerAlt} ${translated.name}`;

  modal.querySelector("#modal-name").textContent = translated.name;
  modal.querySelector("#modal-role").textContent = `${translated.designation}${labels.roleSeparator}${translated.company}`;
  modal.querySelector("#modal-designation").textContent = translated.designation;
  modal.querySelector("#modal-company").textContent = translated.company;
  modal.querySelector("#modal-years").textContent = person.years;
  modal.querySelector("#modal-description").textContent = translated.description;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  requestAnimationFrame(() => {
    modal.querySelector(".modal-close")?.focus();
  });
}

function closeAlumniModal() {
  if (!modal || !modal.classList.contains("is-open")) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  lastFocusedElement?.focus();
}

modal?.querySelectorAll("[data-close-modal]").forEach((element) => {
  element.addEventListener("click", closeAlumniModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAlumniModal();
    return;
  }

  if (event.key !== "Tab" || !modal?.classList.contains("is-open") || !modalPanel) return;

  const focusable = modalPanel.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );

  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
