# Prepper Box

## Database migrations

`dotnet ef migrations add InitialCreate --project PrepperBox.Db --startup-project PrepperBox.Db`

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
docker tag prepper-box-api ghcr.io/hwndmaster/prepper-box-api:latest
docker tag prepper-box-web ghcr.io/hwndmaster/prepper-box-web:latest
```

Push the images
```shell
docker push ghcr.io/hwndmaster/prepper-box-api:latest
docker push ghcr.io/hwndmaster/prepper-box-web:latest
```

### Remotely

Create `docker-compose.yml`:

```yaml
services:
  prepper-box-api:
    image: ghcr.io/hwndmaster/prepper-box-api:latest
    container_name: prepper-box-api
    ports:
      - "5095:8045"
    volumes:
      - C:/path/to/your/remote/data:/app/Data
    restart: unless-stopped

  prepper-box-web:
    image: ghcr.io/hwndmaster/prepper-box-web:latest
    container_name: prepper-box-web
    ports:
      - "5096:8046"
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

#### Building locally

```shell
docker compose build --build-arg ATOM_PKG_ACCESS_TOKEN=ghp_TOKEN
```

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
