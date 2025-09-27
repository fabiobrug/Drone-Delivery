# 🔧 **CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE**

## 🔐 **ENCRYPTION_KEY - Chave de Criptografia**

A `ENCRYPTION_KEY` é uma chave de 32 caracteres (16 bytes em hexadecimal) usada para criptografar dados sensíveis no backend.

### **Chave Gerada para Você:**

```
ENCRYPTION_KEY=c8a6faafd1cb8eb545b91f3c4ef6487b
```

## 📁 **ARQUIVOS .ENV NECESSÁRIOS**

### **1. Backend (.env)**

Crie o arquivo `backend/.env` com o seguinte conteúdo:

```env
NODE_ENV=development
PORT=3001
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_KEY=your_supabase_service_role_key_here
ENCRYPTION_KEY=c8a6faafd1cb8eb545b91f3c4ef6487b
FRONTEND_URL=http://localhost:5173
```

### **2. Frontend (.env.local)**

Crie o arquivo `frontend/DroneOps/.env.local` com o seguinte conteúdo:

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3002
VITE_NODE_ENV=development
VITE_MAP_GRID_SIZE=100
VITE_MAP_CELL_SIZE=20
VITE_REAL_TIME_ENABLED=true
VITE_UPDATE_INTERVAL=5000
```

## 🔑 **CONFIGURAÇÃO DO SUPABASE**

### **1. Acesse o Supabase Dashboard**

- Vá para [supabase.com](https://supabase.com)
- Faça login na sua conta
- Selecione seu projeto

### **2. Obtenha as Chaves**

- Vá em **Settings** → **API**
- Copie as seguintes chaves:
  - **Project URL** → `SUPABASE_URL`
  - **anon public** → `SUPABASE_ANON_KEY`
  - **service_role** → `SUPABASE_KEY`

### **3. Substitua no .env do Backend**

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚀 **EXPLICAÇÃO DAS VARIÁVEIS**

### **Backend (.env)**

| Variável            | Descrição                        | Exemplo                            |
| ------------------- | -------------------------------- | ---------------------------------- |
| `NODE_ENV`          | Ambiente de execução             | `development`                      |
| `PORT`              | Porta do servidor                | `3001`                             |
| `SUPABASE_URL`      | URL do seu projeto Supabase      | `https://xxx.supabase.co`          |
| `SUPABASE_ANON_KEY` | Chave pública do Supabase        | `eyJhbGciOiJIUzI1NiIs...`          |
| `SUPABASE_KEY`      | Chave de serviço do Supabase     | `eyJhbGciOiJIUzI1NiIs...`          |
| `ENCRYPTION_KEY`    | Chave de criptografia (32 chars) | `c8a6faafd1cb8eb545b91f3c4ef6487b` |
| `FRONTEND_URL`      | URL do frontend                  | `http://localhost:5173`            |

### **Frontend (.env.local)**

| Variável                 | Descrição                     | Exemplo                     |
| ------------------------ | ----------------------------- | --------------------------- |
| `VITE_API_BASE_URL`      | URL base da API               | `http://localhost:3001/api` |
| `VITE_WS_URL`            | URL do WebSocket              | `ws://localhost:3002`       |
| `VITE_NODE_ENV`          | Ambiente                      | `development`               |
| `VITE_MAP_GRID_SIZE`     | Tamanho do grid do mapa       | `100`                       |
| `VITE_MAP_CELL_SIZE`     | Tamanho da célula             | `20`                        |
| `VITE_REAL_TIME_ENABLED` | Ativar tempo real             | `true`                      |
| `VITE_UPDATE_INTERVAL`   | Intervalo de atualização (ms) | `5000`                      |

## ⚠️ **IMPORTANTE**

1. **NUNCA** commite os arquivos `.env` para o Git
2. **MANTENHA** as chaves seguras e privadas
3. **USE** diferentes chaves para desenvolvimento e produção
4. **ATUALIZE** as chaves regularmente em produção

## 🔄 **COMO GERAR NOVA ENCRYPTION_KEY**

Se precisar gerar uma nova chave:

```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## ✅ **VERIFICAÇÃO**

Após configurar os arquivos `.env`:

1. **Backend**: `cd backend && npm run dev`
2. **Frontend**: `cd frontend/DroneOps && npm run dev`
3. **Teste**: Acesse `http://localhost:5173`

Se tudo estiver configurado corretamente, o sistema deve carregar sem erros!
