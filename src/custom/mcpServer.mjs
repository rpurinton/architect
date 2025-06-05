import express from "express";
import http from "http";
import crypto from "crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

let discordClient = null;

// Tool for returning discord client guilds
export function getGuildsTool(server) {
  const getGuildsRequestSchema = z.object({});
  const getGuildsResponseSchema = z.object({
    guilds: z.array(z.object({ id: z.string(), name: z.string() })),
  });

  server.tool(
    "get-guilds",
    "Returns Discord guilds cached in the MCP server Discord client.",
    getGuildsRequestSchema,
    async () => {
      if (!discordClient) {
        return {
          isError: true,
          content: [{ type: "text", text: "Discord client not initialized" }],
        };
      }

      const guilds = discordClient.guilds.cache.map((guild) => ({
        id: guild.id,
        name: guild.name,
      }));

      return {
        guilds,
      };
    },
    getGuildsResponseSchema
  );
}

// MCP Server instance and tools initialization
export const server = new McpServer({ name: "architect-mcp-server", version: "1.0.0" });

getGuildsTool(server);

// Express HTTP server and MCP transport setup
const app = express();
app.use(express.json());

const mcpTransport = new StreamableHTTPServerTransport({
  sessionIdGenerator: () => crypto.randomUUID(),
});

app.get("/mcp", (req, res) => {
  res.status(200).send("GET /mcp endpoint - no action");
});

app.post("/mcp", async (req, res) => {
  await mcpTransport.handleRequest(req, res, req.body);
});

export async function startHttpServer(client) {
  discordClient = client;

  try {
    await server.connect(mcpTransport);
    console.log("MCP Server connected");
  } catch (err) {
    console.error("MCP Server connection error:", err);
  }

  const port = process.env.PORT ? Number(process.env.PORT) : 9232;

  const serverInstance = http.createServer(app);
  serverInstance.listen(port, () => {
    console.log(`Architect MCP HTTP Server listening on port ${port}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log("Received shutdown signal, closing HTTP server...");
    serverInstance.close(() => {
      console.log("HTTP server closed. Exiting process.");
      process.exit(0);
    });
    setTimeout(() => {
      console.error("Force exiting after 10s.");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

