import { encode } from "next-auth/jwt";

async function getWsUrl() {
  const res = await fetch('http://127.0.0.1:9222/json/new', { method: 'PUT' });
  const target = await res.json();
  return target.webSocketDebuggerUrl;
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.callbacks = new Map();
  }
  async connect() {
    return new Promise((resolve, reject) => {
      this.ws.addEventListener('open', () => resolve());
      this.ws.addEventListener('error', (err) => reject(err));
      this.ws.addEventListener('message', (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      });
    });
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async close() {
    this.ws.close();
  }
}

async function findOverflows() {
  const wsUrl = await getWsUrl();
  const cdp = new CDPClient(wsUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');

  const sessionToken = await encode({
    token: { name: "Alex Rivera", email: "alex.rivera@parknex.io", sub: "user-123" },
    secret: "fc87b9c9f28a34b22c7104b2a64c489c",
  });

  await cdp.send('Network.setCookie', {
    name: 'next-auth.session-token',
    value: sessionToken,
    domain: 'localhost',
    path: '/',
    httpOnly: true,
  });

  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 320,
    height: 900,
    deviceScaleFactor: 1,
    mobile: true,
  });

  await cdp.send('Page.navigate', { url: 'http://localhost:3001/customer/dashboard' });
  await new Promise((r) => setTimeout(r, 1200));

  const checkScript = `
    (() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const overflowing = [];
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.right > 320 || rect.width > 320) {
          overflowing.push({
            tag: el.tagName,
            id: el.id,
            className: el.className ? String(el.className).slice(0, 50) : '',
            width: rect.width,
            right: rect.right,
            text: (el.innerText || '').slice(0, 30).trim()
          });
        }
      }
      return overflowing.slice(0, 15);
    })()
  `;

  const res = await cdp.send('Runtime.evaluate', { expression: checkScript, returnByValue: true });
  console.log("Overflowing elements on 320px:", JSON.stringify(res.result.value, null, 2));

  await cdp.close();
}

findOverflows().catch(console.error);
