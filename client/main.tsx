const bootstrap = async () => {
  await import('./builder/registry');
  await import('./App.tsx');
};

const startMocksIfNeeded = async () => {
  if ((import.meta as any).env?.VITE_MODE !== 'MOCK') {
    return;
  }

  try {
    const { worker, mswStartOptions } = await import('../mocks/msw/browser');
    await worker.start(mswStartOptions as any);
  } catch (error) {
    console.error('[msw] Failed to start mock service worker', error);
  }
};

startMocksIfNeeded().finally(() => {
  bootstrap().catch((error) => {
    console.error('[telecheck] Failed to bootstrap application', error);
  });
});

