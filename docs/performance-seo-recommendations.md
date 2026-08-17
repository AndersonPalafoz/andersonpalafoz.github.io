# Recomendações de Performance e SEO

## Contexto e leitura do estado atual

A plataforma foi auditada com foco em autenticação, gestão de usuários, turmas externas, experiência do aluno, CMS e qualidade de build. O projeto utiliza Next.js 15, App Router, TypeScript, Neon PostgreSQL com Drizzle, NextAuth e integrações com Google Workspace e Stripe. A suíte atual registra **192 testes Vitest aprovados** e o build de produção foi concluído sem erros.

Esses resultados confirmam estabilidade de compilação e testes automatizados, mas **não substituem medições de campo** de Core Web Vitals, Lighthouse, acessibilidade real, rastreamento por robôs ou conversão orgânica. As recomendações abaixo estão organizadas por prioridade para que a evolução possa ser dividida em prompts independentes.

> **Princípio de prioridade:** primeiro remover riscos que podem comprometer dados reais, autorização ou indexabilidade; depois otimizar bytes, interação e aquisição orgânica.

## Prioridade consolidada

| Prioridade | Frente | Recomendação | Impacto esperado | Esforço |
|---|---|---|---|---|
| P0 | Integridade | Substituir qualquer estado local, `initialAssets` ou upload simulado da biblioteca de mídia por persistência real em S3 e metadados no banco. | Evita perda de arquivos e dados falsos no CMS. | Médio |
| P0 | Segurança | Corrigir o escopo das turmas externas para que professores só leiam e alterem suas próprias turmas; administradores devem ter escopo explícito. | Evita exposição entre docentes e instituições. | Médio |
| P0 | SEO técnico | Implementar `metadata` por rota pública, sitemap XML, robots.txt, URLs canônicas e controle de indexação das áreas privadas. | Melhora rastreamento e evita indexação de dashboards. | Médio |
| P1 | Performance | Medir e otimizar LCP, INP e CLS em Home, Sobre, Cursos, Materiais, Blog e páginas de curso. | Melhora experiência real e sinais de qualidade. | Médio |
| P1 | Imagens e mídia | Migrar imagens públicas para `next/image`, definir dimensões, formatos modernos e carregamento prioritário apenas para o conteúdo acima da dobra. | Reduz bytes e deslocamentos de layout. | Médio |
| P1 | Conteúdo | Criar clusters de conteúdo interligando artigos, materiais e cursos por tema e nível. | Aumenta descoberta, profundidade de sessão e autoridade temática. | Médio/alto |
| P1 | Dados estruturados | Adicionar JSON-LD adequado para pessoa, cursos, artigos, breadcrumbs e organização, sem inventar avaliações ou depoimentos. | Melhora compreensão semântica pelos buscadores. | Médio |
| P2 | Observabilidade | Configurar medição de Web Vitals, erros de cliente/servidor e funil orgânico por rota. | Permite priorizar com dados reais. | Médio |
| P2 | Conteúdo editorial | Criar calendário para as buscas prioritárias: Professor de Inglês Salvador, aulas de inglês, materiais de inglês, grammar, vocabulary, reading e writing. | Expande aquisição qualificada. | Médio/alto |

## Recomendações de otimização de performance

### 1. Medir antes de alterar

Executar Lighthouse em desktop e mobile e acompanhar dados reais de usuários para as rotas públicas mais importantes. A medição deve registrar pelo menos **LCP**, **INP**, **CLS**, tempo de resposta do servidor, tamanho total transferido e erros JavaScript. Core Web Vitals representam dimensões de carregamento, interação e estabilidade visual da experiência real [1].

A coleta deve ser separada por rota, dispositivo e tipo de conexão. Não é suficiente medir apenas a Home: a página de histórico acadêmico, o CMS e os painéis autenticados têm perfis de carregamento diferentes e devem ser avaliados como aplicações internas.

### 2. Reduzir JavaScript inicial

Revisar componentes client-side de páginas públicas. Componentes que usam `useState`, `useEffect`, `useSession` ou bibliotecas de gráficos devem ser isolados em ilhas interativas e carregados apenas quando necessários. Gráficos administrativos, editores WYSIWYG, gerenciadores de mídia e players devem utilizar importação dinâmica quando não forem necessários no primeiro paint.

A meta é manter a Home, Sobre, Blog, Materiais e páginas públicas com o menor JavaScript interativo possível. Dashboards podem carregar mais código, mas devem fazê-lo por seção e não por um pacote único.

### 3. Otimizar imagens e identidade visual

Revisar todas as imagens públicas e de CMS para garantir dimensões explícitas, compressão e variantes responsivas. Usar `next/image` para imagens exibidas no frontend quando o fluxo de armazenamento permitir, definindo `sizes` conforme o layout. A documentação do Next.js recomenda o componente de imagem para dimensionamento responsivo e otimização automática [2].

O logo principal, favicon e imagens acima da dobra devem ter versões leves e dimensões previsíveis. Imagens decorativas devem ser carregadas de forma não bloqueante. Nunca inserir imagens base64 grandes no conteúdo ou no banco.

### 4. Melhorar fontes e estabilidade visual

Manter Poppins de maneira consistente, mas evitar múltiplos pesos desnecessários. Carregar apenas os pesos usados, preferencialmente pelo mecanismo de fonte do Next.js ou por uma estratégia que evite bloqueio de renderização. Reservar espaço para logos, avatares, gráficos, thumbnails e embeds antes de o conteúdo chegar para reduzir CLS.

### 5. Otimizar vídeos, áudios e embeds

YouTube, players universais e materiais multimídia não devem carregar iframes ou metadados pesados antes da interação do usuário. Usar uma miniatura leve e carregar o player após clique ou foco. Áudios devem exibir metadados reais, evitar pré-carregamento indiscriminado e salvar progresso sem múltiplas requisições redundantes.

### 6. Controlar consultas e payloads

Manter `LIMIT`, `OFFSET` ou paginação por cursor em relatórios e pesquisas. Selecionar somente colunas necessárias, evitar N+1 — especialmente nas listas de turmas externas, alunos, CMS e relatórios — e aplicar índices para chaves de busca, status, professor, curso e timestamps.

As respostas das APIs devem ser compactas e paginadas. Histórico acadêmico, relatórios e biblioteca de mídia não devem enviar todos os registros de uma vez. Para dados que mudam pouco, usar cache com invalidação explícita; para dados sensíveis do aluno, respeitar autorização e não compartilhar cache entre usuários.

### 7. Melhorar cache e revalidação

Definir políticas diferentes para conteúdo público e áreas autenticadas. Artigos, páginas públicas e catálogos podem usar revalidação; notas, frequência, progresso, compras e dados de usuários devem ser sempre validados no servidor e nunca tratados como conteúdo público cacheável.

### 8. Manter a operação de mídia realmente persistente

O componente `MediaAssetLibrary` deve ser tratado como um ponto de atenção P0. A implementação atual possui ativos iniciais e o fluxo visual de upload; a versão de produção precisa enviar o `File` ao endpoint protegido, armazenar bytes no S3, salvar metadados reais no banco e devolver a URL ou chave persistente. O estado React deve ser apenas uma representação temporária do resultado persistido.

Também é necessário implementar exclusão real, validação de MIME no servidor, limite de tamanho, nomes seguros, autorização administrativa e atualização da lista por revalidação. Um arquivo arrastado não pode ser considerado enviado somente porque apareceu no estado local.

## Recomendações de SEO técnico

### 1. Metadados por página

Implementar títulos, descrições, Open Graph, Twitter Cards, idioma, canonical e imagens sociais por rota pública. O Metadata API do Next.js é a base recomendada para títulos, descrições e outros sinais de SEO em aplicações App Router [3].

A regra deve ser: cada página pública possui intenção de busca própria; cada rota privada utiliza `noindex, nofollow` quando apropriado e não expõe títulos ou dados de aluno para rastreadores.

### 2. Sitemap e robots

Criar sitemap dinâmico contendo apenas URLs públicas, canônicas e indexáveis: Home, Sobre, Cursos públicos, Materiais públicos, Blog, artigos, FAQ, Contato e páginas públicas de validação de certificados. Excluir `/dashboard/*`, `/professor/*`, `/admin/*`, login, checkout, perfil, compras e páginas que dependem de sessão.

Criar `robots.txt` coerente com o sitemap, sem considerar robots como mecanismo de segurança. A proteção real das áreas privadas continua sendo autenticação e autorização server-side.

### 3. Arquitetura de informação e URLs

Preservar a hierarquia prevista pela estratégia da plataforma: **Homepage → Blog → Materiais → Cursos → Contato**. Artigos devem apontar para materiais e cursos relacionados; materiais devem apontar para os cursos em que são usados; cursos devem apontar para artigos que aprofundem seus temas. Cada conteúdo público deve ter pelo menos um link contextual de entrada e uma saída relevante.

Evitar páginas duplicadas por parâmetros, filtros ou variações de slug. Definir canonical e, quando necessário, controlar parâmetros de consulta.

### 4. Conteúdo orientado à intenção

Priorizar páginas úteis para as buscas estratégicas já definidas na plataforma: **Professor de Inglês Salvador**, **Professor de Inglês Online**, **Aulas de Inglês**, **Curso de Inglês**, **Materiais de Inglês**, **Grammar**, **Vocabulary**, **Reading** e **Writing**.

A recomendação não é repetir palavras-chave artificialmente. Cada termo deve corresponder a uma página com objetivo claro, exemplos pedagógicos, escopo, público, nível CEFR quando aplicável e chamada para ação coerente.

### 5. Dados estruturados sem fabricar informações

Adicionar JSON-LD somente quando os dados existirem de fato. Possíveis entidades incluem Person/Organization para a identidade profissional, Course para cursos reais, Article para posts, BreadcrumbList para hierarquia e uma página de validação para certificados emitidos.

Não inserir `Review`, `AggregateRating`, depoimentos, número de alunos, notas ou resultados que não sejam provenientes de dados reais e verificáveis. O requisito de dados reais da plataforma deve prevalecer sobre qualquer tentativa de obter rich results.

### 6. Qualidade editorial e autoridade

Transformar o blog e a biblioteca em um hub de conhecimento com textos originais sobre ensino de inglês, gramática, morfologia, sintaxe, leitura, escrita e aplicações pedagógicas. Cada artigo deve declarar público, objetivo, nível, data de atualização, autoria e fontes quando aplicável.

Materiais gratuitos devem ter página de apresentação indexável, sumário real, nível, formato, tamanho, licença ou condição de uso e relação com cursos. O download não deve ser a única forma de descobrir o conteúdo.

### 7. Indexação de áreas privadas e conteúdo pago

Garantir que dados de alunos, notas, frequência, mensagens, compras, relatórios administrativos e conteúdo pago protegido não sejam renderizados em HTML público nem incluídos em sitemap. O bloqueio de download deve existir no endpoint, não apenas no botão da interface.

### 8. Certificados públicos

A página pública de validação deve possuir URL estável, metadados claros e dados mínimos necessários para verificar autenticidade. Não expor e-mail, notas, frequência ou informações pessoais além do necessário. O QR Code deve apontar para uma URL canônica de validação e não para uma rota dependente da sessão do aluno.

## Plano de execução em prompts separados

| Etapa | Prompt recomendado | Critério de conclusão |
|---|---|---|
| 1 | “Medir Core Web Vitals e Lighthouse nas páginas públicas e listar os maiores gargalos.” | Relatório com métricas por rota, dispositivo e prioridade. |
| 2 | “Otimizar imagens, fontes, bundles e embeds seguindo o relatório de performance.” | Redução mensurável de bytes e melhoria de LCP/INP/CLS. |
| 3 | “Implementar metadata, canonical, sitemap e robots para as rotas públicas.” | Sitemap válido, metadados por página e áreas privadas fora da indexação. |
| 4 | “Corrigir a persistência real da biblioteca de mídia e auditar o upload drag-and-drop.” | Upload, listagem e exclusão confirmados no S3/banco, sem estado fictício. |
| 5 | “Implementar dados estruturados e interlinking do blog, materiais e cursos.” | JSON-LD válido e mapa de links contextuais sem dados inventados. |
| 6 | “Configurar observabilidade de Web Vitals, erros e funil orgânico.” | Dashboard ou exportação com dados reais por rota e período. |

## Critérios de aceite

Uma etapa de performance só deve ser considerada concluída quando houver medição antes/depois, ausência de regressão funcional nos 192 testes e confirmação de que o ganho não veio de remover conteúdo importante. Uma etapa de SEO só deve ser considerada concluída quando a URL estiver correta, o conteúdo for real, o acesso estiver autorizado, o sitemap estiver coerente e não houver dados privados ou avaliações fabricadas.

### Referências

[1]: https://developers.google.com/search/docs/appearance/core-web-vitals "Google Search Central — Core Web Vitals"
[2]: https://nextjs.org/docs/app/api-reference/components/image "Next.js — Image Component"
[3]: https://nextjs.org/docs/app/getting-started/metadata-and-og-images "Next.js — Metadata and OG images"
[4]: https://web.dev/explore/learn-core-web-vitals "web.dev — Learn Core Web Vitals"

## Referências

[1] Google Search Central — [Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)

[2] Next.js — [Image Component](https://nextjs.org/docs/app/api-reference/components/image)

[3] Next.js — [Metadata and OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)

[4] web.dev — [Learn Core Web Vitals](https://web.dev/explore/learn-core-web-vitals)

> Documento elaborado com base no estado auditado do projeto e nas diretrizes internas de SEO orgânico da plataforma. As métricas de campo ainda precisam ser coletadas antes de declarar qualquer ganho de performance.
