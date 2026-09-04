# ChutaXuta iOS — instalação gratuita / sideload

O projeto inclui um workflow que gera `ChutaXuta-v1.45-unsigned.ipa` para iPhone real, sem certificado pago.

## GitHub

1. Colocar todo o conteúdo deste ZIP na raiz do repositório.
2. Abrir **Actions**.
3. Executar **Build ChutaXuta Android + iOS Sideload**.
4. No fim ficam disponíveis dois artefactos:
   - `ChutaXuta-v1.45-Android-APK`
   - `ChutaXuta-v1.45-iOS-Sideload-IPA`
5. Descompactar o artefacto iOS para obter `ChutaXuta-v1.45-unsigned.ipa`.

## Instalar no iPhone sem Apple Developer pago

O IPA é deliberadamente gerado sem assinatura. AltStore, SideStore ou Sideloadly fazem a assinatura com um Apple ID gratuito no momento da instalação.

### AltStore
- Instalar AltServer no PC/Mac e AltStore no iPhone.
- Abrir AltStore > **My Apps** > `+` e escolher `ChutaXuta-v1.45-unsigned.ipa`.

### SideStore
- Depois de SideStore estar configurado no iPhone, abrir o IPA através do SideStore e instalar.
- É a via mais cómoda quando se pretende renovar a assinatura sem voltar sempre ao computador, de acordo com a configuração usada.

### Sideloadly
- Ligar o iPhone ao PC/Mac.
- Arrastar `ChutaXuta-v1.45-unsigned.ipa` para Sideloadly.
- Introduzir o Apple ID quando solicitado e iniciar a instalação.

## Limitações da conta Apple gratuita

A assinatura gratuita é temporária e normalmente exige renovação periódica (habitualmente 7 dias). O iOS também impõe limites a apps assinadas com uma conta gratuita. Isto é uma limitação da Apple, não da ChutaXuta.

O Bundle ID do projeto é `pt.rjp.chutaxuta`. As funções ChutaXuta — Stat, Atualizar, atualização automática, popups, Google Sheets e reset semanal de quinta-feira às 23:30 — são as mesmas da v1.45 Android.
