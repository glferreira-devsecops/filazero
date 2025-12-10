# FilaZero Saúde - Guia de Deployment (Produção)

## Visão Geral

Este guia cobre o deploy do FilaZero Saúde em diferentes ambientes. O sistema é extremamente portátil.

**Opções de Deploy**:

1. **Vercel (Demo/Frontend)**: Mais rápido e fácil.
2. **VPS (DigitalOcean/Linode)**: Controle total, mais barato ($5/mês).
3. **Fly.io**: PaaS moderno, fácil escala.
4. **Docker**: Para qualquer ambiente containerizado.

---

## Opção 1: Vercel (Recomendado para Demo)

Ideal para demonstração rápida sem backend no ar (usando Modo Offline/Mock).

1. Faça fork do repositório no GitHub.
2. Crie conta na Vercel (vercel.com).
3. "Import Project" -> Selecione o repo.
4. Framework Preset: **Vite**.
5. Deploy!
6. *Opcional*: Configure a variável de ambiente `VITE_POCKETBASE_URL` para apontar para seu backend real.

---

## Opção 2: VPS Linux (Produção Real)

A maneira mais econômica e robusta para produção.

### Requisitos

- VPS Ubuntu 22.04 ($5-6/mês)
- Domínio configurado (ex: `app.suaclinica.com`)

### Passo a Passo

1. **Acesse o servidor**:

    ```bash
    ssh root@seu-ip
    ```

2. **Baixe o PocketBase**:

    ```bash
    mkdir /opt/filazero
    cd /opt/filazero
    wget https://github.com/pocketbase/pocketbase/releases/download/v0.21.5/pocketbase_0.21.5_linux_amd64.zip
    unzip pocketbase_*.zip
    chmod +x pocketbase
    ```

3. **Rode o Backend (Teste)**:

    ```bash
    ./pocketbase serve --http="0.0.0.0:80"
    ```

4. **Configure como Serviço (Systemd)**:
    Crie `/etc/systemd/system/pocketbase.service`:

    ```ini
    [Unit]
    Description=PocketBase
    [Service]
    ExecStart=/opt/filazero/pocketbase serve --http="0.0.0.0:8090"
    WorkingDirectory=/opt/filazero
    Restart=always
    [Install]
    WantedBy=multi-user.target
    ```

    Ative: `systemctl enable --now pocketbase`

5. **Proxy Reverso (Nginx)**:
    Instale o Nginx e configure para encaminhar tráfego da porta 80/443 para a 8090 (backend).

6. **SSL (HTTPS)**:
    Use Certbot: `certbot --nginx -d app.suaclinica.com`

---

## Opção 3: Docker (Portabilidade)

Se você prefere containers.

### Dockerfile (Full Stack)

```dockerfile
# Build Frontend
FROM node:18-alpine as builder
WORKDIR /app
COPY frontend/ .
RUN npm install && npm run build

# Runtime
FROM alpine:latest
RUN apk add --no-cache ca-certificates unzip wget
WORKDIR /app
# Baixar PocketBase...
COPY --from=builder /app/dist /app/pb_public
CMD ["/app/pocketbase", "serve", "--http=0.0.0.0:8090"]
```

### Rodando

```bash
docker build -t filazero .
docker run -p 8090:8090 filazero
```

---

## Backup e Manutenção

O banco de dados é um arquivo único: `pb_data/data.db`.

**Backup**: Basta copiar este arquivo.

```bash
cp -r pb_data pb_data_backup_$(date +%F)
```

Configure um cronjob para subir isso para um S3 ou Google Drive diariamente.

---

## Solução de Problemas

- **Erro 502 (Bad Gateway)**: O PocketBase não está rodando. Verifique `systemctl status pocketbase`.
- **Erro CORS**: Adicione seu domínio nas configurações do PocketBase (painel Admin > Settings).
- **Websocket desconectando**: Verifique se seu Nginx está configurado para suportar upgrades de conexão WebSocket.
