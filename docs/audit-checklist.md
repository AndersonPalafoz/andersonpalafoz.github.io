# Checklist de Auditoria Modular — Plataforma Anderson Palafoz

Este documento divide a auditoria técnica e funcional da plataforma em **6 módulos independentes**. Cada módulo pode ser executado em um prompt separado para garantir controle rigoroso, validação de dados reais, segurança e conformidade com as diretrizes educacionais e de governança.

---

## Módulo 1: Autenticação, Segurança & RBAC (Controle de Acesso)
*Objetivo:* Garantir que todas as rotas protegidas, papéis (Admin, Professor, Aluno) e sessões estejam blindados contra acessos indevidos e perda de sessão.

- [ ] **1.1 Login e Sessão:** Verificar persistência de sessão com NextAuth (Google OAuth e Credentials) e ausência de deslogamento inesperado.
- [ ] **1.2 Conta Admin Principal:** Validar que o e-mail `palafozanderson@gmail.com` possui privilégios irrestritos de administrador e aprovado automaticamente.
- [ ] **1.3 Isolamento de Painéis:** Confirmar que os links de Admin e Professor aparecem exclusivamente dentro do Dashboard (`/dashboard`) com base no cargo, nunca no menu público.
- [ ] **1.4 Proteção de Rotas de API:** Testar se endpoints protegidos (`/api/admin/*`, `/api/professor/*`) rejeitam usuários não autenticados ou sem papel adequado com código `401`/`403`.
- [ ] **1.5 Inatividade e 2FA:** Auditar o bloqueio por inatividade e as configurações de segurança de token.

---

## Módulo 2: Integridade de Dados & Conexão Neon PostgreSQL
*Objetivo:* Assegurar que 100% dos dados exibidos sejam reais (vindos do banco relacional Neon) e que não existam mocks, placeholders ou notas inventadas.

- [ ] **2.1 Ausência de Mocks:** Auditar rotas críticas de histórico, notas e perfil para garantir que consultas SQL/Drizzle retornem apenas dados reais.
- [ ] **2.2 Paginação e Limites:** Verificar se consultas pesadas em relatórios utilizam limites estritos (`LIMIT`/`OFFSET`) para proteger os limites do Neon.
- [ ] **2.3 Tratamento de Erros de Banco:** Validar se páginas como `/dashboard/historico` exibem estados de erro amigáveis e opção de "Tentar Novamente" em caso de falhas de conexão.
- [ ] **2.4 Migrações Drizzle:** Garantir que o schema do banco (`drizzle/schema.ts`) e o banco real estejam sincronizados sem desvios estruturais.

---

## Módulo 3: Painel do Professor & Turmas Externas (SIMAL, Megaworks, UFBA)
*Objetivo:* Validar a gestão docente unificada, o Academic Knowledge Hub e o cadastro manual de turmas e alunos de instituições parceiras.

- [ ] **3.1 Central "Minha Área":** Verificar a usabilidade dos cartões de resumo, atalhos e contagem de tarefas pendentes de correção.
- [ ] **3.2 CRUD de Turmas Externas (`/professor/turmas-externas`):** Testar a criação, edição, busca instantânea e filtros por instituição (SIMAL, Megaworks, UFBA).
- [ ] **3.3 Matrícula Manual de Alunos:** Validar a adição e remoção de alunos em turmas externas com e-mails e IDs institucionais.
- [ ] **3.4 Moderação de Alunos (`/professor/alunos`):** Confirmar aprovação e rejeição de solicitações de cadastro.

---

## Módulo 4: Experiência do Aluno, Gamificação & Histórico Acadêmico
*Objetivo:* Auditar o painel do aluno, trilha adaptativa, ofensivas (streaks), placar de líderes e visualização de notas e frequência.

- [ ] **4.1 Histórico Acadêmico (`/dashboard/historico`):** Verificar gráficos temporais de notas, cálculo de médias por disciplina e exportação em PDF.
- [ ] **4.2 Skeleton Loaders:** Confirmar a presença de esqueletos animados (`animate-pulse`) durante o carregamento de dados em páginas sensíveis.
- [ ] **4.3 Sistema de Gamificação:** Validar contagem de XP, ofensivas diárias baseadas em UTC e funcionamento da loja de XP.
- [ ] **4.4 Certificados e QR Code:** Testar a geração de certificados de conclusão e a validação pública.

---

## Módulo 5: CMS Global, Seletor de Logo & Editor Visual
*Objetivo:* Verificar a autonomia do administrador para gerenciar conteúdos de qualquer área do site e personalizar identidade visual.

- [ ] **5.1 Painel CMS (`/admin/cms`):** Testar a edição de blocos de conteúdo reais e a listagem de revisões.
- [ ] **5.2 Biblioteca de Mídia:** Validar upload, busca por nome/categoria e exclusão múltipla de arquivos.
- [ ] **5.3 Seletor Visual de Logo:** Confirmar que alterações na logo e tema refletem corretamente nas páginas públicas e privadas.

---

## Módulo 6: Qualidade, Testes Automatizados & Build de Produção
*Objetivo:* Assegurar estabilidade para deploy no Vercel, ausência de erros de tipagem TypeScript e sucesso na suíte de testes.

- [ ] **6.1 Testes Vitest:** Executar `pnpm test` e garantir que todos os 192+ testes automatizados passem com 100% de sucesso.
- [ ] **6.2 Build Next.js 15:** Executar `pnpm build` para confirmar a ausência de erros de compilação, Server/Client boundary ou falhas de pacotes.
- [ ] **6.3 Acessibilidade & Responsividade:** Validar contraste WCAG e comportamento em dispositivos móveis (breakpoints flexíveis).

---

### Instruções para Execução em Etapas:
Para realizar a auditoria, você pode solicitar a revisão módulo por módulo em prompts separados:
> *"Executar a auditoria do Módulo X do checklist e relatar os achados."*
