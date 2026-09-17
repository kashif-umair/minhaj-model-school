const alumni = [
  {
    id: "ahmad-raza",
    name: "Ahmad Raza",
    designation: "Senior Software Engineer",
    company: "Northstar Technologies",
    years: "1994 – 1999",
    headshot: "https://placehold.co/600x600/e2ebe7/17443f?text=Ahmad+Raza",
    banner: "https://placehold.co/1400x800/315f58/f8f5ec?text=Ahmad+Raza+Banner",
    summary: "A technology professional working on large-scale digital products and engineering teams.",
    description: "Ahmad built his career in software engineering after completing his later education in computer science. He has worked across product development, engineering leadership and large-scale web systems, and continues to value the strong learning habits formed during his early school years."
  },
  {
    id: "sara-khan",
    name: "Sara Khan",
    designation: "Consultant Physician",
    company: "City Medical Centre",
    years: "1993 – 1998",
    headshot: "https://placehold.co/600x600/efe5dc/654a35?text=Sara+Khan",
    banner: "https://placehold.co/1400x800/7a604b/fffaf2?text=Sara+Khan+Banner",
    summary: "A medical professional focused on patient care, clinical excellence and community health.",
    description: "Sara went on to pursue medicine and now works as a consultant physician. Her professional journey combines clinical practice with mentoring younger doctors, and she remains passionate about education, service and giving back to the communities that shaped her."
  },
  {
    id: "usman-ali",
    name: "Usman Ali",
    designation: "Director of Operations",
    company: "Crescent Industries",
    years: "1995 – 2000",
    headshot: "https://placehold.co/600x600/dde4ee/2f4968?text=Usman+Ali",
    banner: "https://placehold.co/1400x800/3d5876/f5f8fc?text=Usman+Ali+Banner",
    summary: "An operations leader managing teams, systems and business growth across multiple markets.",
    description: "Usman has developed a career in business operations and management, working with multidisciplinary teams and helping organizations improve how they serve customers. He credits his early education with developing the discipline and confidence that later became central to his professional life."
  },
  {
    id: "aisha-mahmood",
    name: "Aisha Mahmood",
    designation: "Education Program Lead",
    company: "Future Learning Foundation",
    years: "1996 – 2001",
    headshot: "https://placehold.co/600x600/e9e1ef/5d3f6d?text=Aisha+Mahmood",
    banner: "https://placehold.co/1400x800/674c76/fbf7fd?text=Aisha+Mahmood+Banner",
    summary: "An education specialist designing programs that help young people learn and thrive.",
    description: "Aisha works in education and youth development, designing learning programs and supporting teachers and students. Her work reflects a long-standing belief that a strong beginning at school can shape confidence, opportunity and ambition for many years to come."
  },
  {
    id: "bilal-hassan",
    name: "Bilal Hassan",
    designation: "Entrepreneur & Managing Director",
    company: "Hassan Ventures",
    years: "1992 – 1997",
    headshot: "https://placehold.co/600x600/e6e7dc/53543d?text=Bilal+Hassan",
    banner: "https://placehold.co/1400x800/5e6147/fffdf4?text=Bilal+Hassan+Banner",
    summary: "An entrepreneur building and supporting businesses across technology and professional services.",
    description: "Bilal has spent his career building businesses and working with teams across different industries. His journey has taken him from small entrepreneurial projects to leading a growing company, while keeping a strong connection to the people and places that formed his earliest memories of education."
  }
];

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

const alumniList = document.querySelector("#alumni-list");
const modal = document.querySelector("#alumni-modal");
const modalPanel = modal?.querySelector(".modal-panel");
let lastFocusedElement = null;

function alumniCardTemplate(person) {
  return `
    <button class="alumni-card" type="button" data-alumni-id="${person.id}" aria-label="View profile for ${person.name}">
      <div class="alumni-photo-wrap">
        <img class="alumni-photo" src="${person.headshot}" alt="Placeholder headshot for ${person.name}" loading="lazy">
      </div>
      <div class="alumni-copy">
        <h3>${person.name}</h3>
        <p class="alumni-role">${person.designation} · ${person.company}</p>
        <p class="alumni-summary">${person.summary}</p>
        <span class="alumni-school-years">Minhaj Model School · ${person.years}</span>
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

  lastFocusedElement = trigger;

  const banner = modal.querySelector("#modal-banner");
  banner.src = person.banner;
  banner.alt = `Placeholder banner for ${person.name}`;

  modal.querySelector("#modal-name").textContent = person.name;
  modal.querySelector("#modal-role").textContent = `${person.designation} at ${person.company}`;
  modal.querySelector("#modal-designation").textContent = person.designation;
  modal.querySelector("#modal-company").textContent = person.company;
  modal.querySelector("#modal-years").textContent = person.years;
  modal.querySelector("#modal-description").textContent = person.description;

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
