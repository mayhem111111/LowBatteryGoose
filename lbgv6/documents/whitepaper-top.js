if ("scrollRestoration" in history) history.scrollRestoration = "manual";
function goTop() {
  window.scrollTo(0, 0);
}
function goHash() {
  var el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (el) el.scrollIntoView();
}
function place() {
  if (location.hash.length > 1) goHash();
  else goTop();
}
place();
window.addEventListener("DOMContentLoaded", place, { once: true });
window.addEventListener("load", place, { once: true });
window.addEventListener("hashchange", goHash);
