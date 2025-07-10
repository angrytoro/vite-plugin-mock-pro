// src/loader.ts
import fg from 'fast-glob';
import fs from 'fs';
import type { MockConfig, MockItem } from './types.js';

// 使用 Map 存储，方便快速查找和更新
export const mockStore = new Map<string, MockItem>();

export async function loadMocks(mockDir: string, fileSuffix: string = '.mock'): Promise<void> {
  mockStore.clear();
  const mockFiles = await fg(`${mockDir}/**/*${fileSuffix}.{js,json}`, {
    ignore: ['**/node_modules/**'],
    absolute: true,
  });

  for (const file of mockFiles) {
    let config: MockConfig;
    if (file.endsWith('.json')) {
      config = JSON.parse(fs.readFileSync(file, 'utf-8'));
    } else {
      // 通过在路径后添加时间戳来绕过 Node.js 的 import 缓存
      const module = await import(`${file}?t=${Date.now()}`);
      config = module.default;
    }

    for (const url in config) {
      mockStore.set(url, config[url]);
    }
  }
}
