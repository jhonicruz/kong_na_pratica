# Kong API Gateway Load Balancer Study Project

Este é um projeto de estudo que demonstra a implementação de um sistema distribuído usando Kong API Gateway como load balancer, com múltiplas instâncias de backend Node.js e um frontend Next.js.

## 🏗️ Arquitetura do Projeto

```
┌─────────┐     ┌─────────────┐     ┌──────────┐
│ Frontend │────▶│  Kong API   │────▶│Backend-1 │
└─────────┘     │  Gateway    │     └──────────┘
                │(LoadBalancer)│     ┌──────────┐
                └─────────────┘────▶│Backend-2 │
                       │           └──────────┘
                       │           ┌──────────┐
                       └──────────▶│Backend-3 │
                                  └──────────┘
```

## 🚀 Tecnologias Utilizadas

- **Kong API Gateway**: Load balancer e API Gateway
- **Node.js/TypeScript**: Backend runtime
- **Next.js**: Frontend framework
- **Docker & Docker Compose**: Containerização e orquestração
- **PostgreSQL**: Banco de dados para configuração do Kong

## 📁 Estrutura do Projeto

```
kong_na_pratica/
├── docker-compose.yaml       # Orquestração dos containers
├── kong-config.sh           # Script de configuração do Kong
├── backend/                 # Serviço backend (Node.js/TypeScript)
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       └── server.ts
└── frontend/               # Aplicação frontend (Next.js)
    ├── Dockerfile
    ├── package.json
    └── app/
```

## 🐳 Docker Compose Explicado

O arquivo `docker-compose.yaml` define todos os serviços necessários para a aplicação:

### Redes Docker

```yaml
networks:
  kong-net: # Rede para comunicação Kong/Database
  app-net: # Rede para comunicação entre serviços
```

### Serviços

1. **kong-database** (PostgreSQL):

   - Armazena configurações do Kong
   - Volume persistente para dados
   - Healthcheck para garantir disponibilidade

2. **kong-migrations**:

   - Executa migrações do banco de dados do Kong
   - Roda apenas uma vez durante o startup

3. **kong**:

   - API Gateway principal
   - Configurado para usar PostgreSQL
   - Expõe portas:
     - 8000: Proxy HTTP
     - 8443: Proxy HTTPS
     - 8001: Admin API HTTP
     - 8444: Admin API HTTPS

4. **backend-1/2/3**:

   - Três instâncias idênticas do backend
   - Portas: 4000, 4001, 4002
   - Healthchecks configurados
   - Build multi-stage para otimização

5. **frontend**:

   - Aplicação Next.js
   - Porta 3000
   - Build standalone para melhor performance

6. **kong-config**:
   - Serviço de configuração inicial do Kong
   - Executa o script kong-config.sh

## 🔧 Dockerfiles Explicados

### Backend Dockerfile

```dockerfile
# Stage 1: Base
FROM node:20-alpine AS base
# Stage 2: Dependencies
FROM base AS deps
# Instala apenas dependências de produção
# Stage 3: Builder
FROM base AS builder
# Compila TypeScript para JavaScript
# Stage 4: Runner
FROM base AS runner
# Copia apenas arquivos necessários
# Usa usuário não-root para segurança
```

### Frontend Dockerfile

```dockerfile
# Similar ao backend, mas com configurações específicas Next.js
# Usa build standalone do Next.js
# Configuração de variáveis de ambiente
# Otimização de camadas Docker
```

## 📝 Kong Configuration Explicado

O script `kong-config.sh` configura o Kong API Gateway:

1. **Verificação de Disponibilidade**:

   ```bash
   # Aguarda Kong Admin API ficar disponível
   # Tenta por 30 segundos antes de falhar
   ```

2. **Configuração do Upstream**:

   ```bash
   # Cria um upstream para load balancing
   # Adiciona os três backends como targets
   # Peso igual (100) para distribuição uniforme
   ```

3. **Configuração do Serviço e Rota**:
   ```bash
   # Cria serviço apontando para o upstream
   # Configura rota /api
   # strip_path=true remove /api antes de encaminhar
   ```

## 🔄 Load Balancing

O Kong distribui as requisições entre os backends usando o algoritmo round-robin:

- Distribuição uniforme de carga
- Failover automático se um backend cair
- Healthchecks para remover backends não saudáveis

## 🚦 Como Usar

1. **Iniciar o Projeto**:

   ```bash
   docker compose up -d --build
   ```

2. **Verificar Status**:

   ```bash
   docker compose ps
   ```

3. **Logs dos Serviços**:

   ```bash
   # Todos os logs
   docker compose logs -f
   # Logs específicos
   docker compose logs -f backend-1 backend-2 backend-3
   ```

4. **Testar Load Balancing**:
   ```bash
   # Fazer várias requisições para ver distribuição
   curl http://localhost:8000/api/enviar
   ```

## 🔍 Pontos de Acesso

- Frontend: http://localhost:3000
- Kong Proxy: http://localhost:8000
- Backends diretos: http://localhost:4000-4002 (apenas para debug)

## 🔐 Acessando a Admin API do Kong (Restrita)

A Admin API do Kong foi restrita por segurança. Para acessá-la quando necessário, você tem duas opções:

### 1. Usando Port-Forward Temporário

```bash
# Criar um port-forward temporário para a Admin API
docker compose exec -it kong sh -c "kong health"  # Primeiro, verifique se o Kong está saudável
docker compose exec -it kong sh                   # Entre no container do Kong

# Agora, em outro terminal, crie o port-forward temporário
docker compose port kong 8001                     # Verifique a porta interna
```

### 2. Usando o Container Kong-Config

Para adicionar novos serviços, você pode:

1. Editar o arquivo `kong-config.sh` adicionando suas novas configurações
2. Executar o container kong-config novamente:

```bash
docker compose up kong-config
```

### Exemplo de Adição de Novo Serviço

Para adicionar um novo serviço via kong-config.sh:

```bash
# Adicione ao kong-config.sh:
echo "Creating new service"
curl -sSf -X POST ${KONG_ADMIN_URL}/services \
  --data "name=new-service" \
  --data "url=http://new-service:8080"

echo "Creating route for new service"
curl -sSf -X POST ${KONG_ADMIN_URL}/services/new-service/routes \
  --data "paths[]=/new-api" \
  --data "strip_path=true"
```

### Verificando Configurações Atuais

Para verificar as configurações sem expor a Admin API:

```bash
# Listar serviços
docker compose exec kong curl -s http://localhost:8001/services | jq

# Listar rotas
docker compose exec kong curl -s http://localhost:8001/routes | jq

# Listar upstreams
docker compose exec kong curl -s http://localhost:8001/upstreams | jq
```

## 🛠️ Melhorias Sugeridas para Produção

1. **Segurança**:

   - Restringir acesso à Admin API
   - Implementar autenticação
   - Usar HTTPS/TLS
   - Remover exposição direta dos backends

2. **Monitoramento**:

   - Adicionar logging estruturado
   - Implementar métricas
   - Configurar alertas

3. **Resiliência**:
   - Ajustar timeouts
   - Implementar circuit breakers
   - Configurar rate limiting

## � Segurança

### Antes de Subir para o GitHub

1. **Variáveis de Ambiente**:
   - NUNCA comite arquivos `.env`
   - Use o `.env.example` como template
   - Gere senhas fortes para produção

2. **Portas e Acessos**:
   - Admin API do Kong não está exposta publicamente
   - Portas dos backends só devem ser expostas em desenvolvimento
   - Use HTTPS em produção

3. **Boas Práticas**:
   - Mantenha as dependências atualizadas
   - Escaneie vulnerabilidades: `npm audit`
   - Use `docker scan` para verificar containers

### Configuração Inicial

```bash
# 1. Clone o repositório
git clone [seu-repositorio]

# 2. Crie o arquivo .env baseado no exemplo
cp .env.example .env

# 3. Modifique as senhas no .env
nano .env

# 4. Inicie os containers
docker compose up -d --build
```

### Checklist de Segurança

- [ ] Modificar todas as senhas padrão
- [ ] Restringir acesso à Admin API do Kong
- [ ] Configurar HTTPS/TLS
- [ ] Implementar rate limiting
- [ ] Configurar autenticação
- [ ] Remover portas de debug em produção
- [ ] Atualizar todas as dependências

## �📚 Recursos Adicionais

- [Documentação Kong](https://docs.konghq.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Kong Security Guide](https://docs.konghq.com/gateway/latest/plan-and-deploy/security/)
