export default {
  '/api/http/get': {
    method: 'GET',
    response: () => ({ id: 1, name: 'GET' }),
  },
  '/api/http/post': {
    method: 'POST',
    statusCode: 201,
    response: ({ body }) => ({ received: body }),
  },
  '/api/http/delay': {
    delay: 300,
    response: () => ({ ok: true }),
  },
};
