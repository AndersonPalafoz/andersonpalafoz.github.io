# Auditoria visual mobile — 25/08/2026

As rotas administrativas e de aluno foram abertas em viewport de 390 × 844 px sem sessão autenticada. Todas redirecionaram para a tela de login, portanto a captura não permite validar o conteúdo interno de `/admin/certificados`, `/professor/turmas-externas` ou `/dashboard/certificados`. O redirecionamento protegido é esperado e não foi classificado como regressão funcional.

A captura exibiu uma renderização sem os estilos finais no fluxo de login durante o carregamento do ambiente de desenvolvimento, com links e tipografia em aparência nativa do navegador. Isso deve ser acompanhado separadamente no ambiente autenticado/publicado; não há evidência suficiente para atribuir o efeito às páginas protegidas auditadas. O build de produção, executado na mesma rodada, foi concluído com sucesso.
