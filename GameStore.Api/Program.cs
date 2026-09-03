using GameStore.Api.Data;
using GameStore.Api.Endpoints;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddValidation();

builder.AddGameStoreDb();
builder.AddCorsOptions();

var app = builder.Build();

app.UseCors("AllowAllFrontend");
app.MapGamesEndpoints();
app.MapGenreEndpoints();

app.MigrateDb();

app.Run();
