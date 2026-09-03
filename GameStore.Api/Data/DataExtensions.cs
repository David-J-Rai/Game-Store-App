using GameStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GameStore.Api.Data;

public static class DataExtensions
{
    public static void MigrateDb(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<GameStoreContext>();
        dbContext.Database.Migrate();
    }

    public static void AddGameStoreDb(this WebApplicationBuilder builder)
    {
        var connString = builder.Configuration.GetConnectionString("GameStore");
        builder.Services.AddSqlite<GameStoreContext>(
            connString,
            optionsAction: options => options.UseSeeding((context, _) =>
            {
                if (!context.Set<Genre>().Any())
                {
                    context.Set<Genre>().AddRange(
                        new Genre { name = "Fighting" },
                        new Genre { name = "RPG" },
                        new Genre { name = "Platformer" },
                        new Genre { name = "Racing" },
                        new Genre { name = "Sports" }
                    );

                    context.SaveChanges();
                }
            })
        );
    }

    public static void AddCorsOptions(this WebApplicationBuilder builder)
    {
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowAllFrontend", policy =>
            {
                policy.WithOrigins("http://127.0.0.1:5001", "http://localhost:5001")
                    .AllowAnyMethod()
                    .AllowAnyHeader();
            });
        });
    }
}
