# ---- Build Stage ----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy everything from the repo root (needed for shared project references)
COPY . .

WORKDIR /src/PrepperBox.WebApi
RUN --mount=type=secret,id=atom_pkg_access_token \
	--mount=type=cache,id=prepper-box-api-nuget-packages,target=/root/.nuget/packages \
	--mount=type=cache,id=prepper-box-api-nuget-v3,target=/root/.local/share/NuGet/v3-cache \
	sh /src/scripts/docker-dotnet-restore.sh tool /src/PrepperBox.WebApi
RUN --mount=type=secret,id=atom_pkg_access_token \
	--mount=type=cache,id=prepper-box-api-nuget-packages,target=/root/.nuget/packages \
	--mount=type=cache,id=prepper-box-api-nuget-v3,target=/root/.local/share/NuGet/v3-cache \
	sh /src/scripts/docker-dotnet-restore.sh project /src/PrepperBox.WebApi linux-x64

RUN --mount=type=cache,id=prepper-box-api-nuget-packages,target=/root/.nuget/packages \
	--mount=type=cache,id=prepper-box-api-nuget-v3,target=/root/.local/share/NuGet/v3-cache \
	dotnet publish -c Release -r linux-x64 --self-contained false /p:UseAppHost=false /p:DebugType=None /p:DebugSymbols=false --no-restore -o /app/publish

# ---- Runtime Stage ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_HTTP_PORTS=8045

EXPOSE 8045
ENTRYPOINT ["dotnet", "PrepperBox.WebApi.dll"]
