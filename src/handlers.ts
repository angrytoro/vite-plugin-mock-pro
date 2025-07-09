// src/handlers.ts
import type { IncomingMessage, ServerResponse } from 'http';
import type { MockHttpItem, MockSseItem } from './types';
import { sendSseMessage } from './utils';
import { URLSearchParams } from 'url';

// 辅助函数：解析请求体
async function parseBody(req: IncomingMessage): Promise<Record<string, any>> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

// 处理 HTTP 请求
export async function handleHttpRequest(
  item: MockHttpItem,
  req: IncomingMessage,
  res: ServerResponse
) {
  const { response, statusCode = 200, delay = 0, headers } = item;

  const body = await parseBody(req);
  const query = Object.fromEntries(new URLSearchParams(req.url?.split('?')[1] || ''));
  
  const responseData = response({ query, body, params: {} }); // params can be added with more complex routing

  setTimeout(() => {
    res.statusCode = statusCode;
    if (headers) {
      for (const key in headers) {
        res.setHeader(key, headers[key]);
      }
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(responseData));
  }, delay);
}

// 处理 SSE 请求
export function handleSseRequest(
  item: MockSseItem,
  req: IncomingMessage,
  res: ServerResponse
) {
  const { stream } = item;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const send = (event: string, data: any) => {
    sendSseMessage(res, event, data);
  };
  
  stream.generator(send, () => {
    res.end();
  });

  // 当客户端关闭连接时，清理资源
  req.on('close', () => {
    res.end();
  });
}
