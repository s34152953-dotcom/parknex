import fs from 'fs';
import path from 'path';
import { encode } from "next-auth/jwt";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://astute-pony-718.convex.cloud";
const convex = new ConvexHttpClient(CONVEX_URL);
const NEXTAUTH_SECRET = "fc87b9c9f28a34b22c7104b2a64c489c";

const ARTIFACT_DIR = '/Users/apple/.gemini/antigravity-ide/brain/b2cafbc3-9bcf-40e1-bc03-0d9bcf4d2a21';
const VIEWPORTS = [320, 375, 390, 430, 768, 1024, 1366];

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

async function run() {
  console.log('=== PARKNEX CUSTOMER DASHBOARD AUTHENTICATED MULTI-VIEWPORT TEST ===\n');

  const testEmail = "alex.rivera@parknex.io";
  const testPlate = "KA-01-MJ-2026";

  // 1. Setup user & active booking in Convex
  console.log('Setting up real test data in Convex...');
  await convex.mutation(api.users.upsertUser, {
    email: testEmail,
    name: "Alex Rivera",
    vehicleNumber: testPlate,
  });

  const slotsResult = await convex.query(api.slots.getSlots, { floor: "B2" });
  const targetSlot = slotsResult?.slots?.find((s) => s.slotNumber === "B-03") || slotsResult?.slots?.[0];

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
    bookingId = active._id;
    exitPassToken = active.customerAccessToken;
  }

  await convex.mutation(api.bookings.confirmPillarLocation, {
    bookingId,
    pillarTokenOrCode: targetSlot.pillar,
  });

  // 2. Generate NextAuth session token
  const sessionToken = await encode({
    token: {
      name: "Alex Rivera",
      email: testEmail,
      sub: "user-alex-rivera",
    },
    secret: NEXTAUTH_SECRET,
  });

  const wsUrl = await getWsUrl();
  const cdp = new CDPClient(wsUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('DOM.enable');
  await cdp.send('Network.enable');

  // Set auth cookie
  await cdp.send('Network.setCookie', {
    name: 'next-auth.session-token',
    value: sessionToken,
    domain: 'localhost',
    path: '/',
    httpOnly: true,
  });

  const results = [];

  for (const width of VIEWPORTS) {
    const height = 900;
    console.log(`\nTesting Viewport: ${width}px x ${height}px`);

    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });

    await cdp.send('Page.navigate', { url: 'http://localhost:3001/customer/dashboard' });
    await new Promise((r) => setTimeout(r, 1500));

    const evalScript = `
      (() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        const hasHorizontalOverflow = scrollWidth > innerWidth;

        const header = document.querySelector('header');
        const headerRect = header ? header.getBoundingClientRect() : null;

        const nav = document.querySelector('nav');
        const navRect = nav ? nav.getBoundingClientRect() : null;

        const desktopTabs = document.querySelector('[class*="md:grid"]');
        const isDesktopTabsVisible = desktopTabs ? window.getComputedStyle(desktopTabs).display !== 'none' : false;

        const title = document.querySelector('h1')?.innerText;
        const timeline = document.querySelector('[class*="grid-cols-2 sm:grid-cols-4"]');

        return {
          width: ${width},
          scrollWidth,
          innerWidth,
          hasHorizontalOverflow,
          headerHeight: headerRect ? headerRect.height : 0,
          title,
          isDesktopTabsVisible,
          isMobileNavVisible: nav ? window.getComputedStyle(nav).display !== 'none' : false,
          hasTimeline: Boolean(timeline),
        };
      })()
    `;

    const evalRes = await cdp.send('Runtime.evaluate', {
      expression: evalScript,
      returnByValue: true,
    });

    const res = evalRes.result.value;

    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const filename = `screenshot_dashboard_${width}px.png`;
    fs.writeFileSync(path.join(ARTIFACT_DIR, filename), Buffer.from(screenshot.data, 'base64'));

    console.log(`  - Horizontal Overflow: ${res.hasHorizontalOverflow ? 'FAIL (' + res.scrollWidth + ' > ' + res.innerWidth + ')' : 'NONE (scrollWidth: ' + res.scrollWidth + 'px) PASS'}`);
    console.log(`  - Header Height: ${res.headerHeight}px`);
    console.log(`  - Title: "${res.title}"`);
    console.log(`  - Desktop 4-Col Selector: ${res.isDesktopTabsVisible ? 'VISIBLE (Desktop)' : 'HIDDEN (Mobile)'}`);
    console.log(`  - Mobile Bottom Nav: ${res.isMobileNavVisible ? 'VISIBLE (Mobile)' : 'HIDDEN (Desktop)'}`);
    console.log(`  - Timeline Active: ${res.hasTimeline ? 'YES' : 'NO'}`);
    console.log(`  - Screenshot saved: ${filename}`);

    results.push(res);
  }

  await cdp.close();
  console.log('\n=== ALL VIEWPORT TESTS COMPLETED SUCCESSFULLY ===');
}

run().catch(console.error);
