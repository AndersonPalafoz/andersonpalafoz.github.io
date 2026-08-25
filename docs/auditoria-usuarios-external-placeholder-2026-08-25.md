# Auditoria dos usuários `external.placeholder` — 25/08/2026

## Resultado em produção

A API administrativa publicada em `https://andersonpalafoz.vercel.app/api/admin/users` retornou quatro registros com o mesmo nome, **Adna Caroline Vale Oliveira**, IDs 10, 11, 12 e 13. Todos possuem `role: user`, `approvalStatus: approved`, `deletedAt: null` e `loginMethod: manual_external`.

Os e-mails são identificadores técnicos gerados automaticamente:

| ID | E-mail técnico | Criado em | Estado |
|---:|---|---|---|
| 10 | `nao-cadastrado-1787367159067-5deik@external.placeholder` | 22/08/2026 02:52 UTC | Ativo |
| 11 | `nao-cadastrado-1787367189099-fcizm@external.placeholder` | 22/08/2026 02:53 UTC | Ativo |
| 12 | `nao-cadastrado-1787367556424-2jxrk@external.placeholder` | 22/08/2026 02:59 UTC | Ativo |
| 13 | `nao-cadastrado-1787367581226-ecgyo@external.placeholder` | 22/08/2026 02:59 UTC | Ativo |

## Origem

Essas contas foram criadas pela rota `POST /api/admin/certificates/issue`, quando o administrador emitiu um certificado para uma pessoa sem selecionar um `userId` cadastrado. O fluxo exige um nome, cria um `openId` técnico com o prefixo `manual-ext-`, gera um e-mail placeholder quando nenhum e-mail real é informado e grava `loginMethod: manual_external` e `approvalStatus: approved`.

Portanto, não são quatro logins Google diferentes nem cadastros feitos pela pessoa no site. São quatro registros de identidade técnica, criados em emissões separadas. Como o e-mail placeholder é gerado com `Date.now()` e um sufixo aleatório, o sistema não reutiliza automaticamente o registro anterior quando a emissão é repetida sem o mesmo e-mail direto.

## Por que a exclusão parece indisponível

A conta está ativa (`deletedAt: null`). O fluxo correto é primeiro usar **Excluir usuário externo**, que faz exclusão lógica e preserva o histórico; depois, na aba/filtro de contas excluídas, aparecem **Recuperar** e **Excluir definitivamente**. A exclusão definitiva exige digitar exatamente o e-mail da conta e pode ser bloqueada se houver dependências acadêmicas, como sessões de aula, turmas externas, concessões de acesso ou cupons criados pelo usuário.

Na captura, a ação desktop aparecia apenas como ícone e a coluna podia ficar fora da área visível. O layout foi ajustado para exibir o botão textual e a categoria **Certificado externo**, além de identificar a conta como `Usuário técnico · sem login no site` no modo mobile.

## Auditoria do banco do workspace

A base acessível pelo workspace não contém esses quatro registros, o que confirma que eles pertencem à base usada pelo deployment Vercel e não à base local atualmente conectada às consultas administrativas do workspace. Nenhuma consulta de auditoria inseriu, atualizou ou excluiu dados.

## Segurança preservada

A conta principal do administrador continua protegida. A exclusão lógica permanece reversível, e a exclusão definitiva continua exigindo confirmação explícita por e-mail e passando por verificações de dependências antes da remoção.
