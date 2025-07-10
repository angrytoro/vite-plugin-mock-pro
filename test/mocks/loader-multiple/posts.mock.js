// 用于测试多文件加载
export default {
  '/api/test/posts': {
    method: 'GET',
    response: () => [{ id: 1, title: 'Post 1' }],
  },
};
