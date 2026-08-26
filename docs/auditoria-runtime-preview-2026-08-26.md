# Auditoria do erro runtime no preview — 26/08/2026

A tela `Cannot read properties of undefined (reading 'call')` foi reproduzida durante um estado incremental do watcher Next.js. O padrão é compatível com mapa de módulos/chunks inconsistente, agravado por arquivos ausentes em `.next/types` e cache Webpack parcial. O erro não apareceu no build de produção.

Foram removidos `.next`, `node_modules/.cache` e `.turbo`, e o servidor foi reiniciado. Após a reconstrução, o preview respondeu normalmente, a página inicial foi renderizada e o servidor indicou `Ready` sem novo erro. Os registros anteriores continuam no arquivo de log por serem históricos; não foram interpretados como falhas novas.

A correção operacional é manter o preview com artefatos gerados de forma íntegra e evitar exclusão parcial de `.next/types` ou concorrência de watchers. A validação técnica também passou em 18 arquivos/52 testes de certificados, TypeScript e build de produção.
