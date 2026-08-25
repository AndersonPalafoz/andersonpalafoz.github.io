# Auditoria em produção — `/admin/anotacoes` e `/admin/usuarios`

Data da verificação: 25/08/2026.

## `/admin/anotacoes`

A rota respondeu e carregou com sessão administrativa persistida. O cabeçalho exibiu o usuário Anderson Bacelar Palafoz, o link de retorno ao painel admin e o título “Anotações dos Alunos”. A interface apresenta uma explicação adequada sobre exclusão auditável: o texto original é preservado e o aluno visualiza um aviso de remoção administrativa. Há uma busca por nome ou e-mail do aluno. No estado inicial observado não foram exibidos resultados nem erro de API. A composição desktop está visualmente estilizada, sem overflow horizontal aparente no viewport de 1280×720.

## `/admin/usuarios`

A rota respondeu com sessão administrativa e identificou o usuário como “Super-admin”. Carregou os KPIs “Aguardando análise: 1”, “Contas aprovadas: 6” e “Excluídas logicamente: 1”, além de busca, filtros por papel e status, atualização e exportação CSV. A tabela exibiu oito registros e controles de alteração de papel, professor responsável e ações contextuais.

Foram observados controles para criar usuário, aprovar, recusar, excluir logicamente, recuperar e excluir definitivamente. Usuários técnicos de certificados externos aparecem com identificação específica e botão “Excluir usuário externo”. Há também um botão “Excluir professor” para o registro de professor. O estado publicado demonstrou os quatro usuários técnicos associados à emissão de certificados externos, uma conta excluída logicamente, uma conta pendente, um professor aprovado e o super-admin principal.

## Pontos de atenção

O HTML extraído concatena as opções de selects na tabela, mas a captura visual mostra os controles separados e alinhados. A página de usuários possui grande densidade de ações em cada linha; recomenda-se validar em viewport móvel para garantir que os controles não causem rolagem lateral e que as confirmações destrutivas permaneçam claras. Não foram executadas ações de mutação, exclusão, aprovação ou alteração de papel, para não modificar dados reais durante a auditoria.
