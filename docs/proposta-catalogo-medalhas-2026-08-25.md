# Proposta de catálogo pedagógico de medalhas

**Projeto:** Anderson Palafoz Platform  
**Data:** 25 de agosto de 2026  
**Status:** Proposta para aprovação administrativa; nenhum registro foi inserido no banco.

## 1. Princípio pedagógico

As medalhas devem reconhecer comportamentos de aprendizagem observáveis, e não substituir o progresso acadêmico. A plataforma deve continuar priorizando conclusão de aulas, qualidade das atividades, feedback do professor, frequência e autonomia. Por isso, recomenda-se um catálogo pequeno, claro e opcional, evitando excesso de badges ou competição artificial.

> Uma medalha deve responder a três perguntas: **o que o aluno fez**, **qual evidência comprova isso** e **como essa conquista contribui para sua aprendizagem**.

O schema atual já oferece uma base suficiente para a primeira versão. `medals_catalog` possui `code`, `title`, `description`, `icon`, `category` e `requirement`; `user_medals` registra o aluno, o código da medalha, a origem automática ou manual, o administrador responsável e uma justificativa opcional. A proposta abaixo usa somente esses campos e não exige migração imediata.

## 2. Categorias recomendadas

| Categoria | Finalidade | Forma preferencial de concessão |
|---|---|---|
| `academic` | Reconhecer domínio ou prática linguística comprovável | Automática após evidência acadêmica validada |
| `achievement` | Reconhecer marcos de progresso no curso | Automática a partir do progresso persistido |
| `streak` | Reconhecer consistência de estudo sem punir pausas | Automática, com critérios moderados |
| `manual` | Registrar reconhecimento excepcional do professor | Manual, sempre com justificativa |

A categoria `manual` deve ser usada com parcimônia. Toda concessão manual precisa conter uma justificativa em `user_medals.notes`, para que o histórico seja compreensível e auditável.

## 3. Catálogo inicial proposto

A primeira versão deve começar com **16 medalhas**, distribuídas entre progresso, prática linguística, consistência e reconhecimento docente. Os códigos são estáveis e devem ser usados como identificadores técnicos; os títulos podem ser revisados editorialmente sem quebrar concessões já existentes.

### 3.1 Progresso e conclusão

| Código | Título | Categoria | Critério objetivo | Evidência mínima |
|---|---|---|---|---|
| `primeiro-passo` | Primeiro Passo | `achievement` | Concluir a primeira aula de um curso | Um registro de progresso concluído |
| `trilha-iniciada` | Trilha Iniciada | `achievement` | Concluir 25% das aulas de um curso | Percentual calculado a partir das aulas cadastradas |
| `trilha-em-andamento` | Trilha em Andamento | `achievement` | Concluir 50% das aulas de um curso | Registros de progresso consistentes |
| `trilha-concluida` | Trilha Concluída | `achievement` | Cumprir todos os requisitos de conclusão do curso | Progresso e atividades exigidas concluídos |

As medalhas de percentual não devem ser concedidas se o curso não possuir aulas cadastradas. Isso evita reconhecer progresso artificial em cursos incompletos ou de teste.

### 3.2 Práticas linguísticas

| Código | Título | Categoria | Critério objetivo | Evidência mínima |
|---|---|---|---|---|
| `voz-em-pratica` | Voz em Prática | `academic` | Enviar uma atividade de speaking válida | Arquivo ou gravação associada à atividade |
| `escuta-atenta` | Escuta Atenta | `academic` | Concluir uma atividade de listening com envio registrado | Tentativa válida e conclusão persistida |
| `leitura-com-proposito` | Leitura com Propósito | `academic` | Concluir uma prática de reading | Atividade concluída ou avaliação registrada |
| `escrita-em-construcao` | Escrita em Construção | `academic` | Entregar uma prática de writing | Submissão registrada; não depende de nota perfeita |
| `feedback-aplicado` | Feedback Aplicado | `academic` | Responder a um feedback do professor e reenviar a prática | Histórico de interação e nova submissão |

Os critérios devem reconhecer a prática e a revisão, não somente a nota. Uma nota mínima pode ser necessária para algumas medalhas acadêmicas futuras, mas não deve ser usada como único indicador de aprendizagem.

### 3.3 Consistência e autonomia

| Código | Título | Categoria | Critério objetivo | Evidência mínima |
|---|---|---|---|---|
| `ritmo-de-estudo` | Ritmo de Estudo | `streak` | Estudar em três dias distintos dentro de sete dias | Acessos ou conclusões válidas em dias diferentes |
| `constancia-semanal` | Constância Semanal | `streak` | Cumprir atividade de estudo em quatro semanas distintas | Eventos de aprendizagem, não apenas login |
| `autonomia-aprendiz` | Autonomia de Aprendiz | `achievement` | Concluir uma aula e uma atividade sem intervenção manual | Progresso e entrega registrados |
| `biblioteca-explorada` | Biblioteca Explorada | `achievement` | Acessar três materiais vinculados ao curso | Downloads ou visualizações autorizadas |

A plataforma não deve penalizar o aluno por interromper uma sequência. As medalhas de consistência são marcos históricos: uma pausa não deve apagar medalhas já conquistadas nem gerar mensagens de culpa.

### 3.4 Reconhecimento do professor

| Código | Título | Categoria | Critério objetivo | Evidência mínima |
|---|---|---|---|---|
| `participacao-destacada` | Participação Destacada | `manual` | Reconhecimento de participação relevante em aula ou projeto | Justificativa obrigatória do professor/admin |
| `evolucao-notavel` | Evolução Notável | `manual` | Reconhecimento de avanço observável ao longo do período | Justificativa com contexto e período |
| `colaboracao-academica` | Colaboração Acadêmica | `manual` | Contribuição respeitosa e útil para colegas ou projeto | Justificativa e referência ao contexto |
| `compromisso-com-a-aprendizagem` | Compromisso com a Aprendizagem | `manual` | Reconhecimento global de dedicação consistente | Justificativa detalhada e não genérica |

Medalhas manuais não devem funcionar como prêmios subjetivos sem explicação. O painel deve mostrar quem concedeu, quando concedeu, qual foi a justificativa e, futuramente, permitir revogação auditada em caso de erro.

## 4. Regras técnicas de concessão

Cada medalha automática deve ter um requisito legível no campo `requirement`, mas a regra executável deve ser mantida em código versionado ou em uma camada de regras. Não é recomendável interpretar texto livre diretamente para conceder medalhas. Uma convenção segura seria mapear `code` para funções determinísticas, por exemplo `primeiro-passo` para a primeira conclusão de aula e `trilha-concluida` para a função de elegibilidade do certificado.

A concessão automática deve ser idempotente. Se o mesmo evento for processado duas vezes, a plataforma não deve criar duas concessões da mesma medalha para o mesmo aluno, salvo se futuramente houver uma regra explícita de temporadas. Até existir uma restrição única no banco, a aplicação deve consultar a combinação `userId + medalCode` antes de inserir.

| Regra | Decisão recomendada |
|---|---|
| Reprocessamento de evento | Não duplicar medalha já concedida |
| Curso sem aulas | Não conceder medalhas percentuais |
| Conteúdo apagado ou arquivado | Não contar como nova evidência; preservar histórico já conquistado |
| Atividade invalidada | Reavaliar elegibilidade antes de conceder |
| Concessão manual | Exigir `awardedBy` e `notes` |
| Alteração de requisito | Versionar a regra; não invalidar retroativamente sem decisão administrativa |
| Conta excluída | Manter a relação histórica conforme a política de retenção da plataforma |

## 5. Melhorias recomendadas no painel administrativo

O catálogo administrativo deve sair de uma lista simples e passar a apresentar uma tabela com código, título, categoria, estado, requisito, quantidade de concessões e data de criação. Como o catálogo real está vazio, o estado vazio atual deve orientar o administrador, mas não criar dados automaticamente.

A criação e edição de medalhas deve incluir uma prévia do ícone, validação de código único, limite de caracteres para título e descrição, seleção controlada de categoria e um campo de requisito escrito em linguagem clara. Para medalhas automáticas, o painel deve informar qual regra técnica está vinculada ao código. Para medalhas manuais, deve indicar que a concessão exigirá justificativa.

O painel de concessões deve permitir filtrar por aluno, medalha, categoria, origem automática/manual e período. Também deve exibir o administrador responsável por cada concessão manual. A exclusão não deve ser física por padrão; recomenda-se arquivamento do catálogo e revogação auditada da concessão, com motivo obrigatório.

## 6. Melhorias recomendadas na área do aluno

A área do aluno deve apresentar medalhas como um resumo de conquistas, não como um painel competitivo. O ideal é mostrar as conquistas recentes, explicar o próximo marco de aprendizagem e permitir abrir uma medalha para consultar a descrição, o requisito cumprido, a data e, quando aplicável, o feedback associado.

Medalhas bloqueadas podem ser exibidas em quantidade limitada, com linguagem orientadora e sem revelar critérios que incentivem exploração artificial do sistema. O aluno deve conseguir ocultar a seção de medalhas se preferir concentrar-se apenas no progresso acadêmico. Não se recomenda ranking público, contagem ostensiva de pontos ou animações excessivas.

## 7. Acessibilidade e linguagem

Os ícones nunca devem ser a única forma de comunicar uma conquista. Toda medalha precisa de título, descrição textual, texto alternativo e contraste suficiente. O uso de emojis no campo `icon` pode ser mantido por compatibilidade, mas a interface deve aceitar nomes de ícones acessíveis e fornecer fallback textual.

A linguagem deve ser positiva e descritiva. Recomenda-se evitar expressões como “fracasso”, “atrasado” ou “perdeu a sequência”. O sistema deve dizer “próximo marco”, “prática registrada” e “retome quando estiver pronto”.

## 8. Ordem recomendada de implementação

A sequência mais segura é: primeiro consolidar a validação de código e o estado vazio; depois criar o CRUD administrativo; em seguida implementar concessão manual auditada; somente então ativar duas ou três regras automáticas de baixo risco, como `primeiro-passo`, `voz-em-pratica` e `trilha-concluida`. As demais regras devem ser liberadas após observar falsos positivos e revisar a experiência com alunos.

Não recomendo cadastrar as 16 medalhas de uma vez. A primeira rodada pode usar quatro medalhas-piloto: `primeiro-passo`, `trilha-iniciada`, `voz-em-pratica` e `participacao-destacada`. Depois da validação do administrador e de testes com dados reais, o catálogo pode ser ampliado gradualmente.

## 9. Decisões que precisam de aprovação

| Decisão | Recomendação |
|---|---|
| Quantidade inicial | Quatro medalhas-piloto |
| Ranking público | Não implementar |
| XP associado | Não associar automaticamente; manter foco no progresso |
| Concessão manual | Permitir somente com justificativa |
| Revogação | Permitir apenas com motivo e registro do responsável |
| Medalhas de streak | Usar dias de estudo, não simples login |
| Cadastro automático | Não executar antes da aprovação do administrador |

Esta proposta está pronta para revisão. Até a aprovação, o catálogo permanece sem registros novos no banco.
