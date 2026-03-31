# ---- Build Stage ----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy everything from the repo root (needed for shared project references)
COPY . .

WORKDIR /src/PrepperBox.WebApi

# Configure the GitHub NuGet source used by Genius.Atom.* packages.
# Pass a GitHub PAT via: docker compose build --build-arg ATOM_PKG_ACCESS_TOKEN=<token>
# or by setting ATOM_PKG_ACCESS_TOKEN in your environment before running docker compose.
ARG ATOM_PKG_ACCESS_TOKEN
RUN cat > /src/nuget.config << EOF
<?xml version="1.0" encoding="utf-8"?>
<configuration>
    <packageSources>
        <add key="nuget.org" value="https://api.nuget.org/v3/index.json" protocolVersion="3" />
        <add key="github" value="https://nuget.pkg.github.com/hwndmaster/index.json" />
    </packageSources>
    <packageSourceMapping>
        <packageSource key="github">
            <package pattern="Genius.*" />
        </packageSource>
        <packageSource key="nuget.org">
            <package pattern="*" />
        </packageSource>
    </packageSourceMapping>
    <packageSourceCredentials>
        <github>
            <add key="Username" value="dummy" />
            <add key="ClearTextPassword" value="$ATOM_PKG_ACCESS_TOKEN" />
        </github>
    </packageSourceCredentials>
</configuration>
EOF

# Restore dotnet tools (declared in .config/dotnet-tools.json at the repo root).
# This downloads Genius.Atom.Build into the NuGet package cache so that the
# Directory.Build.props Import of its .props/.targets files resolves correctly.
WORKDIR /src

WORKDIR /src/PrepperBox.WebApi
RUN dotnet tool restore
RUN dotnet restore

RUN dotnet publish -c Release --no-restore -o /app/publish

# ---- Runtime Stage ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_HTTP_PORTS=8045

EXPOSE 8045
ENTRYPOINT ["dotnet", "PrepperBox.WebApi.dll"]
