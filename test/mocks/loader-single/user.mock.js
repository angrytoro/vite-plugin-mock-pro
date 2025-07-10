// 这个文件用于测试加载单个文件的场景
export default {
  '/api/test/user': {
    method: 'GET',
    response: () => ({ id: 1, name: 'Single User' }),
  },
  '/api/test/settings': {
    method: 'POST',
    response: () => ({ success: true }),
  },
};
