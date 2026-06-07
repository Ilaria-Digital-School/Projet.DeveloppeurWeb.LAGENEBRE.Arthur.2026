/* ============================================================
   Recipe Shelter — search.js
   Recherche avancée : filtres, affichage, pagination
   ============================================================ */

"use strict";

// ── Données de démo ────────────────────────────────────────
const DEMO_RECIPES = [
  { id: 1, slug: "tarte-aux-pommes", title: "Tarte aux Pommes Normande", category: "Desserts", description: "Une tarte aux pommes généreuse avec une crème normande onctueuse et une pâte brisée maison croustillante.", prepTime: 30, cookTime: 45, servings: 8, author: "Sophie M.", rating: 4.8, ratingCount: 34, tags: ["sucré","automne"], ingredients: ["pommes","farine","beurre"] },
  { id: 2, slug: "boeuf-bourguignon", title: "Bœuf Bourguignon", category: "Viandes", description: "Le classique français mijotés pendant des heures dans un vin de Bourgogne avec des légumes de saison.", prepTime: 45, cookTime: 180, servings: 6, author: "Jean P.", rating: 4.9, ratingCount: 52, tags: ["classique","hiver"], ingredients: ["boeuf","vin rouge","carottes","champignons"] },
  { id: 3, slug: "risotto-parmesan", title: "Risotto au Parmesan", category: "Pâtes & Riz", description: "Un risotto crémeux et savoureux, préparé avec un bon bouillon de légumes et du parmesan affiné.", prepTime: 15, cookTime: 30, servings: 4, author: "Marco L.", rating: 4.6, ratingCount: 28, tags: ["végétarien","rapide"], ingredients: ["riz arborio","parmesan","oignon"] },
  { id: 4, slug: "gateau-chocolat", title: "Gâteau au Chocolat Fondant", category: "Desserts", description: "Un gâteau au chocolat ultra fondant avec un cœur coulant, à servir tiède avec une boule de glace vanille.", prepTime: 20, cookTime: 25, servings: 6, author: "Claire D.", rating: 4.7, ratingCount: 61, tags: ["sucré","rapide"], ingredients: ["chocolat","beurre","oeufs","farine"] },
  { id: 5, slug: "salade-nicoise", title: "Salade Niçoise Traditionnelle", category: "Salades", description: "La vraie salade niçoise avec thon, olives, anchois et légumes croquants, sans cuisson des légumes.", prepTime: 20, cookTime: 0, servings: 4, author: "Pierre N.", rating: 4.4, ratingCount: 19, tags: ["léger","été","sans cuisson"], ingredients: ["thon","tomates","oeufs","olives"] },
  { id: 6, slug: "soupe-oignon", title: "Soupe à l'Oignon Gratinée", category: "Soupes", description: "La soupe à l'oignon parisienne, gratinée au four avec du gruyère fondant sur des croûtons dorés.", prepTime: 15, cookTime: 60, servings: 4, author: "Hélène B.", rating: 4.5, ratingCount: 23, tags: ["classique","hiver"], ingredients: ["oignons","gruyère","bouillon"] },
  { id: 7, slug: "poulet-roti", title: "Poulet Rôti aux Herbes", category: "Viandes", description: "Un poulet rôti parfumé aux herbes de Provence, avec une peau dorée et croustillante.", prepTime: 15, cookTime: 90, servings: 5, author: "Anne-Marie C.", rating: 4.7, ratingCount: 44, tags: ["classique","dimanche"], ingredients: ["poulet","herbes","ail","citron"] },
  { id: 8, slug: "crepes-bretonnes", title: "Crêpes Bretonnes", category: "Desserts", description: "Les vraies crêpes bretonnes fines et dorées, avec leur recette traditionnelle au beurre salé.", prepTime: 10, cookTime: 30, servings: 12, author: "Yann K.", rating: 4.8, ratingCount: 78, tags: ["classique","sucré"], ingredients: ["farine","oeufs","lait","beurre"] },
];

const CATEGORIES = ["Tous", "Desserts", "Viandes", "Pâtes & Riz", "Salades", "Soupes"];
const PAGE_SIZE = 6;

let currentPage = 1;
let filteredRecipes = [...DEMO_RECIPES];

// ── Éléments DOM ───────────────────────────────────────────
const resultsGrid = document.getElementById("results-grid");
const resultsCount = document.getElementById("results-count");
const paginationEl = document.getElementById("pagination");
const searchForm = document.getElementById("search-form");
const inputQ = document.getElementById("search-q");
const selectCategory = document.getElementById("search-category");
const selectTime = document.getElementById("search-max-time");
const btnReset = document.getElementById("btn-reset");
const liveRegion = document.getElementById("search-live-region");

// ── Initialisation ─────────────────────────────────────────
function init() {
  // Lire les paramètres URL pour pré-remplir
  const params = new URLSearchParams(window.location.search);
  if (params.get("q"))
    inputQ.value = params.get("q");
  if (params.get("categoryId"))
    selectCategory.value = params.get("categoryId");

  applyFilters();

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    currentPage = 1;
    applyFilters();
  });

  btnReset.addEventListener("click", () => {
    searchForm.reset();
    currentPage = 1;
    applyFilters();
  });
}

// ── Filtrage ───────────────────────────────────────────────
function applyFilters() {
  const q = inputQ.value.trim().toLowerCase();
  const category = selectCategory.value;
  const maxTime = parseInt(selectTime.value, 10) || Infinity;

  filteredRecipes = DEMO_RECIPES.filter((r) => {
    const matchQ = !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    const matchCat = !category || category === "Tous" || r.category === category;
    const totalTime = r.prepTime + r.cookTime;
    const matchTime = totalTime <= maxTime;
    
    return matchQ && matchCat && matchTime;
  });

  renderResults();
  renderPagination();
  announceResults();
}

// ── Rendu des résultats ────────────────────────────────────
function renderResults() {
  const start = (currentPage - 1) * PAGE_SIZE;
  const page = filteredRecipes.slice(start, start + PAGE_SIZE);

  resultsCount.textContent = `${filteredRecipes.length} recette${filteredRecipes.length !== 1 ? "s" : ""} trouvée${filteredRecipes.length !== 1 ? "s" : ""}`;

  if (filteredRecipes.length === 0) {
    resultsGrid.innerHTML = `<p class="rs-no-results" style="grid-column:1/-1;text-align:center;color:rgba(26,26,26,.55);padding:3rem 0;">Aucune recette ne correspond à votre recherche.</p>`;
    return;
  }

  resultsGrid.innerHTML = page.map(recipeCardHTML).join("");
  initFavoriteButtons();
}

function recipeCardHTML(r) {
  const totalMin = r.prepTime + r.cookTime;
  const timeLabel = totalMin < 60 ? `${totalMin} min` : `${Math.floor(totalMin / 60)}h${totalMin % 60 ? (totalMin % 60) + "min" : ""}`;

  return `
    <article class="rs-recipe-card">
      <a class="rs-recipe-card-link" href="recipe-detail.html?slug=${r.slug}" aria-label="${r.title}">
        <div class="rs-recipe-image">
          <img src="assets/images/placeholder.svg" alt="" width="400" height="300" loading="lazy">
        </div>
        <div class="rs-recipe-card-body">
          <div>
            <span class="rs-category">${r.category}</span>
            <h2>${r.title}</h2>
          </div>
          <p>${r.description}</p>
          <div class="rs-recipe-meta" aria-label="Informations">
            <span class="rs-meta-item">${timeLabel}</span>
            <span class="rs-meta-item">${r.servings} portions</span>
            <span class="rs-meta-item">★ ${r.rating}</span>
            <span class="rs-meta-item">Par ${r.author}</span>
          </div>
        </div>
      </a>
      <button type="button" class="rs-fav-badge" data-fav-btn="${r.slug}">♡</button>
    </article>`;
}

// ── Pagination ─────────────────────────────────────────────
function renderPagination() {
  const totalPages = Math.ceil(filteredRecipes.length / PAGE_SIZE);
  if (totalPages <= 1) {
    paginationEl.innerHTML = "";
    return;
  }

  let html = "";
  for (let i = 1; i <= totalPages; i++) {
    html += `<button type="button" class="${i === currentPage ? "active" : ""}"
      aria-label="Page ${i}" aria-current="${i === currentPage ? "page" : "false"}"
      data-page="${i}">${i}</button>`;
  }
  paginationEl.innerHTML = html;

  paginationEl.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentPage = parseInt(btn.dataset.page, 10);
      renderResults();
      renderPagination();
      resultsGrid.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

// ── Annonce aria-live pour lecteurs d'écran ────────────────
function announceResults() {
  liveRegion.textContent = `${filteredRecipes.length} résultat${filteredRecipes.length !== 1 ? "s" : ""} affiché${filteredRecipes.length !== 1 ? "s" : ""}`;
}

document.addEventListener("DOMContentLoaded", init);
