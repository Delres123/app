// 构建脚本 - 合并所有文件为单文件HTML（移除所有外部依赖）
const fs = require('fs');
const path = require('path');

const srcDir = __dirname;

// 读取源文件
const html = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(srcDir, 'app.css'), 'utf8');
const js = fs.readFileSync(path.join(srcDir, 'app.js'), 'utf8');
const imgJs = fs.readFileSync(path.join(srcDir, 'image-manager.js'), 'utf8');

// 确保dist目录存在
const distDir = path.join(srcDir, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// 合并文件
let combined = html;

// 移除 manifest.json 引用（外部文件依赖，可能导致加载阻塞）
combined = combined.replace('<link rel="stylesheet" href="app.css">', '<style>' + css + '</style>');
combined = combined.replace('<link rel="manifest" href="manifest.json">', '');
combined = combined.replace(/<script src=["']image-manager\.js["'][^>]*><\/script>/, '<script>' + imgJs + '</script>');
combined = combined.replace('<script src="app.js"></script>', '<script>' + js + '</script>');

// 修复 image-manager.js 中的 picsum.photos 外部链接为内联SVG（国内无法访问）
combined = combined.replace(
    /`https:\/\/picsum\.photos\/seed\/\$\{hash\}\/800\/600`/g,
    '`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><text y="400" font-size="200">🌙</text></svg>`'
);
combined = combined.replace(
    /`https:\/\/picsum\.photos\/800\/600`/g,
    '`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><text y="400" font-size="200">🌙</text></svg>`'
);

// 移除 image-manager.js 中的 picsum 注释
combined = combined.replace(/\/\/ 使用免费的AI图片API[^]*?\n\/\/ 生成图片[^\n]*\n/g, '');

// 写入
const outputPath = path.join(distDir, 'index.html');
fs.writeFileSync(outputPath, combined, 'utf8');

// 验证
const urls = combined.match(/https?:\/\/[^\s"'<>]+/g) || [];
console.log('构建成功！');
console.log('文件大小：' + (combined.length / 1024).toFixed(2) + ' KB');
console.log('外部URL数量：' + urls.length);
if (urls.length > 0) urls.forEach(u => console.log('  ', u));
console.log('保存位置：' + outputPath);
