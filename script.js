const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSHLrhQjaxFPEOVWmL1Q7qiE7ddk5RXkgZm-3pDFTtAq2e6oUKs6r7qM2lHUOtTxrXQKBBNX6QKZMD7/pub?output=csv";

let productos = [];
let carrito = [];
let categoriaActual = "cocina"; // Cambié esto a cocina para que coincida con tu nuevo rubro

const productList = document.getElementById("product-list");
const cart = document.getElementById("cart");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const whatsappBtn = document.getElementById("whatsapp-btn");

async function cargarProductosDesdeSheet() {
  try {
    const res = await fetch(sheetURL);
    const csv = await res.text();
    // Limpiamos líneas vacías al final
    const lines = csv.trim().split("\n").filter(line => line.trim() !== "");

   productos = lines.slice(1).map(line => {
  const data = line.split(",");
  if (data.length >= 4) {
    const categoria = data.pop().trim().toLowerCase();
    const imagen = data.pop().trim();
    const precioRaw = data.pop().trim();
    
    const textoCompleto = data.join(",").replace(/"/g, "").trim();

    return {
      nombre: textoCompleto,
      precio: parseFloat(precioRaw) || 0,
      imagen: imagen,
      categoria: categoria
    };
  }
  return null;
}).filter(p => p !== null);

    console.log("Productos cargados:", productos);
    renderProductos();
  } catch (error) {
    console.error("Error en la carga:", error);
  }
}

function renderProductos() {
  productList.innerHTML = "";
  const filtrados = productos.filter(p => 
    p.categoria && p.categoria === categoriaActual.toLowerCase()
  );

  if (filtrados.length === 0) {
    productList.innerHTML = `<p style="text-align:center; grid-column: 1/-1;">Próximamente más productos en ${categoriaActual}...</p>`;
    return;
  }

  filtrados.forEach((prod) => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}" />
      <h3>${prod.nombre}</h3>
      <p>$${prod.precio}</p>
      <button class="add-btn">Agregar al carrito</button>
    `;
    const button = div.querySelector("button");
    button.addEventListener("click", () => agregarAlCarrito(prod));
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
  if(cartCount) cartCount.textContent = carrito.length;
  if(cartTotal) cartTotal.textContent = total;
}

window.eliminarDelCarrito = function(index) {
  carrito.splice(index, 1);
  actualizarCarrito();
};

document.addEventListener("DOMContentLoaded", () => {
  const toggleOutside = document.getElementById("toggle-cart");
  const toggleInside = document.getElementById("toggle-cart-inside");

  if (toggleOutside) toggleOutside.addEventListener("click", () => cart.classList.toggle("visible"));
  if (toggleInside) toggleInside.addEventListener("click", () => cart.classList.toggle("visible"));

  document.querySelectorAll("#categories li").forEach(li => {
    li.addEventListener("click", () => {
      categoriaActual = li.dataset.category;
      renderProductos();
    });
  });

  if(whatsappBtn) {
    whatsappBtn.addEventListener("click", () => {
      if (carrito.length === 0) return alert("El carrito está vacío.");
      const mensaje = carrito.map((item, i) => `${i + 1}. ${item.nombre} - $${item.precio}`).join('%0A');
      const total = carrito.reduce((sum, item) => sum + item.precio, 0);
      const texto = `Hola! Quiero hacer un pedido a Abundia:%0A${mensaje}%0A%0ATotal: $${total}`;
      window.open(`https://wa.me/5491125841686?text=${texto}`, "_blank");
    });
  }

  cargarProductosDesdeSheet();
});
