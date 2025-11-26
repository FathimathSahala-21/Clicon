// ==================== GLOBAL VARIABLES ====================
let products = []; //List of normally fetched products
let cart = []; //All items user added to cart
let selectedProduct = null; //Temporarily holds a product selected to add to cart
let allProducts = []; //All 100 products fetched from DummyJSON
let currentPage = "home"; //Tracks which page user is currently on (home / cart)

// ==================== ROUTER ====================
//function switches between pages (home/cart) without reloading the website.
function navigateTo(page) {
  currentPage = page;

  try {
    const url = page === "home" ? "/" : `#${page}`;
    window.history.pushState({ page }, "", url);
  } catch (e) {
    window.location.hash = page === "home" ? "" : page;
  }

  renderPage(page);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderPage(page) {
  const app = document.getElementById("app");
  document.body.className = `page-${page}`;

  const topBanner = document.getElementById("topBanner");
  const mainHeader = document.querySelector(".main-header");
  const searchContainer = document.querySelector(".search-container");

  if (page === "cart") {
    if (topBanner) topBanner.style.display = "none";
    if (mainHeader) mainHeader.style.display = "none";
    if (searchContainer) searchContainer.style.display = "none";
  } else {
    if (topBanner) topBanner.style.display = "block";
    if (mainHeader) mainHeader.style.display = "flex";
    if (searchContainer) searchContainer.style.display = "flex";
  }

  if (page === "home") {
    renderHomePage();
  } else if (page === "cart") {
    renderCartPage();
  }
}

window.addEventListener("popstate", (event) => {
  const page = event.state?.page || "home";
  currentPage = page;
  renderPage(page);
});

// ==================== HOME PAGE ====================
function renderHomePage() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <section class="deals-section">
      <div class="container">
        <div class="section-header">
          <div>
            <h2>Best Deals</h2>
            <div class="countdown-timer">
              <span>Deals ends in</span>
              <div class="timer">
                <span class="time-box" id="days">16d</span> :
                <span class="time-box" id="hours">21h</span> :
                <span class="time-box" id="minutes">57m</span> :
                <span class="time-box" id="seconds">23s</span>
              </div>
            </div>
          </div>
          <a href="#" class="browse-all">
            Browse All Product <i class="fas fa-arrow-right"></i>
          </a>
        </div>

        <div class="products-grid" id="productsGrid">
        </div>
      </div>
    </section>

    <section class="category-section">
      <div class="container">
        <h2>Shop with Categorys</h2>
        <div class="categories-slider" id="categoriesSlider">
        </div>
      </div>
    </section>

    <div class="classification-container" id="classificationsContainer"></div>
  `;

  displayFeaturedProducts();
  displayProductClassifications();
  fetchCategories();
  startCountdown();
}

// ==================== CART PAGE ====================
function renderCartPage() {
  const app = document.getElementById("app");

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 100 ? 0 : 15;
  const discount = subtotal * 0.1;
  const tax = (subtotal - discount) * 0.1;
  const total = subtotal - discount + shipping + tax;

  if (cart.length === 0) {
    app.innerHTML = `
      <div class="cart-page">
        <div class="container">
          <div class="breadcrumb">
            <a onclick="navigateTo('home')"><i class="fas fa-home"></i> Home</a>
            <span>›</span>
            <span>Shopping Card</span>
          </div>
          <div class="empty-cart">
            <i class="fas fa-shopping-cart"></i>
            <h3>Your cart is empty</h3>
            <p>Add some products to get started!</p>
            <button class="btn btn-primary" onclick="navigateTo('home')">
              <i class="fas fa-arrow-left"></i>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    `;
    return;
  }

  app.innerHTML = `
    <div class="cart-page">
      <div class="container">
        <div class="breadcrumb">
          <a onclick="navigateTo('home')"><i class="fas fa-home"></i> Home</a>
          <span>›</span>
          <span>Shopping Card</span>
        </div>

        <div class="cart-layout">
          <div class="cart-section">
            <h2>Shopping Card</h2>
            <table class="cart-table">
              <thead>
                <tr>
                  <th>PRODUCTS</th>
                  <th>PRICE</th>
                  <th>QUANTITY</th>
                  <th>SUB-TOTAL</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="cartTableBody">
                ${cart
                  .map(
                    (item, index) => `
                  <tr>
                    <td data-label="Product">
                      <div class="product-info">
                        <img src="${item.image}" alt="${
                      item.title
                    }" onerror="this.src='https://placehold.co/80x80/png'">
                        <div class="product-details">
                          <h4>${item.title.substring(0, 50)}${
                      item.title.length > 50 ? "..." : ""
                    }</h4>
                        </div>
                      </div>
                    </td>
                    <td data-label="Price">$${item.price.toFixed(2)}</td>
                    <td data-label="Quantity">
                      <div class="quantity-controls">
                        <button onclick="updateCartQuantity(${index}, -1)">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateCartQuantity(${index}, 1)">+</button>
                      </div>
                    </td>
                    <td data-label="Subtotal">$${(
                      item.price * item.quantity
                    ).toFixed(2)}</td>
                    <td>
                      <button class="remove-btn" onclick="removeFromCart(${index})" title="Remove item">
                        <i class="fas fa-times"></i>
                      </button>
                    </td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            <div class="cart-actions">
              <button class="btn btn-secondary" onclick="navigateTo('home')">
                <i class="fas fa-arrow-left"></i>
                RETURN TO SHOP
              </button>
              <button class="btn btn-primary" onclick="renderCartPage()">
                UPDATE CART
              </button>
            </div>
          </div>

          <div class="totals-section">
            <h3>Card Totals</h3>
            <div class="totals-row">
              <span>Sub-total</span>
              <span class="amount">$${subtotal.toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>Shipping</span>
              <span class="amount">${
                shipping === 0 ? "Free" : "$" + shipping.toFixed(2)
              }</span>
            </div>
            <div class="totals-row">
              <span>Discount</span>
              <span class="amount">$${discount.toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>Tax</span>
              <span class="amount">$${tax.toFixed(2)}</span>
            </div>
            <div class="totals-row total">
              <span>Total</span>
              <span class="amount">$${total.toFixed(2)} USD</span>
            </div>
            <button class="checkout-btn-full" onclick="checkout()">
              PROCEED TO CHECKOUT
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ==================== CART FUNCTIONS ====================
//Reads saved cart from localStorage.
function initializeCart() {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
  updateCartCount();
}
//Stores updated cart to localStorage.
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  const totalItems = cart.length;
  if (cartCount) {
    cartCount.textContent = totalItems;
  }
}
//Deletes item from cart array.
function updateCartQuantity(index, change) {
  cart[index].quantity += change;
  if (cart[index].quantity < 1) {
    cart[index].quantity = 1;
  }
  saveCart();
  renderCartPage();
}
//Deletes item from cart array.
function removeFromCart(index) {
  if (confirm("Are you sure you want to remove this item?")) {
    cart.splice(index, 1);
    saveCart();
    renderCartPage();
  }
}

function checkout() {
  showMessage("Proceeding to checkout...", "info");
}

// ==================== PRODUCT FUNCTIONS ====================
async function fetchProducts() {
  try {
    const response = await fetch("https://dummyjson.com/products?limit=100");
    const data = await response.json();
    allProducts = data.products;

    displayFeaturedProducts();
    displayProductClassifications();

    document
      .querySelector(".search-btn")
      .addEventListener("click", searchProducts);
    document
      .querySelector(".search-input")
      .addEventListener("keyup", function (e) {
        if (e.key === "Enter") searchProducts();
      });
  } catch (error) {
    console.error("Error fetching products:", error);
    const grid = document.getElementById("productsGrid");
    if (grid) {
      grid.innerHTML = '<p style="color: red;">Failed to load products</p>';
    }
  }
}
//best deal section creation and display
function displayFeaturedProducts() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
  const featured = shuffled.slice(0, 9);

  // Create Featured Product Card
  if (featured.length > 0) {
    const product = featured[0];
    const featuredCard = document.createElement("div");
    featuredCard.className = "featured-product";

    featuredCard.innerHTML = `
      <div class="product-image">
        <img src="${product.thumbnail}" alt="${product.title}">
      </div>
      <div class="product-info">
        <h3>${product.title}</h3>
        <p>${product.description}</p>
        <div class="product-rating">
          <span class="stars">${"★".repeat(
            Math.floor(product.rating)
          )}${"☆".repeat(5 - Math.floor(product.rating))}</span>
          <span class="rating-count">(${product.stock || 0})</span>
        </div>
        <p class="product-price">$${product.price.toFixed(2)}</p>
   <!-- Wishlist Icon -->
   <div class="featured-icons">
        <button class="featured-wishlist-icon" data-action="wishlist" title="Add to Wishlist">
          <i class="fa fa-heart"></i>
        </button>
        <button class="add-to-cart-btn" onclick="addFeaturedToCart(${
          product.id
        })">Add to Cart</button>
     
        
        <!-- Eye Icon -->
        <button class="featured-eye-icon" data-action="view" title="Quick View" onclick='openModal(${JSON.stringify(
          product
        )})'>
          <i class="fa fa-eye"></i>
        </button>
        </div>
      </div>
    `;
    grid.appendChild(featuredCard);
  }

  // Create Products Grid Container
  const productsGrid = document.createElement("div");
  productsGrid.className = "productsGridTop";

  // Add 8 regular product cards with hover icons
  featured.slice(1).forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.productId = product.id; // Store product ID for reference

    let bannerHTML = "";
    if (product.stock <= 0)
      bannerHTML += '<span class="banner sold">SOLD OUT</span>';
    else if (product.rating >= 4.5)
      bannerHTML += '<span class="banner hot">HOT</span>';
    if (product.discountPercentage)
      bannerHTML += `<span class="banner discount">${product.discountPercentage}% OFF</span>`;

    card.innerHTML = `
    <div class="product-image">
      ${bannerHTML}
      <img src="${product.thumbnail}" alt="${product.title}">

      <!-- Hover overlay icons -->
      <div class="hover-icons">
        <button class="icon wish" data-action="wishlist"><i class="fa fa-heart"></i></button>
        <button class="icon cart-btn" data-action="addcart"><i class="fa fa-shopping-cart"></i></button>
        <button class="icon eye-btn" data-action="view"><i class="fa fa-eye"></i></button>
      </div>
    </div>

    <div class="product-info">
      <h3>${product.title}</h3>
      <div class="product-rating">
        <span class="stars">${"★".repeat(
          Math.floor(product.rating)
        )}${"☆".repeat(5 - Math.floor(product.rating))}</span>
        <span class="rating-count">(${product.stock || 0})</span>
      </div>
      <div class="product-price">${product.price.toFixed(2)}</div>
    </div>
  `;

    // Append card to grid first
    productsGrid.appendChild(card);

    // Use addEventListener instead of onclick for better reliability
    const eyeBtn = card.querySelector(".eye-btn");
    const cartBtn = card.querySelector(".cart-btn");
    const wishBtn = card.querySelector(".wish");

    if (eyeBtn) {
      eyeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        console.log("Eye clicked for:", product.title);
        openModal(product);
      });
    }

    if (cartBtn) {
      cartBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        console.log("Cart clicked for:", product.title);
        try {
          selectedProduct = product;
          addToCart();
          console.log("Product added to cart successfully");
          navigateTo("cart");
        } catch (error) {
          console.error("Error adding to cart:", error);
        }
      });
    }

    if (wishBtn) {
      wishBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        console.log("Wishlist clicked for:", product.title);
        showMessage("Added to wishlist!", "info");
      });
    }
  });
  grid.appendChild(productsGrid);
}
//This function is used when a user clicks Add to Cart button on a featured product.
function addFeaturedToCart(id) {
  const product = allProducts.find((p) => p.id === id);
  if (product) {
    selectedProduct = product;
    addToCart();
    renderPage("cart");
  }
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  const rating = product.rating || 4.0;
  const stars =
    "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  const image = product.thumbnail || product.images?.[0] || product.image;

  card.innerHTML = `
    <div class="product-image">
      <img src="${image}" alt="${product.title}"
           onerror="this.src='https://placehold.co/150x150/png'">
    </div>
    <div class="product-info">
      <h3 class="product-title">${product.title.substring(0, 50)}...</h3>
      <p class="product-description">${product.description.substring(
        0,
        80
      )}...</p>
      <div class="product-rating">
        <span class="stars">${stars}</span>
        <span class="rating-count">(${product.stock || 0})</span>
      </div>
      <p class="product-price">$${product.price.toFixed(2)}</p>
      
    </div>
  `;

  // ❗ Now the image exists → safe to attach event listener
  const img = card.querySelector(".product-image img");
  if (img) {
    img.onclick = function () {
      openModal(product);
    };
  }

  return card;
}
//create classification
function createProductCardClassification(product_class) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.onclick = function () {
    openModal(product_class);
  };

  const image =
    product_class.thumbnail || product_class.images?.[0] || product_class.image;

  card.innerHTML = `
    <div class="product-image">
      <img src="${image}" alt="${product_class.title}"
           onerror="this.src='https://placehold.co/150x150/png'">
    </div>
    <div class="product-info">
      <h3 class="product-title">${product_class.title.substring(0, 50)}...</h3>
      <p class="product-price">$${product_class.price.toFixed(2)}</p>
    </div>
  `;

  return card;
}
//display product classification
function displayProductClassifications() {
  const container = document.getElementById("classificationsContainer");
  if (!container) return;

  const classifications = [
    { id: "topRated", title: "Top Rated", filter: (p) => p.rating >= 4.5 },
    { id: "newArrivals", title: "New Arrivals", filter: (p) => p.id % 2 === 0 },
    { id: "bestSellers", title: "Best Sellers", filter: (p) => p.stock > 50 },
    { id: "flashSale", title: "Flash Sale Today", filter: (p) => p.price < 50 },
  ];

  container.innerHTML = "";

  classifications.forEach((classification) => {
    const section = document.createElement("div");
    section.classList.add("classification-section");

    const title = document.createElement("h2");
    title.textContent = classification.title;
    section.appendChild(title);

    const filtered = allProducts.filter(classification.filter);
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    const grid = document.createElement("div");
    grid.classList.add("classification-grid");

    selected.forEach((product) => {
      const card = createProductCardClassification(product);
      card.classList.add("classification-product-card");
      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

// ==================== CATEGORIES ====================
//for caroousal
async function fetchCategories() {
  try {
    const response = await fetch("https://dummyjson.com/products/categories");
    const categories = await response.json();
    const selectedCategories = categories.slice(0, 12);

    const categoriesWithImages = await Promise.all(
      selectedCategories.map(async (category) => {
        try {
          const productsResponse = await fetch(
            `https://dummyjson.com/products/category/${category.slug}?limit=1`
          );
          const data = await productsResponse.json();
          const product = data.products[0];

          return {
            name: category.name,
            slug: category.slug,
            image:
              product?.thumbnail ||
              product?.images?.[0] ||
              "https://placehold.co/150x150/png",
          };
        } catch (err) {
          return {
            name: category.name,
            slug: category.slug,
            image: "https://placehold.co/150x150/png",
          };
        }
      })
    );

    displayCategoriesCarousel(categoriesWithImages);
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}
//carousal display
function displayCategoriesCarousel(categories) {
  const slider = document.getElementById("categoriesSlider");
  if (!slider) return;

  const parentContainer = slider.closest(".category-section .container");
  if (parentContainer) {
    parentContainer.style.position = "relative";
  }

  const oldButtons = slider.parentElement.querySelectorAll(".carousel-btn");
  oldButtons.forEach((btn) => btn.remove());

  const prevBtn = document.createElement("button");
  prevBtn.className = "carousel-btn prev";
  prevBtn.onclick = () => scrollCategories(-1);
  prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';

  const nextBtn = document.createElement("button");
  nextBtn.className = "carousel-btn next";
  nextBtn.onclick = () => scrollCategories(1);
  nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';

  slider.parentElement.appendChild(prevBtn);
  slider.parentElement.appendChild(nextBtn);

  slider.innerHTML = "";

  categories.forEach((category) => {
    const card = document.createElement("div");
    card.className = "category-card";
    card.onclick = function () {
      console.log(`Category clicked: ${category.name}`);
    };

    card.innerHTML = `
      <div class="category-image">
        <img src="${category.image}" alt="${category.name}"
             onerror="this.src='https://placehold.co/150x150/png'">
      </div>
      <h3>${category.name.toUpperCase()}</h3>
    `;

    slider.appendChild(card);
  });
}
//function is used for scrolling your categories carousel left or right.
function scrollCategories(direction) {
  const slider = document.getElementById("categoriesSlider");
  if (slider) {
    const scrollAmount = 300;
    slider.scrollBy({
      left: direction * scrollAmount,
      behavior: "smooth",
    });
  }
}

// ==================== MODAL ====================
function openModal(product) {
  selectedProduct = product;
  const image = product.thumbnail || product.images?.[0] || product.image;
  document.getElementById("modalImage").src = image;
  document.getElementById("modalName").textContent = product.title;
  document.getElementById("modalDescription").textContent = product.description;
  document.getElementById("modalPrice").textContent =
    "$" + product.price.toFixed(2);
  document.getElementById("modalQuantity").value = 1;
  document.getElementById("productModal").classList.add("show");
}

function closeModal() {
  document.getElementById("productModal").classList.remove("show");
}

function changeQuantity(change) {
  const input = document.getElementById("modalQuantity");
  let value = parseInt(input.value) + change;
  if (value < 1) value = 1;
  input.value = value;
}

function addToCart() {
  const quantity = parseInt(document.getElementById("modalQuantity").value);
  const existingItem = cart.find((item) => item.id === selectedProduct.id);

  const image =
    selectedProduct.thumbnail ||
    selectedProduct.images?.[0] ||
    selectedProduct.image;

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: selectedProduct.id,
      title: selectedProduct.title,
      price: selectedProduct.price,
      image: image,
      quantity: quantity,
    });
  }

  saveCart();
  closeModal();
  showMessage("Product added to cart!", "success");
}

// ==================== UTILITY FUNCTIONS ====================
function closeBanner() {
  const banner = document.getElementById("topBanner");
  if (banner) {
    banner.style.display = "none";
  }
}

function startCountdown() {
  const timer = setInterval(function () {
    const days = document.getElementById("days");
    const hours = document.getElementById("hours");
    const minutes = document.getElementById("minutes");
    const seconds = document.getElementById("seconds");

    if (!days || !hours || !minutes || !seconds) {
      clearInterval(timer);
      return;
    }

    let d = parseInt(days.textContent);
    let h = parseInt(hours.textContent);
    let m = parseInt(minutes.textContent);
    let s = parseInt(seconds.textContent);

    s--;
    if (s < 0) {
      s = 59;
      m--;
    }
    if (m < 0) {
      m = 59;
      h--;
    }
    if (h < 0) {
      h = 23;
      d--;
    }

    days.textContent = d + "d";
    hours.textContent = h + "h";
    minutes.textContent = m + "m";
    seconds.textContent = s + "s";
  }, 1000);
}

function searchProducts() {
  const query = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();

  if (!query) {
    displayFeaturedProducts();
    return;
  }

  const results = allProducts.filter(
    (product) =>
      product.title.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
  );

  displaySearchResults(results);
}

function displaySearchResults(results) {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  if (results.length === 0) {
    grid.innerHTML = `<p style="padding:20px; font-size:18px; color:#888;">
        No products found.
      </p>
      <button class="btn btn-secondary" onclick="navigateTo('home')">
        <i class="fas fa-arrow-left"></i>
        RETURN TO SHOP
      </button>`;
    return;
  }

  // Add return shop button at the top
  const buttonContainer = document.createElement("div");
  buttonContainer.style.marginBottom = "20px";
  buttonContainer.innerHTML = `<button class="returnHomeSearch" onclick="navigateTo('home')">
    <i class="fas fa-home"></i>
    Home
  </button>`;
  grid.appendChild(buttonContainer);

  results.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.productId = product.id;

    card.innerHTML = `
      <div class="product-image">
        <img src="${product.thumbnail}" alt="${product.title}">

        <!-- Hover overlay icons -->
        <div class="hover-icons">
          <button class="icon wish" data-action="wishlist"><i class="fa fa-heart"></i></button>
          <button class="icon cart-btn" data-action="addcart"><i class="fa fa-shopping-cart"></i></button>
          <button class="icon eye-btn" data-action="view"><i class="fa fa-eye"></i></button>
        </div>
      </div>

      <div class="product-info">
        <h3>${product.title}</h3>
        <div class="product-rating">
          <span class="stars">${"★".repeat(
            Math.floor(product.rating)
          )}${"☆".repeat(5 - Math.floor(product.rating))}</span>
          <span class="rating-count">(${product.stock || 0})</span>
        </div>
        <div class="product-price">${product.price.toFixed(2)}</div>
      </div>
    `;

    grid.appendChild(card);

    // Add event listeners
    const eyeBtn = card.querySelector(".eye-btn");
    const cartBtn = card.querySelector(".cart-btn");
    const wishBtn = card.querySelector(".wish");

    if (eyeBtn) {
      eyeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        openModal(product);
      });
    }

    if (cartBtn) {
      cartBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        try {
          addToCart(product);
          navigateTo("cart");
        } catch (error) {
          console.error("Error adding to cart:", error);
        }
      });
    }

    if (wishBtn) {
      wishBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        showMessage("Added to wishlist!", "info");
      });
    }
  });
}
function showMessage(text, type = "success") {
  const message = document.createElement("div");
  message.className = "success-message";

  const bgColor =
    type === "success" ? "#4caf50" : type === "info" ? "#2196F3" : "#ff9800";
  const icon =
    type === "success"
      ? "check-circle"
      : type === "info"
      ? "info-circle"
      : "exclamation-circle";

  message.style.background = bgColor;
  message.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${text}</span>
  `;

  document.body.appendChild(message);

  setTimeout(() => {
    message.style.animation = "slideOut 0.3s ease";
    setTimeout(() => message.remove(), 300);
  }, 3000);
}

// ==================== INITIALIZE ====================
window.addEventListener("DOMContentLoaded", function () {
  initializeCart();
  fetchProducts();

  const hash = window.location.hash.slice(1);
  const page = hash || "home";
  currentPage = page;
  renderPage(page);
});
