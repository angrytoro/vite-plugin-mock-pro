// src/loader.ts
import fg from 'fast-glob';
import fs from 'fs';
import type { MockConfig, MockItem } from './types.js';
import { pathToFileURL } from 'url';
import os from 'os';

const isWindows = os.platform() === 'win32';

// 使用 Map 存储，方便快速查找和更新
export const mockStore = new Map<string, MockItem>();

export async function loadMocks(mockDir: string, fileSuffix: string = '.mock'): Promise<void> {
  mockStore.clear();
  // Normalize path for cross-platform compatibility (Windows)
  const abMockDir = isWindows ? fg.convertPathToPattern(mockDir) : mockDir;
  const mockFiles = await fg(`${fg.convertPathToPattern(abMockDir)}/**/*${fileSuffix}.{js,json}`, {
    ignore: ['**/node_modules/**'],
    absolute: true,
  });

  for (const file of mockFiles) {
    let config: MockConfig;
    if (file.endsWith('.json')) {
      config = JSON.parse(fs.readFileSync(file, 'utf-8'));
    } else {
      // For Windows, dynamic import requires a file URL.
      
      const importPath = isWindows ? pathToFileURL(file).href : file;
      // Append timestamp to bypass Node.js import cache
      const module = await import(`${importPath}?t=${Date.now()}`);
      config = module.default;
    }

    for (const url in config) {
      mockStore.set(url, config[url]);
    }
  }
}
