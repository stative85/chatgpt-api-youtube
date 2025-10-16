const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

export function createTimer() {
  const started = now();
  return {
    stop() {
      return Math.round(now() - started);
    }
  };
}

export function formatLatency(value: number) {
  const ms = Math.max(0, value);
  if (ms < 1000) {
    return `${ms}ms`;
  }
  const seconds = ms / 1000;
  return `${seconds.toFixed(1)}s`;
}
