export default {
  '/sse/timed': {
    method: 'SSE',
    stream: {
      generator: (send) => {
        let count = 0;
        const timer = setInterval(() => {
          send('message', { count });
          count++;
          if (count > 5) clearInterval(timer);
        }, 100);
      },
    },
  },
};
