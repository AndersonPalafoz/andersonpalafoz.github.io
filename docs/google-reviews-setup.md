# Integração de depoimentos do Google

A página pública `/depoimentos` e a prévia na home consultam a Places API (New) exclusivamente no servidor por meio de `/api/google-reviews`. A chave não é enviada ao navegador, as avaliações não são persistidas no banco e as respostas usam `Cache-Control: no-store`.

## Variáveis da Vercel

Configure estas variáveis no projeto da Vercel para os ambientes necessários:

```text
GOOGLE_PLACES_API_KEY=chave-do-projeto-google-cloud
GOOGLE_PLACE_ID=place-id-da-localizacao
```

Não use o prefixo `NEXT_PUBLIC_` na chave. A chave deve permanecer disponível somente no ambiente server-side.

## Configuração no Google Cloud

1. Crie ou selecione um projeto no [Google Cloud Console](https://console.cloud.google.com/).
2. Ative a **Places API (New)**.
3. Configure o faturamento conforme as regras atuais do Google Maps Platform.
4. Restrinja a chave por API, permitindo apenas a Places API (New). Quando possível, aplique também restrições de servidor compatíveis com o ambiente de produção.
5. Obtenha o `place_id` correto da localização no Google Maps.
6. Cadastre as duas variáveis na Vercel e faça um novo deploy.

A rota solicita somente `id`, `displayName`, `rating`, `userRatingCount`, `reviews` e `googleMapsUri`, usando `languageCode=pt-BR`. O componente preserva a atribuição ao Google Maps e oferece links para o perfil oficial.

## Comportamento sem configuração

Sem as variáveis, a página continua funcionando: mostra o estado de configuração pendente e mantém o link para buscar o perfil de Anderson Palafoz no Google. Se a API falhar, a página mostra uma mensagem de indisponibilidade, um botão de nova tentativa e o link oficial.

## Observações de política

A integração deve respeitar as [políticas de atribuição da Places API](https://developers.google.com/maps/documentation/places/web-service/policies). Não remova a identificação Google Maps, não oculte atribuições de autor e não transforme a resposta em um banco permanente de avaliações sem revisar as regras aplicáveis. Para obter uma listagem mais completa e administrar avaliações da própria localização, avalie a [Business Profile API](https://developers.google.com/my-business/content/review-data), que exige OAuth e acesso administrativo ao Perfil da Empresa.
