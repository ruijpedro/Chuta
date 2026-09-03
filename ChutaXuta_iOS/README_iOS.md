# ChutaXuta iOS 1.45

Versão iOS baseada na mesma WebApp da versão Android 1.45.

Mantém:
- Jogo, Equipas, Stat, Mais e Aviso;
- popups existentes;
- botão **Atualizar**;
- atualização automática em segundo plano lógico da WebApp enquanto a app está ativa;
- sincronização ao abrir e ao regressar ao primeiro plano;
- reset semanal à quinta-feira às 23:30;
- se a app estiver fechada às 23:30, o reset pendente é executado na abertura seguinte;
- Google Sheets / coluna `Estatística`;
- partilha através da folha de partilha do iOS (incluindo WhatsApp quando instalado);
- links Google Maps abrem externamente.

## Abrir no Mac

1. Abrir `ChutaXuta.xcodeproj` no Xcode.
2. Selecionar o target **ChutaXuta**.
3. Em **Signing & Capabilities**, escolher a tua Team Apple.
4. Se necessário, alterar o Bundle Identifier `pt.rjp.chutaxuta` para um identificador único da tua conta.
5. Ligar o iPhone e executar.

## GitHub Actions

O workflow `build-ios.yml` compila sem assinatura para o iOS Simulator, validando o projeto.
Para produzir um `.ipa` instalável num iPhone é necessária assinatura Apple (certificado + provisioning profile / Apple Developer).
