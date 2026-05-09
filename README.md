# Porkbun DynDNS v2

A Bun-based dynamic DNS updater that runs every 5 minutes in a Docker container.

## Features

- Runs every 5 minutes automatically
- Updates both `A` and `AAAA` records when matching DNS records already exist
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

Create a `.env` file with:

```env
DOMAIN=example.com
APIKEY=pk1_xxxxxxxxxxxxxxxxx
SECRETAPIKEY=sk1_xxxxxxxxxxxxxxxxx
```

The updater will:
1. Detect IPv4 from `https://api-ipv4.porkbun.com/api/json/v3/ip`
2. Detect IPv6 from `https://api.porkbun.com/api/json/v3/ip`
3. Update the existing `A` record when the public IPv4 changes
4. Update the existing `AAAA` record when the public IPv6 changes
5. Skip `AAAA` updates when Porkbun does not return an IPv6 address
6. Skip missing `AAAA` records instead of creating them automatically

If you run this in Docker and want automatic IPv6 detection, the container itself must reach Porkbun over IPv6. In the current deployment, this is achieved with `network_mode: host`.

## Project Structure

```
.
├── Dockerfile          # Multi-stage Docker build
├── index.ts           # Main application with 5-minute scheduler
├── package.json       # Bun project configuration
├── .gitignore        # Git ignore patterns
└── README.md         # This file
```
