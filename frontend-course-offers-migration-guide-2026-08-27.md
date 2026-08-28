# Guia de migração do frontend para ofertas e coortes

**Projeto:** Anderson Palafoz
**Data:** 27 de agosto de 2026
**Escopo:** adaptação dos consumidores frontend de cursos, matrículas, progresso, materiais, frequência, avaliações e relatórios para o modelo `course → offer/cohort`.

> **Princípio central:** `courseId` identifica o conteúdo; `offerId` identifica a oferta/coorte em que o aluno está matricado e onde acontecem agenda, professores, frequência, avaliações, fechamento e relatórios.

## 1. Estado atual e objetivo

O frontend atual foi construído principalmente em torno de `courseId`. O componente de matrícula, por exemplo, consulta `/api/enrollments`, verifica uma inscrição por curso e envia somente `{ courseId }` para matrícula ou checkout. A nova camada acrescenta endpoints para ofertas, professores e matrículas contextuais, mas a integração visual ainda precisa ser feita nos consumidores existentes.

A migração deve ser incremental. O fluxo legado precisa continuar funcionando para cursos sem ofertas, enquanto os cursos que possuem ofertas devem solicitar ou carregar explicitamente uma coorte. Nenhum componente deve inferir uma oferta apenas pelo nome do curso ou pelo e-mail do aluno.

## 2. Contrato frontend recomendado

Crie tipos compartilhados em `lib/course-offer-types.ts` ou em um cliente tipado equivalente. Evite importar diretamente o schema Drizzle em componentes client-side.

```ts
export type CourseOffer = {
  id: number;
  courseId: number;
  sourceExternalClassId?: number | null;
  institution?: string | null;
  offerName: string;
  academicTerm: string;
  ownerTeacherId: number;
  modality?: string | null;
  classDays?: string | null;
  classTime?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  gradingPolicy: "standard" | "unit" | "simal";
  gradingScope: "course" | "unit";
  gradeStatus: "open" | "closed";
  status: "draft" | "published" | "archived";
  deletedAt?: string | null;
};

export type CourseOfferStudent = {
  id: number;
  offerId: number;
  userId?: number | null;
  externalStudentId?: number | null;
  name: string;
  email?: string | null;
  status: "active" | "inactive" | "completed";
};
```

O cliente HTTP deve concentrar tratamento de erros, `cache: "no-store"` para estado acadêmico e serialização do `offerId`.

```ts
export async function getCourseOffers(courseId: number) {
  const response = await fetch(`/api/course-offers?courseId=${courseId}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Não foi possível carregar as ofertas.");
  return (await response.json()).offers as CourseOffer[];
}

export async function enrollInCourse(courseId: number, offerId?: number) {
  const response = await fetch("/api/enrollments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courseId, ...(offerId ? { offerId } : {}) }),
  });
  if (!response.ok) throw new Error((await response.json()).error ?? "Falha na matrícula.");
  return response.json();
}
```

O endpoint de listagem deverá futuramente aceitar filtro por `courseId`. Enquanto esse filtro não estiver implementado no backend, a página deve receber as ofertas de um Server Component autorizado ou usar um endpoint específico de ofertas públicas do curso; não se deve expor ofertas de outros cursos ao cliente.

## 3. Matriz de componentes

| Componente | Mudança | Prioridade | Estratégia |
|---|---|---:|---|
| `components/enroll-button.tsx` | Matrícula e checkout com `offerId` | Crítica | Já adaptado para aceitar `offers` e `offerId`, mantendo fallback legado |
| `app/cursos/[id]/page.tsx` | Carregar e selecionar oferta | Crítica | Server Component carrega ofertas do curso e passa opções ao botão |
| `app/dashboard/meus-cursos/page.tsx` | Exibir matrícula por oferta | Crítica | Mostrar coorte, período, professor, frequência e status acadêmico |
| `app/professor/cursos/page.tsx` | Listar cursos e ofertas | Crítica | Adicionar visão de ofertas/coortes, sem misturar conteúdo e operação |
| `app/admin/cursos/page.tsx` | Administrar ofertas | Crítica | Separar CRUD do curso de CRUD da oferta |
| `components/professor-courses-list.tsx` | Ações operacionais | Alta | Redirecionar ações de período para `/api/course-offers` |
| `components/professor-courses-trash-manager.tsx` | Lixeira de ofertas | Alta | Criar aba ou manager específico para ofertas |
| `app/cursos/[id]/aulas/[lessonId]/page.tsx` | Contexto de acesso | Alta | Propagar `offerId` e validar matrícula contextual |
| `app/dashboard/aluno-externo/page.tsx` | Unificar aluno externo | Alta | Adaptar leitura para `courseOfferStudents` sem remover legado |
| `components/student-activities-board.tsx` | Atividades contextualizadas | Média | Propagar `offerId` somente quando a atividade for da oferta |
| `components/material-progress-button.tsx` | Progresso contextual | Média | Usar oferta quando o material for específico da coorte |
| `components/material-comments-section.tsx` | Comentários por escopo | Média | Garantir que comentários não vazem entre ofertas |
| `components/save-material-button.tsx` | Favoritos | Média | Pode permanecer por material global; adicionar oferta se o material for contextual |
| `app/professor/turmas-externas/page.tsx` | Compatibilidade | Alta | Manter funcionando e migrar por adaptador, não por substituição abrupta |

## 4. Ordem de implementação

### 4.1 Cliente da API e tipos

Antes de alterar páginas, crie o cliente tipado. Cada método deve possuir um contrato único para erros `401`, `403`, `404`, `409` e `422`. O cliente não deve esconder `403`, pois a interface precisa diferenciar “sem permissão” de “sem dados”.

### 4.2 Página de detalhe do curso

Em `app/cursos/[id]/page.tsx`, carregue somente ofertas ativas vinculadas ao curso. Mostre um cartão por oferta com nome, período, instituição, professor, modalidade, agenda e estado. Ofertas arquivadas ou fechadas não devem aparecer como opção de nova matrícula.

Passe as opções para o botão:

```tsx
<EnrollButton
  courseId={course.id}
  offers={offers}
  offerId={selectedOfferId}
  isFree={course.isFree}
  price={course.price}
  resumeLessonId={resumeLessonId}
/>
```

Se houver mais de uma oferta, a seleção deve ser obrigatória. Se o curso não possuir oferta, preserve o botão legado com `offers={[]}`.

### 4.3 Matrícula e checkout

O botão deve enviar `{ courseId, offerId }` quando houver oferta. O endpoint legado `/api/enrollments` precisará aceitar `offerId`, validar se a oferta pertence ao curso e criar a matrícula contextual. O checkout pago deve aplicar a mesma validação antes de iniciar o Stripe.

O frontend não deve considerar uma matrícula existente somente porque encontrou `courseId` quando o usuário escolheu uma oferta específica. A comparação deve ser:

```ts
const sameCourse = enrollment.courseId === courseId;
const sameOffer = !offerId || enrollment.offerId === offerId;
const isEnrolled = sameCourse && sameOffer;
```

### 4.4 Dashboard do aluno

Em `app/dashboard/meus-cursos/page.tsx`, substitua cartões agrupados somente por curso por cartões que exibam curso e oferta. Uma pessoa pode estar em duas ofertas do mesmo curso e deve visualizar progresso, frequência e status separadamente.

O painel deve tratar os seguintes estados:

| Estado | Interface |
|---|---|
| Curso sem oferta | Comportamento atual por curso |
| Oferta ativa | Mostrar acesso, período e progresso |
| Oferta fechada | Mostrar histórico e resultado, sem nova matrícula |
| Oferta arquivada | Mostrar somente se o aluno ainda possuir histórico |
| Matrícula pendente | Mostrar aviso, sem liberar operações acadêmicas |
| Falha de carregamento | Manter estado vazio distinguível de erro |

### 4.5 Aula e progresso

`app/cursos/[id]/aulas/[lessonId]/page.tsx` continua resolvendo conteúdo pelo curso e aula, mas deve preservar `offerId` na URL ou em um contexto de navegação. Links de retorno, “próxima aula” e “continuar assistindo” devem manter o parâmetro.

A autorização de acesso deve verificar a matrícula contextual quando a oferta exigir isso. O progresso de uma aula global pode continuar em `lessonProgress`; atividades, frequência e avaliações devem incluir a oferta para não misturar turmas.

### 4.6 Painel professor e administração

O painel docente deve separar duas categorias de ação:

| Conteúdo | Oferta/coorte |
|---|---|
| Editar título e descrição do curso | Editar período, agenda e modalidade |
| Criar módulos e aulas | Matricular alunos |
| Ordenar conteúdo | Lançar frequência |
| Editar materiais globais | Lançar avaliações e fechar notas |
| Publicar conteúdo | Atribuir professores delegados |

`professor-courses-list.tsx` não deve chamar o endpoint de cursos para arquivar uma oferta. A ação deve usar `/api/course-offers/[id]`. A lixeira de cursos e a lixeira de ofertas devem permanecer visualmente separadas.

## 5. Fluxos de frequência, notas e relatórios

Quando o frontend receber `offerId`, todos os pedidos acadêmicos deverão carregá-lo. Isso inclui chamada por data, notas, média manual, fechamento, boletim, CSV, XLSX, PDF e gráficos.

A política `gradingPolicy` deve ser usada para apresentar o contexto correto. Em ofertas SIMAL, a interface deve exibir prova escrita até 8,0, apresentação até 2,0 e total até 10, sem substituir esses valores por uma média genérica.

O fechamento de notas deve bloquear controles de edição quando `gradeStatus === "closed"`, mas manter visualização e exportação. A média manual deve mostrar justificativa e data de ajuste para usuários autorizados.

## 6. Compatibilidade com alunos externos

`app/dashboard/aluno-externo/page.tsx` deve ser generalizado gradualmente. Durante a transição, a camada de normalização pode converter os dois formatos para um view model:

```ts
type StudentCourseContext = {
  courseId?: number | null;
  offerId?: number | null;
  title: string;
  studentName: string;
  grades: unknown[];
  attendance: unknown;
  materials: unknown[];
  legacy: boolean;
};
```

O campo `legacy` é útil para preservar links e comportamentos antigos sem espalhar verificações de tabela por toda a interface. O painel deve permitir que um aluno externo sem conta continue vendo seu boletim e seus materiais, enquanto uma matrícula com usuário interno passa a usar o contexto da oferta.

## 7. Responsividade e acessibilidade

O seletor de oferta deve funcionar em celular, tablet e desktop. Use `label` associado, foco visível, mensagem de erro com `role="alert"`, estado de carregamento com nome acessível e botões com `type="button"` explícito.

Cartões de ofertas devem empilhar em telas estreitas e não podem depender de largura fixa. Dados longos como instituição, período e nome da oferta devem usar `min-w-0`, quebra de texto e truncamento apenas quando houver alternativa acessível. Não esconda informações acadêmicas essenciais apenas por breakpoint.

## 8. Testes obrigatórios

Cada componente migrado deve possuir testes para compatibilidade legada e contexto novo.

| Grupo | Casos mínimos |
|---|---|
| Seletor | Nenhuma oferta, uma oferta, múltiplas ofertas, oferta arquivada, seleção obrigatória |
| Matrícula | Payload legado, payload com oferta, conflito por curso, conflito por oferta |
| Checkout | Curso gratuito, pago, oferta inválida, oferta de outro curso |
| Dashboard | Duas ofertas do mesmo curso, curso sem oferta, matrícula histórica |
| Aula | Propagação de `offerId`, link de retorno, acesso sem matrícula |
| Professor | Proprietário, delegado, curso sem permissão, oferta arquivada |
| Administração | Criar, editar, arquivar, restaurar e atribuir professor |
| Acadêmico | Frequência, notas decimais, SIMAL, média manual e fechamento |
| Relatórios | Filtro por oferta, exportação sem dados, caracteres brasileiros |
| Responsividade | 390, 768 e 1440 pixels, sem overflow horizontal |

Os testes E2E devem iniciar com uma oferta temporária e destruir os dados no `finally`. Não use a produção como ambiente de teste.

## 9. Rollout recomendado

A migração frontend deve ser liberada por etapas. Primeiro publique os tipos, cliente e componentes de leitura sem mudar a matrícula. Depois habilite seleção e matrícula em uma oferta de staging. Em seguida migre dashboard e aula. Só depois habilite gestão docente, frequência, notas, relatórios e alunos externos.

Use uma flag de capacidade por curso ou oferta, por exemplo `offersEnabled`. Quando falsa, a interface permanece no fluxo legado; quando verdadeira, o componente exige o contexto da oferta. A flag deve ser removida somente após todos os consumidores terem sido migrados e os dados reais terem sido validados.

## 10. Critérios de aceite

A migração frontend estará concluída quando um curso sem oferta continuar com o fluxo atual, um curso com uma oferta abrir diretamente seu contexto e um curso com várias ofertas exigir seleção explícita. O mesmo aluno poderá estar em mais de uma oferta sem mistura de progresso, frequência ou notas. Professor proprietário e delegado verão somente as ofertas permitidas, enquanto o administrador poderá gerenciar o conjunto completo.

Além disso, o `offerId` deverá permanecer nos fluxos de matrícula, checkout, aula, atividades, frequência, notas e relatórios; estados de erro e carregamento deverão ser distinguíveis; e a interface deverá manter comportamento correto em celular, tablet e desktop.

## 11. Checklist de implementação

- [ ] Criar cliente frontend tipado para ofertas, professores e alunos.
- [ ] Adicionar filtro seguro por `courseId` ao endpoint de listagem pública/autorizada.
- [ ] Atualizar `app/cursos/[id]/page.tsx` com cartões e seleção de ofertas.
- [ ] Atualizar o endpoint legado de matrícula para validar e persistir `offerId`.
- [ ] Integrar `components/enroll-button.tsx` ao pai que fornece as ofertas.
- [ ] Atualizar dashboard do aluno para separar contextos por oferta.
- [ ] Propagar `offerId` em aulas, atividades e links de continuidade.
- [ ] Criar gestão docente e administrativa de ofertas.
- [ ] Integrar matrículas, professores delegados, frequência e avaliações.
- [ ] Atualizar relatórios e gráficos para filtrar por oferta.
- [ ] Generalizar o painel de aluno externo com view model compatível.
- [ ] Executar testes de contrato, unitários, E2E e responsividade.
- [ ] Validar em staging e publicar progressivamente.

## Referências

[1]: https://github.com/AndersonPalafoz/andersonpalafoz.github.io/blob/main/components/enroll-button.tsx — Componente de matrícula atualizado para aceitar ofertas/coortes.
[2]: https://github.com/AndersonPalafoz/andersonpalafoz.github.io/blob/main/app/api/course-offers/route.ts — Endpoint de coleção de ofertas.
[3]: https://github.com/AndersonPalafoz/andersonpalafoz.github.io/blob/main/app/api/course-offers/%5Bid%5D/route.ts — Endpoint de item de oferta.
[4]: https://github.com/AndersonPalafoz/andersonpalafoz.github.io/blob/main/app/api/course-offers/%5Bid%5D/students/route.ts — Endpoint de matrículas contextuais.
[5]: https://github.com/AndersonPalafoz/andersonpalafoz.github.io/blob/main/drizzle/schema.ts — Modelos de cursos, matrículas, ofertas e coortes.
[6]: https://github.com/AndersonPalafoz/andersonpalafoz.github.io/blob/main/app/api/course-offers/e2e.test.ts — Testes E2E locais dos handlers de ofertas.
