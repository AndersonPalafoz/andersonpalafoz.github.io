# Relatório Técnico: Estratégias de Armazenamento Externo para a Plataforma Anderson Palafoz

Para mitigar limitações de espaço no plano gratuito do Neon PostgreSQL e garantir alta disponibilidade para materiais didáticos em PDF, imagens de capa e áudios de pronúncia, o projeto pode integrar soluções de armazenamento de objetos dedicadas. Este relatório detalha as melhores alternativas do mercado, considerando gratuidade, limites de cota, facilidade de integração com o Next.js 15 e alinhamento com a arquitetura existente.

---

## 1. Tabela Comparativa das Soluções de Armazenamento

| Solução | Franquia Gratuita (Free Tier) | Custo Excedente | Otimização de Mídia Automática | Facilidade de Integração com Next.js |
| :--- | :--- | :--- | :--- | :--- |
| **Supabase Storage** | **1 GB** de armazenamento + 2 GB de banda/mês | US$ 0,021 por GB adicional | Não (requer processamento próprio) | Excelente (já integrado ao projeto via SDK) |
| **Cloudinary** | **25 GB** de créditos mensais (muito generoso para imagens/áudios) | Pay-as-you-go baseado em transformações | **Sim** (redimensionamento, WebP automático e compressão) | Muito Alta (SDK dedicado para Next.js) |
| **Cloudflare R2** | **10 GB** de armazenamento por mês (sem custos de saída/bandwidth) | US$ 0,015 por GB adicional | Não | Alta (Compatível com a API S3) |
| **Google Drive API** | **15 GB** por conta Google (ou 30 GB+ no Workspace) | Gratuito na cota pessoal | Não | Média (Necessita autenticação OAuth e token refresh) |

---

## 2. Análise Detalhada das Opções

### A. Cloudinary (Recomendado para Mídia e Performance)
* **Vantagens**: Oferece o plano gratuito mais robusto para imagens e áudios, transformações automáticas na URL (converter PNG pesado em WebP otimizado instantaneamente) e CDN global integrada.
* **Desvantagens**: Menos adequado para arquivos binários puros como PDFs volumosos de apostilas, embora suporte documentos genéricos.
* **Como Integrar**: Utilizar o pacote `cloudinary` no servidor Next.js para receber streams de formulários e retornar URLs otimizadas diretamente para o banco de dados.

### B. Cloudflare R2 (Recomendado para Arquivos Pesados e PDFs)
* **Vantagens**: Não cobra taxas de saída de dados (*egress fees*), o que elimina custos surpresa ao baixar apostilas e materiais didáticos com frequência. Compatível com a API padrão do AWS S3.
* **Desvantagens**: Não faz otimização automática de imagens nativamente como o Cloudinary.

### C. Google Drive API (Já parcialmente integrada ao ecossistema do Professor)
* **Vantagens**: Aproveita os 15 GB+ da conta Google institucional ou pessoal do professor, centralizando os materiais didáticos já existentes no Drive.
* **Desvantagens**: Exige gerenciamento de tokens de acesso OAuth, podendo apresentar latência em requisições diretas de visualização na web se a conta atingir limites de cota de requisição (*rate limits*).

---

## 3. Recomendação de Arquitetura para a Plataforma

Para manter a simplicidade e a robustez:
1. **Para Imagens e Capas de Cursos/Artigos**: Adotar o **Cloudinary** ou estender a utilização do **Supabase Storage** com compressão prévia no cliente (já implementada).
2. **Para Apostilas em PDF de Longo Formato**: Utilizar o **Google Drive** institucional do professor para armazenamento de grandes volumes sem custo adicional, fazendo cache dos metadados no Neon PostgreSQL.

*Autor: Arquitetura de Software - Plataforma Anderson Palafoz*
