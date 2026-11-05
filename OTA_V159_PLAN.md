# ChutaXuta v1.59 — preparação OTA

Ramo de desenvolvimento. Não publicar OTA antes de existir uma APK base com o atualizador nativo.

## Situação atual
- Android atual usa WebView Java própria e carrega `file:///android_asset/index.html`.
- A Mobilis usa Capacitor 7 e `@capgo/capacitor-updater` 7.
- O Apps Script V8 e os dados Google Sheets são independentes do pacote OTA.

## Implementação segura
1. Migrar o invólucro Android para Capacitor mantendo `appId: com.rjp.chulaxuta` e as funcionalidades existentes, incluindo partilha WhatsApp.
2. Incluir `@capgo/capacitor-updater` na APK base e configurar `autoUpdate:false`.
3. Instalar `notifyAppReady` e verificação manual/automática do manifesto remoto; validar appId, versões, URL de Release e SHA-256; usar `download` e `next`, com recuperação em falha.
4. Compilar Release com assinatura permanente em GitHub Secrets; não incluir keystore no repositório.
5. Criar workflow de publicação que valide a versão, testes e ausência de alterações nativas, crie ZIP do build Web, calcule SHA-256, publique GitHub Release e só depois atualize o manifesto.
6. Fazer teste real em APK base antes de promover para main. A assinatura da APK atualmente instalada tem de coincidir para atualização por cima.
7. Manter sincronização com Apps Script V8 e reset terça 23:30; a alteração pontual do dia de jogo exige atualização coordenada do servidor. Dia/hora do jogo por defeito: terça 22:00.

## Segurança
Não publicar ZIPs OTA arbitrários. As atualizações OTA alteram apenas recursos Web compatíveis com a base nativa. Nunca colocar credenciais ou keystores no Git.
