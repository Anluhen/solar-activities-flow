// server.js
const express = require('express');
const fs      = require('fs');
const path    = require('path');
const app     = express();
const DATA    = path.join(__dirname, 'deliveries.json');

app.use(express.json());
app.use(express.static('public'));  // serve your HTML/CSS/JS from ./public

// read all deliveries
app.get('/api/deliveries', (req, res) => {
  fs.readFile(DATA, 'utf8', (err, raw) => {
    if (err && err.code === 'ENOENT') return res.json([]);
    if (err) return res.status(500).send(err);
    res.json(JSON.parse(raw));
  });
});

// overwrite the list
app.post('/api/deliveries', (req, res) => {
  fs.writeFile(DATA, JSON.stringify(req.body, null, 2), err => {
    if (err) return res.status(500).send(err);
    res.sendStatus(204);
  });
});

app.listen(3000, () => console.log('Listening on http://localhost:3000'));
