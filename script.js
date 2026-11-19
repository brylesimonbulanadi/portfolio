// script.js — add before </body> as: <script src="script.js" defer></script>
// Creates the helper elements itself, so no extra HTML is needed.
document.body.insertAdjacentHTML("afterbegin",
  '<div id="progress"></div>' +
  '<button id="to-top" type="button" aria-label="Back to top">↑</button>' +
  '<div id="lightbox" role="dialog" aria-label="Design preview"><button id="lightbox-close" type="button" aria-label="Close">✕</button><img src="" alt=""></div>');

/* ===== extra.js — paste inside your existing <script>, after showDesign(0); startDesignSlider(); ===== */

// 1. Scroll progress bar + back-to-top button
const progress = document.getElementById("progress");
const toTop = document.getElementById("to-top");
function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  toTop.classList.toggle("show", window.scrollY > 600);
}
window.addEventListener("scroll", onScroll, { passive: true });
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
onScroll();

// 2. Highlight the nav link for the section in view
const navAnchors = [...navLinks.querySelectorAll("a")];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navAnchors.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
navAnchors.forEach((a) => {
  const target = document.querySelector(a.getAttribute("href"));
  if (target) sectionObserver.observe(target);
});

// 3. Design slider: pause on hover, arrow keys, swipe, counter
const slider = document.querySelector(".design-slider");
const counter = document.createElement("div");
counter.className = "slider-count";
document.getElementById("design-dots").before(counter);
const baseShow = showDesign;
showDesign = function (i) { baseShow(i); counter.textContent = `${designIndex + 1} / ${designItems.length}`; };
showDesign(designIndex);

slider.addEventListener("mouseenter", () => clearInterval(designTimer));
slider.addEventListener("mouseleave", startDesignSlider);
slider.tabIndex = 0;
slider.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") { showDesign(designIndex - 1); startDesignSlider(); }
  if (e.key === "ArrowRight") { showDesign(designIndex + 1); startDesignSlider(); }
});
let touchX = null;
slider.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
slider.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) { showDesign(designIndex + (dx < 0 ? 1 : -1)); startDesignSlider(); }
  touchX = null;
});

// 4. Lightbox: click a design to view it full size
const lightbox = document.getElementById("lightbox");
const lightboxImg = lightbox.querySelector("img");
designItems.forEach((slide) => {
  slide.querySelector("img").addEventListener("click", (e) => {
    lightboxImg.src = e.target.src;
    lightboxImg.alt = e.target.alt;
    lightbox.classList.add("open");
    clearInterval(designTimer);
  });
});
function closeLightbox() { lightbox.classList.remove("open"); startDesignSlider(); }
lightbox.addEventListener("click", (e) => { if (e.target !== lightboxImg) closeLightbox(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

// 5. Scroll-reveal animation on every section (content stays visible if JS is off)
document.documentElement.classList.add("js");
const revealSelectors = [
  ".kicker", ".accent-line", "section h2", ".section-copy",
  ".card", ".timeline-item", ".focus", ".chips .chip", ".list li", ".contact-content > *"
];
const seen = new Set();
document.querySelectorAll("main section:not(.hero)").forEach((section) => {
  let order = 0;
  section.querySelectorAll(revealSelectors.join(",")).forEach((el) => {
    if (seen.has(el)) return;
    seen.add(el);
    el.classList.add("reveal");
    // Stagger siblings slightly (capped so nothing waits long)
    el.style.setProperty("--d", Math.min(order++ * 0.07, 0.5) + "s");
  });
});
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add("in"); obs.unobserve(entry.target); }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
seen.forEach((el) => revealObserver.observe(el));