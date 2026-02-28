// Stub for node:http — sentinel's server module needs this but we only use the core engine in-browser
export function createServer() {
  throw new Error("node:http is not available in the browser");
}
export default { createServer };
