using Genius.Atom.Web.OpenApi;
using Genius.PrepperBox.WebApi.JsonConverters;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

Genius.Atom.Infrastructure.Module.Configure(builder.Services);
Genius.Atom.Data.Module.Configure(builder.Services);
Genius.Atom.Web.Module.Configure(builder,
    new Microsoft.AspNetCore.Mvc.ApiVersion(1, 0),
    configureMvcOptions: null,
    jsonOptions => JsonSetup.SetupJsonOptions(jsonOptions));
Genius.PrepperBox.Core.Module.Configure(builder.Services);
Genius.PrepperBox.Db.Module.Configure(builder.Services);
Genius.PrepperBox.WebApi.Module.Configure(builder.Services, builder.Configuration);

builder.Environment.ContentRootPath = Path.Combine(AppContext.BaseDirectory);
var dbPath = Path.Combine(builder.Environment.ContentRootPath, "Data", "PrepperBox.db");
Directory.CreateDirectory(Path.GetDirectoryName(dbPath)!);
builder.Services.AddDbContext<Genius.PrepperBox.Db.PrepperBoxDbContext>(options =>
{
    options.UseSqlite($"Data Source={dbPath};Foreign Keys=True");
});
builder.Services.AddOpenApi(options =>
{
    options.AddSchemaTransformer<DateTimeOffsetSchemaTransformer>();
    options.AddOperationTransformer<ReferenceParameterTransformer>();
});

var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

Genius.Atom.Infrastructure.Module.Initialize(app.Services);
Genius.PrepperBox.Core.Module.Initialize(app.Services);
await Genius.PrepperBox.Db.Module.InitializeAsync(app.Services, app.Environment.IsDevelopment()).ConfigureAwait(false);
Genius.PrepperBox.WebApi.Module.Initialize(app.Services);
Genius.Atom.Web.Module.Initialize(app);

app.UseCors("AllowReactApp");
app.MapControllers();

await app.RunAsync().ConfigureAwait(false);
