if ("scrollRestoration" in history) history.scrollRestoration = "manual";
function goTop() {
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  window.scrollTo(0, 0);
}
goTop();
window.addEventListener("DOMContentLoaded", goTop, { once: true });
window.addEventListener("load", goTop, { once: true });
window.addEventListener("pageshow", goTop);
