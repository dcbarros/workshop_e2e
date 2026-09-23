# ClientLab — Frontend para Workshop Cypress E2E

Aplicação frontend criada como sistema-alvo de um workshop de automação E2E com Cypress.

## Tecnologias

- React + TypeScript
- Vite
- `localStorage` para persistência
- `sessionStorage` para sessão de login
- ViaCEP para consulta real de CEP
- endpoints JSON estáticos para chamadas observáveis pelo `cy.intercept()` nas operações sem backend
- geração de PDF no navegador

## Executar

```bash
npm install
npm run dev
```

Acesse a URL exibida pelo Vite.

### Login de demonstração

- Usuário: `qa.workshop`
- Senha: `cypress123`

## Áreas

- Login
- Dashboard
- Clientes
- Cadastro/edição de cliente
- Atendimentos — área demonstrativa de componentes e tabelas

## Cadastro de cliente

Inclui CPF, idade, e-mail, endereço, consulta ViaCEP, combobox de tipo de cliente, combobox de interesses, radio button, upload/drag-and-drop, relacionamentos e PDF.

Na seção **Dados do cliente**, a interface segue o protótipo do requisito: **Tipo de cliente** e **Interesses** são exibidos como comboboxes nativos (`<select>`), facilitando também a prática do comando `cy.select()` no Cypress. Como os requisitos escritos também mencionam múltiplas seleções, esta versão prioriza a representação visual do protótipo e a definição dos campos. O modelo interno continua utilizando arrays, reduzindo impacto estrutural no restante da aplicação.

Nesta versão, **E-mail**, **Salvar cadastro** e **Cancelar** são controlados centralmente em `src/config/workshopFeatures.ts` e começam desabilitados na interface para representar requisitos que não chegaram corretamente à produção.

Outros defeitos intencionais também foram preservados e estão documentados em `docs/DECISOES_E_DEFEITOS.md`.

## Atendimentos

A rota `#/atendimentos` é a área recomendada para demonstrações do instrutor. Ela possui:

- combobox/select;
- radio buttons;
- checkboxes;
- upload;
- inputs com limite;
- filtros;
- tabela;
- seleção de linhas;
- alteração de status;
- ações em lote;
- persistência em `localStorage`.

## Rede

A consulta de CEP chama diretamente:

`https://viacep.com.br/ws/{cep}/json/`

As demais operações didáticas continuam usando pulsos de rede em `public/mock-api` antes de ler/gravar `localStorage`. Isso permite praticar `cy.intercept()` sem criar um backend próprio.

## Documentação

- `docs/GUIA_WORKSHOP.md` — mapeamento do conteúdo do workshop para as telas.
- `docs/DECISOES_E_DEFEITOS.md` — decisões de requisitos, defeitos intencionais e limites.

## Seção 03 — Tipo de cliente e Interesses

A seção **Dados do cliente** utiliza comboboxes multisseleção para refletir os critérios de aceite do cadastro:

- **Tipo de cliente**: permite selecionar Pessoa física e Pessoa jurídica ao mesmo tempo; deve existir pelo menos uma opção selecionada para o cadastro ser válido. O valor inicial permanece Pessoa física, conforme a definição original do campo.
- **Interesses**: permite selecionar zero, um ou vários interesses.
- Os dois campos exibem os tooltips previstos nos critérios de aceite quando o ponteiro passa sobre o campo.
- Os valores continuam armazenados como arrays no objeto `Client`, portanto a persistência no `localStorage` suporta múltiplas escolhas.

Seletores úteis para Cypress:

```js
cy.get('[data-cy="client-type"]').click()
cy.get('[data-cy="client-type-option-pessoa-juridica"]').click()

cy.get('[data-cy="client-interests"]').click()
cy.get('[data-cy="client-interests-option-eletronicos"]').click()
cy.get('[data-cy="client-interests-option-papelaria"]').click()
```

Tooltips:

```js
cy.get('[data-cy="client-type"]')
  .trigger('mouseenter')

cy.get('[data-cy="client-type-tooltip"]')
  .should('be.visible')
  .and('contain', 'Selecione um ou mais tipo de clientes')
```

### Relacionamentos em modal
Na seção **Relacionamentos**, inclusão e edição são feitas em um modal. A tabela permanece na tela principal; o botão `+ Adicionar relacionamento` abre o formulário e o botão de edição reutiliza o mesmo modal com os dados preenchidos.
