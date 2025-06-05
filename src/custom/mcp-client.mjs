import { Client } from '@modelcontextprotocol/sdk/client';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio';

export async function initializeMcpClient() {
  const client = new Client(
    { name: 'Architect MCP Client', version: '1.0.0' },
    { capabilities: { sampling: {} } }
  );

  const transport = new StdioClientTransport({ command: 'some-external-command' });
  await client.connect(transport);

  console.log('MCP Client initialized');
  return client;
}

// Export default for convenience
export default initializeMcpClient;
