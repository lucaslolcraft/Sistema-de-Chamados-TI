@echo off
echo Configurando proxy...

:: Defina aqui o endereço e a porta do seu proxy
set PROXY_SERVER=200.198.59.244:8080

:: Opcional: descomente a linha abaixo se seu proxy precisar de autenticação
:: set PROXY_USER=seu_usuario
:: set PROXY_PASS=sua_senha
:: set PROXY_AUTH=%PROXY_USER%:%PROXY_PASS%@

:: Configura as variáveis de ambiente para HTTP e HTTPS
set http_proxy=http://%PROXY_AUTH%%PROXY_SERVER%
set https_proxy=https://%PROXY_AUTH%%PROXY_SERVER%

echo.
echo Proxy configurado para esta sessao do terminal:
echo http_proxy=%http_proxy%
echo https_proxy=%https_proxy%
echo.