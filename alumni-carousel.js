(() => {
  const root = document.querySelector("[data-featured-alumni]");
  const sourceAlumni = window.MINHAJ_ALUMNI || [];
  if (!root || sourceAlumni.length < 2) return;

  const language = document.documentElement.lang === "ur" ? "ur" : "en";
  const isRtl = document.documentElement.dir === "rtl";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const labels = {
    en: {
      carousel: "Featured alumni",
      previous: "Show previous alumni",
      next: "Show next alumni",
      school: "Minhaj Model School",
      viewProfile: "View profile for",
      viewStory: "View story",
      headshotAlt: "Profile illustration for"
    },
    ur: {
      carousel: "نمایاں سابق طلبہ",
      previous: "پچھلے سابق طلبہ دکھائیں",
      next: "اگلے سابق طلبہ دکھائیں",
      school: "منہاج ماڈل اسکول",
      viewProfile: "پروفائل دیکھیں:",
      viewStory: "کہانی دیکھیں",
      headshotAlt: "پروفائل تصویر:"
    }
  }[language];

  let track = null;
  let currentIndex = 0;
  let visibleCount = 0;
  let autoplayTimer = null;
  let resizeTimer = null;
  let touchStartX = 0;
  let touchStartY = 0;

  function translatedPerson(person) {
    return { ...person, ...person[language] };
  }

  function siteRootPath() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const languageIndex = parts.findIndex((part) => part === "ur" || part === "en");
    if (languageIndex === -1) return "/";
    const rootParts = parts.slice(0, languageIndex);
    return rootParts.length ? `/${rootParts.join("/")}/` : "/";
  }

  function assetPath(path) {
    return `${siteRootPath()}${path.replace(/^\/+/, "")}`;
  }

  function cardsVisible() {
    if (window.matchMedia("(max-width: 767px)").matches) return 1;
    if (window.matchMedia("(max-width: 1024px)").matches) return 2;
    return 3;
  }

  function cardTemplate(person, clone = false) {
    const translated = translatedPerson(person);
    const arrow = language === "ur" ? "←" : "→";
    const cloneAttributes = clone ? ' aria-hidden="true" tabindex="-1"' : "";

    return `
      <a class="featured-alumni-card" href="alumni/${encodeURIComponent(person.id)}/" aria-label="${labels.viewProfile} ${translated.name}"${cloneAttributes}>
        <div class="featured-alumni-photo">
          <img src="${assetPath(person.headshot)}" alt="${clone ? "" : `${labels.headshotAlt} ${translated.name}`}" loading="lazy">
        </div>
        <div class="featured-alumni-copy">
          <span class="featured-alumni-years">${labels.school} · ${person.years}</span>
          <h3>${translated.name}</h3>
          <p class="featured-alumni-role">${translated.designation} · ${translated.company}</p>
          <span class="featured-alumni-link">${labels.viewStory} <span aria-hidden="true">${arrow}</span></span>
        </div>
      </a>
    `;
  }

  function itemStep() {
    const card = track?.querySelector(".featured-alumni-card");
    if (!card || !track) return 0;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function positionTrack(animate = true) {
    if (!track) return;
    const step = itemStep();
    if (!step) return;
    track.style.transition = animate && !reduceMotion.matches
      ? "transform 560ms cubic-bezier(0.22, 1, 0.36, 1)"
      : "none";
    track.style.transform = `translate3d(${-currentIndex * step}px, 0, 0)`;
  }

  function next() {
    currentIndex += 1;
    positionTrack(true);
  }

  function previous() {
    currentIndex -= 1;
    positionTrack(true);
  }

  function handleTransitionEnd(event) {
    if (event.propertyName !== "transform") return;

    if (currentIndex >= visibleCount + sourceAlumni.length) {
      currentIndex = visibleCount;
      positionTrack(false);
    } else if (currentIndex < visibleCount) {
      currentIndex = visibleCount + sourceAlumni.length - 1;
      positionTrack(false);
    }
  }

  function startAutoplay() {
    window.clearInterval(autoplayTimer);
    if (reduceMotion.matches) return;
    autoplayTimer = window.setInterval(next, 3400);
  }

  function attachSwipe(viewport) {
    viewport.addEventListener("touchstart", (event) => {
      const touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: true });

    viewport.addEventListener("touchend", (event) => {
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
      if (deltaX < 0) next();
      else previous();
    }, { passive: true });
  }

  function buildCarousel() {
    visibleCount = cardsVisible();
    const before = sourceAlumni.slice(-visibleCount);
    const after = sourceAlumni.slice(0, visibleCount);
    const previousGlyph = isRtl ? "→" : "←";
    const nextGlyph = isRtl ? "←" : "→";

    root.classList.add("alumni-carousel");
    root.setAttribute("role", "region");
    root.setAttribute("aria-label", labels.carousel);
    root.innerHTML = `
      <div class="alumni-carousel-viewport">
        <div class="alumni-carousel-track">
          ${before.map((person) => cardTemplate(person, true)).join("")}
          ${sourceAlumni.map((person) => cardTemplate(person)).join("")}
          ${after.map((person) => cardTemplate(person, true)).join("")}
        </div>
      </div>
      <div class="alumni-carousel-controls" aria-label="${labels.carousel}">
        <button class="alumni-carousel-button" type="button" data-alumni-previous aria-label="${labels.previous}">${previousGlyph}</button>
        <button class="alumni-carousel-button" type="button" data-alumni-next aria-label="${labels.next}">${nextGlyph}</button>
      </div>
    `;

    track = root.querySelector(".alumni-carousel-track");
    const viewport = root.querySelector(".alumni-carousel-viewport");
    currentIndex = visibleCount;

    root.querySelector("[data-alumni-previous]").addEventListener("click", previous);
    root.querySelector("[data-alumni-next]").addEventListener("click", next);
    track.addEventListener("transitionend", handleTransitionEnd);
    attachSwipe(viewport);

    requestAnimationFrame(() => positionTrack(false));
    startAutoplay();
  }

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (cardsVisible() !== visibleCount) buildCarousel();
      else positionTrack(false);
    }, 140);
  });

  reduceMotion.addEventListener?.("change", () => {
    positionTrack(false);
    startAutoplay();
  });

  buildCarousel();
})();
