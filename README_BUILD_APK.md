# ChutaXuta v1.42 — Build APK

Esta versão inclui duas formas de compilação para evitar os erros anteriores:

1. `ChulaXuta_Android/` está diretamente na raiz do repositório e é a opção preferida.
2. `ChulaXuta_Android_Project.zip` fica também incluído como compatibilidade.

O workflow `.github/workflows/build-apk.yml` **não usa `dirname`, `xargs` nem procura o projeto dentro de um ZIP exterior**.

## Para atualizar o GitHub

Extrair este ZIP no computador e enviar **o conteúdo interior** para a raiz do repositório, substituindo os ficheiros existentes.

Na raiz do GitHub devem ficar visíveis:

- `.github/`
- `ChulaXuta_Android/`
- `ChulaXuta_Android_Project.zip`
- `web/`
- `README.md`

Depois executar: Actions → `Build ChutaXuta Android APK v1.42` → Run workflow.
