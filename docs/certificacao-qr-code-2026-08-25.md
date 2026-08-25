# Certificação automática com QR Code

## Objetivo

A plataforma agora utiliza um único código de autenticidade por certificado, gerado no momento da emissão e reutilizado no PDF, na área do aluno, no modal de conclusão, nas áreas administrativas e na página pública de validação.

## Fluxo de emissão

Quando o aluno conclui a última aula, `POST /api/lessons/[id]/progress` chama `issueCertificateIfEligible`. O serviço calcula o percentual com base nas aulas persistidas, exige 100%, verifica se já existe um certificado para o par aluno/curso e evita duplicidade. Cursos externos continuam respeitando a decisão explícita sobre a marca do site.

## PDF e QR Code

O gerador oficial `lib/certificate-pdf.ts` inclui um QR Code PNG apontando para `https://andersonpalafoz.vercel.app/verificar/{certificateCode}`. A inclusão ocorre depois da composição do modelo, portanto abrange o modelo padrão, modelos institucionais e as composições reutilizadas pelos fluxos Fabric, Konva e GrapesJS. O gerador jsPDF dos protótipos também recebeu o mesmo contrato quando um código de verificação é fornecido.

O QR Code não depende da presença da logo do site. `includeSiteBranding` continua controlando identidade visual e logo; a autenticação documental permanece disponível para modelos internos e externos.

## Validação pública

A API e a página `/verificar/[code]` consultam o código único e ignoram certificados com `deletedAt` preenchido. A resposta pública mostra somente nome, curso, nível, data, código, assinatura e possibilidade de download, sem expor dados privados desnecessários. A página também exibe o QR Code e o código em texto para validação manual.

## Áreas integradas

| Área | Integração |
|---|---|
| Curso/aula | Emissão automática idempotente ao atingir 100% |
| Aluno | Modal de conclusão, galeria, download, compartilhamento e bloco de validação |
| Professor | Certificados emitidos pelo fluxo oficial recebem QR Code no PDF |
| Administrador | Emissão manual, institucional, externa, assinatura e exportações usam o gerador oficial |
| Público | Página de validação com QR Code, código e estado válido/revogado |

## Verificações executadas

Foram aprovados 13 testes focados de QR Code, composição, PDF, conclusão de aula e contratos de certificados. O build isolado de produção também foi aprovado. Nenhum certificado real foi criado ou alterado durante os testes.
