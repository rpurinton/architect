#!/usr/bin/env node
import 'dotenv/config';
import { registerExceptionHandlers } from './src/exceptions.mjs';
import { loadLocales } from './src/locales.mjs';
import { loadAndRegisterCommands } from './src/commands.mjs';
import { createAndLoginDiscordClient } from './src/discord.mjs';
import { setupShutdownHandlers } from './src/shutdown.mjs';
import initializeHttpServer from './src/custom/httpServer.mjs';

(async () => {
  try {
    registerExceptionHandlers();
    loadLocales();
    global.commands = await loadAndRegisterCommands();
    global.client = await createAndLoginDiscordClient();
    global.httpServer = await initializeHttpServer();
    setupShutdownHandlers({ client: global.client });
  }
  catch (error) {
    console.error('Failed to initialize:', error);
    process.exit(1);
  }
})();
