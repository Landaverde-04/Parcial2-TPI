document.getElementById('registroForm').addEventListener('submit', async (e) => {
e.preventDefault();


const usuario = document.getElementById('regUsuario').value;
const password = document.getElementById('regPassword').value;
const rol = document.getElementById('rol').value;


const newUser = { usuario, password, rol };


await fetch('http://localhost:3000/usuarios', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(newUser)
});


alert('Usuario registrado exitosamente');
document.getElementById('registroForm').reset();
});