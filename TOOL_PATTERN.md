# Custom Tool Pattern for `src/custom/tools/*.mjs`

All custom tools in `src/custom/tools/*.mjs` follow a consistent pattern for defining and registering tools with the server. Here is the general structure and conventions observed:

## 1. Module Export
- Each tool exports a default async function.
- The function signature is:
  ```js
  export default async function (server, toolName = 'tool-name') { ... }
  ```
- `server` is the object used to register the tool.
- `toolName` is an optional override for the tool's name.

## 2. Tool Registration
- The function calls `server.tool(...)` to register the tool.
- The arguments to `server.tool` are:
  1. `toolName`: The name of the tool (string).
  2. Description: A short string describing what the tool does.
  3. Schema: A Zod schema object describing the expected input arguments (or an empty object if no arguments).
  4. Handler: An async function `(args, extra) => { ... }` that implements the tool's logic.

## 3. Handler Logic
- The handler function:
  - Extracts and validates arguments from `args`.
  - Fetches data from the Discord client (guilds, channels, roles, etc.) using `global.client`.
  - Throws descriptive errors if required entities are not found.
  - Gathers and processes the relevant data, often mapping or filtering collections.
  - Returns an object with a `content` array, typically containing a single object:
    ```js
    {
      content: [
        { type: 'text', text: JSON.stringify(result, null, 2) },
      ],
    }
    ```

## 4. Data Returned
- The returned data is always JSON-serialized and placed in the `content` array as a text block.
- The data structure is concise and only includes relevant fields for the tool's purpose.
- For detailed tools, undefined or null fields are filtered out for cleanliness.

## 5. Conventions
- Uses `zod` for argument validation.
- Uses Discord.js collections and methods for data access.
- Handles errors gracefully with descriptive messages.
- Follows a clear, readable, and modular style.

---

## Example architect
```js
import { z } from 'zod';

export default async function (server, toolName = 'tool-name') {
  server.tool(
    toolName,
    'Description of what this tool does.',
    { /* zod schema for args */ },
    async (args, extra) => {
      // Fetch and validate data
      // ...
      // Build result
      return {
        content: [
          { type: 'text', text: JSON.stringify(result, null, 2) },
        ],
      };
    }
  );
}
```

This pattern ensures all tools are consistent, easy to maintain, and integrate smoothly with the server framework.
