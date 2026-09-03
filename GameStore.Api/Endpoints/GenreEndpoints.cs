using GameStore.Api.Data;
using GameStore.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace GameStore.Api.Endpoints;

public static class GenreEndpoints
{
    public static void MapGenreEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/genres");

        group.MapGet("/", async (GameStoreContext dbContext) => await dbContext.Genres.Select(genre => new GenreDTO (
            genre.id, genre.name
        )).AsNoTracking().ToListAsync());
    }
}
