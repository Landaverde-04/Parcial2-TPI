const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
e.preventDefault();


const usuario = document.getElementById('usuario').value;
const password = document.getElementById('password').value;


const res = await fetch('http://localhost:3000/usuarios');
const usuarios = await res.json();


const user = usuarios.find(u => u.usuario === usuario && u.password === password);
if(user){
sessionStorage.setItem('rol', user.rol);
sessionStorage.setItem('usuario', user.usuario);


if(user.rol === 'cliente') {
window.location = 'index.html';
} else if(user.rol === 'empleado') {
window.location = 'clientes.html';
}
} else {
document.getElementById('error').textContent = 'Usuario o contraseña incorrecta';
}
});