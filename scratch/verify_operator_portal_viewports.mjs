import http from "http";
import fs from "fs";

const CDP_PORT = 9222;
const BASE_URL = "http://localhost:3002";
const ARTIFACT_DIR = "/Users/apple/.gemini/antigravity-ide/brain/b2cafbc3-9bcf-40e1-bc03-0d9bcf4d2a21";

function cdpRequest(path, postData = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "127.0.0.1",
      port: CDP_PORT,
      path,
      method: postData ? "POST" : "GET",
      headers: postData ? { "Content-Type": "application/json" } : {},
    };
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });
    req.on("error", reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

function sendWsMessage(wsUrl, method, params = {}) {
  return new Promise((resolve, reject) => {
    import("ws").then(({ WebSocket }) => {
      const ws = new WebSocket(wsUrl);
      let id = 1;
      ws.on("open", () => {
        ws.send(JSON.stringify({ id: id++, method, params }));
      });
      ws.on("message", (msg) => {
        const parsed = JSON.parse(msg.toString());
        if (parsed.id === 1) {
          ws.close();
          if (parsed.error) reject(parsed.error);
          else resolve(parsed.result);
        }
      });
      ws.on("error", reject);
    });
  });
}

async function runCdpCommand(wsUrl, commands) {
  const { WebSocket } = await import("ws");
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let idCounter = 1;
    const callbacks = new Map();

    ws.on("open", async () => {
      for (const cmd of commands) {
        const currentId = idCounter++;
        await new Promise((resCmd, rejCmd) => {
          callbacks.set(currentId, { resolve: resCmd, reject: rejCmd });
          ws.send(JSON.stringify({ id: currentId, method: cmd.method, params: cmd.params || {} }));
        });
      }
      ws.close();
      resolve();
    });

    ws.on("message", (msg) => {
      const parsed = JSON.parse(msg.toString());
      if (callbacks.has(parsed.id)) {
        const { resolve, reject } = callbacks.get(parsed.id);
        callbacks.delete(parsed.id);
        if (parsed.error) reject(parsed.error);
        else resolve(parsed.result);
      }
    });

    ws.on("error", reject);
  });
}

async function testViewport(wsUrl, width, height, route = "/admin/booking", screenshotName = null) {
  const { WebSocket } = await import("ws");
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 1;

    function send(method, params = {}) {
      return new Promise((res, rej) => {
        const curId = id++;
        const handler = (data) => {
          const parsed = JSON.parse(data.toString());
          if (parsed.id === curId) {
            ws.off("message", handler);
            if (parsed.error) rej(parsed.error);
            else res(parsed.result);
          }
        };
        ws.on("message", handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    ws.on("open", async () => {
      try {
        await send("Page.enable");
        await send("Emulation.setDeviceMetricsOverride", {
          width,
          height,
          deviceScaleFactor: 2,
          mobile: width < 768,
        });

        await send("Page.navigate", { url: `${BASE_URL}${route}` });
        await new Promise((r) => setTimeout(r, 1200));

        // Evaluate layout metrics
        const evalRes = await send("Runtime.evaluate", {
          expression: `({
            innerWidth: window.innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            bodyScrollWidth: document.body.scrollWidth,
            title: document.title
          })`,
          returnByValue: true,
        });

        const metrics = evalRes.result?.value;

        if (screenshotName) {
          const ssRes = await send("Page.captureScreenshot", { format: "png" });
          if (ssRes.data) {
            fs.writeFileSync(`${ARTIFACT_DIR}/${screenshotName}`, Buffer.from(ssRes.data, "base64"));
          }
        }

        ws.close();
        resolve(metrics);
      } catch (err) {
        ws.close();
        reject(err);
      }
    });

    ws.on("error", reject);
  });
}

async function main() {
  console.log("=== VERIFYING OPERATOR PORTAL MULTI-VIEWPORT MATRIX ===");

  const targets = await cdpRequest("/json");
  const pageTarget = targets.find((t) => t.type === "page");
  if (!pageTarget) {
    console.error("No active Chrome page target found.");
    process.exit(1);
  }

  const wsUrl = pageTarget.webSocketDebuggerUrl;

  const viewports = [
    { w: 320, h: 640, label: "320px Ultra-Mobile" },
    { w: 375, h: 667, label: "375px iPhone SE" },
    { w: 390, h: 844, label: "390px iPhone 14 Pro" },
    { w: 768, h: 1024, label: "768px iPad Portrait" },
    { w: 1024, h: 768, label: "1024px Laptop/Tablet Landscape" },
    { w: 1366, h: 768, label: "1366px Desktop HD" },
  ];

  const results = [];

  for (const vp of viewports) {
    const screenshotName = `operator_dashboard_${vp.w}px.png`;
    const res = await testViewport(wsUrl, vp.w, vp.h, "/admin/booking", screenshotName);
    const overflow = res.scrollWidth - res.innerWidth;
    const pass = overflow <= 0;

    results.push({
      viewport: vp.label,
      width: vp.w,
      scrollWidth: res.scrollWidth,
      overflow: `${overflow}px`,
      status: pass ? "PASS" : "FAIL",
    });

    console.log(`[${vp.label}] width=${vp.w}px, scrollWidth=${res.scrollWidth}px -> Overflow: ${overflow}px [${pass ? "PASS" : "FAIL"}]`);
  }

  // Capture individual views on Desktop (1280x800)
  console.log("\nCapturing dedicated views for Operator Portal modules...");
  await testViewport(wsUrl, 1280, 800, "/admin/booking", "view_live_map_1280px.png");
  console.log("  - Saved view_live_map_1280px.png");

  await testViewport(wsUrl, 1280, 800, "/admin/new-entry", "view_new_entry_1280px.png");
  console.log("  - Saved view_new_entry_1280px.png");

  await testViewport(wsUrl, 1280, 800, "/admin/scan-exit", "view_scan_exit_1280px.png");
  console.log("  - Saved view_scan_exit_1280px.png");

  await testViewport(wsUrl, 1280, 800, "/admin/active-sessions", "view_active_sessions_1280px.png");
  console.log("  - Saved view_active_sessions_1280px.png");

  await testViewport(wsUrl, 1280, 800, "/admin/customer-issues", "view_customer_issues_1280px.png");
  console.log("  - Saved view_customer_issues_1280px.png");

  await testViewport(wsUrl, 1280, 800, "/admin/history", "view_history_1280px.png");
  console.log("  - Saved view_history_1280px.png");

  await testViewport(wsUrl, 1280, 800, "/admin/settings", "view_settings_1280px.png");
  console.log("  - Saved view_settings_1280px.png");

  console.log("\n=== MULTI-VIEWPORT VERIFICATION SUMMARY ===");
  console.table(results);
}

main().catch(console.error);
