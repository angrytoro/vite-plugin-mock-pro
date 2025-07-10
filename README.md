# vite-plugin-mock-pro

[![npm version](https://img.shields.io/npm/v/vite-plugin-mock-pro.svg)](https://www.npmjs.com/package/vite-plugin-mock-pro)
[![license](https://img.shields.io/npm/l/vite-plugin-mock-pro.svg)](https://github.com/<你的用户名>/vite-plugin-mock-pro/blob/main/LICENSE)

一个为 Vite 打造的、功能强大且轻量级的 Mock API 插件。支持热模块更新 (HMR)，用 TypeScript 编写，并提供完整的类型定义。

[English](./README.en.md) | **简体中文**

`vite-plugin-mock-pro` 让你能够将 API Mock 配置分离到单独的文件中，在开发过程中轻松模拟后端接口，而无需真实的后端服务。当你的 mock 文件发生变化时，所有更新都会被即时应用，无需重启 Vite 开发服务器。

## ✨ 特性

-   **⚡️ 极速热更新 (HMR)**：修改 mock 文件后，更改会立即生效，无需刷新页面或重启服务。
-   **📁 文件化管理**：将你的 mock 配置按模块拆分到不同的文件中，保持项目整洁。
-   **🔧 配置简单**：零样板代码，只需在 `vite.config.ts` 中添加几行代码即可启用。
-   **✅ TypeScript 支持**：完全使用 TypeScript 编写，提供一流的类型提示和安全保障。
-   **✍️ 动态响应**：支持使用函数来动态生成 mock 响应数据。
-   **📡 支持 SSE**：轻松模拟 Server-Sent Events，用于测试实时数据推送等长连接场景。
-   **🚀 现代模块化**：作为纯 ESM 包构建，完美适配现代 Node.js 和 Vite 生态。

## 📦 安装

使用你喜欢的包管理器进行安装：

```bash
# npm
npm install vite-plugin-mock-pro --save-dev

# yarn
yarn add vite-plugin-mock-pro --dev

# pnpm
pnpm add vite-plugin-mock-pro -D
```

## 🚀 使用方法

### 步骤 1: 配置 Vite

在你的 `vite.config.ts` 文件中，导入并使用 `viteMockPro()` 插件。

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // 以 React 为例
import { viteMockPro } from 'vite-plugin-mock-pro';

export default defineConfig({
  plugins: [
    react(),
    viteMockPro({
      // 指定存放 mock 文件的目录
      mockDir: 'mock',
    }),
  ],
});
```

### 步骤 2: 创建 Mock 文件

在你的项目根目录下，创建一个 `mock` 文件夹（或你在配置中指定的任何名称）。然后，在其中创建你的 mock 文件，例如 `user.mock.js`。

每一个 mock 文件都应该 `export default` 一个对象，对象的 `key` 是你要 mock 的 API 路径，`value` 则是该接口的配置。

```javascript
// mock/user.mock.js
// 注意：mock 文件需为 .js 结尾

const userMock = {
  // 匹配 /api/user 接口
  '/api/user': {
    // 请求方法为 GET
    method: 'GET',
    // 响应数据可以是一个函数，用于动态生成内容
    response: (req, res) => {
      // req 和 res 分别是 Node.js 的 http.IncomingMessage 和 http.ServerResponse 对象
      // 你可以从 req 中获取查询参数、请求头等信息
      const { query } = req;

      return {
        code: 200,
        message: '成功',
        data: {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: query.role || 'guest', // 可以根据查询参数返回不同数据
        },
      };
    },
  },

  // 匹配 /api/login 接口
  '/api/login': {
    method: 'POST',
    response: {
      // 也可以是一个静态的对象
      code: 200,
      message: '登录成功',
      data: {
        token: '这是一个模拟的token-string-abcdefg123456',
      },
    },
  },
};

export default userMock;
```

### 步骤 3: 运行你的应用

现在，启动你的 Vite 开发服务器：

```bash
npm run dev
```

当你访问 `http://localhost:5173/api/user` 时，你将收到来自 `user.mock.ts` 中定义的模拟响应。如果你修改了任何 `.mock.ts` 文件，这些更改会立即生效，无需任何操作！

### 📈 高级用法：模拟 Server-Sent Events (SSE)

`vite-plugin-mock-pro` 支持通过专用的 SSE 配置模拟长连接（如实时推送、进度等）。你可以在 mock 文件中为某个路径配置 `method: 'SSE'`，并通过 `stream.generator(send, req, res)` 发送事件和管理连接关闭。

**示例：创建 SSE Mock 文件**

```javascript
// mock/sse.mock.js
// 注意：mock 文件需为 .js 结尾

const sseMock = {
  '/api/sse/stream': {
    method: 'SSE',
    stream: {
      generator(send, req, res) {
        let count = 0;
        const timer = setInterval(() => {
          send('message', { count });
          count++;
          if (count > 5) {
            clearInterval(timer);
            res.end(); // 主动关闭 SSE 连接
          }
        }, 1000);
      }
    }
  },
  '/api/sse/custom': {
    method: 'SSE',
    stream: {
      generator(send, req, res) {
        send('custom-event', { foo: 1 });
        setTimeout(() => {
          send('custom-event', { foo: 2 });
          res.end();
        }, 500);
      }
    }
  }
};

export default sseMock;
```

**说明：**
- `send(eventName, data)` 用于发送自定义事件和数据。
- `close()` 用于主动关闭 SSE 连接（如定时器结束、业务完成等）。
- 你无需手动设置响应头或监听 `req.on('close')`，插件会自动处理。

**在前端消费 SSE 数据**

在你的前端代码中，你可以使用 `EventSource` API 来接收来自模拟接口的数据。

```javascript
// 在你的某个 React/Vue 组件中
import { useEffect } from 'react';

function RealTimeLogger() {
  useEffect(() => {
    // 指向你在 mock 文件中定义的 API 路径
    const eventSource = new EventSource('/api/sse/stream');

    // 监听 message 事件
    eventSource.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      console.log('Received SSE data:', data);
    });

    // 监听自定义事件
    eventSource.addEventListener('custom-event', (event) => {
      const data = JSON.parse(event.data);
      console.log('Received custom event:', data);
    });

    // 监听错误事件
    eventSource.onerror = (err) => {
      console.error('EventSource failed:', err);
      eventSource.close();
    };

    // 组件卸载时，关闭连接
    return () => {
      eventSource.close();
    };
  }, []);

  return <div>Check the console for real-time logs...</div>;
}
```

## ⚙️ 配置选项

插件提供了一些选项来自定义其行为。

| 选项      | 类型      | 默认值       | 描述                                                               |
| :-------- | :-------- | :----------- | :----------------------------------------------------------------- |
| `mockDir` | `string`  | `'mock'`     | 存放 mock 配置文件的目录路径，相对于项目根目录。                   |
| `fileSuffix` | `string`  | `'.mock'`    | mock文件的后缀名，插件会查找并加载所有以 `[fileSuffix].js` 结尾的文件（不支持 .ts）。 |

**示例：在生产构建中禁用 Mock**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { viteMockPro } from 'vite-plugin-mock-pro';

export default defineConfig(({ command }) => {
  return {
    plugins: [
      viteMockPro({
        mockDir: 'mock',
        // 仅在开发模式 (serve) 下启用
        enable: command === 'serve',
      }),
    ],
  };
});
```

## 🤝 贡献

欢迎任何形式的贡献！如果你有好的想法或发现了 bug，请随时提出 Issue 或提交 Pull Request。

1.  Fork 本仓库
2.  创建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3.  提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4.  推送到分支 (`git push origin feature/AmazingFeature`)
5.  打开一个 Pull Request

## 📄 许可证

本项目基于 [MIT](./LICENSE) 许可证。