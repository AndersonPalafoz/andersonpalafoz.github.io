# Auditoria de legado de certificados nos painéis — 26/08/2026

## Resultado

A varredura não encontrou uma segunda interface oficial abandonada nem uma rota comprovadamente órfã. O sistema atual está dividido entre o gerador oficial administrativo, a gestão de assinaturas compartilhada por administrador/professor, a galeria/exportação do aluno e o laboratório experimental de Fabric, Konva e GrapesJS.

| Área | Referência | Classificação | Decisão |
|---|---|---|---|
| Administrador | `/admin/certificados` e `AdminCertificateWorkflow` | Fluxo oficial | Preservado |
| Administrador | Modelos, assinaturas, exportação e exclusão | Fluxo oficial | Preservado |
| Professor | `/professor/certificados` e `CertificateSignatureManager` | Operação oficial de assinatura | Preservado |
| Aluno | `/dashboard/certificados` e `StudentCertificatesGallery` | Consumo, busca e exportação oficial | Preservado |
| Conclusão de curso | `/api/certificate` e `CertificateModal` | Compatibilidade usada pela conclusão automática | Preservado; não é duplicata órfã |
| Laboratório | Fabric, Konva e GrapesJS | Experimental e carregado sob demanda | Preservado, claramente separado |
| Verificação | `/verificar/[code]` e APIs de download/validação | Serviço oficial de autenticidade | Preservado |

A ausência de uma linha de usuário não é mais usada como motivo para criar um aluno técnico. Destinatários externos são persistidos no certificado, com `userId` opcional e campos próprios, enquanto os filtros de alunos e usuários ocultam placeholders históricos.

## Validação

Foram executados 18 arquivos de teste relacionados a certificados, totalizando 52 testes aprovados. O TypeScript e o build de produção também passaram. O erro `undefined.call` observado no preview foi tratado como inconsistência de cache/HMR após reconstrução limpa; a home voltou a responder e o TypeScript reportou zero erros. Ocorrências antigas permanecem no log somente como histórico.

## Conclusão

Não foi removida nenhuma rota oficial. A remoção indiscriminada de `/api/certificate` ou do `CertificateModal` quebraria a emissão automática na conclusão de cursos. As engines experimentais não devem alimentar o Gerador Oficial e continuam visualmente separadas no painel administrativo.
