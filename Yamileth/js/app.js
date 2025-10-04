// Puedes usar app.js para funciones globales si las necesitas
function cerrarSesion() {
sessionStorage.clear();
window.location = 'login.html';
}