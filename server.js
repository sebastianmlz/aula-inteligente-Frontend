const express = require('express');
const path = require('path');
const app = express();

// Cambia 'dist/aula-inteligente-Frontend' por la ruta de tu build si es diferente
const distFolder = path.join(__dirname, 'dist', 'aula-inteligente-Frontend');

// Servir archivos estáticos
app.use(express.static(distFolder));

// Redirigir todas las rutas al index.html (para SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(distFolder, 'index.html'));
});

// Puerto por variable de entorno o 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});