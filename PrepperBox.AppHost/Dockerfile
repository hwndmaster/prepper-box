# ---- Build Stage ----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy everything from the repo root (needed for project references)
COPY . .

# Configure GitHub Packages credentials through a build secret named
# atom_pkg_access_token passed from docker-compose.

# Restore tools at repo root so Directory.Build.props imports resolve.
WORKDIR /src
RUN --mount=type=secret,id=atom_pkg_access_token \
	--mount=type=cache,id=prepper-box-apphost-nuget-packages,target=/root/.nuget/packages \
	--mount=type=cache,id=prepper-box-apphost-nuget-v3,target=/root/.local/share/NuGet/v3-cache \
	sh /src/scripts/docker-dotnet-restore.sh tool /src

WORKDIR /src/PrepperBox.AppHost
RUN --mount=type=secret,id=atom_pkg_access_token \
	--mount=type=cache,id=prepper-box-apphost-nuget-packages,target=/root/.nuget/packages \
	--mount=type=cache,id=prepper-box-apphost-nuget-v3,target=/root/.local/share/NuGet/v3-cache \
	sh /src/scripts/docker-dotnet-restore.sh project /src/PrepperBox.AppHost
RUN --mount=type=cache,id=prepper-box-apphost-nuget-packages,target=/root/.nuget/packages \
	--mount=type=cache,id=prepper-box-apphost-nuget-v3,target=/root/.local/share/NuGet/v3-cache \
	dotnet build /src/PrepperBox.AppHost/PrepperBox.AppHost.csproj -c Release --no-restore /p:UseAppHost=false /p:DebugType=None /p:DebugSymbols=false
RUN --mount=type=cache,id=prepper-box-apphost-nuget-packages,target=/root/.nuget/packages \
	sh -eu -c 'mkdir -p /aspire-runtime-packages; \
	for package in aspire.hosting.orchestration.linux-x64 aspire.dashboard.sdk.linux-x64; do \
		if [ ! -d "/root/.nuget/packages/$package" ]; then \
			echo "Required Aspire package not found in NuGet cache: $package" >&2; \
			exit 1; \
		fi; \
		cp -a "/root/.nuget/packages/$package" /aspire-runtime-packages/; \
	done'

# ---- Runtime Stage ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# In "deployed" mode the app host's DCP orchestrator creates the api and web containers on the host's
# Docker daemon, whose socket is bind-mounted in by compose. DCP locates the runtime by probing for the
# CLI (Aspire.Shared.ContainerRuntimeDetector.IsCliInstalledAsync), so the binary has to be present.
# Copied from the official CLI image rather than installed via apt: it is a single static binary, and
# the docker.io package would drag in the daemon we explicitly do not want here.
COPY --from=docker:28-cli /usr/local/bin/docker /usr/local/bin/docker

COPY --from=build /src/PrepperBox.AppHost/bin/Release/net10.0 .
COPY --from=build /aspire-runtime-packages /root/.nuget/packages

ENV ASPNETCORE_URLS=http://+:15191
ENV ASPIRE_ALLOW_UNSECURED_TRANSPORT=true
ENV ASPIRE_DASHBOARD_OTLP_ENDPOINT_URL=http://0.0.0.0:21192
ENV ASPIRE_DASHBOARD_OTLP_HTTP_ENDPOINT_URL=http://0.0.0.0:21193
ENV AppHost__Mode=dashboard

EXPOSE 15191
EXPOSE 21192
EXPOSE 21193

ENTRYPOINT ["dotnet", "Genius.PrepperBox.AppHost.dll"]
