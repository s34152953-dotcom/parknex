import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = '/Users/apple/.gemini/antigravity-ide/brain/b2cafbc3-9bcf-40e1-bc03-0d9bcf4d2a21';

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
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async close() {
    this.ws.close();
  }
}

async function capture() {
  const viewports = [
    { name: '375px', width: 375, height: 667, mobile: true },
    { name: '768px', width: 768, height: 1024, mobile: false },
    { name: '1280px', width: 1280, height: 800, mobile: false },
  ];

  for (const vp of viewports) {
    const wsUrl = await getWsUrl();
    const cdp = new CDPClient(wsUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 2,
      mobile: vp.mobile,
    });

    await cdp.send('Page.navigate', { url: 'http://localhost:3004/admin/new-entry' });
    await new Promise((r) => setTimeout(r, 1200));

    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(ARTIFACT_DIR, `vehicle_verification_entry_${vp.name}.png`);
    fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
    console.log(`Saved screenshot to ${filePath}`);

    await cdp.close();
  }
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
