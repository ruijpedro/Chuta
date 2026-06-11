# Chuta Xuta — APK privada para Android

Este pacote transforma o ficheiro `ChulaXuta_v2.html` numa app Android local, usando WebView.

## Como compilar a APK

### Opção A — Android Studio
1. Abrir a pasta `ChulaXuta_Android` no Android Studio.
2. Esperar o Gradle sincronizar.
3. Ir a `Build > Build Bundle(s) / APK(s) > Build APK(s)`.
4. A APK fica normalmente em:
   `app/build/outputs/apk/debug/app-debug.apk`
5. Copiar para o telemóvel e instalar.

### Opção B — GitHub Actions
1. Criar um repositório privado no GitHub.
2. Enviar estes ficheiros para o repositório.
3. Abrir o separador `Actions`.
4. Correr o workflow `Build Private APK`.
5. Descarregar o artefacto `ChulaXuta-private-apk`.

## Instalação no telemóvel
1. Copiar o ficheiro `.apk` para o telemóvel.
2. Abrir o ficheiro.
3. Permitir “instalar apps desconhecidas” apenas para a app usada para abrir o ficheiro.
4. Instalar.

A app fica só no teu telemóvel. Não é publicada na Play Store.
