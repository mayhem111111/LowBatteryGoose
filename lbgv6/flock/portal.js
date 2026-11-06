const logout = document.getElementById("logout");
logout.addEventListener("click", async () => {
  logout.disabled = true;
  logout.textContent = "SIGNING OUT…";
  try {
    const response = await fetch("/api/community/logout", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store"
    });
    if (!response.ok) throw new Error("Sign out did not complete.");
    window.location.replace("/flock/login.html");
  } catch {
    logout.disabled = false;
    logout.textContent = "TRY SIGN OUT AGAIN";
  }
});