// Mark JS as available; the CSS only hides .reveal elements under .js,
// so a no-JS visit renders every section immediately.
document.documentElement.classList.add("js");

document.getElementById("year").textContent = String(new Date().getFullYear());

// Header bottom border once the page is scrolled past the top sentinel.
const header = document.getElementById("site-header");
const sentinel = document.getElementById("top-sentinel");
if (header && sentinel && "IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => {
    header.classList.toggle("scrolled", !entry.isIntersecting);
  }).observe(sentinel);
}

// Reveal sections as they enter the viewport (CSS gates this behind
// prefers-reduced-motion, so adding the class is always safe).
const revealed = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12 }
  );
  revealed.forEach((el) => io.observe(el));
} else {
  revealed.forEach((el) => el.classList.add("in"));
}
