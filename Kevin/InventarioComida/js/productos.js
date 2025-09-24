    if (!localStorage.getItem("productos")) {
      const iniciales = [
        { id: 1, nombre: "Leche Entera", cantidad: 10, unidad: "litros", precio: 1.20, vencimiento: "2025-10-01", idCategoria: 1 },
        { id: 2, nombre: "Pollo Entero", cantidad: 5, unidad: "kg", precio: 3.50, vencimiento: "2025-09-30", idCategoria: 2 },
        { id: 3, nombre: "Zanahoria", cantidad: 20, unidad: "kg", precio: 0.80, vencimiento: "2025-09-28", idCategoria: 3 }
      ];
      localStorage.setItem("productos", JSON.stringify(iniciales));
    }

    const form = document.getElementById("formProducto");
    const lista = document.getElementById("listaProductos");
    const selectCategoria = document.getElementById("categoriaProducto");

    function cargarCategoriasSelect() {
      selectCategoria.innerHTML = "";
      const categorias = JSON.parse(localStorage.getItem("categorias")) || [];
      categorias.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.nombre;
        selectCategoria.appendChild(option);
      });
    }

    function cargarProductos() {
      lista.innerHTML = "";
      const productos = JSON.parse(localStorage.getItem("productos")) || [];
      const categorias = JSON.parse(localStorage.getItem("categorias")) || [];

      productos.forEach(prod => {
        const categoria = categorias.find(c => c.id == prod.idCategoria);
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${prod.id}</td>
          <td>${prod.nombre}</td>
          <td>${prod.cantidad}</td>
          <td>${prod.unidad}</td>
          <td>$${prod.precio.toFixed(2)}</td>
          <td>${prod.vencimiento}</td>
          <td>${categoria ? categoria.nombre : "Sin categoría"}</td>
          <td class="acciones">
            <button class="edit" onclick="editarProducto(${prod.id})">Editar</button>
            <button class="delete" onclick="eliminarProducto(${prod.id})">Eliminar</button>
          </td>
        `;
        lista.appendChild(tr);
      });
    }

    function guardarProducto(e) {
      e.preventDefault();

      const id = document.getElementById("idProducto").value;
      const nombre = document.getElementById("nombreProducto").value;
      const cantidad = parseInt(document.getElementById("cantidadProducto").value);
      const unidad = document.getElementById("unidadMedida").value;
      const precio = parseFloat(document.getElementById("precioProducto").value);
      const vencimiento = document.getElementById("fechaVencimiento").value;
      const idCategoria = parseInt(document.getElementById("categoriaProducto").value);

      let productos = JSON.parse(localStorage.getItem("productos")) || [];

      if (id) {
        productos = productos.map(p =>
          p.id == id ? { id: p.id, nombre, cantidad, unidad, precio, vencimiento, idCategoria } : p
        );
      } else {
        const nuevoId = productos.length ? productos[productos.length - 1].id + 1 : 1;
        productos.push({ id: nuevoId, nombre, cantidad, unidad, precio, vencimiento, idCategoria });
      }

      localStorage.setItem("productos", JSON.stringify(productos));
      form.reset();
      document.getElementById("idProducto").value = "";
      cargarProductos();
    }

    function editarProducto(id) {
      const productos = JSON.parse(localStorage.getItem("productos")) || [];
      const prod = productos.find(p => p.id == id);
      document.getElementById("idProducto").value = prod.id;
      document.getElementById("nombreProducto").value = prod.nombre;
      document.getElementById("cantidadProducto").value = prod.cantidad;
      document.getElementById("unidadMedida").value = prod.unidad;
      document.getElementById("precioProducto").value = prod.precio;
      document.getElementById("fechaVencimiento").value = prod.vencimiento;
      document.getElementById("categoriaProducto").value = prod.idCategoria;
    }

    function eliminarProducto(id) {
      let productos = JSON.parse(localStorage.getItem("productos")) || [];
      productos = productos.filter(p => p.id != id);
      localStorage.setItem("productos", JSON.stringify(productos));
      cargarProductos();
    }

    form.addEventListener("submit", guardarProducto);
    cargarCategoriasSelect();
    cargarProductos();
  