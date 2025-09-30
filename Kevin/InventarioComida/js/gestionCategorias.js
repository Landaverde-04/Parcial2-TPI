const API_URL = "http://localhost:3000/categorias";

const form = document.getElementById("formCategoria");
const lista = document.getElementById("listaCategorias");
const idInput = document.getElementById("idCategoria");
const nombreInput = document.getElementById("nombreCategoria");
const descripcionInput = document.getElementById("descripcionCategoria");

// Función para obtener el siguiente ID disponible
async function obtenerSiguienteId() {
  try {
    const res = await fetch(API_URL);
    const categorias = await res.json();
    
    if (categorias.length === 0) {
      return 1; // Si no hay categorías, empezar con 1
    }
    
    // Obtener el ID más alto y sumar 1
    const maxId = Math.max(...categorias.map(cat => parseInt(cat.id) || 0));
    return maxId + 1;
  } catch (error) {
    console.error("Error al obtener siguiente ID:", error);
    return 1; // Valor por defecto en caso de error
  }
}

// Cargar categorías en la tabla
async function cargarCategorias() {
  lista.innerHTML = "";
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const categorias = await res.json();

    categorias.forEach(cat => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="text-center">${cat.id}</td>
        <td>${cat.nombre}</td>
        <td>${cat.descripcion || ""}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-warning me-2" onclick="editarCategoria('${cat.id}')">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="eliminarCategoria('${cat.id}')">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      lista.appendChild(tr);
    });
  } catch (error) {
    console.error("Error al cargar categorías:", error);
    alert("Error al cargar categorías. Verifica que el servidor esté ejecutándose.");
  }
}

// Guardar o editar categoría
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = idInput.value;
  const nombre = nombreInput.value.trim();
  const descripcion = descripcionInput.value.trim();

  if (!nombre) return alert("El nombre es obligatorio");

  try {
    let response;
    if (id) {
      // Editar
      response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: parseInt(id), nombre, descripcion })
      });
    } else {
      // Crear - Obtener el siguiente ID disponible
      const nuevoId = await obtenerSiguienteId();
      response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: nuevoId, nombre, descripcion })
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    form.reset();
    idInput.value = "";
    await cargarCategorias();
    alert(id ? "Categoría actualizada exitosamente" : "Categoría creada exitosamente");
  } catch (error) {
    console.error("Error al guardar categoría:", error);
    alert("Error al guardar categoría. Verifica que el servidor esté ejecutándose.");
  }
});

// Editar categoría
async function editarCategoria(id) {
  console.log("Editando categoría con ID:", id);
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const cat = await response.json();

    idInput.value = cat.id;
    nombreInput.value = cat.nombre;
    descripcionInput.value = cat.descripcion || "";
    
    // Scroll al formulario para que el usuario vea que se está editando
    form.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error("Error al editar categoría:", error);
    alert("Error al cargar los datos de la categoría para editar.");
  }
}

// Eliminar categoría
async function eliminarCategoria(id) {
  console.log("Eliminando categoría con ID:", id);
  if (!confirm("¿Seguro que deseas eliminar esta categoría?")) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, { 
      method: "DELETE" 
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    await cargarCategorias();
    alert("Categoría eliminada exitosamente");
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    alert("Error al eliminar categoría. Verifica que el servidor esté ejecutándose.");
  }
}

// Inicializar
cargarCategorias();