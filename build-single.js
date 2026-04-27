const fs = require('fs');
const path = require('path');

// Read files
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, 'app.css'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

// Inline CSS and JS into HTML
let output = html;

// Replace CSS link with inline style
output = output.replace(
  /<link rel="stylesheet" href="app\.css">/,
  `<style>\n${css}\n</style>`
);

// Remove manifest link (not needed for single file)
output = output.replace(/<link rel="manifest" href="manifest\.json">/, '');

// Replace JS script with inline script
output = output.replace(
  /<script src="app\.js"><\/script>/,
  `<script>\n${js}\n</script>`
);

// Write output
const outPath = path.join(__dirname, 'dist', 'index.html');
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(outPath, output, 'utf8');

console.log(`Built: ${outPath} (${Buffer.byteLength(output)} bytes)`);
