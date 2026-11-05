# Configuração do dia de jogo — requisitos v1.59

- Dia e hora por defeito: terça-feira, 22:00, fuso Europe/Lisbon.
- Edição por responsável: (1) alterar apenas o próximo jogo; (2) alterar o dia/hora habitual.
- Mostrar data/hora efetiva na convocatória a todos os dispositivos.
- A alteração pontual não modifica o dia habitual.
- O servidor Apps Script é a fonte de verdade: guardar configuração e identificador de ciclo; os clientes não devem gerar ciclos independentes.
- Nunca chamar ensureCycle_ com a nova data antes de a configuração ser confirmada pelo servidor; caso contrário, a versão atual pode apagar presenças prematuramente.
- Reset das presenças apenas após o fim do jogo configurado, com margem operacional, preservando pagamentos e estatísticas.
- Pedir confirmação antes de mudar data/hora; impedir que um cliente desatualizado reverta a configuração.
- Manter compatibilidade com versões anteriores e confirmar implantação do Apps Script antes de ativar o editor.
- Testes: terça por defeito; terça→quinta apenas uma semana; quinta→terça habitual; viragem do dia; mudança com presenças confirmadas; dois telemóveis; fuso horário de verão/inverno.
