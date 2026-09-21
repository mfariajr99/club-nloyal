# Como abrir uma versão de teste (sem mexer no site real nem no banco de dados real)

Este pacote é uma cópia do sistema atualizado (com o Programa de Indicações
novo). Ele vai virar um **site separado**, com um **banco de dados separado**,
para você clicar à vontade sem nenhum risco para os clientes e vendas reais
que já estão no sistema no ar.

Leva uns 10 minutos. Siga na ordem.

---

## 1. Crie um repositório NOVO no GitHub (não é o mesmo do site real)

1. Acesse [github.com](https://github.com) e entre na sua conta.
2. Clique no **+** no canto superior direito → **New repository**.
3. Em "Repository name", digite: `giftback-app-teste`
4. Deixe como **Private**.
5. Clique em **Create repository**.

## 2. Envie os arquivos deste pacote para esse repositório

1. Na página do repositório recém-criado, clique no link **uploading an
   existing file** (ou "Add file" → "Upload files").
2. Extraia (descompacte) o arquivo `.zip` que eu te enviei no computador.
3. Arraste **todo o conteúdo** da pasta descompactada (as pastas `backend`,
   `frontend`, o arquivo `render.yaml`, etc.) para dentro da área de upload
   do GitHub.
4. Role para baixo e clique em **Commit changes**.

## 3. Crie o site de teste no Render (um clique cria o site E o banco novo)

1. Acesse [dashboard.render.com](https://dashboard.render.com).
2. Clique em **New +** → **Blueprint**.
3. Escolha o repositório **giftback-app-teste** que você acabou de criar (na
   primeira vez o Render pode pedir para autorizar o acesso a esse
   repositório).
4. O Render vai mostrar uma prévia com dois itens novos: o serviço
   **giftback-app-teste** e o banco **giftback-db-teste**. Confirme que os
   nomes têm "-teste" — isso garante que é tudo separado do site real.
5. Clique em **Apply** (ou **Create New Resources**).
6. Aguarde a mensagem **Live** (leva uns 3–5 minutos na primeira vez).

## 4. Ajuste final e primeiro acesso

1. Copie a URL do serviço de teste (algo como
   `https://giftback-app-teste.onrender.com`).
2. Abra o serviço **giftback-app-teste** no Render → aba **Environment** →
   encontre **PUBLIC_BASE_URL** → cole essa mesma URL (sem barra `/` no
   final) → salve. O Render reinicia sozinho.
3. Abra essa URL no navegador. Clique em **"Cadastre sua empresa"** e crie
   uma empresa de teste (pode usar qualquer nome, tipo "Empresa Teste", e um
   e-mail/senha à sua escolha — não precisa ser um e-mail real).
4. Pronto: você está dentro de uma cópia completa do sistema, com um banco de
   dados 100% separado do banco real. Cadastre clientes fictícios, crie
   campanhas de Giftback e de Indicação, teste os links de WhatsApp — nada
   disso encosta no site nem no banco que seus clientes de verdade usam hoje.

---

## Quando terminar de testar

- Se estiver tudo certo, me avise aqui na conversa que eu te ajudo a subir
  essa mesma versão para o repositório e o site **reais** (o
  `giftback-app`, que é o que seus clientes usam).
- O site e o banco de teste podem ficar parados sem custo (plano gratuito).
  Se quiser apagá-los depois: no Render, abra cada um
  (**giftback-app-teste** e **giftback-db-teste**) → aba **Settings** →
  **Delete Web Service** / **Delete Database**, no fim da página.
