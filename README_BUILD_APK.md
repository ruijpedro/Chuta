# Compilar a APK do ChutaXuta

1. Extrair este ZIP no computador.
2. Carregar **todo o conteúdo interior** para a raiz do repositório GitHub, incluindo a pasta oculta `.github`.
3. Confirmar que existe `.github/workflows/build-apk.yml` e que já não contém `xargs dirname`.
4. Abrir **Actions → Build ChutaXuta Android APK → Run workflow**.
5. No fim, descarregar o artefacto `ChutaXuta-v1.3-APK`. O GitHub entrega os artefactos num ZIP; dentro estará `ChutaXuta-v1.3-debug.apk`.

O workflow usa diretamente `project/ChulaXuta_Android` e não executa `find | xargs dirname`.

## Confirmações e reset semanal
- Os botões Confirmar, Pendente e Não Vai apresentam uma janela de confirmação (popup).
- O reset semanal ocorre à quinta-feira às 23:30.
- Se a aplicação estiver fechada, o reset ocorre na primeira abertura após essa hora.
- A app volta a verificar o reset quando regressa ao primeiro plano e a cada minuto enquanto permanece aberta.
