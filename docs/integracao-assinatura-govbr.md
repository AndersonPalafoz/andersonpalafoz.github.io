# Integração com o gov.br para Assinatura Digital de Certificados

## 1. Visão Geral e Contexto
A plataforma de ensino de Anderson Palafoz emite certificados acadêmicos de conclusão para os cursos oferecidos. Embora a emissão nativa gere documentos em PDF com carimbo de tempo, identificador único e QR Code de validação, existe o interesse pedagógico e institucional em associar a **Assinatura Eletrônica Avançada do gov.br** (regulamentada pelo Decreto nº 10.543/2020) para atestar a autenticidade do documento emitido pelo professor/instituição.

---

## 2. Análise de Viabilidade e Restrições Oficiais
A API de Assinatura Eletrônica do gov.br (disponível através do portal oficial de integração do Governo Digital) possui restrições severas de elegibilidade e arquitetura:
1. **Público Alvo da API:** A API oficial de integração de assinatura em lote/sistema é destinada primariamente a **órgãos e entidades da administração pública**, autarquias e empresas integradas via convênios específicos com o Ministério da Gestão e da Inovação em Serviços Públicos (MGI).
2. **Contas Prata e Ouro:** O signatário (no caso, o professor Anderson Palafoz) precisa obrigatoriamente possuir conta gov.br com nível de confiabilidade **Prata** ou **Ouro** para assinar eletronicamente.
3. **Fluxo do Signatário:** A API do gov.br exige que o hash criptográfico (SHA-256) do PDF seja enviado para o gateway do gov.br, onde o titular da conta é redirecionado para autenticar e aprovar explicitamente a assinatura com sua própria identidade gov.br.

---

## 3. Fluxo Implementável e Alternativa Prática para Plataformas Privadas
Como a plataforma é uma solução educacional privada e independente, existem dois caminhos viáveis para atender ao requisito de validade jurídica e oficial:

### Caminho A: Assinatura Manual via Validador Oficial (Recomendado para MVP)
1. **Geração Automatizada:** O painel administrativo da plataforma (`/admin/certificados`) gera o certificado oficial em PDF contendo dados do aluno, carga horária, QR Code de verificação interna e identificadores únicos.
2. **Download e Assinatura pelo Professor:** O professor faz o download do PDF gerado e o submete ao portal oficial gratuito de assinatura do governo ([assinador.iti.br](https://assinador.iti.br) ou [assinador.iti.gov.br](https://validar.iti.gov.br)) utilizando sua conta gov.br Prata/Ouro.
3. **Reupload do PDF Assinado:** O certificado com carimbo digital oficial (padrão PAdES) é reupado na plataforma para disponibilização segura na área do aluno (`/dashboard/certificados`).

### Caminho B: Arquitetura Preparada no Banco e Painel (Preparado na Plataforma)
A plataforma pode registrar metadados de assinatura digital na tabela de certificados para indicar se o documento foi assinado externamente via gov.br e armazenar o hash de verificação.

---

## 4. Próximos Passos de Homologação
- Manter o gerador de certificados em PDF atualizado com os padrões exigidos.
- Utilizar o validador oficial do ITI ([validar.iti.gov.br](https://validar.iti.gov.br)) para atestar a validade jurídica dos certificados emitidos.
