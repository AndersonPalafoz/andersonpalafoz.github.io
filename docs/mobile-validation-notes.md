# Validação móvel — skeletons e toasts

As capturas em 320px e 375px das rotas administrativas protegidas (`/admin/reviews`, `/admin/relatorios-academicos`, `/dashboard/calendario` e `/dashboard/compras`) redirecionaram para `/login` por ausência de sessão autenticada. Portanto, não foi possível observar os skeletons e toasts em estado autenticado nesta sessão.

O fluxo de login permaneceu visualmente contido nas duas larguras: cabeçalho, logotipo, botões de tema/menu e cartão de autenticação não apresentaram overflow horizontal ou sobreposição. A validação autenticada ainda é necessária para confirmar os estados de carregamento, mensagens de erro e toasts dentro das páginas protegidas.
