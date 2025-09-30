// js/productos.js
document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = `http://${window.location.hostname}:3000`; 
  const API_PRODUCTOS = `${API_BASE}/productos`;
  const API_CATEGORIAS = `${API_BASE}/categorias`;

  const form = document.getElementById("formProducto");
  const idProductoInput = document.getElementById("idProducto");
  const nombreProductoInput = document.getElementById("nombreProducto");
  const cantidadProductoInput = document.getElementById("cantidadProducto");
  const unidadMedidaInput = document.getElementById("unidadMedida");
  const precioProductoInput = document.getElementById("precioProducto");
  const fechaVencimientoInput = document.getElementById("fechaVencimiento");
  const categoriaSelect = document.getElementById("categoriaProducto");
  const listaProductos = document.getElementById("listaProductos");

  let categoriasCache = [];

  try {
    await cargarCategoriasSelect();
  } catch (err) {
    console.error("Error cargando categorías iniciales:", err);
  }
  cargarProductos();

  // Guardar producto
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const producto = {
      nombre: nombreProductoInput.value.trim(),
      cantidad: Number.parseInt(cantidadProductoInput.value, 10) || 0,
      unidadMedida: unidadMedidaInput.value.trim(),
      precio: Number.parseFloat(precioProductoInput.value) || 0,
      fechaVencimiento: fechaVencimientoInput.value,
      categoriaId: categoriaSelect.value ? Number.parseInt(categoriaSelect.value, 10) : null
    };

    const id = idProductoInput.value;

    try {
      if (id) {
        // Editar producto existente
        await fetch(`${API_PRODUCTOS}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(producto)
        });
      } else {
        // Obtener todos los productos para calcular el próximo ID
        const res = await fetch(API_PRODUCTOS);
        const productos = await res.json();
        const maxId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) : 0;

        // Asignar el siguiente ID manualmente
        producto.id = maxId + 1;

        // Crear nuevo producto con ID incremental
        await fetch(API_PRODUCTOS, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(producto)
        });
      }

      form.reset();
      idProductoInput.value = "";
      await cargarCategoriasSelect();
      cargarProductos();
    } catch (error) {
      console.error("Error al guardar producto:", error);
    }
  });

  async function cargarCategoriasSelect() {
    try {
      const res = await fetch(API_CATEGORIAS);
      categoriasCache = await res.json();

      categoriaSelect.innerHTML = `<option value="">Seleccionar categoría...</option>`;
      categoriasCache.forEach((cat) => {
        const option = document.createElement("option");
        option.value = String(cat.id);
        option.textContent = cat.nombre;
        categoriaSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      throw error;
    }
  }

  // cargar productos (sin ?_expand=categoria)
  async function cargarProductos() {
    try {
      const res = await fetch(API_PRODUCTOS);
      const data = await res.json();
      mostrarProductos(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  }

  // mostrar productos
  function mostrarProductos(productos) {
    listaProductos.innerHTML = "";

    if (!productos || productos.length === 0) {
      listaProductos.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-muted">No hay productos registrados</td>
        </tr>
      `;
      return;
    }

    productos.forEach((prod) => {
      const categoriaNombre =
        (prod.categoria && prod.categoria.nombre) ||
        (categoriasCache.find((c) => Number(c.id) === Number(prod.categoriaId)) || {}).nombre ||
        "Sin categoría";

      const precioTexto = (() => {
        if (typeof prod.precio === "number") return prod.precio.toFixed(2);
        const p = parseFloat(prod.precio);
        return isNaN(p) ? "0.00" : p.toFixed(2);
      })();

      const row = document.createElement("tr");

      row.innerHTML = `
        <td class="text-center">${prod.id}</td>
        <td>${prod.nombre || ""}</td>
        <td class="text-center">${prod.cantidad ?? ""}</td>
        <td>${prod.unidadMedida || ""}</td>
        <td class="text-end">$${precioTexto}</td>
        <td class="text-center">${prod.fechaVencimiento || ""}</td>
        <td>${categoriaNombre}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-warning me-2 btn-editar">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn btn-sm btn-danger btn-eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;

      // editar
      row.querySelector(".btn-editar").addEventListener("click", () => {
        idProductoInput.value = prod.id;
        nombreProductoInput.value = prod.nombre || "";
        cantidadProductoInput.value = prod.cantidad ?? "";
        unidadMedidaInput.value = prod.unidadMedida || "";
        precioProductoInput.value = prod.precio ?? "";
        fechaVencimientoInput.value = prod.fechaVencimiento || "";

        const catId = prod.categoriaId ?? (prod.categoria && prod.categoria.id) ?? "";
        categoriaSelect.value = catId ? String(catId) : "";
      });

      // eliminar
      row.querySelector(".btn-eliminar").addEventListener("click", async () => {
        if (confirm(`¿Seguro que deseas eliminar el producto "${prod.nombre}"?`)) {
          try {
            await fetch(`${API_PRODUCTOS}/${prod.id}`, { method: "DELETE" });
            cargarProductos();
          } catch (error) {
            console.error("Error al eliminar producto:", error);
          }
        }
      });

      listaProductos.appendChild(row);
    });
  }
});
