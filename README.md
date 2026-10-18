# My Game Store

A small game-store application with a static HTML/CSS/JavaScript frontend and an ASP.NET Core minimal API backed by SQLite. Browse and search games, view game details, and keep a shopping cart in the browser.

## Features

- Home page with randomly selected featured games.
- Game catalog with title/genre search, genre filtering, and sorting.
- Game detail page with release date, genre, and price.
- Shopping cart with quantity changes, item removal, and subtotal.
- Responsive layout and game artwork.

The cart is stored in the browser's local storage. It is not associated with a user account, shared across browsers, or submitted to an order/payment service.

## Requirements

- .NET 10 SDK.
- Python 3 (for the simple local frontend server below), or another static web server.

## Run locally

Run the API and frontend in separate terminals from the repository root.

### 1. Start the API

```powershell
dotnet run --project .\GameStore.Api\GameStore.Api.csproj --launch-profile http
```

The `http` launch profile listens on `http://localhost:5002`. On startup, the API applies database migrations and seeds the game genres if they are missing. The SQLite database connection is configured in `GameStore.Api/appsettings.json` and defaults to `GameStore.Api/GameStore.db`.

### 2. Start the frontend

With Python installed, run:

```powershell
py -m http.server 5001 --bind 127.0.0.1 --directory .\GameStore.Frontend
```

Open <http://127.0.0.1:5001> in a browser. The frontend requests API data from `http://localhost:5002`; the API's development CORS policy allows `http://127.0.0.1:5001` and `http://localhost:5001`.

The frontend API address is currently set in `GameStore.Frontend/js/main.js`. If you change the API address or the frontend's local origin, update that value and the API's allowed CORS origins in `GameStore.Api/Data/DataExtensions.cs` to match.

## API

The API returns JSON and currently exposes:

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/games` | List all games. |
| `GET` | `/games/{id}` | Get one game, or `404` if it does not exist. |
| `POST` | `/games` | Add a list of games. |
| `PUT` | `/games/{id}` | Update a game's name, genre, price, and release date. |
| `DELETE` | `/games/{id}` | Delete a game. |
| `GET` | `/genres` | List available genres. |

Example game payload for `POST /games` (the API expects an array):

```json
[
  {
    "name": "Celeste",
    "genreId": 3,
    "genre": "Platformer",
    "price": 19.99,
    "releaseDate": "2018-01-25"
  }
]
```

The `genreId` must refer to a genre in the database. The API seeds these genres on startup:

| ID | Genre |
| --- | --- |
| 1 | Fighting |
| 2 | RPG |
| 3 | Platformer |
| 4 | Racing |
| 5 | Sports |

The API also supports an HTTPS launch profile on `https://localhost:7160` (and HTTP on port `5002`). For production, deploy the frontend and API to reachable HTTPS addresses and configure the API's CORS policy for the frontend origin; local addresses are only for development.

## Project structure

```text
GameStore.Api/       ASP.NET Core API, EF Core models, migrations, and SQLite setup
GameStore.Frontend/  Static pages, styles, JavaScript, and game artwork
GameStore.slnx       .NET solution
```
