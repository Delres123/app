@echo off
chcp 65001 >nul
echo 正在打包造梦空间APP...
echo.

cd /d C:\Users\Administrator\.qclaw\workspace

nativefier --name "ZaomengSpace" ^
  --port 8888 ^
  --show-menu-bar false ^
  --single-instance ^
  --tray disable ^
  --file "C:\Users\Administrator\.qclaw\workspace\zaomeng-app\index.html"

echo.
echo 打包完成！
pause
