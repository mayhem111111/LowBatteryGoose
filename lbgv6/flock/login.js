import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/+esm";

const byId = (id) => document.getElementById(id);
const accountPanel = byId("account-panel");
const mfaPanel = byId("mfa-panel");
const recoveryPanel = byId("recovery-panel");
const forgotPanel = byId("forgot-panel");
const statusBox = byId("status");
let supabase = null;
const authMemory = new Map();
const authStorage = {
  async getItem(key) {
    if (key.endsWith("-code-verifier")) return window.localStorage.getItem(key);
    return authMemory.has(key) ? authMemory.get(key) : null;
  },
  async setItem(key, value) {
    if (key.endsWith("-code-verifier")) window.localStorage.setItem(key, value);
    else authMemory.set(key, value);
  },
  async removeItem(key) {
    if (key.endsWith("-code-verifier")) window.localStorage.removeItem(key);
    else authMemory.delete(key);
  }
};
let authMode = "signin";
let factorId = null;
let challengeId = null;

function message(text, kind = "info") {
  statusBox.textContent = text;
  statusBox.className = "notice" + (kind === "error" ? " notice-error" : kind === "success" ? " notice-success" : "");
  statusBox.hidden = !text;
}
function showPanel(panel) {
  accountPanel.hidden = panel !== "account";
  mfaPanel.hidden = panel !== "mfa";
  recoveryPanel.hidden = panel !== "recovery";
  forgotPanel.hidden = panel !== "forgot";
}
function setBusy(button, busy, text) {
  button.disabled = busy;
  if (busy) {
    button.dataset.originalText = button.textContent;
    button.textContent = text || "PLEASE WAIT…";
  } else if (button.dataset.originalText) {
    button.textContent = button.dataset.originalText;
    delete button.dataset.originalText;
  }
}
function errorText(error) {
  return error && typeof error.message === "string" ? error.message : "Something went wrong. Please try again.";
}
function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
async function issuePortalSession() {
  const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal.error) throw aal.error;
  if (!aal.data || aal.data.currentLevel !== "aal2") {
    throw new Error("The authenticator step has not been completed. The portal requires two verified factors.");
  }
  const sessionResult = await supabase.auth.getSession();
  if (sessionResult.error) throw sessionResult.error;
  const accessToken = sessionResult.data.session && sessionResult.data.session.access_token;
  if (!accessToken) throw new Error("Your sign-in session could not be confirmed. Please sign in again.");
  const response = await fetch("/api/community/session", {
    method: "POST",
    headers: { Authorization: "Bearer " + accessToken },
    credentials: "same-origin",
    cache: "no-store"
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "The secure portal session could not be created.");
  // The Supabase access/refresh session remains in memory only. Clear it as
  // soon as the HttpOnly portal cookie has been issued.
  await supabase.auth.signOut({ scope: "local" });
  authMemory.clear();
  window.localStorage.removeItem("lbg-flock-auth-code-verifier");
  message("Two-factor verification complete. Welcome to the Flock.", "success");
  window.location.assign("/flock/");
}
async function challengeFactor(id) {
  const challenge = await supabase.auth.mfa.challenge({ factorId: id });
  if (challenge.error) throw challenge.error;
  challengeId = challenge.data.id;
  factorId = id;
  byId("mfa-title").textContent = "Check your authenticator.";
  byId("mfa-description").textContent = "Enter the current six-digit code from the authenticator app connected to your account.";
  byId("enrollment-box").hidden = true;
  byId("mfa-submit").textContent = "VERIFY AND ENTER ↗";
  showPanel("mfa");
  byId("totp-code").focus();
}
async function enrollFactor() {
  const enrollment = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "Flock authenticator",
    issuer: "Low Battery Goose"
  });
  if (enrollment.error) throw enrollment.error;
  factorId = enrollment.data.id;
  challengeId = null;
  const qr = enrollment.data.totp && enrollment.data.totp.qr_code;
  if (!qr) throw new Error("The authenticator setup QR code was not returned. Please try again.");
  byId("totp-qr").src = qr.startsWith("data:") ? qr : "data:image/svg+xml;charset=utf-8," + encodeURIComponent(qr);
  byId("totp-secret").textContent = enrollment.data.totp.secret;
  byId("enrollment-box").hidden = false;
  byId("mfa-title").textContent = "Set up your second factor.";
  byId("mfa-description").textContent = "Scan the QR code with an authenticator app, then enter the six-digit code it generates. You must complete this setup before entering the portal.";
  byId("mfa-submit").textContent = "VERIFY AUTHENTICATOR ↗";
  showPanel("mfa");
  byId("totp-code").focus();
}
async function afterFirstFactor() {
  const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal.error) throw aal.error;
  if (aal.data && aal.data.currentLevel === "aal2") {
    await issuePortalSession();
    return;
  }
  const listed = await supabase.auth.mfa.listFactors();
  if (listed.error) throw listed.error;
  const factors = listed.data.totp || [];
  const factor = factors.find((item) => item.status === "verified") || factors[0];
  if (factor) {
    await challengeFactor(factor.id);
  } else {
    await enrollFactor();
  }
}
async function verifyAuthenticator(code) {
  if (!factorId) throw new Error("No authenticator factor is active. Please start again.");
  if (!challengeId) {
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) throw challenge.error;
    challengeId = challenge.data.id;
  }
  const result = await supabase.auth.mfa.verify({
    factorId,
    challengeId,
    code
  });
  if (result.error) {
    challengeId = null;
    throw result.error;
  }
  challengeId = null;
  await issuePortalSession();
}
function setAuthMode(mode) {
  authMode = mode;
  const signup = mode === "signup";
  byId("signup-tab").classList.toggle("is-active", signup);
  byId("signin-tab").classList.toggle("is-active", !signup);
  byId("signup-tab").setAttribute("aria-pressed", String(signup));
  byId("signin-tab").setAttribute("aria-pressed", String(!signup));
  byId("confirm-wrap").hidden = !signup;
  byId("confirm-password").required = signup;
  byId("password").autocomplete = signup ? "new-password" : "current-password";
  byId("account-submit").innerHTML = signup ? "CREATE ACCOUNT <span>↗</span>" : "SIGN IN <span>↗</span>";
  message("");
}
async function handleCallback() {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const code = query.get("code");
  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");
  const callbackType = query.get("type") || hash.get("type");
  if (!code && !(accessToken && refreshToken)) return false;

  history.replaceState(null, "", window.location.pathname);
  if (code) {
    const exchanged = await supabase.auth.exchangeCodeForSession(code);
    if (exchanged.error) throw exchanged.error;
  } else {
    const established = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    if (established.error) throw established.error;
  }
  if (callbackType === "recovery") {
    showPanel("recovery");
    message("Your recovery link is verified. Set a new password, then complete authenticator verification.");
  } else {
    await afterFirstFactor();
  }
  return true;
}
async function boot() {
  try {
    const configResponse = await fetch("/api/community/config", { cache: "no-store" });
    const config = await configResponse.json().catch(() => ({}));
    if (!configResponse.ok || !config.supabaseUrl || !config.supabaseAnonKey) {
      byId("setup-warning").hidden = false;
      byId("account-submit").disabled = true;
      return;
    }
    supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: "pkce",
        storageKey: "lbg-flock-auth",
        storage: authStorage
      }
    });
    try {
      await handleCallback();
    } catch (error) {
      message(errorText(error), "error");
      showPanel("account");
    }
  } catch {
    byId("setup-warning").hidden = false;
    byId("setup-warning").textContent = "The secure login service could not be reached. Please try again later.";
  }
}

byId("signin-tab").addEventListener("click", () => setAuthMode("signin"));
byId("signup-tab").addEventListener("click", () => setAuthMode("signup"));
byId("account-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  message("");
  if (!supabase) {
    message("The login service is not configured yet.", "error");
    return;
  }
  const email = byId("email").value.trim().toLowerCase();
  const password = byId("password").value;
  if (!validateEmail(email)) return message("Enter a valid email address.", "error");
  if (password.length < 12) return message("Use a password with at least 12 characters.", "error");
  if (authMode === "signup" && password !== byId("confirm-password").value) {
    return message("The passwords do not match.", "error");
  }
  const button = byId("account-submit");
  setBusy(button, true, authMode === "signup" ? "CREATING ACCOUNT…" : "SIGNING IN…");
  try {
    if (authMode === "signup") {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/flock/login" }
      });
      if (result.error) throw result.error;
      if (result.data.session) {
        await afterFirstFactor();
      } else {
        message("Check your email for the confirmation link. After confirming your address, return here to set up your authenticator and enter the Flock.", "success");
      }
    } else {
      const result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      await afterFirstFactor();
    }
  } catch (error) {
    message(errorText(error), "error");
  } finally {
    setBusy(button, false);
  }
});
byId("mfa-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const code = byId("totp-code").value.replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return message("Enter the six-digit code from your authenticator app.", "error");
  const button = byId("mfa-submit");
  setBusy(button, true, "VERIFYING CODE…");
  try {
    await verifyAuthenticator(code);
  } catch (error) {
    message(errorText(error), "error");
    byId("totp-code").select();
  } finally {
    setBusy(button, false);
  }
});
byId("cancel-auth").addEventListener("click", async () => {
  if (supabase) await supabase.auth.signOut();
  factorId = null;
  challengeId = null;
  showPanel("account");
  message("You have been signed out. Sign in again to continue.");
});
byId("forgot-link").addEventListener("click", () => {
  byId("recovery-email").value = byId("email").value.trim();
  showPanel("forgot");
  message("");
});
byId("back-to-signin").addEventListener("click", () => {
  showPanel("account");
  message("");
});
byId("forgot-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = byId("recovery-email").value.trim().toLowerCase();
  if (!validateEmail(email)) return message("Enter a valid email address.", "error");
  const button = event.submitter;
  setBusy(button, true, "SENDING LINK…");
  try {
    const result = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/flock/login"
    });
    if (result.error) throw result.error;
    message("If that address belongs to an account, a password-reset email will arrive shortly.", "success");
  } catch (error) {
    message(errorText(error), "error");
  } finally {
    setBusy(button, false);
  }
});
byId("recovery-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = byId("new-password").value;
  if (password.length < 12) return message("Use a password with at least 12 characters.", "error");
  if (password !== byId("new-password-confirm").value) return message("The passwords do not match.", "error");
  const button = event.submitter;
  setBusy(button, true, "SAVING PASSWORD…");
  try {
    const result = await supabase.auth.updateUser({ password });
    if (result.error) throw result.error;
    await afterFirstFactor();
  } catch (error) {
    message(errorText(error), "error");
  } finally {
    setBusy(button, false);
  }
});

setAuthMode("signin");
boot();