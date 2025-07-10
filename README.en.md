# vite-plugin-mock-pro

[![npm version](https://img.shields.io/npm/v/vite-plugin-mock-pro.svg)](https://www.npmjs.com/package/vite-plugin-mock-pro)
[![license](https://img.shields.io/npm/l/vite-plugin-mock-pro.svg)](https://github.com/<your-username>/vite-plugin-mock-pro/blob/main/LICENSE)

A powerful and lightweight Mock API plugin for Vite. Supports Hot Module Replacement (HMR), written in TypeScript, and provides complete type definitions.

[简体中文](./README.md) | **English**

`vite-plugin-mock-pro` allows you to separate API mock configurations into individual files, making it easy to simulate backend APIs during development without a real backend service. When your mock files change, all updates are applied instantly without restarting the Vite dev server.

## ✨ Features

-   **⚡️ Instant HMR**: Changes to mock files take effect immediately, no need to refresh or restart.
-   **📁 Modular File Management**: Organize your mock configs in separate files for a clean project structure.
-   **🔧 Simple Configuration**: Zero boilerplate, just a few lines in `vite.config.ts` to enable.
-   **✅ TypeScript Support**: Written in TypeScript with first-class type safety and hints.
-   **✍️ Dynamic Responses**: Support for functions to generate dynamic mock responses.
-   **📡 SSE Support**: Easily mock Server-Sent Events for real-time data push scenarios.
-   **🚀 Modern ESM**: Built as a pure ESM package, perfectly compatible with modern Node.js and Vite.

## 📦 Installation

Use your favorite package manager:

```bash
# npm
npm install vite-plugin-mock-pro --save-dev

# yarn
yarn add vite-plugin-mock-pro --dev

# pnpm
pnpm add vite-plugin-mock-pro -D
```

## 🚀 Usage

### Step 1: Configure Vite

In your `vite.config.ts`, import and use `viteMockPro()`.

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Example: React
import { viteMockPro } from 'vite-plugin-mock-pro';

export default defineConfig({
  plugins: [
    react(),
    viteMockPro({
      // Directory for mock files
      mockDir: 'mock',
    }),
  ],
});
```

### Step 2: Create Mock Files

Create a `mock` folder in your project root (or any directory you specify in the config). Then create your mock files inside, e.g., `user.mock.js`.

> **Note:** Mock files must use the `.js` extension.

Each mock file should `export default` an object. The object's key is the API path, and the value is the config for that endpoint.

```javascript
// mock/user.mock.js
// Note: mock files must use .js extension

const userMock = {
  // Match /api/user endpoint
  '/api/user': {
    // HTTP method
    method: 'GET',
    // Response can be a function for dynamic data
    response: (req, res) => {
      // req and res are Node.js http.IncomingMessage and http.ServerResponse
      // You can access query params, headers, etc. from req
      const { query } = req;

      return {
        code: 200,
        message: 'Success',
        data: {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: query.role || 'guest', // Return different data based on query
        },
      };
    },
  },

  // Match /api/login endpoint
  '/api/login': {
    method: 'POST',
    response: {
      // Can also be a static object
      code: 200,
      message: 'Login successful',
      data: {
        token: 'mocked-token-string-abcdefg123456',
      },
    },
  },
};

export default userMock;
```

### Step 3: Run Your App

Start your Vite dev server:

```bash
npm run dev
```

When you visit `http://localhost:5173/api/user`, you'll get the mock response defined in `user.mock.ts`. Any changes to `.mock.ts` files take effect instantly—no manual reload needed!

### 📈 Advanced: Mocking Server-Sent Events (SSE)

`vite-plugin-mock-pro` supports dedicated SSE config for simulating long-lived connections (e.g., real-time push, progress). In your mock file, set `method: 'SSE'` for a path and use `stream.generator(send, close)` to send events and manage connection closure.

**Example: Create an SSE Mock File**

```javascript
// mock/sse.mock.js
// Note: mock files must use .js extension

const sseMock = {
  '/api/sse/stream': {
    method: 'SSE',
    stream: {
      generator(send, close) {
        let count = 0;
        const timer = setInterval(() => {
          send('message', { count });
          count++;
          if (count > 5) {
            clearInterval(timer);
            close(); // Actively close the SSE connection
          }
        }, 1000);
      }
    }
  },
  '/api/sse/custom': {
    method: 'SSE',
    stream: {
      generator(send, close) {
        send('custom-event', { foo: 1 });
        setTimeout(() => {
          send('custom-event', { foo: 2 });
          close();
        }, 500);
      }
    }
  }
};

export default sseMock;
```

**Notes:**
- `send(eventName, data)` sends custom events and data.
- `close()` actively closes the SSE connection (e.g., when finished).
- You do **not** need to manually set response headers or listen for `req.on('close')`—the plugin handles it.

**Consuming SSE Data in Frontend**

Use the `EventSource` API in your frontend to receive data from the mock endpoint.

```javascript
// In your React/Vue component
import { useEffect } from 'react';

function RealTimeLogger() {
  useEffect(() => {
    // Point to the API path defined in your mock file
    const eventSource = new EventSource('/api/sse/stream');

    // Listen for message events
    eventSource.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      console.log('Received SSE data:', data);
    });

    // Listen for custom events
    eventSource.addEventListener('custom-event', (event) => {
      const data = JSON.parse(event.data);
      console.log('Received custom event:', data);
    });

    // Listen for errors
    eventSource.onerror = (err) => {
      console.error('EventSource failed:', err);
      eventSource.close();
    };

    // Clean up on component unmount
    return () => {
      eventSource.close();
    };
  }, []);

  return <div>Check the console for real-time logs...</div>;
}
```

## ⚙️ Plugin Options

The plugin provides several options for customization.

| Option        | Type      | Default     | Description                                                                 |
| :------------ | :-------- | :---------- | :-------------------------------------------------------------------------- |
| `mockDir`     | `string`  | `'mock'`    | Directory for mock config files, relative to project root.                  |
| `fileSuffix`  | `string`  | `'.mock'`   | Suffix for mock files. The plugin loads all files ending with `[fileSuffix].js` (TypeScript `.ts` is not supported).  |

**Example: Disable Mock in Production**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { viteMockPro } from 'vite-plugin-mock-pro';

export default defineConfig(({ command }) => {
  return {
    plugins: [
      viteMockPro({
        mockDir: 'mock',
        // Only enable in dev mode
        enable: command === 'serve',
      }),
    ],
  };
});
```

## 🤝 Contributing

All contributions are welcome! If you have ideas or find bugs, feel free to open an Issue or Pull Request.

1.  Fork this repo
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the [MIT](./LICENSE) License.
