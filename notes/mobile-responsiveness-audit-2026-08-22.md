# Auditoria mobile — 22/08/2026

## Escopo
Capturas em viewport 375x812 das rotas `/`, `/sobre`, `/cursos`, `/materiais`, `/blog`, `/contato`, `/dashboard` e `/admin/certificados`.

## Resultado
As páginas públicas renderizaram em coluna única, sem overflow horizontal aparente. O cabeçalho usa a logo horizontal oficial em tamanho reduzido, o menu mobile permanece acessível e o rodapé quebra corretamente os blocos de navegação e contato. Cursos, materiais, blog e contato mantiveram cartões, botões e formulários dentro da largura disponível.

As rotas `/dashboard` e `/admin/certificados` redirecionaram para a tela de login por ausência de sessão autenticada na sessão de validação; portanto, a captura não comprova o estado autenticado dessas telas. A proteção CSS global foi mantida em `html`, `body`, `.site-shell` e `main.min-h-screen`, com `max-width: 100%` e `overflow-x: hidden`.

## Decisão
Não foram observados ajustes emergenciais nas páginas públicas. A validação autenticada dos painéis continua dependente de uma sessão de usuário/admin disponível.
