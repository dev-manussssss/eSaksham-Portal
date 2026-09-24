import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = '/Users/bhagyaasatimackbook/.gemini/antigravity-ide/brain/92af860a-bfee-43de-b7b1-2ed9a0ecf4df';

// Helper to send CDP command over WebSocket
function createCdpSession(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 1;
    const callbacks = new Map();

    ws.onopen = () => {
      resolve({
        send: (method, params = {}) => {
          return new Promise((res, rej) => {
            const reqId = id++;
            callbacks.set(reqId, { res, rej });
            ws.send(JSON.stringify({ id: reqId, method, params }));
          });
        },
        close: () => ws.close(),
      });
    };

    ws.onerror = reject;

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const { res, rej } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) rej(msg.error);
        else res(msg.result);
      }
    };
  });
}

async function loginApi(email, password = 'Demopass@2026') {
  const res = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

async function run() {
  console.log('Starting headless Chrome for forensic preview capture...');
  const tmpDir = `/tmp/chrome_preview_${Date.now()}`;
  fs.mkdirSync(tmpDir, { recursive: true });

  const chromeProc = spawn(
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    [
      '--headless=new',
      '--remote-debugging-port=9223',
      `--user-data-dir=${tmpDir}`,
      '--disable-gpu',
      '--no-first-run',
      '--window-size=1440,900',
    ],
    { stdio: 'ignore' }
  );

  // Wait for Chrome port
  await new Promise((r) => setTimeout(r, 2000));

  try {
    const versionRes = await fetch('http://127.0.0.1:9223/json/version');
    const versionData = await versionRes.json();
    console.log('Connected to Chrome:', versionData['User-Agent']);

    // Create a new target/page
    const newPageRes = await fetch('http://127.0.0.1:9223/json/new?http://localhost:5173', { method: 'PUT' });
    const pageData = await newPageRes.json();
    const wsUrl = pageData.webSocketDebuggerUrl;

    const cdp = await createCdpSession(wsUrl);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // Capture Landing Page
    console.log('Capturing Landing Page (1440x900)...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise((r) => setTimeout(r, 1500));
    const landingScreenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'preview_landing_1440.png'), Buffer.from(landingScreenshot.data, 'base64'));

    // Mobile landing page (375x667)
    console.log('Capturing Mobile Landing Page (375x667)...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await new Promise((r) => setTimeout(r, 500));
    const mobileLanding = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'preview_landing_375.png'), Buffer.from(mobileLanding.data, 'base64'));

    // Capture Login Page (1440)
    console.log('Capturing Login Page (1440x900)...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/login' });
    await new Promise((r) => setTimeout(r, 1500));
    const loginScreenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'preview_login_1440.png'), Buffer.from(loginScreenshot.data, 'base64'));

    // Capture Mobile Login Page (375)
    console.log('Capturing Mobile Login Page (375x812)...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await new Promise((r) => setTimeout(r, 500));
    const mobileLogin = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'preview_login_375.png'), Buffer.from(mobileLogin.data, 'base64'));

    // Reset to desktop
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // Accounts to test
    const accounts = [
      { name: 'da_bhopal', email: 'da.bhopal@saksham.gov.in', route: '/district-dashboard' },
      { name: 'mp_bhopal', email: 'mp.bhopal@saksham.gov.in', route: '/mp-dashboard' },
      { name: 'ia_pwd', email: 'ia.pwd.bhopal@saksham.gov.in', route: '/dashboard' },
      { name: 'vendor_aarya', email: 'contact@aaryainfra.test', route: '/vendor-dashboard' },
      { name: 'vigilance', email: 'vigilance.central@saksham.gov.in', route: '/investigations' },
    ];

    for (const acc of accounts) {
      console.log(`Testing account: ${acc.email} on ${acc.route}...`);
      const auth = await loginApi(acc.email);
      if (!auth.success) {
        console.error(`Login failed for ${acc.email}:`, auth.error);
        continue;
      }

      // Inject token and session into localStorage
      const injectScript = `
        localStorage.setItem('saksham_auth_token', ${JSON.stringify(auth.token)});
        localStorage.setItem('saksham_auth_session', JSON.stringify(${JSON.stringify(auth.user)}));
        window.location.href = 'http://localhost:5173${acc.route}';
      `;
      await cdp.send('Runtime.evaluate', { expression: injectScript });

      // Wait for page to render and data to load
      await new Promise((r) => setTimeout(r, 3000));

      const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
      const filename = `preview_${acc.name}_dashboard.png`;
      fs.writeFileSync(path.join(ARTIFACTS_DIR, filename), Buffer.from(screenshot.data, 'base64'));
      console.log(`✓ Saved ${filename}`);

      // Also capture mobile version of dashboard
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: 375,
        height: 812,
        deviceScaleFactor: 2,
        mobile: true,
      });
      await new Promise((r) => setTimeout(r, 500));
      const mobileScreenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
      const mobileFilename = `preview_${acc.name}_mobile.png`;
      fs.writeFileSync(path.join(ARTIFACTS_DIR, mobileFilename), Buffer.from(mobileScreenshot.data, 'base64'));
      console.log(`✓ Saved ${mobileFilename}`);

      // Reset to desktop
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: 1440,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
      });
    }

    // Capture Tenders page
    console.log('Capturing Tenders page...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/tenders' });
    await new Promise((r) => setTimeout(r, 3000));
    const tendersScreenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'preview_tenders.png'), Buffer.from(tendersScreenshot.data, 'base64'));

    // Capture Vendors page
    console.log('Capturing Vendors page...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/vendors' });
    await new Promise((r) => setTimeout(r, 3000));
    const vendorsScreenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'preview_vendors.png'), Buffer.from(vendorsScreenshot.data, 'base64'));

    // Capture Projects page
    console.log('Capturing Projects page...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/projects' });
    await new Promise((r) => setTimeout(r, 3000));
    const projectsScreenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'preview_projects.png'), Buffer.from(projectsScreenshot.data, 'base64'));

    // Capture Dedicated Procurement Dashboard
    console.log('Capturing Dedicated Procurement Dashboard...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/procurement-dashboard' });
    await new Promise((r) => setTimeout(r, 3000));
    const procDashScreenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'preview_procurement_dashboard.png'), Buffer.from(procDashScreenshot.data, 'base64'));

    // Capture Tender Detail Page (TND-001 with Comparative Statement)
    console.log('Capturing Tender Detail page (TND-001)...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/tenders/TND-001' });
    await new Promise((r) => setTimeout(r, 3000));
    const tenderDetailScreenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'preview_tender_detail.png'), Buffer.from(tenderDetailScreenshot.data, 'base64'));

    console.log('All forensic previews captured successfully!');
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

run().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
