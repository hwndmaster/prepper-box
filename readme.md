# Prepper Box

## Database migrations

`dotnet ef migrations add InitialCreate --project PrepperBox.Db --startup-project PrepperBox.Db`

## Web development (pnpm)

Run all commands from the `PrepperBox.Web` folder.

Install dependencies:

```shell
pnpm install
```

Available commands:

```shell
pnpm run start          # Start Vite dev server
pnpm run build          # Build production assets
pnpm run serve          # Serve built assets locally
pnpm run lint           # Run ESLint
pnpm run test           # Run Vitest
pnpm run test:coverage  # Run Vitest with coverage
pnpm run nswag          # Regenerate API client
```

## Deploying docker containers

### Prerequisites

ghp_TOKEN to scope the following permissions:
* `read:packages`
* `write:packages`

### Locally

```shell
echo ghp_TOKEN | docker login ghcr.io -u hwndmaster --password-stdin
```

Then

```shell
docker compose build
```

Tag the images for the registry

```shell
docker tag prepper-box-prepper-box-api ghcr.io/hwndmaster/prepper-box-api:latest
docker tag prepper-box-prepper-box-web ghcr.io/hwndmaster/prepper-box-web:latest
```

Push the images
```shell
docker push ghcr.io/hwndmaster/prepper-box-api:latest
docker push ghcr.io/hwndmaster/prepper-box-web:latest
```

### Remotely

Create `docker-compose.yml`:

Create a `.env` file on the remote server with your secrets:

```
TELEGRAM_BOT_TOKEN=123123:xxxxxxx
TELEGRAM_CHAT_ID=-10099999999
```

Then create `docker-compose.yml`:

```yaml
services:
  prepper-box-api:
    image: ghcr.io/hwndmaster/prepper-box-api:latest
    container_name: prepper-box-api
    ports:
      - "5095:8045"
    volumes:
      - C:/path/to/your/remote/data:/app/Data
      - C:/path/to/logs/folder:/app/Logs
    environment:
      - Telegram__BotToken=${TELEGRAM_BOT_TOKEN:-}
      - Telegram__ChatId=${TELEGRAM_CHAT_ID:-}
    restart: unless-stopped

  prepper-box-web:
    image: ghcr.io/hwndmaster/prepper-box-web:latest
    container_name: prepper-box-web
    ports:
      - "5096:8046"
      - "5097:8443"
    volumes:
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - prepper-box-api
    restart: unless-stopped
```

Replace `C:/path/to/your/remote/data` with the actual folder where you want the database on the remote server.

Then start the containers:
```shell
docker compose up -d
```

After updating the docker:
```shell
docker compose pull && docker compose up -d
```

### Miscellaneous

#### HTTPS setup (required for camera/barcode scanning)

Browsers require HTTPS for camera access (`getUserMedia`) when not on localhost. To enable HTTPS:

1. Generate a self-signed certificate for your server's LAN IP address:

```shell
cd PrepperBox.Web/scripts
sh generate-cert.sh 192.168.1.100 ../../certs
```

or using openssl.exe:

```shell
New-Item -ItemType Directory -Force -Path certs
openssl req -x509 -newkey rsa:2048 -nodes `
  -keyout certs/server.key `
  -out certs/server.crt `
  -days 3650 `
  -subj "/CN=192.168.1.100" `
  -addext "subjectAltName=IP:192.168.1.100"
```

Replace `192.168.1.100` with the actual IP address of the machine running the Docker containers.

2. Install `certs/server.crt` as a trusted certificate on each client device:
   - **Windows**: Double-click the `.crt` file → Install Certificate → Local Machine → Trusted Root Certification Authorities. Alternatively, run from Terminal:
        ```shell
        Import-Certificate -FilePath certs\server.crt -CertStoreLocation Cert:\LocalMachine\Root
        ```
   - **Android**: Settings → Security → Install from storage → select the `.crt` file
   - **iOS**: AirDrop or email the `.crt` file → Install Profile → Settings → General → About → Certificate Trust Settings → enable

3. Start the containers — HTTPS will be available on port 5097:

```
https://192.168.1.100:5097
```

4. Open the firewall port if needed:

```shell
New-NetFirewallRule -DisplayName "PrepperBox Web HTTPS" -Direction Inbound -Protocol TCP -LocalPort 5097 -Action Allow
```

#### Building locally

Create a `.env` file at the repo root with your secrets (this file should not be committed):

```
ATOM_PKG_ACCESS_TOKEN=ghp_TOKEN
TELEGRAM_BOT_TOKEN=123123:xxxxxxx
TELEGRAM_CHAT_ID=-10099999999
```

Then build:

```shell
docker compose build
```

The `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` values are passed as runtime environment variables to the API container (see `docker-compose.yml`). They are mapped to `Telegram__BotToken` / `Telegram__ChatId`, which ASP.NET Core binds automatically to the `Telegram` config section.

### Troubleshooting

#### Windows Firewall doesn't let to access the website

```shell
New-NetFirewallRule -DisplayName "PrepperBox Web" -Direction Inbound -Protocol TCP -LocalPort 5096 -Action Allow

# Perhaps, not needed:
New-NetFirewallRule -DisplayName "PrepperBox API" -Direction Inbound -Protocol TCP -LocalPort 5095 -Action Allow
```

#### Check if Docker is binding to all interfaces (not just localhost)

```shell
netstat -an | findstr "5096"
```
