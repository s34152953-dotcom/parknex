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

async function captureTabs() {
  console.log('=== CAPTURING INDIVIDUAL TABS IN ACTION ===');

  const testEmail = "vikram.malhotra@parknex.io";
  const testPlate = "KA-05-EX-9900";

  await convex.mutation(api.users.upsertUser, {
    email: testEmail,
    name: "Vikram Malhotra",
    vehicleNumber: testPlate,
  });

  const slotsResult = await convex.query(api.slots.getSlots, { floor: "B2" });
  const availableSlots = (slotsResult?.slots || []).filter(s => s.status === "available");
  const targetSlot = availableSlots[0] || slotsResult?.slots?.[0];

  let bookingId;
  let exitPassToken;
  try {
    const bookingRes = await convex.mutation(api.bookings.createBooking, {
      slotId: targetSlot.slotId,
      vehicleNumber: testPlate,
      phoneNumber: "+919876543210",
      mallName: "Central Mall Grand",
    });
    bookingId = bookingRes.bookingId;
    exitPassToken = bookingRes.exitPassToken;
  } catch (e) {
    const active = await convex.query(api.bookings.getActiveBookingByVehicle, { vehicleNumber: testPlate });
    if (active) {
      bookingId = active._id;
      exitPassToken = active.customerAccessToken;
    }
  }

  // Pillar confirmed
  await convex.mutation(api.bookings.confirmPillarLocation, {
    bookingId,
    pillarTokenOrCode: targetSlot.pillar,
  });

  const sessionToken = await encode({
    token: { name: "Vikram Malhotra", email: testEmail, sub: "user-vikram-1" },
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
  await new Promise((r) => setTimeout(r, 2000));

  // 1. Tab 1: Find My Car
  let ss = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'tab_find_my_car_1280px.png'), Buffer.from(ss.data, 'base64'));
  console.log('Saved tab_find_my_car_1280px.png');

  // 2. Tab 2: Scan QR
  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('Scan QR'));
      if (btn) btn.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 600));
  ss = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'tab_scan_qr_1280px.png'), Buffer.from(ss.data, 'base64'));
  console.log('Saved tab_scan_qr_1280px.png');

  // 3. Tab 3: History
  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('History'));
      if (btn) btn.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 600));
  ss = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'tab_history_1280px.png'), Buffer.from(ss.data, 'base64'));
  console.log('Saved tab_history_1280px.png');

  // 4. Tab 4: Exit Pass
  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('Exit Pass'));
      if (btn) btn.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 600));
  ss = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'tab_exit_pass_1280px.png'), Buffer.from(ss.data, 'base64'));
  console.log('Saved tab_exit_pass_1280px.png');

  // 5. Customer Assistance Modal
  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('Report a Problem'));
      if (btn) btn.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 600));
  ss = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'modal_assistance_1280px.png'), Buffer.from(ss.data, 'base64'));
  console.log('Saved modal_assistance_1280px.png');

  await cdp.close();
}

captureTabs().catch(console.error);
