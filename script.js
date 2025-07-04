
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSHLrhQjaxFPEOVWmL1Q7qiE7ddk5RXkgZm-3pDFTtAq2e6oUKs6r7qM2lHUOtTxrXQKBBNX6QKZMD7/pub?gid=0&single=true&output=csv";

let productos = [];
let carrito = [];
let categoriaActual = "cadenas";

const productList = document.getElementById("product-list");
const cart = document.getElementById("cart");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const whatsappBtn = document.getElementById("whatsapp-btn");

async function cargarProductosDesdeSheet() {
  const res = await fetch(sheetURL);
  const csv = await res.text();
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

  productos = lines.slice(1).map(line => {
    const data = line.split(",");
    return {
      nombre: data[0].trim(),
      precio: parseFloat(data[1]),
      imagen: data[2].trim(),
      categoria: data[3].trim().toLowerCase()
    };
  });

  renderProductos();
}

function renderProductos() {
  productList.innerHTML = "";
  const filtrados = productos.filter(p => p.categoria === categoriaActual);
  filtrados.forEach(prod => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}" />
      <h3>${prod.nombre}</h3>
      <p>$${prod.precio}</p>
      <button onclick='agregarAlCarrito(${JSON.stringify(prod)})'>Agregar al carrito</button>
    `;
    productList.appendChild(div);
  });
}

function agregarAlCarrito(prod) {
  carrito.push(prod);
  actualizarCarrito();
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  actualizarCarrito();
}

function actualizarCarrito() {
  cartItems.innerHTML = "";
  let total = 0;
  carrito.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${item.imagen}" alt="${item.nombre}" />
      <span>${item.nombre} - $${item.precio}</span>
      <button style="margin-left:auto;" onclick="eliminarDelCarrito(${index})">❌</button>
    `;
    cartItems.appendChild(li);
    total += item.precio;
  });
  cartCount.textContent = carrito.length;
  cartTotal.textContent = total;
}

document.getElementById("toggle-cart").addEventListener("click", () => {
  cart.classList.toggle("visible");
});

document.querySelectorAll("#categories li").forEach(li => {
  li.addEventListener("click", () => {
    categoriaActual = li.dataset.category;
    renderProductos();
  });
});

whatsappBtn.addEventListener("click", () => {
  const numero = whatsappBtn.dataset.whatsapp;
  if (carrito.length === 0) return alert("El carrito está vacío.");
  let mensaje = "Hola! Quiero hacer un pedido:%0A";
  carrito.forEach((item, i) => {
    mensaje += `%0A${i + 1}. ${item.nombre} - $${item.precio}`;
  });
  const total = carrito.reduce((acc, item) => acc + item.precio, 0);
  mensaje += `%0A%0ATotal: $${total}`;
  const url = `https://wa.me/${numero}?text=${mensaje}`;
  window.open(url, "_blank");
});

cargarProductosDesdeSheet();
