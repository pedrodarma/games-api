# Games API

A RESTful API and WebSocket service for managing game logs across multiple game types. This service provides endpoints for logging game events and retrieving game history, with real-time WebSocket support for receiving game logs from external brokers.

## Table of Contents

- [Features](#features)
- [Supported Games](#supported-games)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [WebSocket Integration](#websocket-integration)
- [Project Structure](#project-structure)
- [Development](#development)
- [Docker](#docker)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

## Features

- 🎮 **Multi-Game Support**: Logs and manages data for multiple game types
- 📊 **Game Logging**: RESTful API for creating and retrieving game logs
- 🔌 **WebSocket Client**: Real-time log ingestion from external message brokers
- 🗄️ **MongoDB Integration**: Automatic collection creation per game type
- 🐳 **Docker Support**: Containerized deployment with Docker and Docker Compose
- 🔄 **Auto-Reconnection**: WebSocket client automatically reconnects on connection loss
- 📝 **TypeScript**: Fully typed codebase for better developer experience

## Supported Games

The API currently supports the following games:

| Game Key | Game Name           | Min Players | Max Players |
| -------- | ------------------- | ----------- | ----------- |
| `NBT`    | Naval Battle        | 2           | 2           |
| `RPS`    | Rock Paper Scissors | 2           | 2           |
| `QTT`    | Quick Tac Toe       | 2           | 2           |
| `CNW`    | Carnaval World      | 2           | 10          |
| `PNP`    | Planning Poker      | 2           | 20          |

## Tech Stack

- **Runtime**: Node.js 22.x
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB
- **WebSocket**: ws (WebSocket library)
- **Caching**: Redis (configured but optional)
- **Package Manager**: Yarn
- **Containerization**: Docker

## Prerequisites

- Node.js 22.x
- Yarn package manager
- MongoDB instance (local or remote)
- (Optional) Redis instance for caching
- (Optional) WebSocket broker for real-time log ingestion

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/pedrodarma/games-api.git
   cd games-api
   ```

2. **Install dependencies**:
   ```bash
   yarn install
   ```
   Or use the installation script:
   ```bash
   ./_install.sh
   ```

3. **Set up environment variables** (see [Configuration](#configuration))

4. **Build the project**:
   ```bash
   yarn build
   ```

5. **Start the server**:
   ```bash
   yarn start
   ```

For development with hot-reload:
```bash
yarn dev
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=8060
NODE_ENV=production

# MongoDB Configuration
MONGODB=mongodb://username:password@host:port/databaseName

# WebSocket Broker Configuration
BROKER_URL=ws://your-broker-url:port

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=admin
REDIS_PASSWORD=default
```

### Environment Variables

| Variable         | Description            | Default   | Required                     |
| ---------------- | ---------------------- | --------- | ---------------------------- |
| `PORT`           | Server port            | `8060`    | No                           |
| `NODE_ENV`       | Environment mode       | -         | No                           |
| `MONGODB`        | MongoDB connection URI | -         | Yes                          |
| `BROKER_URL`     | WebSocket broker URL   | -         | Yes (for WebSocket features) |
| `REDIS_HOST`     | Redis host             | `redis`   | No                           |
| `REDIS_PORT`     | Redis port             | `1118`    | No                           |
| `REDIS_USERNAME` | Redis username         | `admin`   | No                           |
| `REDIS_PASSWORD` | Redis password         | `default` | No                           |

## Usage

### Starting the Server

**Development mode** (with hot-reload):
```bash
yarn dev
```

**Production mode**:
```bash
yarn build
yarn start
```

The server will start on the port specified in your `.env` file (default: `8060`).

### Health Check

Verify the server is running:
```bash
curl http://localhost:8060/healthcheck
```

## API Endpoints

### Base URL
```
http://localhost:8060
```

### Endpoints

#### `GET /`
Returns a simple greeting message.

**Response:**
```
Games API
```

---

#### `GET /healthcheck`
Health check endpoint to verify server status.

**Response:**
- Status: `200 OK`

---

#### `POST /log/:gameKey`
Creates a new game log entry.

**Parameters:**
- `gameKey` (path parameter): One of the supported game keys (`NBT`, `RPS`, `QTT`, `CNW`, `PNP`)

**Request Body:**
```json
{
  "hash": "unique-game-hash",
  "status": "completed",
  "startedAt": "2024-01-01T00:00:00.000Z",
  "finishedAt": "2024-01-01T00:30:00.000Z",
  // ... game-specific fields
}
```

**Response:**
- **201 Created**: Log entry created successfully
  ```json
  {
    "message": "Log entry created successfully"
  }
  ```
- **400 Bad Request**: Game key is required
- **500 Internal Server Error**: Failed to create log entry

**Example:**
```bash
curl -X POST http://localhost:8060/log/QTT \
  -H "Content-Type: application/json" \
  -d '{
    "hash": "game-123",
    "status": "completed",
    "startedAt": "2024-01-01T00:00:00.000Z",
    "type": "standard",
    "mode": "online",
    "playerXId": "player-1",
    "playerOId": "player-2"
  }'
```

---

#### `GET /logs/:gameKey`
Retrieves all logs for a specific game.

**Parameters:**
- `gameKey` (path parameter): One of the supported game keys

**Response:**
- **200 OK**: Array of log entries
  ```json
  [
    {
      "_id": "...",
      "hash": "game-123",
      "status": "completed",
      "createdAt": "2024-01-01T00:00:00.000Z",
      // ... other fields
    }
  ]
  ```
- **400 Bad Request**: Game key is required
- **500 Internal Server Error**: Internal server error

**Example:**
```bash
curl http://localhost:8060/logs/QTT
```

## WebSocket Integration

The API includes a WebSocket client that connects to an external message broker to receive game logs in real-time.

### WebSocket Client Features

- **Auto-Connection**: Automatically connects to the broker on server startup
- **Auto-Reconnection**: Automatically reconnects after connection loss (5-second delay)
- **Message Handling**: Processes different message types:
  - `log`: Stores game logs in MongoDB
  - `event`: Handles server registration events
  - `ping/pong`: Heartbeat mechanism

### WebSocket Message Format

```typescript
{
  type: 'log' | 'chat' | 'command' | 'event' | 'action' | 'registered',
  from: string,
  to?: string,
  data: {
    // Game log data or other message data
    gameKey: string,
    hash: string,
    status: string,
    // ... other fields
  }
}
```

### Configuration

Set the `BROKER_URL` environment variable to enable WebSocket functionality:
```env
BROKER_URL=ws://your-broker-url:port
```

The client connects to: `{BROKER_URL}/logs`

## Project Structure

```
games-api/
├── src/
│   ├── _constants/          # Game constants and configurations
│   │   ├── _continents.ts
│   │   ├── _countries.ts
│   │   ├── _games.ts        # Game definitions
│   │   └── index.ts
│   ├── contollers/          # Request handlers
│   │   ├── logs/
│   │   │   ├── logs.controller.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── databases/           # Database connections
│   │   ├── mongodb/
│   │   │   ├── mongodb.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── models/              # Data models
│   │   ├── game.model.ts
│   │   ├── log.model.ts
│   │   ├── log-quicktactoe.model.ts
│   │   ├── websocket-message.model.ts
│   │   └── index.ts
│   ├── repositories/        # Data access layer
│   │   ├── logs/
│   │   │   ├── logs.repository.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   ├── id.utils.ts
│   │   └── index.ts
│   ├── websocket/           # WebSocket client
│   │   ├── websocket.ts
│   │   └── index.ts
│   └── routes.ts            # API routes
├── _scripts/                # Utility scripts
│   ├── get_version_local.sh
│   ├── get_version_remote.sh
│   ├── post-commit
│   ├── pre-commit
│   ├── update_git_hooks.sh
│   └── upgrade_version.sh
├── _build.sh                # Build script
├── _install.sh              # Installation script
├── _prepare.sh              # Preparation script
├── docker-compose.yml       # Docker Compose configuration
├── Dockerfile               # Docker image definition
├── index.ts                 # Application entry point
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## Development

### Development Scripts

```bash
# Start development server with hot-reload
yarn dev

# Build for production
yarn build

# Run linter
yarn lint

# Fix linting issues
yarn lint:fix

# Type checking
yarn typecheck
```

### Code Structure

- **Controllers**: Handle HTTP requests and responses
- **Repositories**: Abstract database operations
- **Models**: Define data structures and interfaces
- **WebSocket**: Manages real-time connections
- **Utils**: Shared utility functions

### TypeScript Path Aliases

The project uses path aliases for cleaner imports:

- `@constants` → `./src/_constants`
- `@databases` → `./src/databases`
- `@controllers` → `./src/contollers`
- `@models` → `./src/models`
- `@repositories` → `./src/repositories`
- `@routes` → `./src/routes.ts`
- `@utils` → `./src/utils`

## Docker

### Building the Docker Image

```bash
docker build -t games-api .
```

### Running with Docker Compose

```bash
docker-compose up -d
```

The `docker-compose.yml` file includes:
- Pre-configured environment variables
- Network configuration
- Port mapping (8060:8060)
- Restart policy

### Docker Image

The Dockerfile uses a multi-stage build:
1. **Base stage**: Sets up the working directory
2. **Build stage**: Installs dependencies and builds the project
3. **Final stage**: Copies built files and runs the application

## Scripts

### Build Scripts

- `_build.sh`: Cleans and builds the project
- `_install.sh`: Cleans and installs dependencies
- `_prepare.sh`: Runs during postinstall

### Version Management

- `_scripts/get_version_local.sh`: Gets local version
- `_scripts/get_version_remote.sh`: Gets remote version
- `_scripts/upgrade_version.sh`: Upgrades version number

### Git Hooks

- `_scripts/pre-commit`: Pre-commit hook
- `_scripts/post-commit`: Post-commit hook
- `_scripts/update_git_hooks.sh`: Updates git hooks

## Database

### MongoDB Collections

The API automatically creates MongoDB collections for each game type on startup:
- `nbt_logs` - Naval Battle logs
- `rps_logs` - Rock Paper Scissors logs
- `qtt_logs` - Quick Tac Toe logs
- `cnw_logs` - Carnaval World logs
- `pnp_logs` - Planning Poker logs

### Database Name

All collections are stored in the `logs` database (configurable via MongoDB connection URI).

## Error Handling

The API includes error handling for:
- Missing required parameters (400 Bad Request)
- Database connection errors (500 Internal Server Error)
- WebSocket connection failures (automatic reconnection)
- Invalid game keys

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC License

## Author

**Pedro Darma**

- GitHub: [@pedrodarma](https://github.com/pedrodarma)
- Repository: [games-api](https://github.com/pedrodarma/games-api)

## Support

For issues and questions:
- GitHub Issues: [https://github.com/pedrodarma/games-api/issues](https://github.com/pedrodarma/games-api/issues)

---

**Note**: This API is designed to work as part of a larger gaming ecosystem. Ensure your MongoDB instance is properly configured and accessible before starting the server.
