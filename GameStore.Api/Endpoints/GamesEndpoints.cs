using GameStore.Api.Data;
using GameStore.Api.DTOs;
using GameStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GameStore.Api.Endpoints;

public static class GamesEndpoints
{
    const string GET_GAME_ENDPOINT_NAME = "GetName";

    private static string GetGenreName(int genreId, GameStoreContext dbContext)
    {
        return dbContext.Genres.FirstOrDefault(g => g.id == genreId)?.name ?? "Unknown";
    }

    public static void MapGamesEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/games");
        // GET /games
        group.MapGet("/", async (GameStoreContext dbContext) => await dbContext.Games.Select(game => new GameDTO(
            game.id,
            game.name,
            game.genreId,
            game.genre.name,
            game.price,
            game.releaseDate
        )).AsNoTracking().ToListAsync());
        
        // GET /games/id
        group.MapGet("/{id}", async (int id, GameStoreContext dbContext) =>
        {
            Game? game = await dbContext.Games.FindAsync(id);
            if(game is null) return Results.NotFound();

            string genreName = GetGenreName(game.genreId, dbContext);

            return Results.Ok(
                new GameDTO (
                    game.id,
                    game.name,
                    game.genreId,
                    genreName,
                    game.price,
                    game.releaseDate
                )
            );
        }).WithName(GET_GAME_ENDPOINT_NAME);

        // POST /games
        group.MapPost("/", async (List<GameDTONoId> games, GameStoreContext dbContext) =>
        {
            foreach (var newGame in games)
            {
                if (string.IsNullOrEmpty(newGame.name))
                {
                    return Results.BadRequest("Name is required for all games in the list.");
                }
            }

            List<Game> gamesToAdd = games.Select(newGame => new Game
            {
                name = newGame.name,
                genreId = newGame.genreId,
                price = newGame.price,
                releaseDate = newGame.releaseDate
            }).ToList();

            await dbContext.Games.AddRangeAsync(gamesToAdd);
            await dbContext.SaveChangesAsync();

            List<GameDTO> responseDTOs = gamesToAdd.Select(game => new GameDTO(
                game.id, 
                game.name, 
                game.genreId,
                GetGenreName(game.genreId, dbContext),
                game.price, 
                game.releaseDate
            )).ToList();

            return Results.Ok(responseDTOs);
        });

        // PUT /games/id
        group.MapPut("/{id}", async (int id, GameDTONoId updatedGame, GameStoreContext dbContext) =>
        {
            Game? game = await dbContext.Games.FindAsync(id);

            if (game is null) return Results.NotFound();

            game.name = updatedGame.name;
            game.genreId = updatedGame.genreId;
            game.price = updatedGame.price;
            game.releaseDate = updatedGame.releaseDate;
            
            await dbContext.SaveChangesAsync();

            return Results.NoContent();
        });

        // DELETE /games/1
        group.MapDelete("/{id}", async (int id, GameStoreContext dbContext) =>
        {
            await dbContext.Games.Where(game => game.id == id).ExecuteDeleteAsync();
            
            return Results.NoContent();
        });
    }
}
