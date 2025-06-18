# EcoTrack 🌱

EcoTrack é uma plataforma inovadora que conecta ecopontos a usuários, facilitando a coleta seletiva e promovendo a educação ambiental. Nosso objetivo é tornar a reciclagem mais acessível e conscientizar a população sobre práticas sustentáveis.

Criado para disciplina Programação 3 (web) no curso de ciência da computação - UFAL

### por: Antônio Guilherme, Efraim Lopes, Felipe Lira, Jhenyfer Kyria, Sthefany Barboza.

## 🚀 Tecnologias

- [Next.js 15.3](https://nextjs.org) - Framework React usado no front e no back.
- [MUI](https://mui.com/) - biblioteca de componentes de interface de usuário para React.
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS utilitário.
- [Firebase](https://firebase.google.com/) - gerenciar autenticação, contas de email e senhas e upload de imagens.
- [MongoDB](https://www.mongodb.com/) - Banco de dados noSQL usado para armazenar os demais dados.

## 📋 Pré-requisitos

- Node.js 18.x ou superior
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/LiraCode/ecotrack.git
cd ecotrack
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
```bash
cp .env
```
variaveis

MONGODB_URI =

NEXT_PUBLIC_FIREBASE_API_KEY =

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 

NEXT_PUBLIC_FIREBASE_PROJECT_ID = 

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET =

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 

NEXT_PUBLIC_FIREBASE_APP_ID = 

NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID =  

FIREBASE_SERVICE_ACCOUNT_KEY =

EMAIL_USER=

EMAIL_PASS=

NEXT_PUBLIC_API_URL=




4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000) para ver a aplicação.

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a versão de produção
- `npm run start` - Inicia a versão de produção
- `npm run lint` - Executa o linter

## 📚 Documentação

Para mais informações sobre as tecnologias utilizadas:

- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação MUI](https://mui.com/material-ui/getting-started/)
- [Documentação Tailwind CSS](https://tailwindcss.com/docs)



## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
