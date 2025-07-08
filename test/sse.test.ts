import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import connect from 'connect';
import EventSource from 'eventsource';
import { viteMockPlus } from '../src';
import path from 'path';

describe('SSE Mocking', () => {
  let server: http.Server;
  let port: number;

  beforeAll(async () => {
    const app = connect();
    const plugin = viteMockPlus({
      mockDir: path.join(__dirname, 'mocks'),
      logger: false,
    });
    // @ts-ignore
    await plugin.configureServer({
      middlewares: app,
      watcher: { add: () => {}, on: () => {} },
    });

    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        port = (server.address() as any).port;
        resolve();
      });
    });
  });

  afterAll(() => {
    server.close();
  });

  it('should establish SSE connection and receive events', async () => {
    const receivedMessages: any[] = [];
    const es = new EventSource(`http://localhost:${port}/sse/timed`);

    await new Promise<void>((resolve) => {
      es.addEventListener('message', (e) => {
        receivedMessages.push(JSON.parse(e.data));
        if (receivedMessages.length >= 3) {
          es.close();
          resolve();
        }
      });
    });

    expect(receivedMessages).toEqual([
      { count: 0 },
      { count: 1 },
      { count: 2 },
    ]);
  });

  it('should receive custom SSE events', async () => {
    const customEvents: any[] = [];
    const es = new EventSource(`http://localhost:${port}/sse/custom`);

    await new Promise<void>((resolve) => {
      es.addEventListener('custom-event', (e) => {
        customEvents.push(JSON.parse(e.data));
        if (customEvents.length >= 2) {
          es.close();
          resolve();
        }
      });
    });

    expect(customEvents).toEqual([
      { foo: 1 },
      { foo: 2 },
    ]);
  });
});
