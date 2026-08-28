# Chuta Xuta — APK Android + WebApp

Este pacote está pronto para o repositório GitHub `Chuta`.

## Estrutura

```text
.github/
  workflows/
    build-apk.yml
    build-web.yml

web/
  index.html
  logo.png
  manifest.json
  .nojekyll

ChulaXuta_Android_Project.zip
README.md
```

## Para compilar a APK

1. Faz upload dos ficheiros/pastas soltos para o GitHub.
2. Vai a `Actions`.
3. Escolhe `Build Android APK`.
4. Carrega em `Run workflow`.
5. No fim, descarrega o artifact `ChutaXuta-APK`.

## Para publicar a WebApp

1. Vai a `Settings → Pages`.
2. Em `Source`, escolhe `GitHub Actions`.
3. Vai a `Actions`.
4. Escolhe `Build ChutaXuta WebApp`.
5. Carrega em `Run workflow`.
6. O link será do tipo:

```text
https://ruijpedro.github.io/Chuta/
```

## Funcionalidades da WebApp

- Sincroniza com Google Sheets via Apps Script.
- Funciona em iPhone, Android e PC.
- Não tem botão `Confirmar todos`.
- Tem pop-up antes de alterar presença.
- Sorteia 2 equipas por defeito.
- Sorteia 3 equipas a pedido.

## v1.42 — Presenças e reset semanal
- Coluna Google Sheets usada: `Estatística` (a API também aceita a chave `estatistica`).
- Ao passar um jogador de outro estado para Confirmado, soma 1 presença, no máximo uma vez por ciclo semanal neste dispositivo.
- O reset semanal muda às quintas-feiras às 23:30, limpa os estados do jogo, equipas e jogadores pontuais, mas não apaga a Estatística.
- Se a app estiver fechada às 23:30, o reset é aplicado na primeira abertura/regresso ao primeiro plano.
- Os popups de confirmação foram mantidos.


## v1.43 — Estatística visível
- Novo separador `Estat.` com ranking acumulado de presenças.
- Mantém a coluna `Estatística` do Google Sheets.
- Reset semanal mantém-se à quinta-feira às 23:30 e não apaga o acumulado.
