/* ============================================================
   Recipe Shelter — validation.js
   Validation JavaScript du formulaire d'inscription
   ============================================================ */

"use strict";

// ── Règles de validation ───────────────────────────────────
const RULES = {
  username: {
    validate(v) {
      if (!v)
        return "Le nom d'utilisateur est requis.";
      if (v.length < 3)
        return "Minimum 3 caractères.";
      if (v.length > 64)
        return "Maximum 64 caractères.";
      if (!/^[a-zA-Z0-9_\-\.]+$/.test(v))
        return "Caractères autorisés : lettres, chiffres, _ - .";
      return null;
    },
  },
  email: {
    validate(v) {
      if (!v)
        return "L'adresse email est requise.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
        return "Adresse email invalide.";
      return null;
    },
  },
  password: {
    validate(v) {
      if (!v)
        return "Le mot de passe est requis.";
      if (v.length < 8)
        return "Minimum 8 caractères.";
      if (v.length > 128)
        return "Maximum 128 caractères.";
      if (!/[A-Z]/.test(v))
        return "Au moins une majuscule requise.";
      if (!/[0-9]/.test(v))
        return "Au moins un chiffre requis.";
      return null;
    },
  },
  "password-confirm": {
    validate(v, form) {
      if (!v)
        return "Veuillez confirmer votre mot de passe.";
      
      const pwd = form.querySelector("#password").value;
      
      if (v !== pwd)
        return "Les mots de passe ne correspondent pas.";
      return null;
    },
  },
};

// ── Helpers DOM ────────────────────────────────────────────
function getField(id) {
  return document.getElementById(id);
}

function getError(id) {
  return document.getElementById(`${id}-error`);
}

function setFieldState(id, errorMsg) {
  const input = getField(id);
  const error = getError(id);

  if (!input || !error)
    return;

  if (errorMsg) {
    input.classList.add("invalid");
    input.classList.remove("valid");
    input.setAttribute("aria-invalid", "true");
    error.textContent = errorMsg;
    error.classList.add("visible");
  } else {
    input.classList.remove("invalid");
    input.classList.add("valid");
    input.setAttribute("aria-invalid", "false");
    error.textContent = "";
    error.classList.remove("visible");
  }
}

// ── Init formulaire ────────────────────────────────────────
function initSignUpForm() {
  const form = document.getElementById("signup-form");
  if (!form) return;

  const submitBtn     = document.getElementById("submit-btn");
  const successBanner = document.getElementById("success-banner");
  const fields        = ["username", "email", "password", "password-confirm"];

  // Validation à la perte de focus
  fields.forEach((id) => {
    const input = getField(id);
    if (!input)
      return;
    input.addEventListener("blur", () => {
      const rule = RULES[id];
      if (rule)
        setFieldState(id, rule.validate(input.value.trim(), form));
    });
    // Retirer l'erreur dès que l'utilisateur retape
    input.addEventListener("input", () => {
      if (input.classList.contains("invalid")) {
        const rule = RULES[id];
        if (rule)
          setFieldState(id, rule.validate(input.value.trim(), form));
      }
    });
  });

  // Indicateur de force du mot de passe
  const pwdInput = getField("password");
  const strengthBar = document.getElementById("pwd-strength-bar");
  const strengthText = document.getElementById("pwd-strength-text");

  if (pwdInput && strengthBar) {
    pwdInput.addEventListener("input", () => {
      const score = passwordScore(pwdInput.value);
      const levels = ["", "Faible", "Moyen", "Fort", "Très fort"];
      const colors = ["", "#d92d20", "#f79009", "#12b76a", "#027a48"];

      strengthBar.style.width   = `${(score / 4) * 100}%`;
      strengthBar.style.background = colors[score] || "#e5e7eb";

      if (strengthText)
        strengthText.textContent = levels[score] || "";
    });
  }

  // Soumission
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let hasError = false;
    fields.forEach((id) => {
      const input = getField(id);
      if (!input)
        return;

      const rule = RULES[id];
      if (!rule)
        return;

      const err = rule.validate(input.value.trim(), form);
      setFieldState(id, err);
      if (err)
        hasError = true;
    });

    if (hasError) {
      // Focus sur le premier champ invalide
      const firstInvalid = form.querySelector(".invalid");
      if (firstInvalid)
        firstInvalid.focus();
      return;
    }

    // Simulation envoi
    submitBtn.disabled = true;
    submitBtn.textContent = "Création en cours…";

    setTimeout(() => {
      form.style.display = "none";
      successBanner.hidden = false;
      successBanner.focus();
    }, 1000);
  });
}

// ── Score de force du mot de passe ────────────────────────
function passwordScore(pwd) {
  let score = 0;

  if (pwd.length >= 8)
    score++;
  if (pwd.length >= 12)
    score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd))
    score++;
  if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd))
    score++;

  return Math.min(score, 4);
}

document.addEventListener("DOMContentLoaded", initSignUpForm);
