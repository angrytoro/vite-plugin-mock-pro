// src/index.ts
import type { Plugin, ViteDevServer } from 'vite';
import type { PluginOptions } from './types';
import { mockStore, loadMocks } from './loader';
import { handleHttpRequest, handleSseRequest } from './handlers';
import { log } from './utils';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';

export function viteMockPro(options: PluginOptions = {}): Plugin {
  const { mockDir = 'mock', logger = true, fileSuffix = '.mock' } = options;
  const resolvedMockDir = path.resolve(process.cwd(), mockDir);

  return {
    name: 'vite-plugin-mock-plus',
    
    // 核心：注入中间件到 Vite 开发服务器
    async configureServer(server: ViteDevServer) {
      // 1. 启动时加载 mocks
      await loadMocks(resolvedMockDir, fileSuffix);
      if (logger) {
        log('Mock files loaded.');
      }

      // 2. 设置 HMR (热更新)
      server.watcher.add(resolvedMockDir); // resolvedMockDir 已为 string
      server.watcher.on('all', async (_event, file) => {
        if (file && file.startsWith(resolvedMockDir)) {
          if (logger) {
            log(`Mock file changed: ${path.basename(file)}, reloading...`);
          }
          await loadMocks(resolvedMockDir, fileSuffix);
          if (logger) {
            log('Mocks reloaded successfully.');
          }
        }
      });
      
      // 3. 中间件逻辑
      const middleware = (
        req: IncomingMessage & { url?: string; method?: string },
        res: ServerResponse,
        next: () => void
      ) => {
        const url = req.url?.split('?')[0];
        if (!url) return next();

        const mockItem = mockStore.get(url);
        if (!mockItem) return next();

        const reqMethod = req.method?.toUpperCase();

        if (mockItem.method === 'SSE' && reqMethod === 'GET') {
          if (logger) log(`[SSE] Matched: ${url}`);
          handleSseRequest(mockItem, req, res);
        } else if (
          mockItem.method !== 'SSE' &&
          (mockItem.method === reqMethod || !mockItem.method) // 如果没指定 method，则匹配所有 HTTP 方法
        ) {
          if (logger) log(`[HTTP] Matched: ${reqMethod} ${url}`);
          handleHttpRequest(mockItem, req, res);
        } else {
          // 方法不匹配
          return next();
        }
      };

      server.middlewares.use(middleware);
    },
  };
}

export default viteMockPro;
