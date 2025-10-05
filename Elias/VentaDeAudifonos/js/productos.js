const API_URL = 'https://172.23.243.26:3000/productos';

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

// Función para convertir imagen a Base64
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Agregar producto
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const imagenFile = document.getElementById('imagen').files[0];
    let imagenBase64 = null;
    
    // Si hay una imagen, convertirla a Base64
    if (imagenFile) {
        try {
            imagenBase64 = await convertImageToBase64(imagenFile);
        } catch (error) {
            alert('Error al procesar la imagen');
            return;
        }
    }
    
    const producto = {
        nombre: document.getElementById('nombre').value.trim(),
        marca: document.getElementById('marca').value.trim(),
        precio: document.getElementById('precio').value,
        stock: document.getElementById('stock').value,
        imagen: imagenBase64
    };

    try {
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
            closeModal();
            loadProducts();
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
            
            // Crear elemento de imagen
            let imgHTML;
            if (producto.imagen) {
                imgHTML = `<img src="${producto.imagen}" alt="${producto.nombre}" class="product-img" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'no-image\\'>Sin imagen</div>'">`;
            } else {
                imgHTML = `<div class="no-image">Sin imagen</div>`;
            }
            
            tr.innerHTML = `
                <td>${imgHTML}</td>
                <td>${producto.id}</td>
                <td>${producto.nombre}</td>
                <td>${producto.marca}</td>
                <td>$${parseFloat(producto.precio).toFixed(2)}</td>
                <td>${producto.stock}</td>
                <td class="actions">
                    <button class="btn btn-warning" onclick="editProduct('${producto.id}')">Editar</button>
                    <button class="btn btn-danger" onclick="deleteProduct('${producto.id}')">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        alert('Error al cargar productos: ' + error.message);
    }
}

// Variable para guardar la imagen actual al editar
let currentProductImage = null;

// Editar producto
// Editar producto
async function editProduct(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const data = await response.json();
        
        // El servidor puede devolver solo el producto o un objeto con {productos: [...]}
        // Necesitamos manejar ambos casos
        let producto;
        if (data.id) {
            // Si data tiene directamente un id, es el producto
            producto = data;
        } else if (data.productos) {
            // Si viene dentro de un array productos
            producto = data.productos.find(p => p.id === id);
        }
        
        if (!producto) {
            alert('Producto no encontrado');
            return;
        }

        document.getElementById('editId').value = producto.id;
        document.getElementById('editNombre').value = producto.nombre;
        document.getElementById('editMarca').value = producto.marca;
        document.getElementById('editPrecio').value = producto.precio;
        document.getElementById('editStock').value = producto.stock;
        
        // Guardar la imagen actual
        currentProductImage = producto.imagen || null;

        document.getElementById('editSection').style.display = 'block';
        document.getElementById('editSection').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        alert('Error al cargar producto: ' + error.message);
        console.error('Error completo:', error);
    }
}

// Guardar cambios de edición
document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('editId').value;
    const imagenFile = document.getElementById('editImagen').files[0];
    let imagenBase64 = currentProductImage; // Mantener imagen actual por defecto
    
    // Si hay una nueva imagen, convertirla
    if (imagenFile) {
        try {
            imagenBase64 = await convertImageToBase64(imagenFile);
        } catch (error) {
            alert('Error al procesar la imagen');
            return;
        }
    }
    
    const producto = {
        nombre: document.getElementById('editNombre').value.trim(),
        marca: document.getElementById('editMarca').value.trim(),
        precio: document.getElementById('editPrecio').value,
        stock: document.getElementById('editStock').value,
        imagen: imagenBase64
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
            const errorData = await response.text();
            alert('Error al actualizar producto: ' + errorData);
        }
    } catch (error) {
        alert('Error al actualizar producto: ' + error.message);
    }
});

// Cancelar edición
function cancelEdit() {
    document.getElementById('editSection').style.display = 'none';
    document.getElementById('editForm').reset();
    currentProductImage = null;
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
                const errorData = await response.text();
                alert('Error al eliminar producto: ' + errorData);
            }
        } catch (error) {
            alert('Error al eliminar producto: ' + error.message);
        }
    }
}