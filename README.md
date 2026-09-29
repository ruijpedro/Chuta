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
- O reset semanal muda às terças-feiras às 23:30, limpa os estados do jogo, equipas e jogadores pontuais, mas não apaga a Estatística.
- Se a app estiver fechada às 23:30, o reset é aplicado na primeira abertura/regresso ao primeiro plano.
- Os popups de confirmação foram mantidos.


## v1.43 — Estatística visível
- Novo separador `Estat.` com ranking acumulado de presenças.
- Mantém a coluna `Estatística` do Google Sheets.
- Reset semanal mantém-se à terça-feira às 23:30 e não apaga o acumulado.

## Android APK + iOS sideload gratuito

Foi acrescentado o workflow **Build ChutaXuta Android + iOS Sideload**. Ele gera uma APK Android e um IPA iOS sem assinatura para instalação através de AltStore, SideStore ou Sideloadly. Ver `IOS_SIDELOAD_GRATUITO.md`.

## V1.55 — sincronização simplificada
- Apps Script V8 continua sem alterações.
- Removido o pedido `action=ensure` antes de cada sincronização; o V8 já garante o ciclo no próprio GET.
- Um único GET JSONP atualiza plantel, presença, pagamento e estatística a partir do servidor.
- `cx_reset_pending` antigo deixa de bloquear a leitura.
- Atualização automática mantém-se a cada 60 segundos, sem executar resets no cliente.
- Android, iOS e WebApp usam o mesmo `index.html`.


## v1.58
Corrigido o URL da implementação Apps Script V8 nos três clientes (Web, Android e iOS). O identificador anterior continha caracteres `l` no lugar de `I`, provocando `Erro de comunicação`. Mantém a sincronização manual e automática e o estado `A sincronizar… → ✓ Sincronizado`.


## v1.58
- Endpoint Apps Script V8 corrigido usando literalmente o URL confirmado pelo utilizador (`...qaYlz5...`).
- WebApp, Android e iOS usam o mesmo endpoint.
- Mantém A sincronizar… → ✓ Sincronizado após resposta válida.
