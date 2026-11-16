/* ══════════════════════════════════════════════════════════
   Автообновление приложения (как Discord):
   при запуске и каждые 30 минут проверяет main на GitHub,
   тихо скачивает zip, подменяет файлы, предлагает перезапуск.
   ══════════════════════════════════════════════════════════ */
const https = require("https");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");

const BRANCH = "main";
const SHA_URL  = "https://api.github.com/repos/kpanics/PantenolVisuals/commits/" + BRANCH;
const ZIP_URL  = "https://codeload.github.com/kpanics/PantenolVisuals/zip/refs/heads/" + BRANCH;

let appDir = null;
let win = null;
let stateFile = null;
let timer = null;

function get(url, hops = 0) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "PantenolVisuals-updater" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && hops < 5) {
        res.resume();
        return get(res.headers.location, hops + 1).then(resolve, reject);
      }
      resolve(res);
    }).on("error", reject);
  });
}

async function fetchText(url) {
  const res = await get(url);
  if (res.statusCode !== 200) { res.resume(); throw new Error("HTTP " + res.statusCode); }
  let body = "";
  for await (const chunk of res) body += chunk;
  return body;
}

function readState() {
  try { return JSON.parse(fs.readFileSync(stateFile, "utf8")); } catch { return {}; }
}
function writeState(s) {
  try { fs.writeFileSync(stateFile, JSON.stringify(s)); } catch {}
}

async function downloadFile(url, dest) {
  const res = await get(url);
  if (res.statusCode !== 200) { res.resume(); throw new Error("HTTP " + res.statusCode); }
  const out = fs.createWriteStream(dest);
  await new Promise((ok, bad) => { res.pipe(out); out.on("finish", () => out.close(ok)); out.on("error", bad); });
}

function unzipTo(zip, dest) {
  return new Promise((resolve, reject) => {
    if (process.platform === "win32") {
      execFile("powershell", ["-NoProfile", "-Command", `Expand-Archive -Force '${zip}' '${dest}'`],
        (e) => (e ? reject(e) : resolve()));
    } else {
      execFile("unzip", ["-oq", zip, "-d", dest], (e) => (e ? reject(e) : resolve()));
    }
  });
}

/* Файлы/папки, которые обновляем (движок, .git и dist не трогаем) */
const SYNC_ITEMS = ["index.html", "css", "js", "assets", "electron", "package.json", "README.md", "launch.sh", "launch.bat", "install.sh", "install.ps1"];

async function checkOnce(verbose) {
  try {
    const body = await fetchText(SHA_URL);
    const remoteSha = JSON.parse(body).sha;
    if (!remoteSha) return;
    const st = readState();
    if (st.lastSha === remoteSha) {
      if (verbose) console.log("[updater] уже свежая версия");
      return;
    }

    if (st.pendingSha === remoteSha && st.pendingReady) {
      /* обновление уже скачано ранее — просто напомним */
      win && win.webContents.send("app-update-ready", { sha: remoteSha.slice(0, 7) });
      return;
    }

    console.log("[updater] новая версия", remoteSha.slice(0, 7), "— скачиваю…");
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pv-upd-"));
    const zipPath = path.join(tmp, "upd.zip");
    await downloadFile(ZIP_URL, zipPath);
    await unzipTo(zipPath, tmp);
    const srcDir = path.join(tmp, "PantenolVisuals-" + BRANCH);
    if (!fs.existsSync(path.join(srcDir, "index.html"))) throw new Error("bad zip");

    for (const item of SYNC_ITEMS) {
      const from = path.join(srcDir, item);
      const to = path.join(appDir, item);
      if (!fs.existsSync(from)) continue;
      fs.rmSync(to, { recursive: true, force: true });
      fs.cpSync(from, to, { recursive: true });
    }
    fs.rmSync(tmp, { recursive: true, force: true });

    st.lastSha = remoteSha;
    st.pendingSha = remoteSha;
    st.pendingReady = true;
    writeState(st);
    console.log("[updater] обновление готово к перезапуску");
    win && win.webContents.send("app-update-ready", { sha: remoteSha.slice(0, 7) });
  } catch (e) {
    console.log("[updater] пропуск:", e.message);
  }
}

function start(mainWindow, dir, userDataDir) {
  win = mainWindow;
  appDir = dir;
  stateFile = path.join(userDataDir, "pv-update.json");
  setTimeout(() => checkOnce(true), 8000);        /* через 8 сек после старта */
  timer = setInterval(() => checkOnce(false), 30 * 60 * 1000); /* каждые 30 минут */
}

function markRestarted() {
  /* после перезапуска новый код уже на диске */
  const st = readState();
  st.pendingReady = false;
  writeState(st);
}

module.exports = { start, markRestarted };
