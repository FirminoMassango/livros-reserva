# Livraria Digital

Sistema de reservas e vendas de livros para livrarias físicas e online.

## Funcionalidades
- Catálogo de livros com reserva rápida (sem cadastro obrigatório)
- Carrinho de compras e ajuste de quantidades
- Painel do vendedor para aprovação e acompanhamento de reservas
- Painel administrativo para estatísticas e gestão
- Integração com métodos de pagamento (dinheiro, M-Pesa, e-Mola, POS)
- Visualização de reservas e vendas por perfil (admin/vendedor)

## Como rodar localmente

1. Clone o repositório:
   ```sh
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```
2. Instale as dependências:
   ```sh
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```sh
   npm run dev
   ```

## Tecnologias
- React + Vite
- TypeScript
- TailwindCSS
- Supabase
- Recharts (para estatísticas)

## Estrutura
- `src/components` — Componentes de UI e páginas
- `src/hooks` — Hooks customizados (reservas, vendas, autenticação)
- `supabase/` — Configuração e funções do banco de dados

## Contribuição
Pull requests são bem-vindos!

---

Desenvolvido para facilitar a gestão de reservas e vendas em livrarias de Moçambique.
