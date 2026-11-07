(() => {
  const form = document.getElementById("governance-application");
  if (!form) return;

  const checks = [...form.querySelectorAll('input[name="roles"]')];
  const count = document.getElementById("role-count");
  const submit = document.getElementById("application-submit");
  const message = document.getElementById("application-message");
  const status = document.getElementById("intake-status");

  const updateCount = () => {
    const selected = checks.filter((input) => input.checked);
    count.textContent = selected.length + " of 3 selected";
    checks.forEach((input) => {
      input.disabled = !input.checked && selected.length >= 3;
    });
  };

  checks.forEach((input) => input.addEventListener("change", updateCount));
  updateCount();
  submit.disabled = true;

  fetch("/api/governance-application", { method: "GET", cache: "no-store" })
    .then(async (response) => {
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.available !== true) {
        throw new Error(result.message || "Applications are temporarily unavailable. Please check back soon.");
      }
      status.textContent = "APPLICATION INTAKE OPEN — Your submission will be sent securely to the private review tracker.";
      status.dataset.state = "open";
      submit.disabled = false;
    })
    .catch((error) => {
      status.textContent = error.message || "Application intake is temporarily unavailable.";
      status.dataset.state = "closed";
    });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "";
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    if (String(data.get("website") || "").trim()) return;

    const roles = checks.filter((input) => input.checked).map((input) => input.value);
    if (!roles.length || roles.length > 3) {
      message.textContent = "Please select between one and three roles.";
      return;
    }

    const payload = {
      applicantName: String(data.get("applicantName") || "").trim(),
      email: String(data.get("email") || "").trim(),
      handle: String(data.get("handle") || "").trim(),
      roles,
      motivation: String(data.get("motivation") || "").trim(),
      skills: String(data.get("skills") || "").trim(),
      portfolio: String(data.get("portfolio") || "").trim(),
      plan: String(data.get("plan") || "").trim(),
      availability: String(data.get("availability") || ""),
      conflicts: String(data.get("conflicts") || "").trim(),
      governanceAck: data.get("governanceAck") === "on",
      privacyAck: data.get("privacyAck") === "on"
    };

    submit.disabled = true;
    const originalLabel = submit.textContent;
    submit.textContent = "SENDING APPLICATION…";
    try {
      const response = await fetch("/api/governance-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store"
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We could not submit your application. Please try again later.");
      form.reset();
      updateCount();
      message.textContent = "HONK! Your application has been received. Thank you for helping build the flock.";
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      message.textContent = error.message || "Something went wrong. Please try again later.";
    } finally {
      submit.textContent = originalLabel;
      submit.disabled = false;
    }
  });
})();
