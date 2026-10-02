# 🧟 Mapas CZ - Catálogo e Histórico de Mapas BO3 Custom Zombies

![Status](https://img.shields.io/badge/Status-Concluído-success)
![React](https://img.shields.io/badge/React-18.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Database_&_Auth-3ecf8e)

**Mapas CZ** é uma aplicação web Full-Stack desenvolvida para catalogar, rastrear e gerenciar o progresso em mapas customizados de Call of Duty: Black Ops III Zombies. O projeto serve como um diário de sobrevivência pessoal, exibindo estatísticas detalhadas de partidas e integração direta com a Steam Workshop.

🔗 **Acesse o projeto ao vivo:** [mapasczwakanta.vercel.app](https://mapasczwakanta.vercel.app)

---

## 🎯 Funcionalidades Principais

* 🔒 **Role-Based Access Control (RBAC):** Arquitetura de segurança onde visitantes possuem acesso *Read-Only* (modo vitrine), enquanto a administração do catálogo (inserir, editar, excluir mapas e históricos) é protegida por autenticação Supabase.
* 🎮 **Integração Steam Workshop:** Busca automatizada de imagens e detalhes dos mapas diretamente da Steam API através do ID do Workshop, contornando bloqueios de CORS via proxy próprio.
* 🛡️ **Sistema de Fallback Manual:** Sistema à prova de falhas que detecta *Rate Limits* (bloqueios temporários) da Steam e libera formulários manuais, garantindo que o cadastro nunca fique travado.
* 📊 **Mini-Dashboard Analítico:** Cálculo em tempo real do histórico do banco de dados para exibir dinamicamente o *Maior Round*, *Total de Partidas* e *Última Data Jogada* por mapa.
* 📖 **Diário de Sobrevivência:** Histórico de partidas individualizado por mapa, com feedback visual codificado por cores via processamento de strings (ex: verde para "Easter Egg", vermelho para "Game Over").
* 📱 **UI/UX Responsiva:** Design System focado no tema escuro (Dark Mode) com alternância fluida entre visualização em Grade (Cards) e Lista (Tabela), adaptando-se do mobile ao desktop.

---

## 🛠️ Tecnologias Utilizadas

**Front-end:**
* [React](https://reactjs.org/) (via Vite)
* [TypeScript](https://www.typescriptlang.org/) para tipagem estática e segurança de código.
* [Tailwind CSS](https://tailwindcss.com/) para estilização utilitária e responsividade.
* [Lucide React](https://lucide.dev/) para iconografia.

**Back-end & Infraestrutura:**
* [Supabase](https://supabase.com/) (PostgreSQL relacional, Edge Functions e Authentication).
* [Vercel](https://vercel.com/) para CI/CD e hospedagem de alta performance.

---

## 🏗️ Estrutura do Banco de Dados (PostgreSQL)

O projeto utiliza um banco de dados relacional com a seguinte topologia básica:

* **Tabela `mapas`**: Armazena o catálogo (ID da Steam, nome, imagem, status de conclusão).
* **Tabela `historico`**: Relacionada 1:N com `mapas`, armazena os registros individuais (data, jogadores, round alcançado, resultado), permitindo consultas agregadas para os dashboards.

---

## 🚀 Como rodar o projeto localmente

### Pré-requisitos
* [Node.js](https://nodejs.org/en/) (v18 ou superior)
* Um projeto configurado no [Supabase](https://supabase.com/)

### Passo a Passo

1. **Clone o repositório:**
```bash
git clone [https://github.com/victorportugal8/catalogo-mapas-cz.git](https://github.com/victorportugal8/catalogo-mapas-cz.git)
cd catalogo-mapas-cz
```
2. **Instale as dependências:**
```bash
npm install
```
3. **Configure as Variáveis de Ambiente:**
Crie um arquivo `.env.local` na raiz do projeto e adicione suas chaves do Supabase:
```bash
VITE_SUPABASE_URL=sua_url_do_supabase_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```
4. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`.