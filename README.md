# Porkbun DynDNS v2

A Bun-based dynamic DNS updater that runs every 5 minutes in a Docker container.

## Features

- Runs every 5 minutes automatically
- Built with Bun for fast performance
- Containerized with Docker
- Lightweight and efficient

## Development

### Prerequisites

- [Bun](https://bun.sh/) installed locally
- [Docker](https://www.docker.com/) for containerization

### Local Development

1. Install dependencies:
```bash
bun install
```

2. Run in development mode (with auto-reload):
```bash
bun run dev
```

3. Run normally:
```bash
bun run start
```

## Docker Usage

### Build the Docker image:
```bash
docker build -t porkbun-dyndns-v2 .
```

### Run the container:
```bash
docker run -d --name porkbun-dyndns porkbun-dyndns-v2
```

### View logs:
```bash
docker logs -f porkbun-dyndns
```

### Stop the container:
```bash
docker stop porkbun-dyndns
docker rm porkbun-dyndns
```

## Configuration

Add your dynamic DNS logic in `index.ts`. The script will:
1. Run immediately when started
2. Then run every 5 minutes continuously
3. Log timestamps for each execution

## Project Structure

```
.
├── Dockerfile          # Multi-stage Docker build
├── index.ts           # Main application with 5-minute scheduler
├── package.json       # Bun project configuration
├── .gitignore        # Git ignore patterns
└── README.md         # This file
```