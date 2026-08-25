# Auditoria de rotas — 25/08/2026

## Achados iniciais

- O acesso ao domínio Vercel está autenticado com a conta exibida como Anderson Bacelar Palafoz.
- `/admin/forum` carregou sem erro visível, reconheceu a área administrativa e exibiu estado vazio honesto: nenhum tópico persistido corresponde aos filtros atuais.
- O fórum apresenta pesquisa por título/conteúdo, filtro por status e botão Atualizar.
- A rota `/admin/forum` não foi redirecionada para login no domínio publicado após a autenticação.
- O ambiente local continua sem sessão autenticada; isso será analisado separadamente por configuração OAuth/callback.

## Auditoria autenticada — mensagens e medalhas

A rota `/admin/mensagens` carregou corretamente e apresenta a Central de Mensagens de Contato, pesquisa por nome/e-mail/assunto/termo e filtros Todas, Não lidas e Lidas. A base consultada retornou zero mensagens e a página exibiu estado vazio coerente, sem erro visível. O painel já informa que as mensagens enviadas por `/contato` devem ser visualizadas e respondidas ali.

A rota `/admin/medalhas` carregou corretamente. Os quatro pilotos oficiais aparecem no catálogo: Participação Destacada, Primeiro Passo, Trilha Iniciada e Voz em Prática. Os selects de aluno e medalha estão habilitados e listam registros persistidos; a justificativa aparece como opcional na interface, embora a regra de concessão manual deva continuar exigindo justificativa no backend. O histórico está vazio, sem dados inventados. Não foi realizada concessão durante a auditoria.

## Auditoria autenticada — progresso e tarefas

A rota `/professor/progresso-aulas` carregou e apresentou a área de acompanhamento geral, filtros por status de feedback e ordenação por data. O estado atual mostra vários registros de alunos, inclusive alunos externos não cadastrados, todos com zero aulas concluídas. A seção de speaking informa que não existem gravações enviadas. Não foi observada falha de carregamento; será necessário revisar no código se a exposição de alunos externos está de acordo com o escopo esperado do professor.

A rota `/professor/tarefas` carregou sem erro, com exportação CSV/PDF, criação de tarefa, busca, filtros por prazo e tags, ordenação e progresso geral. A base retornou zero tarefas e o estado vazio foi apresentado corretamente. A ação de Nova Tarefa permaneceu disponível.

## Auditoria autenticada — turmas externas e alunos

A rota `/professor/turmas-externas` carregou sem erro e apresentou os controles solicitados anteriormente: busca, ano, semestre, modalidade, nível, ordenação, status/frequência, filtro de reprovação, instituições, criação de turma, configuração de aulas, link de sala, horário, carga horária, limite de faltas, datas e matrícula de alunos. O banco retornou zero turmas para a conta, com estado vazio explicativo. A auditoria visual identificou uma faixa de filtros extensa no desktop; será necessário confirmar o comportamento em viewport móvel para evitar rolagem lateral.

A rota `/professor/alunos` carregou corretamente como área de moderação pedagógica. Foram exibidas duas solicitações pendentes, com ações Recusar e Aprovar aluno. A própria página informa que professores não podem aprovar outros professores nem alterar papéis administrativos, o que está alinhado ao controle de permissões. Não foram executadas ações sobre alunos reais.

## Auditoria autenticada e pública — certificados e cursos

A rota `/professor/certificados` carregou corretamente. A área exibe emissão para pessoa sem cadastro, exportação de pendências em CSV, busca por nome/CPF/e-mail/código, filtros por status e datas, seleção múltipla, exclusão e download em lote. O banco retornou zero certificados para a conta e a página mostrou estado vazio coerente. Não foram executadas ações destrutivas ou emissões.

A rota pública `/cursos` carregou com sete cursos e recursos de busca, filtros por nível, tipo, categoria e desejos. A página não apresentou erro visível. Entretanto, o catálogo público ainda lista o curso `English Mastery B2` como `Curso Externo / Avulso`, embora a regra do projeto estabeleça que cursos externos não devem aparecer para visitantes não autorizados. Esse ponto foi marcado como provável correção de escopo/visibilidade e será confirmado no código e nos contratos de consulta.

## Auditoria pública — contato

Em `https://andersonpalafoz.vercel.app/contato`, o formulário publicado ainda orienta o visitante a abrir o aplicativo de e-mail e o botão aparece como “Enviar por email”. A página também mantém os atalhos diretos de e-mail e WhatsApp, que podem continuar existindo como canais alternativos. O fluxo principal do formulário, contudo, ainda não refletia a preferência de centralização no painel; essa é uma correção confirmada no workspace, ainda pendente de build/deploy.
