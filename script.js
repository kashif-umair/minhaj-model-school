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

function alumniListPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const alumniIndex = parts.lastIndexOf("alumni");

  if (alumniIndex === -1) return window.location.pathname;
  return `/${parts.slice(0, alumniIndex + 1).join("/")}/`;
}

function alumniIdFromLocation() {
  const params = new URLSearchParams(window.location.search);
  const legacyId = params.get("alumni");
  if (legacyId) return legacyId;

  const parts = window.location.pathname.split("/").filter(Boolean);
  const alumniIndex = parts.lastIndexOf("alumni");
  const candidate = alumniIndex >= 0 ? parts[alumniIndex + 1] : null;

  return candidate && alumni.some((person) => person.id === candidate) ? candidate : null;
}

function alumniProfilePath(id) {
  return `${alumniListPath()}${encodeURIComponent(id)}/`;
}

function updateLanguageSwitch(id = null) {
  const switchLink = document.querySelector("[data-language-switch]");
  if (!switchLink) return;

  const parts = alumniListPath().split("/").filter(Boolean);
  const languageIndex = parts.findIndex((part) => part === "ur" || part === "en");
  if (languageIndex === -1) return;

  parts[languageIndex] = language === "ur" ? "en" : "ur";
  const otherListPath = `/${parts.join("/")}/`;
  switchLink.href = id ? `${otherListPath}${encodeURIComponent(id)}/` : otherListPath;
}

function alumniCardTemplate(person) {
  const translated = translatedPerson(person);

  return `
    <a class="alumni-card" href="${alumniProfilePath(person.id)}" data-alumni-id="${person.id}" aria-label="${labels.viewProfile} ${translated.name}">
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
    </a>
  `;
}

if (alumniList) {
  alumniList.innerHTML = alumni.map(alumniCardTemplate).join("");

  alumniList.addEventListener("click", (event) => {
    const card = event.target.closest("[data-alumni-id]");
    if (!card) return;

    const person = alumni.find((item) => item.id === card.dataset.alumniId);
    if (!person) return;

    event.preventDefault();
    lastFocusedElement = card;
    window.history.pushState({ alumniId: person.id }, "", alumniProfilePath(person.id));
    openAlumniModal(person, card);
    updateLanguageSwitch(person.id);
  });
}

function openAlumniModal(person, trigger = null) {
  if (!modal) return;

  const translated = translatedPerson(person);
  if (trigger) lastFocusedElement = trigger;

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

function hideAlumniModal({ restoreFocus = true } = {}) {
  if (!modal || !modal.classList.contains("is-open")) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (restoreFocus) lastFocusedElement?.focus();
}

function closeAlumniModal() {
  if (!modal || !modal.classList.contains("is-open")) return;

  if (window.history.state?.alumniId) {
    window.history.back();
    return;
  }

  window.history.replaceState({}, "", alumniListPath());
  hideAlumniModal();
  updateLanguageSwitch();
}

function syncAlumniModalWithLocation() {
  const id = alumniIdFromLocation();

  if (!id) {
    hideAlumniModal({ restoreFocus: false });
    updateLanguageSwitch();
    return;
  }

  const person = alumni.find((item) => item.id === id);
  if (!person) return;

  openAlumniModal(person);
  updateLanguageSwitch(id);
}

modal?.querySelectorAll("[data-close-modal]").forEach((element) => {
  element.addEventListener("click", closeAlumniModal);
});

window.addEventListener("popstate", syncAlumniModalWithLocation);

if (alumniList && modal) {
  const legacyId = new URLSearchParams(window.location.search).get("alumni");
  if (legacyId && alumni.some((person) => person.id === legacyId)) {
    window.history.replaceState({}, "", alumniProfilePath(legacyId));
  }

  syncAlumniModalWithLocation();
}

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
