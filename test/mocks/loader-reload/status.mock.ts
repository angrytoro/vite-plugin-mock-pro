// 用于测试重新加载时是否会清空旧数据
export default {
  '/api/test/status': {
    method: 'GET',
    response: () => ({ status: 'OK' }),
  },
};
