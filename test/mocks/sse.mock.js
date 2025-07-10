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
  '/sse/custom': {
    method: 'SSE',
    stream: {
      generator: (send) => {
        send('custom-event', { foo: 1 });
        setTimeout(() => send('custom-event', { foo: 2 }), 10);
      },
    },
  },
};
