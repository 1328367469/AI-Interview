@echo off
:: 设置编码为 UTF-8 防止乱码
chcp 65001 >nul
set PORT=3000

echo ==================================================
echo   NEXUS_AI 系统启动检查 (System Boot Sequence)
echo ==================================================

:: 检查并清理端口占用
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%PORT%') do (
    echo [!] 发现端口 %PORT% 被占用 (PID: %%a)，正在释放资源...
    taskkill /f /pid %%a >nul 2>&1
)

:: 获取本地局域网 IP
set "IP=127.0.0.1"
for /f "tokens=4" %%a in ('route print ^| findstr 0.0.0.0.*0.0.0.0') do (
    for /f "tokens=2 delims=:" %%b in ('ipconfig ^| findstr /c:"IPv4" ^| findstr "%%a"') do (
        set "IP=%%b"
    )
)
set "IP=%IP: =%"

echo.
echo [✓] 端口就绪: %PORT%
echo [✓] 本地访问: http://localhost:%PORT%
echo [✓] 局域网访问: http://%IP%:%PORT%
echo.
echo 正在启动开发服务器...
echo --------------------------------------------------

:: 执行启动命令
npm run dev
