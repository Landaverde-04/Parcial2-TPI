// productos.js

const productosTable = document.getElementById('productosTable').getElementsByTagName('tbody')[0];
const productoForm = document.getElementById('productoForm');
let productoId = document.getElementById('productoId');
let nombre = document.getElementById('nombre');
let precio = document.getElementById('precio');
let imagen = document.getElementById('imagen');
let descripcion = document.getElementById('descripcion');
let stock = document.getElementById('stock');

let productos = JSON.parse(localStorage.getItem('productos')) || [];

// Mostrar productos en la tabla
function mostrarProductos() {
    productosTable.innerHTML = '';
    productos.forEach((producto, index) => {
        const row = productosTable.insertRow();
        row.innerHTML = `
            <td>${producto.nombre}</td>
            <td>$${producto.precio.toFixed(2)}</td>
            <td><img src="img/${producto.imagen}" alt="${producto.nombre}"></td>
            <td>${producto.descripcion}</td>
            <td>${producto.stock}</td>
            <td>
                <button onclick="editarProducto(${index})">Editar</button>
                <button class="delete-btn" onclick="eliminarProducto(${index})">Eliminar</button>
            </td>
        `;
    });
}

// Agregar o editar producto
productoForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const producto = {
        id: productoId.value || Date.now(),
        nombre: nombre.value,
        precio: parseFloat(precio.value),
        imagen: imagen.value,
        descripcion: descripcion.value,
        stock: parseInt(stock.value)
    };

    if (productoId.value) {
        const index = productos.findIndex(p => p.id == productoId.value);
        productos[index] = producto;  // Actualizamos el producto
    } else {
        productos.push(producto); // Agregamos un nuevo producto
    }

    localStorage.setItem('productos', JSON.stringify(productos));
    resetForm();
    mostrarProductos();
});

// Editar producto
function editarProducto(index) {
    const producto = productos[index];
    productoId.value = producto.id;
    nombre.value = producto.nombre;
    precio.value = producto.precio;
    imagen.value = producto.imagen;
    descripcion.value = producto.descripcion;
    stock.value = producto.stock;
}

// Eliminar producto
function eliminarProducto(index) {
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
        productos.splice(index, 1);
        localStorage.setItem('productos', JSON.stringify(productos));
        mostrarProductos();
    }
}

// Limpiar formulario
function resetForm() {
    productoId.value = '';
    nombre.value = '';
    precio.value = '';
    imagen.value = '';
    descripcion.value = '';
    stock.value = '';
}

// Inicializar  
mostrarProductos();
