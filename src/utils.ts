// src/utils.ts
import type { ServerResponse } from 'http';

export const log = (message: string) => console.log(`[vite-plugin-mock-plus] ${message}`);

/**
 * 格式化并发送 SSE 消息
 * @param res - ServerResponse 对象
 * @param event - 事件名称
 * @param data - 要发送的数据
 */
export const sendSseMessage: (res: ServerResponse, event: string, data: string | object) => void = (res, event, data) => {
  const message = typeof data === 'string' ? data : JSON.stringify(data);
  res.write(`event: ${event}\n`);
  res.write(`data: ${message}\n\n`);
};
