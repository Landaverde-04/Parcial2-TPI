document.addEventListener("DOMContentLoaded", () => {
    const clientesTable = document.getElementById('clientesTable').getElementsByTagName('tbody')[0];
    const addClientForm = document.getElementById('addClientForm');

    // Verificar si el rol es empleado
    const rol = sessionStorage.getItem('rol');
    if (rol !== 'empleado') {
        window.location = 'index.html';  // Si no es empleado, redirigir a la página de inicio
    }

    // Mostrar clientes
    async function mostrarClientes() {
        const res = await fetch('http://localhost:3000/clientes');
        const clientes = await res.json();
        clientesTable.innerHTML = '';  // Limpiar la tabla

        clientes.forEach(cliente => {
            const row = clientesTable.insertRow();
            row.innerHTML = `
                <td>${cliente.nombre}</td>
                <td>${cliente.correo}</td>
                <td>
                    <button onclick="editarCliente(${cliente.id})">Editar</button>
                    <button onclick="eliminarCliente(${cliente.id})">Eliminar</button>
                </td>
            `;
        });
    }

    // Agregar cliente
    addClientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value;
        const correo = document.getElementById('correo').value;

        const newClient = { nombre, correo };
        await fetch('http://localhost:3000/clientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newClient)
        });

        mostrarClientes();  // Refrescar la lista de clientes
        addClientForm.reset();  // Limpiar el formulario
    });

    // Editar cliente
    window.editarCliente = async (id) => {
        const res = await fetch(`http://localhost:3000/clientes/${id}`);
        const cliente = await res.json();

        const nombre = prompt('Nuevo nombre:', cliente.nombre);
        const correo = prompt('Nuevo correo:', cliente.correo);

        if (nombre && correo) {
            await fetch(`http://localhost:3000/clientes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, correo })
            });

            mostrarClientes();  // Refrescar la lista de clientes
        }
    };

    // Eliminar cliente
    window.eliminarCliente = async (id) => {
        if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
            await fetch(`http://localhost:3000/clientes/${id}`, {
                method: 'DELETE'
            });
            mostrarClientes();  // Refrescar la lista de clientes
        }
    };

    // Inicializar
    mostrarClientes();
});
