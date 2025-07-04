const productos = [
  { nombre: "Cadena Oro Rosa", precio: 4500, imagen: "img/cadena1.jpg", categoria: "cadenas" },
  { nombre: "Pulsera Perlas", precio: 3200, imagen: "img/pulsera1.jpg", categoria: "pulseras" },
  { nombre: "Aros Luna", precio: 2800, imagen: "img/aros1.jpg", categoria: "aros" },
  { nombre: "Collar Doble", precio: 5100, imagen: "img/collar1.jpg", categoria: "collares" },
  { nombre: "Dije Estrella", precio: 1900, imagen: "img/dije1.jpg", categoria: "dijes" },
  { nombre: "Anillo Corazón", precio: 3600, imagen: "img/anillo1.jpg", categoria: "anillos" }
];
let carrito = [];
let categoriaActual = "cadenas";
const productList = document.getElementById("product-list");
const cart = document.getElementById("cart");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const whatsappBtn = document.getElementById("whatsapp-btn");

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
function actualizarCarrito() {
  cartItems.innerHTML = "";
  let total = 0;
  carrito.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `<img src="${item.imagen}" alt="${item.nombre}" /><span>${item.nombre} - $${item.precio}</span>`;
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
renderProductos();