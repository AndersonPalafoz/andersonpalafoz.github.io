# Revisão visual dos certificados de teste — 26/08/2026

Foram avaliados dois PDFs emitidos pela plataforma. Ambos confirmam que a geração está usando dados de cursos técnicos de validação, que devem continuar restritos às áreas administrativas, mas o foco desta revisão é o defeito de composição do documento.

| Arquivo | Achados confirmados | Consequência para a correção |
| --- | --- | --- |
| `39c8a1a9-6a5d-4aab-9e11-82e71c9462a2.pdf` | Moldura e grade institucional aparecem, porém o conteúdo está excessivamente deslocado para a metade inferior, com espaço vertical desproporcional; a marca-d'água fica centralizada mas concorre com o bloco de conteúdo; QR Code e bloco de assinatura estão muito próximos do limite inferior. | Definir uma grade de áreas seguras, âncoras consistentes para cada bloco e proteção de margem inferior no exportador. |
| `2bf04bdc-cf1b-48fb-b85d-ece3399b763e.pdf` | O certificado é exportado praticamente sem o template: ausência da moldura, da marca-d'água e da hierarquia de cabeçalho; metadados estão fragmentados e dispersos; o código de validação colide visualmente com o nome do emissor. | Corrigir a serialização e o mapeamento do preset/template antes da exportação, com fallback institucional único e validação de coordenadas antes de gerar o PDF. |

Os dois arquivos indicam uma inconsistência entre o estado visual do editor, o template escolhido e a composição usada na exportação. A correção deve centralizar o modelo de layout usado para prévia e PDF, com dimensões de página, zonas de texto, assinatura e QR Code compartilhadas.

## Achados nas áreas publicadas

| Área | Achados confirmados | Direção de melhoria |
| --- | --- | --- |
| `/professor/certificados` | A página concentra filtros, seleção em lote, ações de emissão, upload e notificação dentro de uma lista de cartões. Os cartões repetem controles extensos e o título atual, **Assinaturas finais**, não traduz todo o ciclo de trabalho docente. Há registros técnicos de teste visíveis. | Organizar a área como uma fila de emissão clara, com barra de filtros compacta, ações contextuais, cartões/tabela adaptativos e um caminho explícito para prévia, geração, assinatura e notificação. Ocultar registros técnicos da visão docente sem apagar dados. |
| `/admin/certificados` | A área administrativa já apresenta o gerador e a prévia institucional, mas os PDFs emitidos demonstram que a composição de exportação não corresponde de forma confiável à prévia. | Manter o gerador administrativo como origem de presets e corrigir o compositor compartilhado, em vez de introduzir uma segunda implementação na área docente. |
