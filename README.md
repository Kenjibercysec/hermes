# Newsletter Platform

Uma plataforma moderna para criação e compartilhamento de newsletters, com recursos de IA e um jornal diário automatizado.

## 🚀 Funcionalidades

- **Autenticação de Usuários**
  - Registro e login de usuários
  - Perfis personalizáveis
  - Sistema de seguidores

- **Criação de Newsletters**
  - Editor Markdown
  - Geração de conteúdo com IA (OpenAI)
  - Agendamento de publicações
  - Categorização automática

- **Feed Personalizado**
  - Visualização de newsletters de usuários seguidos
  - Sistema de descoberta de conteúdo
  - Filtros por categoria

- **Jornal Diário**
  - Geração automática de edições diárias
  - Curadoria de conteúdo com IA
  - Destaques e categorização

- **Painel Administrativo**
  - Gerenciamento de usuários
  - Moderação de conteúdo
  - Estatísticas e relatórios

## 🛠️ Tecnologias

- **Frontend**
  - Next.js 14
  - React
  - Tailwind CSS
  - Shadcn/ui
  - MDEditor

- **Backend**
  - Next.js API Routes
  - Prisma ORM
  - PostgreSQL
  - OpenAI API

- **Autenticação**
  - NextAuth.js
  - Bcrypt

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL
- Conta OpenAI (opcional)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd [nome-do-diretorio]
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/newsletter_app"
NEXTAUTH_SECRET="seu-segredo-nextauth"
NEXTAUTH_URL="http://localhost:3001"
OPENAI_API_KEY="sua-chave-openai" # opcional
```

4. Configure o banco de dados:
```bash
npx prisma migrate dev
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 📦 Estrutura do Projeto

```
├── app/
│   ├── api/           # API Routes
│   ├── admin/         # Painel administrativo
│   ├── create/        # Criação de newsletters
│   ├── feed/          # Feed de conteúdo
│   ├── newspaper/     # Jornal diário
│   └── ...
├── components/        # Componentes React
├── lib/              # Utilitários e configurações
├── prisma/           # Schema e migrações
└── public/           # Arquivos estáticos
```

## 🔐 Autenticação

O sistema usa NextAuth.js para autenticação com as seguintes funcionalidades:
- Login com email/senha
- Proteção de rotas
- Gerenciamento de sessão
- Diferentes níveis de acesso (USER/ADMIN)

## 📝 Criação de Newsletters

1. Acesse `/create`
2. Use o editor Markdown para criar seu conteúdo
3. Opcionalmente, use a IA para:
   - Gerar títulos
   - Criar conteúdo
   - Melhorar o texto existente
4. Agende a publicação ou publique imediatamente

## 📰 Jornal Diário

O sistema gera automaticamente um jornal diário com:
- Curadoria de conteúdo
- Categorização
- Destaques
- Resumos gerados por IA

## 👥 Sistema de Seguidores

- Siga outros usuários
- Receba atualizações no feed
- Descubra novo conteúdo
- Construa sua audiência

## 🔧 Desenvolvimento

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia as [diretrizes de contribuição](CONTRIBUTING.md) antes de enviar um Pull Request.

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas, por favor:
1. Verifique a [documentação](docs/)
2. Abra uma [issue](issues/)
3. Entre em contato com a equipe de suporte 