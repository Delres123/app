const fs = require('fs');

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>造梦空间</title>
</head>
<body>
    <h1>测试中文</h1>
</body>
</html>`;

fs.writeFileSync('test-output.html', html, 'utf8');
console.log('File written successfully');
