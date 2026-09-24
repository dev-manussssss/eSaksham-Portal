import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = '/Users/bhagyaasatimackbook/.gemini/antigravity-ide/brain/92af860a-bfee-43de-b7b1-2ed9a0ecf4df';

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
  console.log('Capturing remaining screen previews in one go...');
  const tmpDir = `/tmp/chrome_all_remaining_${Date.now()}`;
  fs.mkdirSync(tmpDir, { recursive: true });

  const chromeProc = spawn(
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    [
      '--headless=new',
      '--remote-debugging-port=9226',
      `--user-data-dir=${tmpDir}`,
      '--window-size=1440,900',
      '--disable-gpu',
      '--no-first-run'
    ],
    { stdio: 'ignore' }
  );

  await new Promise((r) => setTimeout(r, 2000));

  try {
    const newPageRes = await fetch('http://127.0.0.1:9226/json/new?http://localhost:5173', { method: 'PUT' });
    const pageData = await newPageRes.json();
    const cdp = await createCdpSession(pageData.webSocketDebuggerUrl);

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // 1. Login as District Authority to capture DA workflow pages
    const daAuth = await loginApi('da.bhopal@saksham.gov.in');
    const setDaSession = `
      localStorage.setItem('saksham_auth_token', ${JSON.stringify(daAuth.token)});
      localStorage.setItem('saksham_auth_session', JSON.stringify(${JSON.stringify(daAuth.user)}));
    `;
    await cdp.send('Runtime.evaluate', { expression: setDaSession });

    const routes = [
      { name: 'inspections', route: '/inspections' },
      { name: 'fund_disbursement', route: '/fund-disbursement' },
      { name: 'alerts', route: '/alerts' },
      { name: 'reports', route: '/reports' },
      { name: 'audit_trail', route: '/audit-trail' },
    ];

    for (const r of routes) {
      console.log(`Capturing ${r.name} (${r.route})...`);
      await cdp.send('Page.navigate', { url: `http://localhost:5173${r.route}` });
      await new Promise((res) => setTimeout(res, 2000));
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACTS_DIR, `preview_${r.name}.png`), Buffer.from(shot.data, 'base64'));
      console.log(`✓ Saved preview_${r.name}.png`);
    }

    // 2. Login as Vigilance / Investigator to capture Fraud Graph & Investigation
    const vigAuth = await loginApi('vigilance.central@saksham.gov.in');
    const setVigSession = `
      localStorage.setItem('saksham_auth_token', ${JSON.stringify(vigAuth.token)});
      localStorage.setItem('saksham_auth_session', JSON.stringify(${JSON.stringify(vigAuth.user)}));
    `;
    await cdp.send('Runtime.evaluate', { expression: setVigSession });

    console.log('Capturing fraud_graph (/fraud-graph)...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/fraud-graph' });
    await new Promise((res) => setTimeout(res, 2500));
    const fgShot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'preview_fraud_graph.png'), Buffer.from(fgShot.data, 'base64'));
    console.log('✓ Saved preview_fraud_graph.png');

    console.log('All remaining previews captured successfully!');
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

run().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
