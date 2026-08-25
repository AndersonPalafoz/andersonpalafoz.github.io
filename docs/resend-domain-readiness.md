# Preparação do Resend para produção

## Estado atual

A plataforma possui uma chave `RESEND_API_KEY` configurada e mantém `RESEND_FROM_EMAIL` como `noreply@andersonpalafoz.vercel.app`. O fluxo de onboarding de alunos externos já foi validado com o remetente de onboarding do Resend. Como ainda não há domínio próprio, o remetente profissional permanece pendente e nenhuma variável foi alterada para um endereço não verificável.

## O que funciona agora

O sistema pode continuar usando o fluxo de onboarding já configurado para entregar credenciais temporárias e instruções de primeiro acesso. A aplicação mantém a validação do remetente por formato de e-mail e a chave permanece somente no ambiente, sem ser exposta no código ou no repositório.

## O que será necessário depois

O Resend exige um domínio que pertença à conta para envio regular. A recomendação oficial é registrar um domínio ou subdomínio dedicado, como `mail.seudominio.com.br` ou `accounts.seudominio.com.br`, e adicioná-lo ao painel de Domains. O Resend fornecerá registros DNS específicos; eles devem ser copiados exatamente para o provedor DNS responsável pela zona. A documentação indica DKIM e SPF/MX como registros necessários e recomenda DMARC após a verificação ([Resend — Verified Domains](https://resend.com/docs/dashboard/domains/introduction); [Resend — Add and verify a domain](https://resend.com/docs/add-a-domain)).

| Etapa futura | Resultado esperado |
|---|---|
| Registrar um domínio próprio | Criar uma zona DNS sob controle do administrador |
| Adicionar o domínio no Resend | Receber os valores específicos de DKIM, SPF e MX |
| Publicar os registros DNS | Permitir que o Resend confirme a propriedade |
| Aguardar a propagação | A verificação costuma ocorrer rapidamente, mas pode levar até 72 horas |
| Atualizar `RESEND_FROM_EMAIL` | Usar, por exemplo, `noreply@accounts.seudominio.com.br` |
| Revalidar os e-mails transacionais | Confirmar onboarding, recuperação de senha e certificados |

## Cuidados

Os registros devem ser inseridos na zona DNS realmente autoritativa do domínio. Não se deve reutilizar valores de outro domínio, misturar regiões do Resend ou substituir os valores por exemplos genéricos. Enquanto o domínio não existir, o remetente atual deve permanecer inalterado para preservar o fluxo já testado.

## Referências oficiais

[Resend — Verified Domains](https://resend.com/docs/dashboard/domains/introduction)

[Resend — Add and verify a domain](https://resend.com/docs/add-a-domain)

[Resend — What if my domain is not verifying?](https://resend.com/docs/knowledge-base/what-if-my-domain-is-not-verifying)
