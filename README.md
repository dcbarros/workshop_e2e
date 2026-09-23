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

Inclui CPF, idade, e-mail, endereço, consulta ViaCEP, checkbox de tipo de cliente, seleção múltipla de interesses, radio button, upload/drag-and-drop, relacionamentos e PDF.

Nesta versão, **Salvar cadastro** e **Cancelar** existem no DOM, mas ficam invisíveis com `display: none` para representar um defeito que chegou ao ambiente de produção.

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
