# Auditoria do Estado Atual — 27/08/2026

## Escopo e método

Esta auditoria é exclusivamente de leitura. Foram avaliados o repositório conectado, a compilação, rotas públicas e protegidas, regras de acesso, a implantação registrada e métricas agregadas do banco Neon. Nenhuma tabela, arquivo ou configuração de produção foi alterada.

## Achados iniciais

| Área | Evidência | Situação preliminar |
| --- | --- | --- |
| Repositório | A branch `main` está em `34e96a8`, contendo as melhorias recentes de avatar e navegação mobile. [1] | Confirmada. |
| Implantação | A implantação Production registrada para esse commit foi concluída com sucesso em 27/08/2026. | Confirmada. |
| Site público | A URL oficial respondeu HTTP 200 para Home, Sobre, Aulas, Cursos, Materiais, Blog, Contato, FAQ e Login. [2] | Disponível. |
| Áreas protegidas | Sem sessão, Dashboard, Professor e Administração redirecionaram ao Login; APIs de perfil, certificados e turmas responderam 401/403. | Proteção básica confirmada. |
| Neon | Há 6 usuários ativos, 6 cursos ativos, 1 matrícula ativa, 2 turmas externas e 12 alunos externos, todos vinculados ao SIMAL. Não há certificados ou URLs de PDFs preenchidas. | Dados críticos do SIMAL preservados. |
| Painel superadmin | A conta `palafozanderson@gmail.com` carregou Dashboard e Administração com os módulos de aluno, docência, administração e superadmin esperados. | Funcional, com achado de higiene abaixo. |

## Observação operacional

O URL técnico individual da implantação Production exigiu autenticação no Vercel quando acessado diretamente. Isso não afeta a URL pública oficial, que permaneceu acessível e respondeu normalmente; é um comportamento esperado de proteção de deployment preview.

## Achados adicionais

1. **Prioridade alta — higiene de identidades técnicas.** A busca administrativa lista quatro registros de Adna Caroline Vale Oliveira com e-mails `@external.placeholder` como alunos. Esses registros foram preservados previamente por cautela, mas a exposição na busca principal torna o painel visualmente confuso e conflita com a política de não apresentar identidades técnicas em fluxos pedagógicos. A correção recomendada é ocultá-los das listas gerais por uma regra de visibilidade, sem apagar registros nem dados do SIMAL.
2. **Prioridade alta — suíte global de testes não está íntegra.** A execução completa falhou em 26 testes distribuídos por 14 arquivos. Parte relevante vem de testes de rotas que invocam `headers()` do Next fora do escopo de requisição; outra parte são contratos textuais desatualizados, como a expectativa de uma verificação antiga de autoria em turmas externas. Os testes focados recentes passam, TypeScript e build de produção também, mas a suíte global não pode funcionar hoje como barreira confiável de regressão.
3. **Prioridade alta — dependência de importação de planilhas.** A auditoria de dependências reportou duas vulnerabilidades altas em `xlsx@0.18.5`. Como a página de Turmas Externas importa planilhas com essa biblioteca no navegador, deve-se substituir ou atualizar o leitor antes de incentivar importações de arquivos de origem não confiável.
4. **Prioridade média — indicadores de progresso usam fontes diferentes.** No Dashboard publicado, o cartão de retomada exibiu 9% para o curso ativo, enquanto o histórico e o monitor administrativo exibiram 0%. O cartão usa o percentual calculado com `lessonProgress`; o histórico usa `enrollments.progress`. A divergência é explicável tecnicamente, porém confusa para o usuário e merece uma fonte de verdade única ou uma sincronização explícita.
5. **Prioridade média — ferramenta de banco legada no ambiente do projeto.** A ferramenta de SQL integrada ao projeto respondeu como TiDB e rejeitou sintaxe PostgreSQL, enquanto a produção oficial opera em Neon/PostgreSQL. As métricas foram obtidas corretamente pelo Neon em modo somente leitura, mas futuras operações de dados devem continuar usando o Neon oficial até que a configuração legada seja removida ou alinhada.
6. **Prioridade baixa — manutenção de ambiente.** O preview recente está saudável, porém registra avisos de `browserslist` desatualado e de configuração futura de `allowedDevOrigins`. Há também avisos históricos de cache Webpack, que não reapareceram após o último build bem-sucedido.

## Síntese de qualidade

| Dimensão | Resultado | Leitura |
| --- | --- | --- |
| Disponibilidade pública | Aprovada | As nove rotas públicas verificadas responderam HTTP 200. |
| Autenticação e borda de autorização | Aprovada na amostra | Rotas privadas sem sessão redirecionaram para Login e APIs consultadas negaram acesso. A sessão de superadmin abriu os módulos esperados. |
| Build e tipos | Aprovados | `pnpm exec tsc --noEmit`, `git diff --check` e `pnpm build` finalizaram sem erro. |
| Testes automatizados | Requer correção | A suíte completa contém 26 falhas. Os testes focados recentes permanecem aprovados, mas não substituem a correção da suíte geral. |
| Responsividade | Aprovada na amostra | Home, Cursos, Materiais e Login foram vistos em 375px sem rolagem lateral. Os menus compartilhados receberam testes de regressão. |
| Dados pedagógicos | Aprovados | O banco mantém duas turmas e 12 alunos externos do SIMAL; não foram encontrados certificados nem referências de PDF pendentes. |
| Armazenamento de certificados | Pronto, sem evidência de uso atual | O código valida os caminhos reconhecidos, preserva o bucket privado de assinados e limpa arquivos associados. Não há referências atuais para auditar objetos órfãos. |
| Ferramenta de banco do projeto | Requer atenção operacional | A integração interna de SQL ainda se identifica como TiDB, mas o banco oficial consultado é Neon/PostgreSQL. |
| Dependências | Requer ação | `xlsx` é usado em importação de planilhas e possui duas vulnerabilidades altas reportadas pelo audit. [3] Há ainda um alerta alto em `nanoid` transitivo e um moderado em `postcss`. |

## Plano de correção recomendado

| Prioridade | Ação concreta | Critério de conclusão |
| --- | --- | --- |
| P0 | Substituir ou atualizar o parser `xlsx` da importação de turmas externas por uma alternativa mantida e validar arquivos antes da leitura. | `pnpm audit --prod` não reporta vulnerabilidades altas exploráveis no fluxo de importação. |
| P0 | Adaptar os testes de API para executar em contexto de requisição ou mockar corretamente `headers`/sessão do Next. | `pnpm vitest run` passa integralmente e volta a ser barreira de regressão. |
| P1 | Aplicar a regra já adotada nas áreas pedagógicas para ocultar `@external.placeholder` da busca administrativa geral. | A busca administrativa mostra somente pessoas relevantes, sem apagar os quatro registros preservados. |
| P1 | Definir uma única fonte de verdade para o progresso do curso ou sincronizar `lessonProgress` com `enrollments.progress`. | Cartão de retomada, histórico e monitor administrativo exibem o mesmo percentual. |
| P1 | Remover ou corrigir a integração SQL legada do ambiente para que ela aponte ao Neon oficial. | Consultas de leitura PostgreSQL deixam de falhar por sintaxe TiDB e não há risco de operar no banco incorreto. |
| P2 | Atualizar os dados do Browserslist e decidir se `allowedDevOrigins` deve ser configurado para o fluxo de preview. | Avisos de manutenção do preview reduzidos, sem mudança de comportamento em produção. |

## Limites desta auditoria

As consultas ao Neon foram somente agregadas, sem expor dados pessoais nem realizar escrita. Não foi executada exclusão, alteração de permissões, upload ou fluxo de pagamento. A URL pública oficial foi verificada; o URL técnico individual de deployment é protegido pelo login do Vercel e, por isso, não foi usado como prova de navegação pública.

## Referências

[1]: https://github.com/AndersonPalafoz/andersonpalafoz.github.io/commit/34e96a8caa3fe4a769663280cda449cb8b3f61c0 "Commit atual da branch main"
[2]: https://andersonpalafoz.vercel.app "Site oficial da Anderson Palafoz Platform"
[3]: https://github.com/advisories/GHSA-4r6h-8v6p-xvw6 "Advisory de segurança do SheetJS"
