// 用于测试多文件加载
export default {
  '/api/test/profile': {
    method: 'GET',
    response: () => ({ role: 'admin' }),
  },
};
