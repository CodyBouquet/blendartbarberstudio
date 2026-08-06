/* ============================================================
   blendART Barber Studio — mobile nav
   Shared by index.html and blog.html. The panel only exists
   below the 760px breakpoint; above it the links sit in the bar
   and this script never has anything to do.
   ============================================================ */

const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");

if (navToggle && navMenu) {
  const setNav = (open) => {
    navMenu.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  };
  const isOpen = () => navToggle.getAttribute("aria-expanded") === "true";

  navToggle.addEventListener("click", () => setNav(!isOpen()));

  // Same-page anchors don't reload, so the panel has to close itself.
  navMenu.addEventListener("click", (e) => {
    if (e.target.closest("a")) setNav(false);
  });

  // Tap anywhere off the header. The toggle lives inside .nav, so its
  // own click never reaches this as an "outside" click.
  document.addEventListener("click", (e) => {
    if (isOpen() && !e.target.closest(".nav")) setNav(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) {
      setNav(false);
      navToggle.focus();
    }
  });

  // Rotating to landscape past the breakpoint would otherwise leave the
  // desktop bar holding an "open" class it can't show.
  window.matchMedia("(min-width: 761px)").addEventListener("change", (e) => {
    if (e.matches) setNav(false);
  });
}
