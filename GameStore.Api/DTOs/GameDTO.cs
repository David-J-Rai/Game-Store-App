using System.ComponentModel.DataAnnotations;

namespace GameStore.Api.DTOs;

public record GameDTO(
    int id,
    string name,
    int genreId,
    string genre,
    decimal price,
    DateOnly releaseDate
);

public record GameDTONoId(
    [Required][StringLength(50)] string name,
    [Range(1, 50)] int genreId,
    string genre,
    [Range(1, 100)] decimal price,
    [Required] DateOnly releaseDate
);