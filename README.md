# Sistema Financeiro

Um sistema completo de gestão financeira desenvolvido em React com TypeScript, utilizando as melhores práticas de desenvolvimento frontend.

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca para construção de interfaces
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Vite** - Build tool e dev server ultra-rápido
- **React Router DOM** - Roteamento para aplicações React
- **Tailwind CSS** - Framework CSS utilitário
- **Shadcn/ui** - Componentes UI reutilizáveis e acessíveis
- **Radix UI** - Primitivos de UI headless
- **React Hook Form** - Gerenciamento de formulários performático
- **Zod** - Validação de esquemas TypeScript-first
- **Axios** - Cliente HTTP para requisições
- **Recharts** - Biblioteca de gráficos para React
- **Lucide React** - Ícones SVG
- **Date-fns** - Utilitários para manipulação de datas

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── layout/         # Componentes de layout (Header, Sidebar, Layout)
│   └── ui/             # Componentes UI base (shadcn/ui)
├── features/           # Módulos funcionais da aplicação
│   ├── auth/           # Autenticação e login
│   ├── colaboradores/  # Gestão de colaboradores
│   ├── dashboard/      # Dashboard principal
│   ├── empresas/       # Gestão de empresas
│   ├── entradas/       # Controle de entradas financeiras
│   ├── fornecedores/   # Gestão de fornecedores
│   ├── integracoes/    # Integrações externas
│   ├── pagamentos/     # Controle de pagamentos
│   ├── relatorios/     # Relatórios financeiros
│   ├── saidas/         # Controle de saídas financeiras
│   └── usuarios/       # Gestão de usuários
├── hooks/              # Custom hooks
├── lib/                # Utilitários e configurações
├── App.tsx             # Componente principal
├── main.tsx            # Ponto de entrada da aplicação
└── index.css           # Estilos globais
```

## 🎯 Funcionalidades

### Dashboard
- Visão geral dos indicadores financeiros
- Gráficos de entradas e saídas
- Análise de gastos por categoria
- Métricas em tempo real

### Gestão Financeira
- **Entradas**: Controle de receitas e faturamento
- **Saídas**: Gestão de despesas e custos
- **Pagamentos**: Controle de pagamentos a fornecedores
- **Relatórios**: Análises detalhadas e exportação de dados

### Gestão de Entidades
- **Empresas**: Cadastro e gestão de empresas (multi-CNPJ)
- **Fornecedores**: Cadastro e controle de fornecedores
- **Colaboradores**: Gestão de funcionários
- **Usuários**: Controle de acesso e permissões

### Recursos Técnicos
- **Autenticação**: Sistema de login seguro
- **Integrações**: Conectores para sistemas externos
- **Tema**: Suporte a modo claro/escuro
- **Responsividade**: Interface adaptável para todos os dispositivos

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd sistema-financeiro
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

4. Acesse a aplicação em `http://localhost:5173`

## 📜 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run lint` - Executa o linter para verificar o código
- `npm run preview` - Visualiza a build de produção localmente

## 🎨 Componentes UI

O projeto utiliza o **shadcn/ui** como base para os componentes, garantindo:

- ✅ Acessibilidade (WCAG)
- ✅ Consistência visual
- ✅ Customização via Tailwind CSS
- ✅ Componentes reutilizáveis
- ✅ Tipagem TypeScript completa

### Componentes Disponíveis
- Button, Card, Dialog, Input, Label
- Table, Toast, Dropdown Menu
- Theme Toggle (modo claro/escuro)

## 🔧 Configurações

### Tailwind CSS
O projeto está configurado com:
- Tema customizado com variáveis CSS
- Suporte a modo escuro
- Animações personalizadas
- Sistema de cores consistente

### TypeScript
- Configuração estrita habilitada
- Path mapping configurado (`@/` aponta para `src/`)
- Tipos personalizados para melhor DX

### Vite
- Hot Module Replacement (HMR)
- Build otimizada para produção
- Alias de importação configurado

## 🌟 Padrões de Desenvolvimento

### Estrutura de Componentes
```typescript
// Exemplo de componente tipado
interface ComponentProps {
  title: string
  data: DataType[]
  onAction: (id: string) => void
}

export function Component({ title, data, onAction }: ComponentProps) {
  // Implementação
}
```

### Validação com Zod
```typescript
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  value: z.number().positive('Valor deve ser positivo')
})

type FormData = z.infer<typeof schema>
```

### Formatação de Dados
Utilitários disponíveis em `src/lib/utils.ts`:
- `formatCurrency()` - Formatação de moeda (BRL)
- `formatCNPJ()` - Formatação de CNPJ
- `formatCPF()` - Formatação de CPF
- `formatDate()` - Formatação de datas (pt-BR)

## 🚦 Roteamento

A aplicação utiliza React Router DOM com a seguinte estrutura:

- `/login` - Página de autenticação
- `/` - Dashboard (rota protegida)
- `/empresas` - Gestão de empresas
- `/entradas` - Controle de entradas
- `/saidas` - Controle de saídas
- `/pagamentos` - Gestão de pagamentos
- `/fornecedores` - Cadastro de fornecedores
- `/colaboradores` - Gestão de colaboradores
- `/usuarios` - Controle de usuários
- `/relatorios` - Relatórios financeiros
- `/integracoes` - Configurações de integração

## 📱 Responsividade

O sistema é totalmente responsivo, utilizando:
- Grid system do Tailwind CSS
- Breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`
- Sidebar colapsável em dispositivos móveis
- Tabelas com scroll horizontal

## 🎯 Próximos Passos

- [ ] Implementação do React Query para cache de dados
- [ ] Testes unitários com Jest/Vitest
- [ ] Storybook para documentação de componentes
- [ ] PWA (Progressive Web App)
- [ ] Internacionalização (i18n)

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido com ❤️ usando React + TypeScript + Tailwind CSS**