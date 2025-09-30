// js/categorias.js
document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = `http://${window.location.hostname}:3000`; 
  const API_CATEGORIAS = `${API_BASE}/categorias`;

  const form = document.getElementById("formCategoria");
  const idCategoriaInput = document.getElementById("idCategoria");
  const nombreCategoriaInput = document.getElementById("nombreCategoria");
  const listaCategorias = document.getElementById("listaCategorias");

  cargarCategorias();

  // Guardar categoría
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const categoria = {
      nombre: nombreCategoriaInput.value.trim()
    };

    const id = idCategoriaInput.value;

    try {
      if (id) {
        // Editar categoría existente
        await fetch(`${API_CATEGORIAS}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoria)
        });
      } else {
        // Obtener todas las categorías para calcular el próximo ID
        const res = await fetch(API_CATEGORIAS);
        const categorias = await res.json();
        const maxId = categorias.length > 0 ? Math.max(...categorias.map(c => c.id)) : 0;

        // Asignar el siguiente ID manualmente
        categoria.id = maxId + 1;

        // Crear nueva categoría con ID incremental
        await fetch(API_CATEGORIAS, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoria)
        });
      }

      form.reset();
      idCategoriaInput.value = "";
      cargarCategorias();
    } catch (error) {
      console.error("Error al guardar categoría:", error);
    }
  });

  // Cargar categorías
  async function cargarCategorias() {
    try {
      const res = await fetch(API_CATEGORIAS);
      const data = await res.json();
      mostrarCategorias(data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  }

  // Mostrar categorías en la tabla
  function mostrarCategorias(categorias) {
    listaCategorias.innerHTML = "";

    if (categorias.length === 0) {
      listaCategorias.innerHTML = `
        <tr>
          <td colspan="2" class="text-center text-muted">No hay categorías registradas</td>
        </tr>
      `;
      return;
    }

    categorias.forEach((cat) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${cat.nombre}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-warning me-2 btn-editar">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn btn-sm btn-danger btn-eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;

      // Botón editar
      row.querySelector(".btn-editar").addEventListener("click", () => {
        idCategoriaInput.value = cat.id;
        nombreCategoriaInput.value = cat.nombre;
      });

      // Botón eliminar
      row.querySelector(".btn-eliminar").addEventListener("click", async () => {
        if (confirm(`¿Seguro que deseas eliminar la categoría "${cat.nombre}"?`)) {
          try {
            await fetch(`${API_CATEGORIAS}/${cat.id}`, {
              method: "DELETE"
            });
            cargarCategorias();
          } catch (error) {
            console.error("Error al eliminar categoría:", error);
          }
        }
      });

      listaCategorias.appendChild(row);
    });
  }
});
