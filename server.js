const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // Importar path para servir archivos estáticos

const app = express();
app.use(cors()); // Permitir CORS
app.use(bodyParser.json()); // Parsear JSON

// Servir archivos estáticos desde el directorio actual
app.use(express.static(path.join(__dirname))); // Asegúrate de que el HTML esté en el directorio raíz

// Endpoint para la ruta raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Servir index.html
});

// Endpoint para recibir reseñas
app.post('/api/reviews', (req, res, next) => {
    const newReview = req.body;

    // Validar la entrada
    if (!newReview.author || !newReview.content || !newReview.rating) {
        return res.status(400).send('Faltan campos requeridos: author, content, rating.');
    }

    // Leer las reseñas existentes
    fs.readFile('reviews.json', 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') return next(err); // Manejo de error

        let reviews = [];
        if (data) {
            try {
                reviews = JSON.parse(data);
            } catch (parseError) {
                return next(parseError);
            }
        }

        // Agregar nueva reseña
        reviews.push(newReview);

        // Escribir las reseñas actualizadas en el archivo
        fs.writeFile('reviews.json', JSON.stringify(reviews, null, 2), (err) => {
            if (err) return next(err); // Manejo de error
            res.status(201).send('Reseña guardada.');
        });
    });
});

// Endpoint para obtener todas las reseñas
app.get('/api/reviews', (req, res) => {
    fs.readFile('reviews.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error leyendo el archivo.');
        }
        try {
            const reviews = JSON.parse(data);
            res.status(200).json(reviews);
        } catch (parseError) {
            return res.status(500).send('Error al parsear el archivo JSON.');
        }
    });
});

// Configuración del puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});


