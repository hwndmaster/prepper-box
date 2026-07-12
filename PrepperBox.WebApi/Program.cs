using Genius.Atom.Web.Telemetry;
using Genius.PrepperBox.WebApi.JsonConverters;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddAtomWebTelemetry(options =>
{
    options.ApplicationName = builder.Environment.ApplicationName;
    options.ActivitySourceName = "Genius.PrepperBox.WebApi.Mvc";
});

builder.Environment.ContentRootPath = Path.Combine(AppContext.BaseDirectory);
Directory.CreateDirectory(Path.Combine(builder.Environment.ContentRootPath, "Logs"));

Genius.Atom.Infrastructure.Module.Configure(builder.Services, builder.Configuration);
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
Genius.PrepperBox.WebApi.Module.Initialize(app.Services);
Genius.Atom.Web.Module.Initialize(app);

app.UseReactAppCors();
app.MapAtomWebTelemetryEndpoints();
app.MapControllers();

await app.RunAsync().ConfigureAwait(false);
