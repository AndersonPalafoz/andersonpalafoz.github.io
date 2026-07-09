# Guia de Configuração de Variáveis de Ambiente no Vercel

## 🔧 Problema
A página de login está mostrando erro `?error=Configuration` porque as variáveis de ambiente não estão configuradas no Vercel.

## ✅ Solução: Adicionar Variáveis de Ambiente

### Passo 1: Acessar o Painel do Vercel

1. Vá para [https://vercel.com](https://vercel.com)
2. Faça login com sua conta
3. Clique no projeto **andersonpalafoz** na lista de projetos

### Passo 2: Acessar Configurações de Ambiente

1. No painel do projeto, clique na aba **Settings** (Configurações)
2. Na barra lateral esquerda, clique em **Environment Variables** (Variáveis de Ambiente)

### Passo 3: Adicionar as Variáveis

Você precisa adicionar **4 variáveis de ambiente**. Para cada uma, clique em **"Add New"** (Adicionar Nova):

#### Variável 1: NEXTAUTH_URL
- **Name:** `NEXTAUTH_URL`
- **Value:** `https://andersonpalafoz.vercel.app`
- **Environments:** Selecione "Production"
- Clique **Save**

#### Variável 2: NEXTAUTH_SECRET
- **Name:** `NEXTAUTH_SECRET`
- **Value:** Gere uma chave segura. Você pode usar este comando no terminal:
  ```bash
  openssl rand -base64 32
  ```
  Ou use um gerador online: [https://generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)
- **Environments:** Selecione "Production"
- Clique **Save**

#### Variável 3: GOOGLE_CLIENT_ID
- **Name:** `GOOGLE_CLIENT_ID`
- **Value:** Você precisa obter isso do Google Cloud Console (veja instruções abaixo)
- **Environments:** Selecione "Production"
- Clique **Save**

#### Variável 4: GOOGLE_CLIENT_SECRET
- **Name:** `GOOGLE_CLIENT_SECRET`
- **Value:** Você precisa obter isso do Google Cloud Console (veja instruções abaixo)
- **Environments:** Selecione "Production"
- Clique **Save**

### Passo 4: Obter Google Client ID e Secret

Se você ainda não tem as credenciais do Google, siga estes passos:

1. Vá para [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google+ (Search for "Google+ API" e clique Enable)
4. Vá para **Credentials** (Credenciais) na barra lateral
5. Clique **Create Credentials** → **OAuth 2.0 Client ID**
6. Selecione **Web application** (Aplicação Web)
7. Em **Authorized redirect URIs**, adicione:
   - `https://andersonpalafoz.vercel.app/api/auth/callback/google`
8. Clique **Create**
9. Copie o **Client ID** e **Client Secret** que aparecerem

### Passo 5: Fazer Deploy Novamente

Após adicionar todas as variáveis:

1. Volte para a aba **Deployments** no Vercel
2. Clique no último deploy (deve estar em cinza/inativo)
3. Clique **Redeploy** (Reimplantar)
4. Aguarde o deploy completar

### Passo 6: Testar o Login

1. Vá para [https://andersonpalafoz.vercel.app/login](https://andersonpalafoz.vercel.app/login)
2. Clique em **"Entrar com Google"**
3. Você deve ser redirecionado para o login do Google
4. Após fazer login, você será redirecionado para o dashboard

## 🆘 Se Ainda Não Funcionar

Se o login ainda não funcionar após adicionar as variáveis:

1. Verifique se todas as 4 variáveis estão adicionadas
2. Verifique se o **NEXTAUTH_URL** está correto: `https://andersonpalafoz.vercel.app`
3. Verifique se o **GOOGLE_CLIENT_SECRET** está correto (sem espaços extras)
4. Aguarde 5-10 minutos após o deploy (às vezes leva tempo para propagar)
5. Limpe o cache do navegador (Ctrl+Shift+Delete) e tente novamente

## 📝 Resumo das Variáveis

| Nome | Valor | Origem |
|------|-------|--------|
| NEXTAUTH_URL | `https://andersonpalafoz.vercel.app` | Seu domínio Vercel |
| NEXTAUTH_SECRET | Chave aleatória (openssl rand -base64 32) | Gerar localmente |
| GOOGLE_CLIENT_ID | Obtido do Google Cloud Console | Google Cloud |
| GOOGLE_CLIENT_SECRET | Obtido do Google Cloud Console | Google Cloud |

## ✨ Resultado Esperado

Após configurar corretamente, você verá:
- ✅ Página de login sem erros
- ✅ Botão "Entrar com Google" funcionando
- ✅ Redirecionamento para o Google para autenticação
- ✅ Acesso ao dashboard após login bem-sucedido
