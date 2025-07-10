
/** 发送 SSE 消息的函数类型 */
export type SseSender = (event: string, data: string | object) => void;

/** SSE 配置项 */
export interface MockSseStreamOptions {
  /**
   * 事件流生成器。插件会传入一个 `send` 函数，你需要调用它来发送事件。
   * 你需要自己管理何时关闭流（例如通过 clearInterval）。
   * @param send - 用于发送消息的函数 `(eventName, data) => void`
   */
  generator: (send: SseSender, close: () => void) => void;
}

/** HTTP Mock 配置项 */
export interface MockHttpItem {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';
  /**
   * 响应函数，可以根据请求动态返回结果。
   * @param req - Node.js 的 IncomingMessage 对象
   */
  response: Record<string, any> | ((req: {
    query: Record<string, any>;
    body: Record<string, any>;
    params: Record<string, string>;
  }) => any);
  statusCode?: number;
  delay?: number; // 毫秒
  headers?: Record<string, string>;
}

/** SSE Mock 配置项 */
export interface MockSseItem {
  method: 'SSE';
  stream: MockSseStreamOptions;
}

/** 单个 Mock 配置，可以是 HTTP 或 SSE */
export type MockItem = MockHttpItem | MockSseItem;

/** Mock 配置文件导出的格式 */
export type MockConfig = Record<string, MockItem>;

/** 插件配置选项 */
export interface PluginOptions {
  /**
   * Mock 文件所在的目录
   * @default 'mock'
   */
  mockDir?: string;
  /**
   * 是否在控制台打印日志
   * @default true
   */
  logger?: boolean;
  /**
   * mock 文件后缀名，默认为 '.mock'
   * @default '.mock'
   */
  fileSuffix?: string;
}
