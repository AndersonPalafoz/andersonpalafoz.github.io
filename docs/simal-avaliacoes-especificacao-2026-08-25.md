# Especificação inicial das avaliações SIMAL

Fonte: arquivos fornecidos pelo professor em 25/08/2026.

A avaliação `Units 1, 2 & 4` possui nota máxima de 8,0 pontos e é composta por Grammar (2,0), Reading (2,0), Writing (1,5), Listening (1,0) e Speaking (1,5). A nota do período inclui também uma Presentation de até 2,0 pontos, totalizando 10,0 pontos.

A prova aplicada informada pelo professor é a versão A. A versão B foi fornecida como material de referência e deve existir como opção de avaliação, sem ser lançada automaticamente para os alunos da aplicação atual.

A parte oral vale 1,5 ponto e possui três critérios de 0 a 0,5: na prova, Grammar/Structure, Fluency/Naturalness e Content/Vocabulary; no roteiro complementar, Content and topic fulfillment, Use of language e Comprehensibility. O sistema deve permitir configurar os critérios e registrar as três notas separadamente, calculando o total sem ultrapassar 1,5.

A prova escrita contém 20 itens de Grammar (0,10 cada), 10 itens de Reading (0,20 cada), duas tarefas de Writing (1,0 + 0,5) e 10 itens de Listening (0,10 cada). O sistema deve registrar a nota por componente, não presumir respostas corretas e permitir lançamento manual da nota obtida pelo aluno.

A tela de turmas externas já possui uma tabela simples `externalClassGrades` com título da avaliação, score, maxScore e feedback. A implementação deve preservar esse contrato para avaliações livres existentes e adicionar estrutura de avaliação definida por turma, versão, componente e aluno, permitindo cadastro e edição para alunos existentes e novos.
