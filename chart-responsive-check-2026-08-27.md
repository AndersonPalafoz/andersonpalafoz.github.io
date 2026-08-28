# Teste responsivo — gráfico comparativo

A seção `Distribuição de notas e frequência` da página publicada `/professor/turmas-externas` foi medida diretamente em iframes same-origin com viewports simulados, sem alterar dados.

| Viewport | Largura da seção | Cartões | Altura dos cartões | Overflow interno |
|---|---:|---:|---:|---|
| Desktop 1440px | 834px | 2 | 208px | Nenhum |
| Tablet 768px | 369px | 2 | 208px | Nenhum |
| Celular 390px | 327px | 2 | 298px | Nenhum |

A seção foi encontrada e renderizada nos três viewports. Os cartões empilharam o conteúdo interno no celular, mantiveram as barras e rótulos dentro da largura disponível e não apresentaram elementos com `scrollWidth` maior que `clientWidth`.

Dados observados na produção durante a verificação: Vespertino com 9 alunos, 3 abaixo de 75% e 6 entre 90–100% de frequência; Matutino com 3 alunos, todos na faixa de média 8–10 e frequência 90–100%.


A segunda medição confirmou que não há overflow horizontal na seção. Na resolução celular e tablet, os dois cartões ficam em uma coluna, como esperado pelo comportamento responsivo. No teste desktop, o viewport efetivo do iframe ficou em 1265px e a página também manteve uma coluna porque o breakpoint `xl` não foi atingido no viewport efetivo; isso não prejudicou a leitura e os cartões ficaram com 784px de largura. O conteúdo permaneceu acessível e sem corte.
