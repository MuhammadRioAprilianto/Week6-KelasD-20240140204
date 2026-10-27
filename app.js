// ============================================================
// app.js — GreenMart: Fetch API, DOM Manipulation, Search & Filter
// ============================================================

// ——————————————————————————————————————
// KONFIGURASI & UTILITAS
// ——————————————————————————————————————

/** Endpoint API untuk mengambil data produk */
const API_URL = "https://dummyjson.com/products?limit=30";

/** Key localStorage untuk menyimpan produk buatan user */
const STORAGE_KEY = "greenmart_user_products";

/** State filter aktif */
let currentCategory = "all";
let currentSearchKeyword = "";
let allFetchedProducts = [];

/**
 * Format angka menjadi format mata uang USD ($XX.XX).
 * @param {number} amount - Nilai harga.
 * @returns {string} - Harga dalam format string.
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Ambil daftar produk user dari localStorage.
 * @returns {Array} - Array produk user.
 */
function getUserProducts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

/**
 * Simpan daftar produk user ke localStorage.
 * @param {Array} products - Array produk user.
 */
function saveUserProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// ——————————————————————————————————————
// NAVBAR TOGGLE (RESPONSIVE MOBILE)
// ——————————————————————————————————————
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

// ============================================================
// AUTO-CAPTION ENGINE — Generator Deskripsi Produk Otomatis
// ============================================================

/**
 * Menghasilkan deskripsi produk profesional dan menarik berdasarkan nama dan kategori.
 * @param {string} name - Nama produk.
 * @param {string} category - Kategori produk.
 * @returns {string} - Teks deskripsi hasil generate.
 */
function generateAutoCaption(name, category) {
  const templates = {
    electronics: [
      `${name} adalah perangkat elektronik berkualitas tinggi dengan teknologi mutakhir dan desain ergonomis, dirancang untuk mendukung gaya hidup digital Anda.`,
      `Hadirkan efisiensi dan performa maksimal dengan ${name}. Dibuat dengan komponen andal untuk memenuhi kebutuhan produktivitas masa kini.`,
      `${name} menggabungkan inovasi teknologi presisi dengan keandalan optimal, menjadi solusi cerdas untuk aktivitas harian Anda.`,
    ],
    beauty: [
      `${name} merupakan produk perawatan berkualitas tinggi yang diformulasikan dari bahan pilihan untuk memberikan perlindungan dan nutrisi terbaik.`,
      `Dapatkan hasil optimal dan percaya diri sepanjang hari bersama ${name}. Tekstur ringan, aman digunakan, dan cocok untuk perawatan rutin.`,
      `${name} menghadirkan sentuhan elegan untuk rutinitas perawatan Anda dengan formula khusus yang telah teruji kualitasnya.`,
    ],
    groceries: [
      `${name} adalah produk pilihan segar dengan kualitas terjamin untuk melengkapi kebutuhan dapur dan konsumsi harian keluarga Anda.`,
      `Dipilih dengan standar mutu terbaik, ${name} menyajikan cita rasa dan kualitas konsisten untuk kebutuhan sehari-hari.`,
      `${name} hadir sebagai pilihan bahan konsumsi andalan dengan kesegaran maksimal dan harga yang kompetitif.`,
    ],
    furniture: [
      `${name} dirancang dengan material kokoh dan estetika modern, memberikan sentuhan kenyamanan sekaligus mempercantik interior ruangan Anda.`,
      `Sentuhan craftsmanship presisi pada ${name} menjadikannya pilihan ideal untuk hunian kontemporer yang mengutamakan fungsi dan gaya.`,
      `Padukan kenyamanan dan daya tahan jangka panjang bersama ${name}, solusi perabot rumah yang elegan dan fungsional.`,
    ],
    clothing: [
      `${name} dirancang dengan potongan modern dan bahan yang nyaman, memberikan kebebasan bergerak sekaligus tampilan yang berkelas.`,
      `Tingkatkan gaya penampilan Anda dengan ${name}. Jahitan rapi, material lembut di kulit, dan cocok untuk berbagai momen.`,
      `${name} memadukan estetika minimalis dan kenyamanan premium untuk melengkapi koleksi busana favorit Anda.`,
    ],
    sports: [
      `${name} dirancang untuk mendukung performa latihan dan aktivitas fisik Anda secara optimal dengan material tahan lama dan ergonomis.`,
      `Maksimalkan setiap sesi olahraga Anda bersama ${name}, perlengkapan andal yang mengutamakan keamanan dan ketahanan.`,
      `${name} hadir untuk mendukung mobilitas aktif Anda dengan kenyamanan maksimal dan durabilitas tinggi.`,
    ],
    smartphones: [
      `${name} menghadirkan pengalaman komputasi mobile mutakhir dengan layar responsif, kamera jernih, dan baterai tahan lama.`,
      `Tetap produktif dan terhubung dengan ${name}, smartphone berkinerja cepat dengan desain ramping dan elegan.`,
    ],
    laptops: [
      `${name} menawarkan performa komputasi tinggi untuk kebutuhan multitasking, pekerjaan profesional, hingga hiburan berkualitas.`,
      `Ringan, bertenaga, dan andal — ${name} adalah perangkat laptop ideal untuk menunjang produktivitas di mana saja.`,
    ],
    automotive: [
      `${name} merupakan aksesoris otomotif berkualitas yang dirancang presisi untuk menunjang keamanan dan performa kendaraan Anda.`,
      `Tingkatkan kenyamanan berkendara Anda dengan ${name}, produk otomotif dengan material unggulan dan ketahanan tinggi.`,
    ],
    "home-decoration": [
      `${name} memberikan aksen visual yang memikat untuk memperkaya nuansa hangat dan estetis pada interior ruangan Anda.`,
      `Hadirkan suasana baru di setiap sudut ruangan Anda dengan sentuhan artistik dari ${name}.`,
    ],
  };

  const categoryTemplates = templates[category] || [
    `${name} adalah produk unggulan yang dirancang dengan perhatian pada detail mutu dan keandalan tinggi di kelasnya.`,
    `Temukan perpaduan fungsionalitas dan kualitas terbaik dalam setiap penggunaan ${name}.`,
    `${name} hadir untuk memenuhi kebutuhan Anda dengan standar kualitas teruji dan kepuasan terjamin.`,
  ];

  const randomIndex = Math.floor(Math.random() * categoryTemplates.length);
  return categoryTemplates[randomIndex];
}

// ============================================================
// DOM MANIPULATION — PEMBUATAN ELEMEN KARTU PRODUK
// ============================================================

/**
 * Membuat elemen kartu produk secara dinamis menggunakan DOM Manipulation.
 * @param {Object} product - Data produk.
 * @returns {HTMLElement} - Elemen kartu produk.
 */
function createProductCard(product) {
  const card = document.createElement("div");
  card.classList.add("product-card");

  // Dataset untuk pencarian dan filter kategori
  card.dataset.title = (product.title || "").toLowerCase();
  card.dataset.category = (product.category || "").toLowerCase();
  card.dataset.description = (product.description || "").toLowerCase();

  // 1. Image Wrapper
  const imageWrap = document.createElement("div");
  imageWrap.classList.add("card-image-wrap");

  const img = document.createElement("img");
  img.src = product.thumbnail || "https://placehold.co/400x300/f5f5f5/222222?text=Product";
  img.alt = product.title || "Product";
  img.loading = "lazy";
  imageWrap.appendChild(img);

  // Badge kategori
  const catBadge = document.createElement("span");
  catBadge.classList.add("card-badge", "badge-category");
  catBadge.textContent = product.category || "General";
  imageWrap.appendChild(catBadge);

  // Badge produk baru (jika ditambahkan user)
  if (product.isUserAdded) {
    const newBadge = document.createElement("span");
    newBadge.classList.add("card-badge", "badge-new");
    newBadge.textContent = "New";
    imageWrap.appendChild(newBadge);
  }

  card.appendChild(imageWrap);

  // 2. Card Body
  const body = document.createElement("div");
  body.classList.add("card-body");

  // Baris Header: Judul & Harga
  const headerRow = document.createElement("div");
  headerRow.classList.add("card-header-row");

  const title = document.createElement("h3");
  title.classList.add("card-title");
  title.textContent = product.title;
  title.title = product.title;

  const price = document.createElement("span");
  price.classList.add("price");
  price.textContent = formatCurrency(product.price);

  headerRow.appendChild(title);
  headerRow.appendChild(price);
  body.appendChild(headerRow);

  // Baris Meta: Rating & Review
  const meta = document.createElement("div");
  meta.classList.add("card-meta");

  const ratingVal = product.rating ? Number(product.rating).toFixed(1) : "5.0";
  const reviewCount = product.reviews ? product.reviews.length * 35 + 15 : Math.floor(Math.random() * 150 + 20);

  const starSpan = document.createElement("span");
  starSpan.classList.add("rating-stars");
  starSpan.innerHTML = `&#9733; ${ratingVal}`;

  const reviewSpan = document.createElement("span");
  reviewSpan.classList.add("rating-text");
  reviewSpan.textContent = `(${reviewCount} Reviews)`;

  meta.appendChild(starSpan);
  meta.appendChild(reviewSpan);
  body.appendChild(meta);

  // Deskripsi produk
  const desc = document.createElement("p");
  desc.classList.add("desc");
  desc.textContent = product.description || "Tidak ada deskripsi tersedia.";
  body.appendChild(desc);

  card.appendChild(body);

  // 3. Card Footer (Tombol Aksi)
  const footer = document.createElement("div");
  footer.classList.add("card-footer");

  const btnCart = document.createElement("button");
  btnCart.type = "button";
  btnCart.classList.add("btn", "btn-card", "btn-card-outline");
  btnCart.textContent = "Add to Cart";
  btnCart.addEventListener("click", () => {
    btnCart.textContent = "Added";
    setTimeout(() => { btnCart.textContent = "Add to Cart"; }, 1500);
  });

  const btnBuy = document.createElement("button");
  btnBuy.type = "button";
  btnBuy.classList.add("btn", "btn-card", "btn-card-fill");
  btnBuy.textContent = "Buy Now";

  footer.appendChild(btnCart);
  footer.appendChild(btnBuy);
  card.appendChild(footer);

  return card;
}

// ============================================================
// FETCH API — MENGAMBIL DATA PRODUK
// ============================================================

/**
 * Menampilkan indikator loading di area status katalog.
 */
function showLoading() {
  const status = document.getElementById("catalog-status");
  if (!status) return;
  status.innerHTML = `
    <div class="loading-indicator">
      <div class="spinner"></div>
      <span>Memuat data produk...</span>
    </div>
  `;
}

/**
 * Menampilkan pesan error dan tombol Coba Lagi saat fetch gagal.
 * @param {string} message - Pesan error.
 */
function showError(message) {
  const status = document.getElementById("catalog-status");
  if (!status) return;
  status.innerHTML = `
    <div class="error-box">
      <p>${message}</p>
      <button class="btn-retry" id="btn-retry">Coba Lagi</button>
    </div>
  `;

  const retryBtn = document.getElementById("btn-retry");
  if (retryBtn) {
    retryBtn.addEventListener("click", fetchProducts);
  }
}

/**
 * Mengambil data produk dari DummyJSON API menggunakan fetch() + async/await.
 */
async function fetchProducts() {
  const grid = document.getElementById("product-grid");
  const status = document.getElementById("catalog-status");
  if (!grid || !status) return;

  grid.innerHTML = "";
  showLoading();

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    allFetchedProducts = data.products || [];

    status.innerHTML = "";

    // Gabungkan produk user (localStorage) di posisi paling atas
    const userProducts = getUserProducts();
    const allProducts = [...userProducts, ...allFetchedProducts];

    allProducts.forEach((product) => {
      const card = createProductCard(product);
      grid.appendChild(card);
    });

    // Update jumlah pada filter kategori
    updateCategoryCounts();
    applyProductFilter();
  } catch (error) {
    console.error("Fetch error:", error);
    showError("Gagal memuat data produk. Periksa koneksi internet Anda.");
  }
}

/**
 * Mengambil produk rekomendasi untuk halaman Shop atau Beranda.
 */
async function fetchRecommendations(containerId, limit = 4) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const response = await fetch(`https://dummyjson.com/products?limit=${limit}&skip=6`);
    if (!response.ok) return;

    const data = await response.json();
    const products = data.products || [];

    container.innerHTML = "";
    products.forEach((product) => {
      const card = createProductCard(product);
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Recommendations fetch error:", error);
  }
}

// ============================================================
// FITUR FILTER & PENCARIAN
// ============================================================

/**
 * Memperbarui info teks hasil pencarian/filter.
 */
function updateSearchMeta(shown, total) {
  const meta = document.getElementById("search-meta");
  if (!meta) return;

  if (shown === total) {
    meta.textContent = `Menampilkan ${total} produk`;
  } else {
    meta.textContent = `Menampilkan ${shown} dari ${total} produk`;
  }
}

/**
 * Menghitung jumlah produk per kategori dan memperbarui badge di sidebar.
 */
function updateCategoryCounts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  const cards = grid.querySelectorAll(".product-card");
  const counts = { all: cards.length };

  cards.forEach((card) => {
    const cat = card.dataset.category;
    if (cat) {
      counts[cat] = (counts[cat] || 0) + 1;
    }
  });

  const allCountEl = document.getElementById("count-all");
  if (allCountEl) allCountEl.textContent = counts.all || 0;

  document.querySelectorAll(".cat-filter-btn[data-category]").forEach((btn) => {
    const cat = btn.dataset.category;
    const badge = btn.querySelector(".cat-count");
    if (badge && cat !== "all") {
      badge.textContent = counts[cat] || 0;
    }
  });
}

/**
 * Menerapkan filter kategori dan kata kunci pencarian secara bersamaan.
 */
function applyProductFilter() {
  const grid = document.getElementById("product-grid");
  const emptyState = document.getElementById("empty-state");
  if (!grid) return;

  const cards = grid.querySelectorAll(".product-card");
  let visibleCount = 0;

  cards.forEach((card) => {
    const title = card.dataset.title || "";
    const category = card.dataset.category || "";
    const description = card.dataset.description || "";

    const matchCategory = currentCategory === "all" || category === currentCategory;
    const matchKeyword =
      !currentSearchKeyword ||
      title.includes(currentSearchKeyword) ||
      category.includes(currentSearchKeyword) ||
      description.includes(currentSearchKeyword);

    const isMatch = matchCategory && matchKeyword;
    card.style.display = isMatch ? "" : "none";
    if (isMatch) visibleCount++;
  });

  if (emptyState) {
    emptyState.style.display = visibleCount === 0 ? "block" : "none";
  }

  updateSearchMeta(visibleCount, cards.length);

  const clearBtn = document.getElementById("search-clear");
  if (clearBtn) {
    clearBtn.classList.toggle("visible", currentSearchKeyword !== "");
  }
}

// Event Listeners Pencarian
const searchInput = document.getElementById("search-input");
const searchClear = document.getElementById("search-clear");
const searchSubmit = document.getElementById("btn-search-submit");

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    currentSearchKeyword = e.target.value.toLowerCase().trim();
    applyProductFilter();
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      currentSearchKeyword = searchInput.value.toLowerCase().trim();
      applyProductFilter();
    }
  });
}

if (searchSubmit && searchInput) {
  searchSubmit.addEventListener("click", () => {
    currentSearchKeyword = searchInput.value.toLowerCase().trim();
    applyProductFilter();
  });
}

if (searchClear && searchInput) {
  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    currentSearchKeyword = "";
    applyProductFilter();
    searchInput.focus();
  });
}

// Event Listeners Filter Kategori Sidebar
function setupCategoryFilters() {
  const filterList = document.getElementById("category-filter-list");
  if (!filterList) return;

  filterList.addEventListener("click", (e) => {
    const btn = e.target.closest(".cat-filter-btn");
    if (!btn) return;

    filterList.querySelectorAll(".cat-filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    currentCategory = btn.dataset.category || "all";
    applyProductFilter();
  });
}

// ============================================================
// FORM INTERAKTIF — VALIDASI & EVENT HANDLING (Halaman Manage)
// ============================================================

const productForm = document.getElementById("product-form");
const formFeedback = document.getElementById("form-feedback");
const nameInput = document.getElementById("product-name");
const priceInput = document.getElementById("product-price");
const categorySelect = document.getElementById("product-category");
const descInput = document.getElementById("product-desc");
const imageInput = document.getElementById("product-image");
const nameError = document.getElementById("name-error");
const priceError = document.getElementById("price-error");
const btnAutoCaption = document.getElementById("btn-autocaption");
const captionHint = document.getElementById("caption-hint");

/**
 * Menampilkan notifikasi umpan balik form.
 * @param {string} message - Pesan.
 * @param {"success"|"error"} type - Tipe alert.
 */
function showFormFeedback(message, type) {
  if (!formFeedback) return;
  formFeedback.innerHTML = `
    <div class="alert alert-${type}">
      <span>${message}</span>
    </div>
  `;

  setTimeout(() => {
    if (formFeedback) formFeedback.innerHTML = "";
  }, 4000);
}

/**
 * Validasi field nama produk.
 */
function validateName() {
  if (!nameInput) return true;
  const value = nameInput.value.trim();

  if (value.length === 0) {
    if (nameError) nameError.textContent = "Nama produk wajib diisi.";
    nameInput.classList.add("invalid");
    return false;
  }

  if (value.length < 3) {
    if (nameError) nameError.textContent = "Nama produk minimal 3 karakter.";
    nameInput.classList.add("invalid");
    return false;
  }

  if (nameError) nameError.textContent = "";
  nameInput.classList.remove("invalid");
  return true;
}

/**
 * Validasi field harga produk.
 */
function validatePrice() {
  if (!priceInput) return true;
  const value = parseFloat(priceInput.value);

  if (isNaN(value) || priceInput.value.trim() === "") {
    if (priceError) priceError.textContent = "Harga produk wajib diisi.";
    priceInput.classList.add("invalid");
    return false;
  }

  if (value <= 0) {
    if (priceError) priceError.textContent = "Harga harus bernilai lebih besar dari 0.";
    priceInput.classList.add("invalid");
    return false;
  }

  if (priceError) priceError.textContent = "";
  priceInput.classList.remove("invalid");
  return true;
}

if (nameInput) {
  nameInput.addEventListener("input", validateName);
  nameInput.addEventListener("blur", validateName);
}

if (priceInput) {
  priceInput.addEventListener("input", validatePrice);
  priceInput.addEventListener("blur", validatePrice);
}

// Tombol Auto Caption
if (btnAutoCaption) {
  btnAutoCaption.addEventListener("click", () => {
    const name = nameInput ? nameInput.value.trim() : "";
    const category = categorySelect ? categorySelect.value : "";

    if (name.length < 3) {
      if (captionHint) {
        captionHint.textContent = "Isi nama produk minimal 3 karakter terlebih dahulu.";
        captionHint.style.color = "var(--red)";
      }
      if (nameInput) nameInput.focus();
      return;
    }

    const caption = generateAutoCaption(name, category);

    if (descInput) {
      descInput.value = caption;
    }

    if (captionHint) {
      captionHint.textContent = "Deskripsi berhasil di-generate secara otomatis.";
      captionHint.style.color = "var(--green)";

      setTimeout(() => {
        if (captionHint) captionHint.textContent = "";
      }, 3500);
    }
  });
}

// Submit Form Penambahan Produk
if (productForm) {
  productForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const isNameValid = validateName();
    const isPriceValid = validatePrice();

    if (!isNameValid || !isPriceValid) {
      showFormFeedback("Harap perbaiki kesalahan pada formulir sebelum menyimpan.", "error");
      return;
    }

    const newProduct = {
      id: Date.now(),
      title: nameInput.value.trim(),
      price: parseFloat(priceInput.value),
      category: categorySelect ? categorySelect.value : "electronics",
      description: descInput ? descInput.value.trim() : "",
      thumbnail: imageInput && imageInput.value.trim() ? imageInput.value.trim() : null,
      isUserAdded: true,
      rating: 5.0,
      createdAt: new Date().toISOString(),
    };

    // Simpan ke localStorage
    const userProducts = getUserProducts();
    userProducts.unshift(newProduct);
    saveUserProducts(userProducts);

    // Tambahkan ke recent list sidebar
    addRecentProduct(newProduct);

    showFormFeedback(`Produk "${newProduct.title}" berhasil ditambahkan ke katalog.`, "success");

    // Reset input
    productForm.reset();
    if (nameInput) nameInput.classList.remove("invalid");
    if (priceInput) priceInput.classList.remove("invalid");
    if (nameError) nameError.textContent = "";
    if (priceError) priceError.textContent = "";
  });
}

/**
 * Tambahkan item produk ke sidebar riwayat penambahan.
 */
function addRecentProduct(product) {
  const recentContainer = document.getElementById("recent-products");
  const noRecent = document.getElementById("no-recent");
  if (!recentContainer) return;

  if (noRecent) noRecent.style.display = "none";

  const item = document.createElement("div");
  item.classList.add("recent-item");

  const thumb = document.createElement("img");
  thumb.classList.add("recent-thumb");
  thumb.src = product.thumbnail || "https://placehold.co/96x96/f5f5f5/222222?text=Product";
  thumb.alt = product.title;

  const info = document.createElement("div");
  info.classList.add("recent-info");

  const name = document.createElement("h4");
  name.textContent = product.title;

  const price = document.createElement("span");
  price.textContent = formatCurrency(product.price);

  info.appendChild(name);
  info.appendChild(price);
  item.appendChild(thumb);
  item.appendChild(info);

  recentContainer.insertBefore(item, recentContainer.firstChild);
}

/**
 * Muat riwayat produk user saat halaman manage dibuka.
 */
function loadRecentProducts() {
  const recentContainer = document.getElementById("recent-products");
  if (!recentContainer) return;

  const userProducts = getUserProducts();
  if (userProducts.length > 0) {
    const noRecent = document.getElementById("no-recent");
    if (noRecent) noRecent.style.display = "none";

    userProducts.slice(0, 5).forEach((product) => {
      addRecentProduct(product);
    });
  }
}

// ============================================================
// INISIALISASI APLIKASI
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.includes("catalog.html")) {
    setupCategoryFilters();
    fetchProducts();
    fetchRecommendations("recommendations-grid", 3);
  } else if (path.includes("manage.html")) {
    loadRecentProducts();
  } else {
    // index.html
    fetchRecommendations("featured-grid", 3);
  }
});
