# Auditoria autenticada em produção

## Google Calendar

A sessão administrativa `palafozanderson@gmail.com` permaneceu autenticada em `/dashboard/calendario`. O Google Calendar aparece como conectado nesta sessão. A leitura do calendário principal retornou zero eventos do Google e zero eventos persistidos no período consultado, sem erro de autorização.

## Certificados

A rota `/admin/certificados` abriu autenticada e carregou o Gerador Oficial Padrão. A prévia visual aparece antes da emissão, os campos de aluno/curso/carga horária estão disponíveis e o seletor oferece quatro modelos: padrão da plataforma, institucional de curso livre, IsF/UFBA 2025 e PROFICI/UFBA. A tabela de certificados emitidos estava vazia no momento da auditoria. Nenhuma emissão, exclusão ou gravação foi executada.
