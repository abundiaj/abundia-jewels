
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSHLrhQjaxFPEOVWmL1Q7qiE7ddk5RXkgZm-3pDFTtAq2e6oUKs6r7qM2lHUOtTxrXQKBBNX6QKZMD7/pub?output=csv";

let productos = [];
let carrito = [];
let categoriaActual = "cocina";

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
    // Esto limpia líneas vacías que el Excel a veces manda al final
    const lines = csv.trim().split("\n").filter(line => line.trim() !== "");

    productos = lines.slice(1).map(line => {
      const data = line.split(",");
      
      // Verificamos que la fila tenga datos suficientes para no romperse
      if (data.length >= 4 && data[0] && data[3]) {
        return {
          nombre: data[0].trim(),
          precio: parseFloat(data[1]) || 0,
          imagen: data[2] ? data[2].trim() : "",
          categoria: data[3].trim().toLowerCase()
        };
      }
      return null; 
    }).filter(p => p !== null); 

    renderProductos();
  } catch (error) {
    console.error("Error cargando el Excel:", error);
  }
}
  renderProductos();
}

function renderProductos() {
  productList.innerHTML = "";
  
  // Filtramos asegurándonos de que ambos estén en minúsculas y sin espacios
  const filtrados = productos.filter(p => 
    p.categoria && p.categoria.trim().toLowerCase() === categoriaActual.trim().toLowerCase()
  );

  // Mensaje de aviso si la categoría está vacía
  if (filtrados.length === 0) {
    productList.innerHTML = `<p style="text-align:center; grid-column: 1/-1;">
      Próximamente más productos en ${categoriaActual}...</p>`;
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

  whatsappBtn.addEventListener("click", () => {
  if (carrito.length === 0) return alert("El carrito está vacío.");
  const mensaje = carrito.map((item, i) => `${i + 1}. ${item.nombre} - $${item.precio}`).join('%0A');
  const total = carrito.reduce((sum, item) => sum + item.precio, 0);
  const texto = `Hola! Quiero hacer un pedido:%0A${mensaje}%0A%0ATotal: $${total}`;
  window.open(`https://wa.me/5491125841686?text=${texto}`, "_blank");
});


  cargarProductosDesdeSheet();
});
