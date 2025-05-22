const express = require('express');
const path = require('path');
const app = express();

const distFolder = path.join(__dirname, 'dist', 'aula-inteligente-frontend');

app.use(express.static(distFolder));

app.use('*', (req, res) => {
  res.sendFile(path.join(distFolder, 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});