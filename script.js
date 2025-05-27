let allProducts = [];

// Get cart from localStorage
function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

// Save cart to localStorage and update UI
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
}

// Add product to cart
function addToCart(product) {
  let cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);
}

// Update item quantity in cart
function updateQuantity(productId, change) {
  let cart = getCart();
  const item = cart.find(p => p.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      cart = cart.filter(p => p.id !== productId);
    }
  }
  saveCart(cart);
}

// Remove product from cart
function removeFromCart(productId) {
  const cart = getCart().filter(p => p.id !== productId);
  saveCart(cart);
}

// Update cart UI
function updateCartUI() {
  const cart = getCart();
  const container = document.getElementById('cart-items-container');
  const countBadge = document.getElementById('cart-count');
  const subtotalEl = document.getElementById('cart-subtotal');
  const downloadBtn = document.getElementById('downloadBtn');

  container.innerHTML = '';
  let subtotal = 0;
  let totalCount = 0;

  cart.forEach(item => {
    subtotal += item.price * item.quantity;
    totalCount += item.quantity;

    container.innerHTML += `
      <div class="cart-item d-flex justify-content-between align-items-center py-3 border-bottom">
        <div class="d-flex align-items-center">
          <img src="${item.image}" alt="${item.name}" class="img-fluid rounded" style="width: 80px; height: 80px;">
          <div class="ms-3">
            <h6 class="mb-0">${item.name}</h6>
            <small class="text-muted">${item.description}</small>
            <div class="mt-2 d-flex align-items-center gap-2">
              <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity('${item.id}', -1)">–</button>
              <span class="badge bg-light text-dark">${item.quantity}</span>
              <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity('${item.id}', 1)">+</button>
            </div>
          </div>
        </div>
        <div class="text-end">
          <h6>৳${(item.price * item.quantity).toFixed(2)}</h6>
          <button class="btn btn-outline-danger btn-sm mt-2" onclick="removeFromCart('${item.id}')">Remove</button>
        </div>
      </div>
    `;
  });

  countBadge.textContent = totalCount;
  subtotalEl.textContent = `৳${subtotal.toFixed(2)}`;

  // Enable/disable download button
  downloadBtn.disabled = cart.length === 0;
}

// Render products
function renderProducts(products) {
  const list = document.getElementById('product-list');
  list.innerHTML = ''; // Clear loader

  products.forEach(product => {
    const col = document.createElement('div');
    col.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';

    col.innerHTML = `
      <div class="card h-100 shadow-sm border-0">
        <img src="${product.image}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">
        <div class="card-body d-flex flex-column justify-content-between">
          <div>
            <h5 class="card-title">${product.name}</h5>
            <p class="text-muted mb-1" style="font-size: 0.9rem;">${product.description}</p>
            <p class="mb-1"><strong>Category:</strong> ${product.category}</p>
            <p class="mb-1">
              <span class="text-danger text-decoration-line-through">৳${product.regularPrice}</span>
              <span class="text-success fw-bold ms-2">৳${product.price}</span>
            </p>
            <p class="text-muted" style="font-size: 0.85rem;"><i class="bi bi-bar-chart-fill"></i> Sales: ${product.sales}</p>
          </div>
          <button class="btn btn-sm btn-outline-success w-100 mt-2" onclick='addToCart(${JSON.stringify({
            id: product._id || product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            description: product.description
          })})'>
            <i class="bi bi-cart-plus"></i> Add to Cart
          </button>
        </div>
      </div>
    `;

    list.appendChild(col);
  });
}

// Handle search
function handleLiveSearch() {
  const searchInput = document.querySelector('.search input').value.trim().toLowerCase();

  if (!searchInput) {
    renderProducts(allProducts);
    return;
  }

  const filteredProducts = allProducts.filter(product => {
    return (
      product.name.toLowerCase().includes(searchInput) ||
      product.description.toLowerCase().includes(searchInput) ||
      product.category.toLowerCase().includes(searchInput)
    );
  });

  renderProducts(filteredProducts);
}

document.addEventListener('DOMContentLoaded', () => {
  const productList = document.getElementById('product-list');
  productList.innerHTML = `
    <div class="d-flex justify-content-center w-100 mt-5">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  `;

  fetch('https://billing-project-server.onrender.com/api/products')
    .then(res => res.json())
    .then(products => {
      allProducts = products;
      renderProducts(allProducts);
      updateCartUI();
    })
    .catch(err => {
      productList.innerHTML = `<p class="text-danger text-center">Failed to load products.</p>`;
      console.error('Error loading products:', err);
    });

  // Search input
  const searchInput = document.querySelector('.search input');
  const searchButton = document.querySelector('.search button');
  if (searchInput) searchInput.addEventListener('input', handleLiveSearch);
  if (searchButton) searchButton.addEventListener('click', handleLiveSearch);

  // Download PDF
  document.getElementById("downloadBtn").addEventListener("click", function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const cart = getCart();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Purchase Receipt", 20, 20);

    const now = new Date();
    const formattedDate = now.toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${formattedDate}`, 20, 28);

    const headers = [["Product", "Qty", "Unit Price", "Subtotal"]];
    const data = cart.map(item => [
      item.name,
      item.quantity.toString(),
      `${item.price.toFixed(2)} Taka`,
      `${(item.price * item.quantity).toFixed(2)} Taka`
    ]);

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    doc.autoTable({
      startY: 35,
      head: headers,
      body: data,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { halign: 'center' }
    });

    doc.setFontSize(12);
    doc.setTextColor(0, 128, 0);
    doc.text(`Total: ${total.toFixed(2)} Taka`, 145, doc.lastAutoTable.finalY + 10);

    doc.save("purchase_receipt.pdf");

    // Show modal
    const downloadSuccessModal = new bootstrap.Modal(document.getElementById('downloadSuccessModal'));
    downloadSuccessModal.show();

    // Clear cart
    localStorage.removeItem('cart');
    updateCartUI();

    // Reload on modal close
    document.querySelector('#downloadSuccessModal .btn').addEventListener('click', () => {
      window.location.reload();
    }, { once: true });
  });
});

