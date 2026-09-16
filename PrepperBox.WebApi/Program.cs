using Genius.Atom.Infrastructure.Logging;
using Genius.Atom.Web.Telemetry;
using Genius.PrepperBox.WebApi.JsonConverters;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddAtomWebTelemetry(options =>
{
    options.ApplicationName = builder.Environment.ApplicationName;
    options.ActivitySourceName = "Genius.PrepperBox.WebApi.Mvc";

    // The deployed app host supervises this service over /health, so the endpoints have to exist in
    // Production too. Atom's default maps them in Development only, which left them returning 404 on
    // the server and made health supervision impossible.
    options.MapHealthEndpointsInDevelopmentOnly = false;
});

builder.Environment.ContentRootPath = Path.Combine(AppContext.BaseDirectory);
Directory.CreateDirectory(Path.Combine(builder.Environment.ContentRootPath, "Logs"));

// ReplaceHostDefaults: CreateBuilder registers the Console, Debug and EventSource providers and Atom
// adds Serilog, so without this every line reaches the console twice. Atom removes just those four by
// type, leaving the OpenTelemetry provider AddAtomWebTelemetry registered above untouched.
Genius.Atom.Infrastructure.Module.Configure(builder.Services, builder.Configuration,
    options => options.LoggingMode = AtomLoggingMode.ReplaceHostDefaults);
Genius.Atom.Data.Module.Configure(builder.Services);
Genius.Atom.Web.Module.Configure(builder,
    new Microsoft.AspNetCore.Mvc.ApiVersion(1, 0),
    configureMvcOptions: null,
    jsonOptions => JsonSetup.SetupJsonOptions(jsonOptions));
Genius.PrepperBox.Core.Module.Configure(builder.Services);
Genius.PrepperBox.Db.Module.Configure(builder.Services, builder.Configuration);
Genius.PrepperBox.WebApi.Module.Configure(builder.Services, builder.Configuration);

var dbPath = Path.Combine(builder.Environment.ContentRootPath, "Data", "PrepperBox.db");
Directory.CreateDirectory(Path.GetDirectoryName(dbPath)!);
builder.Services.AddDbContext<Genius.PrepperBox.Db.PrepperBoxDbContext>(options =>
{
    options.UseSqlite($"Data Source={dbPath};Foreign Keys=True");
});
builder.AddReactAppCors();

var app = builder.Build();

Genius.Atom.Infrastructure.Module.Initialize(app.Services);
Genius.PrepperBox.Core.Module.Initialize(app.Services);
await Genius.PrepperBox.Db.Module.InitializeAsync(app.Services, app.Environment.IsDevelopment()).ConfigureAwait(false);
Genius.Atom.Web.Module.Initialize(app);

app.UseReactAppCors();
app.MapAtomWebTelemetryEndpoints();
app.MapControllers();

app.LogAtomStartupSummary(summary => summary
    .AddFile("Database", dbPath)
    // Whether the integration is wired up, never the token itself.
    .Add("Telegram configured", !string.IsNullOrWhiteSpace(builder.Configuration["Telegram:BotToken"])));

await app.RunAsync().ConfigureAwait(false);
