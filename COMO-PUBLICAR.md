# Balanço — como colocar no ar

São 4 etapas. Do começo ao fim leva uns 20 minutos na primeira vez.

Enquanto você não preencher o Firebase, o app abre em **modo demonstração** com os dados fictícios da prévia — dá pra testar tudo antes de configurar.

---

## 0. Se você já tem um app de finanças no ar

**No GitHub — apagar o repositório antigo:**

1. Abra o repositório antigo no GitHub
2. **Settings** (aba do próprio repositório, não a do seu perfil)
3. Role até o fim, na caixa vermelha **Danger Zone**
4. **Delete this repository** → o GitHub pede que você digite o nome completo (`usuario/repositorio`) para confirmar

> Isso é definitivo: apaga código, histórico e tira o site do ar. Se quiser guardar o código por segurança, antes clique em **Code → Download ZIP**. Uma alternativa menos radical é deixar o repositório privado (mesma tela, opção *Change visibility*) — o site sai do ar mas o código continua guardado.

**No Firebase — apagar os dados antigos:**

O projeto Firebase pode ser o mesmo, não precisa criar outro. Só limpe os dados velhos:

1. Console do Firebase → **Realtime Database** → aba **Dados**
2. Passe o mouse sobre o nó antigo (o ramo com o nome do app anterior) → clique no **✕** → confirmar

O app novo grava tudo dentro do ramo `balanco`, separado. Se preferir outro nome, mude no `index.html` a linha `const RAIZ='balanco';`.

**No celular:** apague o ícone do app antigo da tela inicial. O app novo já desregistra sozinho os service workers antigos que ficaram no mesmo endereço.

---

## 1. Criar o projeto no Firebase

> **Já tem um projeto Firebase?** Pule para a etapa 2. Use o mesmo projeto: seu login continua o mesmo e os dados do app novo ficam separados, no ramo `balanco`. Para pegar as chaves de um projeto existente: **⚙️ Configurações do projeto → Seus apps → Configuração do SDK**.

1. Acesse `console.firebase.google.com` e clique em **Adicionar projeto**.
   - Nome sugerido: `balanco-financeiro`
   - Pode desativar o Google Analytics.
2. Dentro do projeto, clique no ícone **`</>`** (Web) para registrar um app.
   - Apelido: `Balanço`
   - **Não** marque "Firebase Hosting" agora.
3. Vai aparecer um bloco de código com `const firebaseConfig = { ... }`. **Guarde essa tela**, você vai copiar esses valores na etapa 3.

## 2. Ligar o login e o banco de dados

**Login por e-mail:**
- Menu lateral → **Criação → Authentication → Vamos começar**
- Aba **Sign-in method** → **E-mail/senha** → ativar → salvar.

**Banco de dados:**
- Menu lateral → **Criação → Realtime Database → Criar banco de dados**
- Local: `us-central1` (ou o mais próximo disponível)
- Escolha **Iniciar no modo bloqueado**.
- Depois vá na aba **Regras**, apague o que estiver lá, cole isto e publique:

```json
{
  "rules": {
    "balanco": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

> Essa regra garante que só você, logada, enxerga os seus dados. Ninguém mais tem acesso.

## 3. Colar seus dados no app

Abra o `index.html` num editor de texto, procure por **`COLE_SUA_API_KEY`** (fica logo no começo do script) e substitua o bloco inteiro pelos valores que apareceram na etapa 1:

```js
const CONFIG_FIREBASE={
  apiKey:"AIza...",
  authDomain:"balanco-financeiro.firebaseapp.com",
  databaseURL:"https://balanco-financeiro-default-rtdb.firebaseio.com",
  projectId:"balanco-financeiro",
  storageBucket:"balanco-financeiro.appspot.com",
  messagingSenderId:"123456789012",
  appId:"1:123456789012:web:abc123"
};
```

> Se o `databaseURL` não estiver no bloco que o Firebase mostrou, pegue no topo da tela do Realtime Database.
> Não tem problema esses valores ficarem visíveis no código — quem protege os dados são as regras da etapa 2.

## 4. Publicar

### Opção A — GitHub Pages (como seus outros apps)

```bash
git init
git add .
git commit -m "Balanço - controle financeiro"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/balanco.git
git push -u origin main
```

No GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root) → Save**.
Em 1 ou 2 minutos o app estará em `https://SEU-USUARIO.github.io/balanco/`.

### Opção B — Firebase Hosting

```bash
firebase init hosting     # pasta pública: . (ponto), single-page app: não
firebase deploy
```

---

## Usando no dia a dia

**Primeiro acesso:** abra o link, digite seu e-mail e uma senha de pelo menos 6 caracteres e clique em **Criar minha conta**. Nas próximas vezes é só **Entrar**.

**Instalar no celular:**
- Android/Chrome: menu ⋮ → *Instalar app* / *Adicionar à tela inicial*
- iPhone/Safari: botão de compartilhar → *Adicionar à Tela de Início*

Depois disso ele abre igual a um aplicativo, sem barra de navegador, e funciona offline para consulta.

**Sincronização:** os dados ficam no Firebase, então celular e computador mostram a mesma coisa. O selinho no topo mostra "sincronizado", "salvando..." ou "sem conexão".

**Quando eu publicar uma versão nova:** os dois arquivos precisam ser atualizados juntos —

1. `index.html` → `const VERSAO='1.0.0'` e a lista `HISTORICO` logo abaixo
2. `sw.js` → `const VERSAO = 'balanco-1.0.0'`

Os dois números devem bater. É isso que faz o celular perceber que saiu coisa nova: o app confere de hora em hora e, quando encontra, mostra uma faixa embaixo com o botão **Atualizar**. Você também pode conferir na hora em **Configurações → Procurar atualização**.

A versão aparece do lado do nome Balanço, no topo. Tocando nela, você cai direto no histórico do que mudou.

---

## Sua conta começa vazia

Ao criar sua conta, o app não vem com nada preenchido — nem categorias, nem contas, nem cartão. A tela Resumo mostra **Primeiros passos** guiando o que fazer, e some sozinha quando você terminar.

A ordem que funciona melhor:

1. **Contas** → cadastre sua conta do banco e o cartão (nome, dia que fecha, dia que vence, limite)
2. **Categorias** → crie as suas, com nome, ícone, cor e limite mensal opcional
3. **Recorrentes** → o que se repete todo mês; isso alimenta a projeção dos meses futuros
4. **Dívidas** → empréstimos e financiamentos; compras parceladas no cartão você lança direto
5. **Lançamentos** → o dia a dia

Tudo é editável dentro do app, a qualquer momento: valores, datas, categorias, número de parcelas, limite do cartão, dia de fechamento e vencimento. Você não precisa mexer no código pra nada disso.

**Compra parcelada:** ao lançar, escolha em quantas vezes. O app cria todas as parcelas sozinho. Se errar, vá em **Dívidas → Editar compra** e mude o valor total ou o número de parcelas — ele refaz tudo.

## Se algo der errado

| O que aparece | O que fazer |
|---|---|
| "modo demonstração" | O `CONFIG_FIREBASE` ainda está com os valores de exemplo. Refaça a etapa 3. |
| "sem acesso ao banco" | As regras da etapa 2 não foram publicadas, ou o `databaseURL` está errado. |
| "E-mail ou senha não conferem" | Se ainda não criou conta, use **Criar minha conta**. |
| App não atualiza no celular | Troque a `VERSAO` no `sw.js` e publique de novo. |
