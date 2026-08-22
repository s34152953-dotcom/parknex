import fs from 'fs';
import path from 'path';
import { encode } from "next-auth/jwt";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://astute-pony-718.convex.cloud";
const convex = new ConvexHttpClient(CONVEX_URL);
const NEXTAUTH_SECRET = "fc87b9c9f28a34b22c7104b2a64c489c";
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

async function captureEmptyState() {
  console.log('=== CAPTURING EMPTY STATE ===');

  const emptyUserEmail = "riya.sen@parknex.io";
  const emptyPlate = "MH-02-ZZ-0001";

  await convex.mutation(api.users.upsertUser, {
    email: emptyUserEmail,
    name: "Riya Sen",
    vehicleNumber: emptyPlate,
  });

  const sessionToken = await encode({
    token: { name: "Riya Sen", email: emptyUserEmail, sub: "user-riya-1" },
    secret: NEXTAUTH_SECRET,
  });

  const wsUrl = await getWsUrl();
  const cdp = new CDPClient(wsUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');

  await cdp.send('Network.setCookie', {
    name: 'next-auth.session-token',
    value: sessionToken,
    domain: 'localhost',
    path: '/',
    httpOnly: true,
  });

  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await cdp.send('Page.navigate', { url: 'http://localhost:3001/customer/dashboard' });
  await new Promise((r) => setTimeout(r, 1500));

  const ss = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'dashboard_empty_state_1280px.png'), Buffer.from(ss.data, 'base64'));
  console.log('Saved dashboard_empty_state_1280px.png');

  await cdp.close();
}

captureEmptyState().catch(console.error);
