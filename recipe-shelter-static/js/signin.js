/* ============================================================
   Recipe Shelter — signin.js
   Validation et soumission du formulaire de connexion
   ============================================================ */

"use strict";

// Compte de démo pour la démonstration
const DEMO_ACCOUNTS = [
  { email: "user@recipe-shelter.fr",  password: "Demo1234!" },
  { email: "admin@recipe-shelter.fr", password: "Admin1234!" },
];

function initSignInForm() {
  const form  = document.getElementById("signin-form");
  const submitBtn = document.getElementById("submit-btn");
  const successBanner = document.getElementById("success-banner");
  const errorBanner = document.getElementById("login-error-banner");
  const togglePwd = document.getElementById("toggle-pwd");
  const pwdInput = document.getElementById("password");

  if (!form) return;

  // ── Afficher / masquer le mot de passe ─────────────────────
  if (togglePwd && pwdInput) {
    togglePwd.addEventListener("click", () => {
      const isShown = pwdInput.type === "text";
      pwdInput.type = isShown ? "password" : "text";
      togglePwd.setAttribute("aria-label", isShown ? "Afficher le mot de passe" : "Masquer le mot de passe");
      togglePwd.setAttribute("aria-pressed", String(!isShown));
      togglePwd.textContent = isShown ? "👁" : "🙈";
    });
  }

  // ── Validation à la perte de focus ─────────────────────────
  document.getElementById("email").addEventListener("blur", () => validateField("email"));
  pwdInput.addEventListener("blur", () => validateField("password"));

  // Efface l'erreur dès que l'utilisateur retape
  ["email", "password"].forEach(id => {
    document.getElementById(id).addEventListener("input", () => {
      clearFieldError(id);
      hideGlobalError();
    });
  });

  // ── Soumission ──────────────────────────────────────────────
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const emailOk = validateField("email");
    const pwdOk = validateField("password");

    if (!emailOk || !pwdOk) {
      document.querySelector(".invalid")?.focus();
      return;
    }

    // Simulation appel API
    submitBtn.disabled = true;
    submitBtn.textContent = "Connexion en cours…";
    hideGlobalError();

    setTimeout(() => {
      const email = document.getElementById("email").value.trim().toLowerCase();
      const password = document.getElementById("password").value;

      const match = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);

      if (match) {
        form.style.display = "none";
        successBanner.hidden = false;
        successBanner.focus();
        // Simule une redirection après 1,5s
        setTimeout(() => { window.location.href = "index.html"; }, 1500);
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = "Se connecter";
        showGlobalError("Identifiants incorrects. Vérifiez votre email et votre mot de passe.");
        document.getElementById("password").value = "";
        document.getElementById("password").focus();
      }
    }, 800);
  });

  // ── Lien mot de passe oublié ────────────────────────────────
  document.getElementById("forgot-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    if (email) {
      alert(`Un email de réinitialisation sera envoyé à : ${email}`);
    } else {
      document.getElementById("email").focus();
      showFieldError("email", "Saisissez votre email pour recevoir le lien de réinitialisation.");
    }
  });
}

// ── Helpers de validation ──────────────────────────────────────
function validateField(id) {
  const input = document.getElementById(id);
  if (!input)
    return true;

  const value = input.value.trim();
  let error = null;

  if (id === "email") {
    if (!value)
      error = "L'adresse email est requise.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      error = "Adresse email invalide.";
  }

  if (id === "password") {
    if (!value)
      error = "Le mot de passe est requis.";
  }

  if (error) {
    showFieldError(id, error);
    return false;
  }

  clearFieldError(id);
  return true;
}

function showFieldError(id, message) {
  const input = document.getElementById(id);
  const errEl = document.getElementById(`${id}-error`);

  if (!input || !errEl)
    return;

  input.classList.add("invalid");
  input.classList.remove("valid");
  input.setAttribute("aria-invalid", "true");
  errEl.textContent = message;
  errEl.classList.add("visible");
}

function clearFieldError(id) {
  const input = document.getElementById(id);
  const errEl = document.getElementById(`${id}-error`);

  if (!input || !errEl)
    return;

  input.classList.remove("invalid");

  if (input.value.trim())
    input.classList.add("valid");
  
  input.setAttribute("aria-invalid", "false");
  errEl.textContent = "";
  errEl.classList.remove("visible");
}

function showGlobalError(message) {
  const banner = document.getElementById("login-error-banner");
  
  if (!banner)
    return;
  
  banner.textContent = message;
  banner.hidden = false;
}

function hideGlobalError() {
  const banner = document.getElementById("login-error-banner");
  
  if (banner)
    banner.hidden = true;
}

document.addEventListener("DOMContentLoaded", initSignInForm);
