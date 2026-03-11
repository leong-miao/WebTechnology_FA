const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => res.send('Home works'));
app.get('/menu', (req, res) => res.send('Menu works'));
app.get('/cart', (req, res) => res.send('Cart works'));

app.listen(PORT, () => {
    console.log(`Test server at http://localhost:${PORT}`);
});