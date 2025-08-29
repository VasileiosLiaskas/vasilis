const express = require('express');
const path = require('path');
const app = express();

const port = process.env.PORT || 3000;
const distDir = path.join(__dirname, 'dist/vasilis');



app.use(express.static(distDir));

app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Angular app running on port ${port}`);
});
