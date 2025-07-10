// tests/loader.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import path from 'path';
import { loadMocks, mockStore } from '../src/loader'; // 引入要测试的函数和存储实例
import type { MockHttpItem } from '../src/types'; // 引入 MockItem 类型以便进行类型断言

describe('Mock Loader', () => {

  // 在每个测试用例运行之前，确保 mockStore 是干净的，
  // 这可以防止测试用例之间产生相互影响。
  beforeEach(() => {
    mockStore.clear();
  });

  it('should load mocks from a single file correctly', async () => {
    // 1. 验证初始状态
    expect(mockStore.size).toBe(0);

    // 2. 执行加载操作
    const singleFileDir = path.resolve(__dirname, 'mocks/loader-single');
    await loadMocks(singleFileDir);

    // 3. 断言结果
    expect(mockStore.size).toBe(3); // 确认加载了3个 mock 配置
    expect(mockStore.has('/api/test/user')).toBe(true);
    expect(mockStore.has('/api/test/settings')).toBe(true);

    const userMock = mockStore.get('/api/test/user');
    expect(userMock?.method).toBe('GET');
  });

  it('should load and merge mocks from multiple files', async () => {
    // 1. 验证初始状态
    expect(mockStore.size).toBe(0);

    // 2. 执行加载操作
    const multipleFilesDir = path.resolve(__dirname, 'mocks/loader-multiple');
    await loadMocks(multipleFilesDir);

    // 3. 断言结果
    expect(mockStore.size).toBe(4); // 确认合并了两个文件的配置
    expect(mockStore.has('/api/test/profile')).toBe(true); // 来自 profile.mock.ts
    expect(mockStore.has('/api/test/posts')).toBe(true);   // 来自 posts.mock.ts
  });

  it('should clear old mocks before loading new ones (HMR simulation)', async () => {
    // 场景模拟：
    // 1. 第一次加载，载入一组 mocks
    // 2. 第二次加载（模拟文件变动后的热更新），载入另一组 mocks
    // 3. 验证旧的 mocks 已被移除，只有新的 mocks 存在

    // 第一次加载
    const initialDir = path.resolve(__dirname, 'mocks/loader-single');
    await loadMocks(initialDir);

    // 验证第一次加载成功
    expect(mockStore.has('/api/test/user')).toBe(true);
    expect(mockStore.size).toBe(3);

    // 第二次加载（模拟热更新）
    const reloadDir = path.resolve(__dirname, 'mocks/loader-reload');
    await loadMocks(reloadDir);

    // 验证结果是否符合预期
    expect(mockStore.size).toBe(1); // 新目录只有一个 mock，所以 size 应该是 1
    expect(mockStore.has('/api/test/status')).toBe(true); // 新的 mock 存在
    expect(mockStore.has('/api/test/user')).toBe(false); // 旧的 mock 已经被清除
    expect(mockStore.has('/api/test/settings')).toBe(false); // 旧的 mock 已经被清除
  });

  it('should load mocks from a single JSON file correctly', async () => {
    expect(mockStore.size).toBe(0);

    const singleFileDir = path.resolve(__dirname, 'mocks/loader-single');
    await loadMocks(singleFileDir);

    expect(mockStore.has('/api/test/user-json')).toBe(true);
    const userJsonMock = mockStore.get('/api/test/user-json');
    expect(userJsonMock?.method).toBe('GET');
    expect((userJsonMock as MockHttpItem)?.response).toEqual({ id: 2, name: 'Single User JSON' });
  });

  it('should load and merge mocks from multiple JSON files', async () => {
    expect(mockStore.size).toBe(0);

    const multipleFilesDir = path.resolve(__dirname, 'mocks/loader-multiple');
    await loadMocks(multipleFilesDir);

    expect(mockStore.has('/api/test/profile-json')).toBe(true);
    expect(mockStore.has('/api/test/posts-json')).toBe(true);

    const profileJsonMock = mockStore.get('/api/test/profile-json');
    expect((profileJsonMock as MockHttpItem)?.response).toEqual({ role: 'user' });

    const postsJsonMock = mockStore.get('/api/test/posts-json');
    expect((postsJsonMock as MockHttpItem)?.response).toEqual([{ id: 2, title: 'Post 2' }]);
  });

  // 快照测试（可选，但推荐）
  // 快照测试可以轻松地验证复杂对象的结构是否符合预期。
  it('should match the snapshot of a loaded mock item', async () => {
    const singleFileDir = path.resolve(__dirname, 'mocks/loader-single');
    await loadMocks(singleFileDir);

    const userMock = mockStore.get('/api/test/user');
    // Vitest 会自动在 __snapshots__ 目录下创建一个快照文件。
    // 如果 userMock 的结构发生变化，测试将会失败，提醒你检查变更。
    expect(userMock).toMatchSnapshot();
  });
});
