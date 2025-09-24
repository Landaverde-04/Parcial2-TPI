    if (!localStorage.getItem("categorias")) {
      const iniciales = [
        { id: 1, nombre: "Lácteos", descripcion: "Leche, queso, yogur y derivados" },
        { id: 2, nombre: "Carnes", descripcion: "Pollo, res, cerdo y pescado" },
        { id: 3, nombre: "Verduras", descripcion: "Tomate, lechuga, zanahoria" }
      ];
      localStorage.setItem("categorias", JSON.stringify(iniciales));
    }

    const form = document.getElementById("formCategoria");
    const lista = document.getElementById("listaCategorias");

    function cargarCategorias() {
      lista.innerHTML = "";
      const categorias = JSON.parse(localStorage.getItem("categorias")) || [];
      categorias.forEach(cat => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${cat.id}</td>
          <td>${cat.nombre}</td>
          <td>${cat.descripcion}</td>
          <td  class="acciones">
            <button class="edit" onclick="editarCategoria(${cat.id})">Editar</button>
            <button class="delete" onclick="eliminarCategoria(${cat.id})">Eliminar</button>
          </td>
        `;
        lista.appendChild(tr);
      });
    }

    function guardarCategoria(e) {
      e.preventDefault();
      const id = document.getElementById("idCategoria").value;
      const nombre = document.getElementById("nombreCategoria").value;
      const descripcion = document.getElementById("descripcionCategoria").value;

      let categorias = JSON.parse(localStorage.getItem("categorias")) || [];

      if (id) {
        categorias = categorias.map(c =>
          c.id == id ? { id: c.id, nombre, descripcion } : c
        );
      } else {
        const nuevoId = categorias.length ? categorias[categorias.length - 1].id + 1 : 1;
        categorias.push({ id: nuevoId, nombre, descripcion });
      }

      localStorage.setItem("categorias", JSON.stringify(categorias));
      form.reset();
      document.getElementById("idCategoria").value = "";
      cargarCategorias();
    }

    function editarCategoria(id) {
      const categorias = JSON.parse(localStorage.getItem("categorias")) || [];
      const cat = categorias.find(c => c.id == id);
      document.getElementById("idCategoria").value = cat.id;
      document.getElementById("nombreCategoria").value = cat.nombre;
      document.getElementById("descripcionCategoria").value = cat.descripcion;
    }

    function eliminarCategoria(id) {
      let categorias = JSON.parse(localStorage.getItem("categorias")) || [];
      categorias = categorias.filter(c => c.id != id);
      localStorage.setItem("categorias", JSON.stringify(categorias));
      cargarCategorias();
    }

    form.addEventListener("submit", guardarCategoria);
    cargarCategorias();
  