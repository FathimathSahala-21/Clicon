// Global Variables
let products = [];
let cart = [];
let selectedProduct = null;
let allProducts = []; // Store all products for classifications

// Close Banner
function closeBanner() {
  document.getElementById("topBanner").style.display = "none";
}

// Fetch Products from API
async function fetchProducts() {
  try {
    const response = await fetch("https://dummyjson.com/products?limit=100");
    const data = await response.json();
    allProducts = data.products;

    // Display random featured products (Best Deals)
    displayFeaturedProducts();

    // Display product classifications
    displayProductClassifications();
  } catch (error) {
    console.error("Error fetching products:", error);
    document.getElementById("productsGrid").innerHTML =
      '<p style="color: red;">Failed to load products</p>';
  }
}

// Display Random Featured Products (Best Deals)
function displayFeaturedProducts() {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";

  // Get 8 random products for "Best Deals"
  const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
  const featured = shuffled.slice(0, 8);

  featured.forEach((product) => {
    const card = createProductCard(product);
    grid.appendChild(card);
  });
}

// Create Product Card
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.onclick = function () {
    openModal(product);
  };

  const rating = product.rating || 4.0;
  const stars =
    "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  const image = product.thumbnail || product.images?.[0] || product.image;

  card.innerHTML = `
    <img src="${image}" alt="${product.title}">
    <h3>${product.title.substring(0, 50)}...</h3>
    <div class="product-rating">
      <span class="stars">${stars}</span>
      <span class="rating-count">(${product.stock || 0})</span>
    </div>
    <p class="product-price">${product.price.toFixed(2)}</p>
  `;

  return card;
}

// Display Product Classifications
function displayProductClassifications() {
  const classifications = [
    { id: "topRated", title: "Top Rated", filter: (p) => p.rating >= 4.5 },
    { id: "newArrivals", title: "New Arrivals", filter: (p) => p.id % 2 === 0 },
    { id: "bestSellers", title: "Best Sellers", filter: (p) => p.stock > 50 },
    { id: "flashSale", title: "Flash Sale Today", filter: (p) => p.price < 50 },
  ];

  // Create main container for all classifications in a row
  const mainContainer = document.createElement("div");
  mainContainer.style.cssText =
    "display: flex; gap: 20px; padding: 40px 20px; background: #f5f5f5; margin: 20px 0; overflow-x: auto;";

  classifications.forEach((classification) => {
    // Create section container
    const section = document.createElement("div");
    section.style.cssText = "min-width: 280px; flex-shrink: 0;";

    const title = document.createElement("h2");
    //  title.style.cssText =
    //   "margin-bottom: 20px; font-size: 20px; color: #191C1F;";
    title.textContent = classification.title;
    section.appendChild(title);

    // Filter and get 3 random products
    const filtered = allProducts.filter(classification.filter);
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    // Create vertical grid for products (column direction)
    const grid = document.createElement("div");
    grid.style.cssText = "display: flex; flex-direction: column; gap: 20px;";

    selected.forEach((product) => {
      const card = createProductCard(product);
      card.classList.add("classification-product-card"); // Add special class
      grid.appendChild(card);
    });

    section.appendChild(grid);
    mainContainer.appendChild(section);
  });

  // Add to first classification container (or create one if needed)
  const container = document.getElementById("topRated");
  if (container) {
    container.parentElement.insertBefore(mainContainer, container);
    // Hide individual containers
    document.getElementById("topRated").style.display = "none";
    document.getElementById("newArrivals").style.display = "none";
    document.getElementById("bestSellers").style.display = "none";
    document.getElementById("flashSale").style.display = "none";
  }
}

// Fetch and Display Categories with Carousel
async function fetchCategories() {
  try {
    // Fetch categories from DummyJSON
    const response = await fetch("https://dummyjson.com/products/categories");
    const categories = await response.json();

    // Get first 12 categories for carousel
    const selectedCategories = categories.slice(0, 12);

    // Get image for each category
    const categoriesWithImages = await Promise.all(
      selectedCategories.map(async (category) => {
        try {
          // Fetch products from this category to get an image
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

// Display Categories as Carousel
function displayCategoriesCarousel(categories) {
  const slider = document.getElementById("categoriesSlider");
  if (!slider) {
    console.error("categoriesSlider element not found");
    return;
  }

  // Ensure parent container has position relative
  const parentContainer = slider.closest(".category-section .container");
  if (parentContainer) {
    parentContainer.style.position = "relative";
  }

  // Remove old buttons if they exist
  const oldButtons = slider.parentElement.querySelectorAll(".carousel-btn");
  oldButtons.forEach((btn) => btn.remove());

  // Add carousel navigation buttons
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

  // Clear and populate slider
  slider.innerHTML = "";

  categories.forEach((category) => {
    const card = document.createElement("div");
    card.className = "category-card";

    // Categories are just visual - no filtering
    card.onclick = function () {
      // Optional: Add visual feedback or navigation
      console.log(`Category clicked: ${category.name}`);
    };

    card.innerHTML = `
      <div class="category-image">
        <img src="${category.image}" alt="${category.name}" 
             onerror="this.src='https://placehold.co/150x150/png'">
      </div>
      <h3>${category.name.toUpperCase()}</h3>
      <p style="font-size: 12px; color: #77878F; margin-top: 8px;">Shop Now →</p>
    `;

    slider.appendChild(card);
  });
}

// Scroll Categories Carousel
function scrollCategories(direction) {
  const slider = document.getElementById("categoriesSlider");
  const scrollAmount = 300;
  slider.scrollBy({
    left: direction * scrollAmount,
    behavior: "smooth",
  });
}

// Toggle Cart
function toggleCart() {
  document.getElementById("cartSidebar").classList.toggle("open");
}

// Open Product Modal
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

// Close Modal
function closeModal() {
  document.getElementById("productModal").classList.remove("show");
}

// Change Quantity
function changeQuantity(change) {
  const input = document.getElementById("modalQuantity");
  let value = parseInt(input.value) + change;
  if (value < 1) value = 1;
  input.value = value;
}

// Add to Cart
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

  updateCart();
  closeModal();
  alert("Product added to cart!");
}

// Update Cart
function updateCart() {
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML =
      '<p style="text-align: center; padding: 40px; color: #999;">Your cart is empty</p>';
  }

  cart.forEach((item, index) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";
    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.title}">
      <div class="cart-item-details">
        <h4>${item.title.substring(0, 30)}...</h4>
        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
        <div class="cart-item-quantity">
          <button onclick="updateCartQuantity(${index}, -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="updateCartQuantity(${index}, 1)">+</button>
        </div>
      </div>
      <button class="remove-item" onclick="removeFromCart(${index})">
        <i class="fas fa-trash"></i>
      </button>
    `;
    cartItems.appendChild(itemDiv);
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = "$" + total.toFixed(2);
}

// Update Cart Quantity
function updateCartQuantity(index, change) {
  cart[index].quantity += change;
  if (cart[index].quantity < 1) {
    cart.splice(index, 1);
  }
  updateCart();
}

// Remove from Cart
function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

// Countdown Timer
function startCountdown() {
  const timer = setInterval(function () {
    const days = document.getElementById("days");
    const hours = document.getElementById("hours");
    const minutes = document.getElementById("minutes");
    const seconds = document.getElementById("seconds");

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

// Initialize on Page Load
window.addEventListener("DOMContentLoaded", function () {
  fetchProducts();
  fetchCategories();
  updateCart();
  startCountdown();
});
