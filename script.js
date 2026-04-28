const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSHLrhQjaxFPEOVWmL1Q7qiE7ddk5RXkgZm-3pDFTtAq2e6oUKs6r7qM2lHUOtTxrXQKBBNX6QKZMD7/pub?output=tsv";

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
    const texto = await res.text();
    const filas = texto.split("\n").filter(f => f.trim() !== "");

    productos = filas.slice(1).map(fila => {
      const celdas = fila.split("\t");
      if (celdas.length >= 4) {
        return {
          nombre: celdas[0].trim(),
          precio: parseFloat(celdas[1].replace("$", "").replace(".", "")) || 0,
          imagen: celdas[2].trim(),
          categoria: celdas[3].trim().toLowerCase()
        };
      }
      return null;
    }).filter(p => p !== null);

    renderProductos();
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
}

function renderProductos() {
  if (!productList) return;
  productList.innerHTML = "";
  const filtrados = productos.filter(p => 
    p.categoria && p.categoria === categoriaActual.toLowerCase()
  );

  function renderProductos() {
  if (!productList) return;
  productList.innerHTML = "";
  
  const filtrados = productos.filter(p => 
    p.categoria && p.categoria === categoriaActual.toLowerCase()
  );

  if (filtrados.length === 0) {
    productList.innerHTML = `<p style="text-align:center; grid-column: 1/-1;">Próximamente más productos en ${categoriaActual}...</p>`;
    return;
  }

  filtrados.forEach((prod) => {
    // BUSCAMOS SI EL PRODUCTO YA ESTÁ EN EL CARRITO
    const enCarrito = carrito.find(item => item.nombre === prod.nombre);
    const cantidadTexto = enCarrito ? `<span class="cantidad-badge">x${enCarrito.cantidad}</span>` : "";

    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}" />
      <h3>${prod.nombre}</h3>
      <p>$${prod.precio.toLocaleString('es-AR')}</p>
      <div class="button-container" style="position: relative; display: inline-block;">
        <button class="add-btn">Agregar al carrito</button>
        ${cantidadTexto} 
      </div>
    `;
    const button = div.querySelector("button");
    button.addEventListener("click", () => agregarAlCarrito(prod));
    productList.appendChild(div);
  });
}

  filtrados.forEach((prod) => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}" />
      <h3>${prod.nombre}</h3>
      <p>$${prod.precio.toLocaleString('es-AR')}</p>
      <button class="add-btn">Agregar al carrito</button>
    `;
    const button = div.querySelector("button");
    button.addEventListener("click", () => agregarAlCarrito(prod));
    productList.appendChild(div);
  });
}

function agregarAlCarrito(prod) {
  const existe = carrito.find(item => item.nombre === prod.nombre);
  if (existe) {
    existe.cantidad += 1;
  } else {
    carrito.push({ ...prod, cantidad: 1 });
  }
  actualizarCarrito();
  if (cart) cart.classList.add("visible");
}

function actualizarCarrito() {
  if (!cartItems) return;
  cartItems.innerHTML = "";
  let total = 0;

  carrito.forEach((item, index) => {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.alignItems = "center";
    li.style.marginBottom = "10px";
    
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    li.innerHTML = `
      <img src="${item.imagen}" alt="${item.nombre}" style="width:40px; height:40px; object-fit:cover; border-radius:5px; margin-right:10px;">
      <div style="flex-grow:1;">
        <div style="font-weight:bold; font-size:0.9rem;">${item.nombre}</div>
        <div style="font-size:0.8rem; color:#666;">
          ${item.cantidad} x $${item.precio.toLocaleString('es-AR')} = $${subtotal.toLocaleString('es-AR')}
        </div>
      </div>
      <button onclick="eliminarDelCarrito(${index})" style="background:none; border:none; color:red; cursor:pointer; font-size:1.2rem; margin-left:10px;">🗑️</button>
    `;
    cartItems.appendChild(li);
  });

  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  if(cartCount) cartCount.textContent = totalItems;
  if(cartTotal) cartTotal.textContent = total.toLocaleString('es-AR');

  renderProductos();
}

window.eliminarDelCarrito = function(index) {
  if (carrito[index].cantidad > 1) {
    carrito[index].cantidad -= 1;
  } else {
    carrito.splice(index, 1);
  }
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
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
      renderProductos();
    });
  });

  if(whatsappBtn) {
    whatsappBtn.addEventListener("click", () => {
      if (carrito.length === 0) return alert("El carrito está vacío.");
      const mensaje = carrito.map(item => `- ${item.nombre} (x${item.cantidad})`).join('%0A');
      const totalFinal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
      const texto = `Hola Abundia! Quiero hacer un pedido:%0A${mensaje}%0A%0A*Total: $${totalFinal.toLocaleString('es-AR')}*`;
      window.open(`https://wa.me/5491125841686?text=${texto}`, "_blank");
    });
  }

  // AHORA ESTÁ FUERA Y SE EJECUTARÁ SIEMPRE
  cargarProductosDesdeSheet();
});
