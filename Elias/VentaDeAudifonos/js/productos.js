const API_URL = 'https://172.23.243.26:3000/productos'; //productos

// Cargar productos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

// Agregar producto
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const producto = {
        nombre: document.getElementById('nombre').value.trim(),
        marca: document.getElementById('marca').value.trim(),
        precio: document.getElementById('precio').value,
        stock: document.getElementById('stock').value
    };

    try {
        // 👇 apuntar directamente al recurso 'productos'
        const response = await fetch(`${API_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(producto)
        });

        if (response.ok) {
            alert('Producto agregado exitosamente');
            document.getElementById('productForm').reset();
            loadProducts(); // recargar lista actualizada
        } else {
            const errorData = await response.text();
            alert('Error al agregar producto: ' + errorData);
        }
    } catch (error) {
        alert('Error al agregar producto: ' + error.message);
    }
});


// Cargar y mostrar productos
async function loadProducts() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json(); 
        const productos = data.productos;   
        
        const tbody = document.getElementById('productList');
        tbody.innerHTML = '';

        productos.forEach(producto => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${producto.id}</td>
                <td>${producto.nombre}</td>
                <td>${producto.marca}</td>
                <td>$${parseFloat(producto.precio).toFixed(2)}</td>
                <td>${producto.stock}</td>
                <td class="actions">
                    <button class="btn btn-warning" onclick="editProduct(${JSON.stringify(producto.id)})">Editar</button>
                    <button class="btn btn-danger" onclick="deleteProduct(${JSON.stringify(producto.id)})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        alert('Error al cargar productos: ' + error.message);
    }
}


// Editar producto
async function editProduct(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const producto = await response.json();

        document.getElementById('editId').value = producto.id;
        document.getElementById('editNombre').value = producto.nombre;
        document.getElementById('editMarca').value = producto.marca;
        document.getElementById('editPrecio').value = producto.precio;
        document.getElementById('editStock').value = producto.stock;

        document.getElementById('editSection').style.display = 'block';
        document.getElementById('editSection').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        alert('Error al cargar producto: ' + error.message);
    }
}

// Guardar cambios de edición
document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('editId').value;
    const producto = {
        nombre: document.getElementById('editNombre').value.trim(),
        marca: document.getElementById('editMarca').value.trim(),
        precio: document.getElementById('editPrecio').value,
        stock: document.getElementById('editStock').value
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(producto)
        });

        if (response.ok) {
            alert('Producto actualizado exitosamente');
            cancelEdit();
            loadProducts();
        } else {
            alert('Error al actualizar producto');
        }
    } catch (error) {
        alert('Error al actualizar producto: ' + error.message);
    }
});

// Cancelar edición
function cancelEdit() {
    document.getElementById('editSection').style.display = 'none';
    document.getElementById('editForm').reset();
}

// Eliminar producto
async function deleteProduct(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Producto eliminado exitosamente');
                loadProducts();
            } else {
                alert('Error al eliminar producto');
            }
        } catch (error) {
            alert('Error al eliminar producto: ' + error.message);
        }
    }
}