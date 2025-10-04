const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());

// Archivos estáticos
app.use(express.static(__dirname));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/img', express.static(path.join(__dirname, 'img')));

// Ruta principal
app.get('/', (req, res) => {
res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para obtener usuarios desde db.json
app.get('/usuarios', (req, res) => {
fs.readFile(path.join(__dirname, 'db.json'), 'utf8', (err, data) => {
    if (err) {
return res.status(500).json({ error: 'No se pudo leer el archivo db.json' });
    }
    const db = JSON.parse(data);
    res.json(db.usuarios);
});
});

app.listen(PORT, () => {
console.log(`Servidor corriendo en http://localhost:${PORT}`);
});