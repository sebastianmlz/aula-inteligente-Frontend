const express = require('express');
const path = require('path');
const app = express();

const distFolder = path.join(__dirname, 'dist', 'aula-inteligente-frontend');

app.use(express.static(distFolder));

app.get('/*', function(req, res) {
  res.sendFile(path.join(distFolder, 'index.html'), function(err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});