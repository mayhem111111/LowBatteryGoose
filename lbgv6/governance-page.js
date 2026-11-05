/* Always open Governance at the top; the sign-up button below handles intentional in-page navigation. */
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
if (location.hash) history.replaceState(null, "", location.pathname + location.search);
window.addEventListener("pageshow", function () { window.scrollTo(0, 0); });
