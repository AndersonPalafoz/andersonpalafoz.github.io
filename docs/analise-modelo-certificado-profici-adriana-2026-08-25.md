# Análise técnica do modelo de certificado PROFICI

## Escopo

O arquivo analisado foi `Certificado_Adriana_Marques_de_Oliveira.docx`. A inspeção combinou a renderização visual das duas páginas do documento com a leitura do XML interno do pacote Office Open XML. O objetivo foi distinguir o que é conteúdo institucional real, o que é campo variável e o que é recurso gráfico reutilizável.

## Diagnóstico geral

O documento está configurado em orientação paisagem, com dimensões de página de `16838 × 11906 twips`, equivalentes a aproximadamente `842 × 595 pt`, correspondentes ao formato A4 paisagem. As margens são aproximadamente `85 pt` superior/inferior e `71 pt` esquerda/direita. O cabeçalho padrão contém a identificação institucional; o rodapé não contém texto.

A renderização possui duas páginas. A primeira contém o certificado completo, incluindo título, corpo, data, assinatura manuscrita e nome da coordenadora. A segunda repete o cabeçalho e deixa isolada a função `Coordenadora Geral do PROFICI`. Para a replicação digital, isso deve ser corrigido: a função deve permanecer na primeira página junto da assinatura, sem reproduzir a quebra de página acidental do DOCX.

## Conteúdo textual identificado

O cabeçalho apresenta, centralizado, `UNIVERSIDADE FEDERAL DA BAHIA`, seguido de `PROFICI - Programa de Proficiência em Língua Estrangeira para Estudantes e Servidores da UFBA`. À esquerda aparece o brasão da UFBA e à direita o logotipo PROFICI.

O título é `CERTIFICADO`, centralizado e em caixa alta. O corpo usa a fórmula `Certifico que [nome] concluiu o [curso] em nível [nível] do PROFICI (Programa de Proficiência em Língua Estrangeira para Estudantes e Servidores da UFBA), realizado no período de [data inicial] a [data final] com carga horária de [carga horária] horas.`

O fechamento apresenta `Salvador, [data por extenso].` A assinatura manuscrita aparece sobre uma linha horizontal. Abaixo dela são exibidos o nome da signatária, `Fernanda Mota Pereira`, e a função `Coordenadora Geral do PROFICI`.

## Formatação extraída

| Região | Alinhamento | Tratamento observado | Regra de replicação |
|---|---|---|---|
| Cabeçalho institucional | Centro | Negrito, sans-serif, aproximadamente 14 pt na primeira linha e 11 pt nas linhas seguintes | Três blocos independentes para permitir edição sem deslocar os logos |
| Título | Centro | Negrito, caixa alta, aproximadamente 20 pt | Campo estático `CERTIFICADO`, editável no editor |
| Corpo | Justificado | Aproximadamente 14 pt no DOCX, com espaçamento de linha 1,5 | Composição por campos dinâmicos e largura máxima controlada |
| Nome do aluno | Dentro do corpo | Negrito | Variável `{{studentName}}` |
| Curso | Dentro do corpo | Negrito | Variável `{{courseTitle}}` |
| Nível | Dentro do corpo | Regular | Variável `{{level}}` |
| Período | Dentro do corpo | Regular | Variável `{{period}}` |
| Carga horária | Dentro do corpo | Regular | Variável `{{workloadHours}}` |
| Local e data | Centro | Regular, aproximadamente 14 pt | Variável `{{issuedAt}}` com local configurável |
| Assinatura | Centro | Imagem manuscrita sobre linha | Asset editável e substituível |
| Nome da signatária | Centro | Regular | Campo `{{coordinatorName}}` |
| Função | Centro | Regular | Texto institucional editável |
| Código/QR | Área inferior reservada | Camada técnica adicional | QR aponta para `/verificar/{certificateCode}` sem substituir o modelo |

Na leitura XML, o corpo e a data aparecem com `w:sz=28`, ou seja, 14 pt; o cabeçalho e os elementos de destaque usam tamanhos maiores ou negrito conforme seus runs. Os parágrafos do corpo e da data apresentam espaçamento `line=360`, equivalente a 1,5 linha, e `after=120` em vários blocos.

## Imagens e recursos extraídos

| Recurso | Dimensão original | Função | Decisão de implementação |
|---|---:|---|---|
| `image3.jpeg` | 112 × 146 px, 120 DPI | Brasão colorido da UFBA | Mantido como camada de imagem editável |
| `image4.jpeg` | 960 × 720 px, 96 DPI | Logotipo PROFICI com globo no “O” | Mantido como camada de imagem editável, com enquadramento proporcional |
| `image1.jpeg` | 335 × 111 px, 120 DPI | Assinatura manuscrita de Fernanda Mota Pereira | Mantida como camada de assinatura substituível |
| `image2.emf` | Vetor EMF | Recurso vetorial associado ao cabeçalho | Preservado no DOCX original; o preset usa a versão rasterizada disponível em `image4.jpeg` para compatibilidade com o pipeline PDF |

Os assets publicados no armazenamento do projeto são:

- `/manus-storage/ufba-crest_db3e90ef.jpeg`
- `/manus-storage/image4-reference_863640d0.jpeg`
- `/manus-storage/profici-wordmark_7b5435b0.jpeg`

O nome histórico `profici-wordmark` foi preservado no caminho interno por compatibilidade, mas o conteúdo visual é a assinatura manuscrita extraída do documento.

## Preset implementado

O editor agora possui um construtor `createProficiCertificateElements()` que cria treze camadas: três imagens institucionais e dez elementos textuais/lineares. O preset é aplicado automaticamente quando a variação `PROFICI` é escolhida no editor de modelos. O JSON salvo no template inclui `visualVariant`, `fieldMappings` e `elements`, permitindo que a seleção seja reutilizada na prévia, na emissão e nos editores Fabric, Konva e GrapesJS.

As coordenadas usam o sistema PDF com origem no canto inferior esquerdo. O cabeçalho ocupa a faixa superior; o título fica centralizado abaixo dos logos; o corpo ocupa a região central; a data fica antes da assinatura; e a assinatura, nome e função ficam agrupados no terço inferior.

## Compatibilidade com QR Code

O QR Code de validação permanece como camada técnica adicional e não depende da logo do site. A opção `includeSiteBranding` continua controlando somente a identidade visual da plataforma. O QR aponta para a página pública de verificação pelo código único e a validação pública ignora certificados logicamente excluídos.

## Limitações controladas

O DOCX original contém uma quebra de página indesejada, provavelmente causada pelo fluxo de paginação do Word. Ela não será replicada. O brasão EMF não é usado diretamente no renderizador PDF porque o pipeline atual trabalha com PNG/JPEG; por isso o preset usa o recurso visual PROFICI em JPEG, mantendo a aparência identificada na renderização. A assinatura permanece separada do nome e da função para permitir que o administrador troque a signatária sem alterar o restante do modelo.

## Critério de aceite

O modelo é considerado replicado quando a seleção de `PROFICI` carrega as imagens e textos na prancheta, os campos variáveis são editáveis, a composição salva pode ser reaberta, a emissão gera PDF em uma página com a assinatura e função agrupadas, o QR Code valida o código público e nenhuma logo da plataforma aparece quando o administrador desmarca a identidade do site.
