const API_URL = "http://localhost:3000/productos";
const CATEGORIAS_URL = "http://localhost:3000/categorias";

const form = document.getElementById("formProducto");
const lista = document.getElementById("listaProductos");
const idInput = document.getElementById("idProducto");
const nombreInput = document.getElementById("nombreProducto");
const cantidadInput = document.getElementById("cantidadProducto");
const unidadMedidaInput = document.getElementById("unidadMedida");
const precioInput = document.getElementById("precioProducto");
const fechaVencimientoInput = document.getElementById("fechaVencimiento");
const categoriaSelect = document.getElementById("categoriaProducto");

// Función para obtener el siguiente ID disponible
async function obtenerSiguienteId() {
  try {
    const res = await fetch(API_URL);
    const productos = await res.json();
    
    if (productos.length === 0) {
      return 1;
    }
    
    const maxId = Math.max(...productos.map(prod => parseInt(prod.id) || 0));
    return maxId + 1;
  } catch (error) {
    console.error("Error al obtener siguiente ID:", error);
    return 1;
  }
}

// Cargar categorías en el select
async function cargarCategorias() {
  try {
    const res = await fetch(CATEGORIAS_URL);
    const categorias = await res.json();

    categoriaSelect.innerHTML = '<option value="">Seleccionar categoría...</option>';
    categorias.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.nombre;
      categoriaSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
}

// Obtener nombre de categoría por ID
function obtenerNombreCategoria(categoriaId) {
  const option = categoriaSelect.querySelector(`option[value="${categoriaId}"]`);
  return option ? option.textContent : "Sin categoría";
}

// Cargar productos en la tabla
async function cargarProductos() {
  lista.innerHTML = "";
  try {
    const res = await fetch(API_URL);
    const productos = await res.json();

    productos.forEach(prod => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="text-center">${prod.id}</td>
        <td>${prod.nombre}</td>
        <td class="text-center">${prod.cantidad}</td>
        <td>${prod.unidadMedida || ""}</td>
        <td class="text-end">$${parseFloat(prod.precio).toFixed(2)}</td>
        <td class="text-center">${prod.fechaVencimiento}</td>
        <td>${obtenerNombreCategoria(prod.categoriaId)}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-warning me-2" onclick="editarProducto('${prod.id}')">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="eliminarProducto('${prod.id}')">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      lista.appendChild(tr);
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

// Guardar o editar producto
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = idInput.value;
  const nombre = nombreInput.value.trim();
  const cantidad = parseInt(cantidadInput.value);
  const unidadMedida = unidadMedidaInput.value.trim();
  const precio = parseFloat(precioInput.value);
  const fechaVencimiento = fechaVencimientoInput.value;
  const categoriaId = parseInt(categoriaSelect.value);

  if (!nombre) return alert("El nombre del producto es obligatorio");
  if (!unidadMedida) return alert("La unidad de medida es obligatoria");
  if (!fechaVencimiento) return alert("La fecha de vencimiento es obligatoria");
  if (!categoriaId) return alert("Debe seleccionar una categoría");

  try {
    let response;
    const productoData = {
      nombre,
      cantidad,
      unidadMedida,
      precio,
      fechaVencimiento,
      categoriaId
    };

    if (id) {
      // Editar
      productoData.id = parseInt(id);
      response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoData)
      });
    } else {
      // Crear
      const nuevoId = await obtenerSiguienteId();
      productoData.id = nuevoId;
      response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoData)
      });
    }

    form.reset();
    idInput.value = "";
    await cargarProductos();
    
  } catch (error) {
    console.error("Error al guardar producto:", error);
  }
});

// Editar producto
async function editarProducto(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const prod = await response.json();

    idInput.value = prod.id;
    nombreInput.value = prod.nombre;
    cantidadInput.value = prod.cantidad;
    unidadMedidaInput.value = prod.unidadMedida || "";
    precioInput.value = prod.precio;
    fechaVencimientoInput.value = prod.fechaVencimiento;
    categoriaSelect.value = prod.categoriaId;
    
  } catch (error) {
    console.error("Error al editar producto:", error);
  }
}

// Eliminar producto
async function eliminarProducto(id) {
  if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, { 
      method: "DELETE" 
    });
    
    await cargarProductos();
  } catch (error) {
    console.error("Error al eliminar producto:", error);
  }
}

// Inicializar
document.addEventListener('DOMContentLoaded', async function() {
  await cargarCategorias();
  await cargarProductos();
});

// Hacer las funciones globales
window.editarProducto = editarProducto;
window.eliminarProducto = eliminarProducto;