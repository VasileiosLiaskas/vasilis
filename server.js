const express = require('express');
const path = require('path');
const app = express();

const port = process.env.PORT || 3000;
const distDir = path.join(__dirname, 'dist/vasilis');


// DEBUG: Check what exists
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);

console.log('Looking for dist at:', distDir);

// Check if the directory exists
if (fs.existsSync(distDir)) {
  console.log('✅ dist/vasilis exists! Contents:', fs.readdirSync(distDir));

  // Check if index.html exists
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('✅ index.html exists!');
  } else {
    console.log('❌ index.html does NOT exist in dist/vasilis/');
    console.log('Files in dist/vasilis/:', fs.readdirSync(distDir));
  }
} else {
  console.log('❌ dist/vasilis directory does NOT exist!');
  console.log('Contents of project root:', fs.readdirSync(__dirname));
}
app.use(express.static(distDir));

app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Angular app running on port ${port}`);
});
