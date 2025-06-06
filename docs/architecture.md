# Architect Project

## Overview

Architect is a Discord.js application integrated with a Model Context Protocol (MCP) server enabling AI-driven automation and administration of Discord servers via conversational agents.

## System Components

- **Discord.js Client:** Connects to Discord, listens to events, processes slash commands.
- **Command Loader:** Loads JSON command definitions and handlers, registers commands with Discord API.
- **Event Loader:** Loads event handler modules attaching them to Discord client.
- **MCP Server:** Embedded MCP server exposing Discord admin functions as resources and tools for AI agents.
- **HTTP Server:** Express.js server exposing MCP endpoint secured with bearer token.
- **MCP Client (optional):** Client to connect to MCP server for communication.
- **Redis Integration:** Caches AI response states and supports command state management.
- **MySQL Database:** Persists application data.
- **OpenAI Integration:** Provides AI conversational responses leveraging conversation history.

## Architecture Diagram

(Consider adding UML or flow diagram here to illustrate component interaction)

## Data Flow

1. Discord client listens to slash commands and events.
2. Commands invoke handlers to perform operations or call AI.
3. MCP server exposes tools for AI-driven management.
4. HTTP server handles MCP protocol requests, enforcing auth.
5. Redis caches conversational context.
6. MySQL stores persistent state.
7. OpenAI generates AI responses for interactions.


---
