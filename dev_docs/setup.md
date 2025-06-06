# Setup Guide

## Prerequisites
- Node.js 18 or above
- MySQL server
- Redis cluster
- Access to Discord Developer Portal

## Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/rpurinton/architect.git
cd architect
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from template:
```bash
cp .env.example .env
```

4. Edit `.env` with correct Discord token, client ID, database and Redis config, MCP token.

5. Initialize MySQL database schema if available.

6. Run the app:
```bash
node architect.mjs
```

7. Alternatively, install systemd service:
```bash
sudo cp architect.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable architect.service
sudo systemctl start architect.service
sudo systemctl status architect.service
```

## Environment Variables
- `DISCORD_TOKEN`: Discord bot token
- `DISCORD_CLIENT_ID`: Discord client application ID
- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`: MySQL connection info
- `REDIS_HOST`, `REDIS_PORT`: Redis cluster connection
- `MCP_TOKEN`: Bearer token for MCP HTTP server
- `MCP_PORT`: HTTP server listening port
- `LOG_LEVEL`: Logging verbosity


---
