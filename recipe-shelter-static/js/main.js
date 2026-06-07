/* ============================================================
   Recipe Shelter — main.js
   Fonctionnalités partagées : navigation, favoris
   ============================================================ */

"use strict";

// ── Navigation mobile ──────────────────────────────────────
const hamburger = document.getElementById("hamburger");
const mainNav   = document.getElementById("main-nav");

if (hamburger && mainNav) {
  hamburger.addEventListener("click", () => {
    const isOpen = hamburger.getAttribute("aria-expanded") === "true";

    hamburger.setAttribute("aria-expanded", String(!isOpen));
    mainNav.classList.toggle("open", !isOpen);
  });

  // Ferme le menu si clic en dehors
  document.addEventListener("click", (e) => {
    if (!hamburger.contains(e.target) && !mainNav.contains(e.target)) {
      hamburger.setAttribute("aria-expanded", "false");
      mainNav.classList.remove("open");
    }
  });
}

// ── Favoris ────────────────────────────────────────────────
// Stockage des favoris en mémoire (simulation)
const favorites = new Set(["tarte-aux-pommes"]);

/**
 * Initialise tous les boutons favoris de la page.
 */
function initFavoriteButtons() {
  document.querySelectorAll("[data-fav-btn]").forEach((btn) => {
    const slug = btn.dataset.favBtn;
    updateFavButton(btn, favorites.has(slug));

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleFavorite(btn, slug);
    });
  });
}

function toggleFavorite(btn, slug) {
  btn.disabled = true;
  // Simule un appel API asynchrone
  setTimeout(() => {
    if (favorites.has(slug)) {
      favorites.delete(slug);
    } else {
      favorites.add(slug);
    }
    updateFavButton(btn, favorites.has(slug));
    btn.disabled = false;
  }, 300);
}

function updateFavButton(btn, isFav) {
  btn.classList.toggle("active", isFav);
  btn.setAttribute("aria-label", isFav ? "Retirer des favoris" : "Ajouter aux favoris");
  btn.innerHTML = isFav
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
         <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
       </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
         <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01z"/>
       </svg>`;
}

// ── Barre de recherche header ──────────────────────────────
const headerSearchForm = document.getElementById("header-search-form");
if (headerSearchForm) {
  headerSearchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = headerSearchForm.querySelector("input").value.trim();
    if (q) {
      window.location.href = `recipes.html?q=${encodeURIComponent(q)}`;
    }
  });
}

// ── Init ────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initFavoriteButtons();
});
