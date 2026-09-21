# Sistema de Giftback — guia de publicação (deploy)

Este pacote contém o sistema completo, pronto para rodar como um site de verdade,
acessível de qualquer lugar (não é mais um protótipo local). Ele é composto por:

- `backend/` — a aplicação em Node.js + PostgreSQL, que também serve o
  `frontend/` (ou seja, é **um único serviço** para publicar, não dois).
- `frontend/` — a interface (painel do atendente + página pública de resgate).
- `render.yaml` — um "blueprint" que diz ao Render como criar tudo automaticamente
  (o serviço web + o banco de dados) com um clique.

Você não precisa entender o código para colocar isso no ar — siga os passos
abaixo. Vai levar uns 15–20 minutos na primeira vez.

---

## 1. O que você vai precisar criar (contas)

Eu não posso criar essas contas por você (exigem seus próprios dados de
cobrança), mas o cadastro é rápido:

1. **Uma conta no GitHub** (gratuita) — [github.com](https://github.com) — é
   onde o código vai ficar guardado para o Render conseguir acessá-lo.
2. **Uma conta no Render** (gratuita para começar) — [render.com](https://render.com)
   — é quem vai hospedar o sistema (o "servidor" onde ele roda).

---

## 2. Subir o código para o GitHub

1. Crie um repositório novo no GitHub (botão **New repository**). Pode deixar
   como **privado** — não precisa ser público.
2. Envie todo o conteúdo desta pasta (`backend/`, `frontend/`, `render.yaml`,
   `.gitignore`, este `README.md`) para esse repositório. Se você tiver
   alguém te ajudando com isso, os comandos padrão são:

   ```
   git init
   git add .
   git commit -m "Sistema de Giftback"
   git branch -M main
   git remote add origin <URL do seu repositório>
   git push -u origin main
   ```

   O arquivo `.gitignore` já garante que o `.env` (com suas chaves locais) e a
   pasta `node_modules` **não** sejam enviados — isso é o esperado e correto.

---

## 3. Criar os serviços no Render (com um clique, via Blueprint)

1. Entre no [dashboard do Render](https://dashboard.render.com).
2. Clique em **New +** → **Blueprint**.
3. Escolha o repositório que você acabou de criar no GitHub (o Render vai
   pedir para autorizar o acesso na primeira vez).
4. O Render vai ler o arquivo `render.yaml` e mostrar uma prévia com dois
   itens: o serviço web **giftback-app** e o banco de dados **giftback-db**.
5. Clique em **Apply** (ou **Create New Resources**). O Render vai:
   - Criar o banco PostgreSQL.
   - Instalar as dependências do backend (`npm install`).
   - Aplicar automaticamente a estrutura do banco de dados (isso acontece
     sozinho a cada vez que o serviço inicia — não precisa rodar nada
     manualmente).
   - Colocar o sistema no ar.
6. Aguarde a mensagem de que o deploy foi concluído (**Live**). Você vai
   receber uma URL parecida com `https://giftback-app.onrender.com`.

### 3.1. Um ajuste depois do primeiro deploy (importante)

Assim que o sistema estiver no ar e você tiver a URL definitiva (seja a do
Render, tipo `https://giftback-app.onrender.com`, seja o seu domínio próprio
depois de configurado — veja seção 5), faça o seguinte:

1. No Render, abra o serviço **giftback-app** → aba **Environment**.
2. Encontre a variável **PUBLIC_BASE_URL** e defina o valor como essa URL
   (sem barra `/` no final). Exemplo: `https://giftback-app.onrender.com`.
3. Salve — o Render vai reiniciar o serviço sozinho.

Essa variável é usada para montar o link de resgate que vai dentro da
mensagem de WhatsApp enviada ao cliente. Sem ela definida corretamente, os
links podem ficar errados.

---

## 4. Primeiro acesso ao sistema

Acesse a URL do seu serviço no navegador. Você verá a tela de login. Como é
a primeira vez, use a opção **"Criar conta" / "Cadastrar empresa"** (no
rodapé da tela de login) para criar a conta real da sua empresa — nome do
negócio, seu e-mail e uma senha. Isso cria a sua empresa do zero, sem nenhum
dado de exemplo, pronta para você cadastrar seus produtos, clientes e
campanhas reais.

(Internamente existe também um script de dados de demonstração usado só
durante o desenvolvimento — não é necessário e não deve ser usado em
produção, já que criaria uma empresa fictícia misturada com a sua.)

---

## 5. Domínio próprio (opcional, recomendado)

Se você tem ou quiser comprar um domínio (ex.: `giftback.suaempresa.com.br`):

1. No Render, abra o serviço **giftback-app** → aba **Settings** → **Custom
   Domains** → **Add Custom Domain**.
2. Digite o domínio desejado. O Render vai mostrar um registro DNS (tipo
   `CNAME`) para você criar no painel onde comprou o domínio (Registro.br,
   GoDaddy, Hostinger, etc.).
3. Depois de criar esse registro, aguarde a propagação (geralmente de
   minutos a poucas horas). O Render emite o certificado HTTPS
   automaticamente, sem custo.
4. Não esqueça de repetir o passo 3.1 acima com a nova URL definitiva
   (`https://giftback.suaempresa.com.br`) em **PUBLIC_BASE_URL**.

---

## 6. Aviso importante sobre o plano gratuito

Para você testar o sistema no ar sem custo, o `render.yaml` cria tudo no
**plano gratuito** do Render. Isso é ótimo para conhecer o sistema, mas tem
duas limitações que valem a pena conhecer **antes de usar com clientes de
verdade**:

- **O serviço "dorme" após 15 minutos sem acesso.** No plano gratuito, se
  ninguém abrir o painel por um tempo, o sistema entra em modo de espera e a
  próxima pessoa a acessar espera cerca de 1 minuto para ele "acordar". Isso
  não acontece nos planos pagos.
- **O banco de dados gratuito expira 30 dias depois de criado** (com mais 14
  dias de tolerância antes de ser apagado de vez, e sem backups automáticos).
  Ou seja: passado esse prazo, você perde o acesso aos dados se continuar no
  plano gratuito.

**Recomendação:** use o plano gratuito só para conhecer e testar. Antes de
cadastrar clientes e campanhas reais (ou o quanto antes possível), faça o
upgrade dos dois itens direto pelo painel do Render:

- Serviço **giftback-app** → **Settings** → **Change Plan** → escolha o
  plano pago de entrada (atualmente em torno de **US$ 7/mês**).
- Banco **giftback-db** → **Settings** → **Change Plan** → escolha o plano
  pago de entrada (atualmente em torno de **US$ 6/mês**, e passa a ter
  backups automáticos).

Ou seja, para rodar de forma estável e sem risco de perder dados, o custo
gira em torno de **US$ 13/mês** no total (os preços exatos aparecem sempre
atualizados no próprio painel do Render antes de você confirmar).

---

## 7. Variáveis de ambiente (referência)

O `render.yaml` já configura a maioria automaticamente. Só o `PUBLIC_BASE_URL`
precisa da sua ação manual (seção 3.1).

| Variável | Quem define | Para que serve |
|---|---|---|
| `DATABASE_URL` | Render (automático) | Conexão com o banco PostgreSQL. |
| `JWT_SECRET` | Render (automático, valor aleatório) | Chave usada para assinar os logins. Nunca compartilhe. |
| `PORT` | Render (automático) | Porta em que o servidor escuta. |
| `PUBLIC_BASE_URL` | **Você define depois do 1º deploy** | Base dos links de resgate enviados por WhatsApp. |
| `PGSSL` | Não definir em produção | Só é usada em ambiente local (veja abaixo). |

---

## 8. Rodando localmente (para desenvolvimento/manutenção futura)

Isso só é necessário se, no futuro, você (ou alguém a seu pedido) quiser
alterar o sistema antes de publicar uma atualização.

1. Tenha Node.js e PostgreSQL instalados localmente.
2. Dentro de `backend/`, copie `.env.example` para `.env` e ajuste conforme
   os comentários do próprio arquivo.
3. Instale as dependências: `npm install`.
4. Aplique a estrutura do banco: `npm run migrate`.
5. (Opcional) Crie dados de exemplo para testar: `npm run seed` — cria a
   empresa de demonstração com login `admin@bellaestetica.com.br` / senha
   `demo1234`.
6. Inicie o servidor: `npm run dev` — acesse `http://localhost:3000`.

Para publicar uma alteração, basta enviar o código atualizado para o mesmo
repositório do GitHub (`git push`) — o Render redeploya automaticamente.

---

## 9. Sobre dados pessoais (LGPD)

O sistema armazena nomes e números de WhatsApp de clientes. Isso está sujeito
à Lei Geral de Proteção de Dados (LGPD). Este pacote entrega a infraestrutura
técnica (o "como guardar e proteger tecnicamente"), mas não substitui
orientação jurídica sobre política de privacidade, consentimento de uso do
WhatsApp para contato comercial, tempo de retenção dos dados, etc. Vale a
pena revisar esse ponto com um advogado ou contador antes de operar em
escala.

---

Qualquer dúvida durante o deploy, volte nesta conversa — posso te ajudar a
revisar uma tela de erro do Render, um valor de variável de ambiente, etc.
