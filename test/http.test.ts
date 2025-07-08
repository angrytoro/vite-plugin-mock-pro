import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import connect from 'connect';
import { viteMockPlus } from '../src';
import path from 'path';

describe('HTTP Mocking', () => {
  const app = connect();

  beforeAll(async () => {
    const plugin = viteMockPlus({
      mockDir: path.join(__dirname, 'mocks'),
      logger: false,
    });
    // @ts-ignore
    await plugin.configureServer({
      middlewares: app,
      watcher: { add: () => {}, on: () => {} },
    });
  });

  it('should mock GET request correctly', async () => {
    const res = await request(app).get('/api/http/get');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, name: 'GET' });
  });

  it('should mock POST request with dynamic response', async () => {
    const res = await request(app)
      .post('/api/http/post')
      .send({ data: 'test' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ received: { data: 'test' } });
  });

  it('should handle delay correctly', async () => {
    const startTime = Date.now();
    await request(app).get('/api/http/delay');
    const endTime = Date.now();
    expect(endTime - startTime).toBeGreaterThanOrEqual(300);
  });

  it('should return 404 for unmatched paths', async () => {
    const res = await request(app).get('/api/not-found');
    expect(res.status).toBe(404);
  });
});
