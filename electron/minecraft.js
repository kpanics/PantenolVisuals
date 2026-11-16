/* ══════════════════════════════════════════════════════════
   PantenolVisuals — настоящая загрузка и запуск Vanilla Minecraft
   С официальных серверов Mojang (piston-meta / piston-data).
   ══════════════════════════════════════════════════════════ */
const https = require("https");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile, spawn } = require("child_process");

const MANIFEST_URL = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json";
const ROOT = path.join(os.homedir(), ".pantenolvisuals", "minecraft");
const DIRS = {
  versions: path.join(ROOT, "versions"),
  libraries: path.join(ROOT, "libraries"),
  assets: path.join(ROOT, "assets"),
};
for (const d of Object.values(DIRS)) fs.mkdirSync(d, { recursive: true });

const OS_NAME = process.platform === "win32" ? "windows" : process.platform === "darwin" ? "osx" : "linux";

/* ───── HTTP helpers ───── */
function get(url, hops = 0) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "PantenolVisuals/2.8" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && hops < 5) {
        res.resume();
        return get(res.headers.location, hops + 1).then(resolve, reject);
      }
      resolve(res);
    }).on("error", reject);
  });
}

async function fetchJSON(url) {
  const res = await get(url);
  if (res.statusCode !== 200) { res.resume(); throw new Error("HTTP " + res.statusCode + " " + url); }
  let body = "";
  for await (const chunk of res) body += chunk;
  return JSON.parse(body);
}

async function downloadTo(url, dest, onTick) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) { onTick && onTick(1); return; }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const tmp = dest + ".part";
  const res = await get(url);
  if (res.statusCode !== 200) { res.resume(); throw new Error("HTTP " + res.statusCode + " " + url); }
  const total = +res.headers["content-length"] || 0;
  let done = 0;
  const out = fs.createWriteStream(tmp);
  res.on("data", (c) => { done += c.length; if (total) onTick && onTick(done / total); });
  await new Promise((ok, bad) => { res.pipe(out); out.on("finish", () => out.close(ok)); out.on("error", bad); res.on("error", bad); });
  fs.renameSync(tmp, dest);
  onTick && onTick(1);
}

async function downloadRetry(url, dest, onTick) {
  for (let i = 0; i < 3; i++) {
    try { return await downloadTo(url, dest, onTick); }
    catch (e) { if (i === 2) throw e; }
  }
}

function unzip(jar, dest) {
  return new Promise((resolve) => {
    if (process.platform === "win32") {
      execFile("powershell", ["-NoProfile", "-Command", `Expand-Archive -Force '${jar}' '${dest}'`], () => resolve());
    } else {
      execFile("unzip", ["-oqq", jar, "-d", dest], () => resolve());
    }
  });
}

/* ───── Манифест версий ───── */
async function listVersions() {
  const man = await fetchJSON(MANIFEST_URL);
  return man.latest.release
    ? man.versions.filter((v) => v.type === "release").slice(0, 25).map((v) => v.id)
    : [];
}
async function latestRelease() {
  const man = await fetchJSON(MANIFEST_URL);
  return man.latest.release;
}

/* ───── Статус установки ───── */
function isInstalled(version) {
  return fs.existsSync(path.join(DIRS.versions, version, version + ".jar")) &&
         fs.existsSync(path.join(DIRS.versions, version, ".pv-done"));
}

/* ───── Установка версии ───── */
async function install(version, send) {
  const t0 = Date.now();
  const say = (stage, pct) => send && send({ stage, pct: Math.min(99, Math.round(pct)) });

  say("Манифест версий…", 2);
  const man = await fetchJSON(MANIFEST_URL);
  const meta = man.versions.find((v) => v.id === version);
  if (!meta) throw new Error("Версия не найдена: " + version);

  say("Файл версии…", 4);
  const vdir = path.join(DIRS.versions, version);
  fs.mkdirSync(vdir, { recursive: true });
  const vjson = await fetchJSON(meta.url);
  fs.writeFileSync(path.join(vdir, version + ".json"), JSON.stringify(vjson));

  say("Клиент Minecraft…", 6);
  await downloadRetry(vjson.downloads.client.url, path.join(vdir, version + ".jar"), (p) => say("Клиент Minecraft…", 6 + p * 14));

  /* библиотеки */
  const libs = (vjson.libraries || []).filter((l) => rulesOk(l.rules) && l.downloads && l.downloads.artifact);
  say("Библиотеки…", 20);
  let li = 0;
  for (const lib of libs) {
    await downloadRetry(lib.downloads.artifact.url, path.join(DIRS.libraries, lib.downloads.artifact.path));
    li++;
    if (li % 3 === 0) say(`Библиотеки… (${li}/${libs.length})`, 20 + (li / libs.length) * 20);
  }

  /* нативные библиотеки */
  say("Нативные библиотеки…", 42);
  const natDir = path.join(vdir, "natives");
  fs.mkdirSync(natDir, { recursive: true });
  for (const lib of vjson.libraries || []) {
    const nats = lib.natives || {};
    const key = nats[OS_NAME];
    if (!rulesOk(lib.rules) || !key) continue;
    const art = lib.downloads && lib.downloads.classifiers && lib.downloads.classifiers[key];
    if (!art) continue;
    const jar = path.join(DIRS.libraries, art.path);
    await downloadRetry(art.url, jar);
    await unzip(jar, natDir);
  }

  /* ассеты */
  const idx = vjson.assetIndex;
  say("Индекс ассетов…", 46);
  const idxPath = path.join(DIRS.assets, "indexes", idx.id + ".json");
  await downloadRetry(idx.url, idxPath);
  const objects = JSON.parse(fs.readFileSync(idxPath, "utf8")).objects || {};
  const entries = Object.values(objects);
  say(`Ассеты… (0/${entries.length})`, 48);
  let ai = 0, CONC = 8;
  const queue = entries.slice();
  async function worker() {
    while (queue.length) {
      const o = queue.shift();
      const p2 = o.hash.slice(0, 2);
      await downloadRetry(`https://resources.download.minecraft.net/${p2}/${o.hash}`, path.join(DIRS.assets, "objects", p2, o.hash));
      ai++;
      if (ai % 40 === 0) say(`Ассеты… (${ai}/${entries.length})`, 48 + (ai / entries.length) * 48);
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));

  fs.writeFileSync(path.join(vdir, ".pv-done"), JSON.stringify({ at: Date.now(), secs: (Date.now() - t0) / 1000 }));
  say("Готово ✔", 100);
}

function rulesOk(rules) {
  if (!rules) return true;
  let ok = false;
  for (const r of rules) {
    const match = !r.os || !r.os.name || r.os.name === OS_NAME;
    if (r.action === "allow" && match) ok = true;
    if (r.action === "disallow" && match) ok = false;
  }
  return ok;
}

/* ───── Запуск ───── */
async function launch({ version, username, ramMb }) {
  const vdir = path.join(DIRS.versions, version);
  const vjson = JSON.parse(fs.readFileSync(path.join(vdir, version + ".json"), "utf8"));

  /* classpath */
  const sep = process.platform === "win32" ? ";" : ":";
  const libs = (vjson.libraries || [])
    .filter((l) => rulesOk(l.rules) && l.downloads && l.downloads.artifact)
    .map((l) => path.join(DIRS.libraries, l.downloads.artifact.path));
  const cp = [...libs, path.join(vdir, version + ".jar")].join(sep);

  /* игровые аргументы (новый и старый формат) */
  const vars = {
    "${auth_player_name}": username || "Player",
    "${version_name}": version,
    "${game_directory}": ROOT,
    "${assets_root}": DIRS.assets,
    "${assets_index_name}": vjson.assets || vjson.assetIndex.id,
    "${auth_uuid}": "00000000000000000000000000000000",
    "${auth_access_token}": "0",
    "${user_type}": "legacy",
    "${version_type}": "release",
    "${clientid}": "0",
  };
  const sub = (s) => Object.entries(vars).reduce((acc, [k, v]) => acc.split(k).join(v), s);

  let gameArgs = [];
  if (vjson.arguments && vjson.arguments.game) {
    for (const a of vjson.arguments.game) {
      if (typeof a === "string") gameArgs.push(sub(a));
      else if (a.rules && rulesOk(a.rules)) {
        const v = Array.isArray(a.value) ? a.value : [a.value];
        gameArgs.push(...v.map(sub));
      }
    }
  } else if (vjson.minecraftArguments) {
    gameArgs = vjson.minecraftArguments.split(" ").map(sub);
  }

  const java = process.platform === "win32" ? "java.exe" : "java";
  const jvmArgs = [
    `-Xmx${ramMb || 4096}M`, "-Xss1G",
    `-Djava.library.path=${path.join(vdir, "natives")}`,
    "-cp", cp,
    vjson.mainClass,
    ...gameArgs,
  ];

  const proc = spawn(java, jvmArgs, { cwd: ROOT });
  return { pid: proc.pid };
}

/* проверка наличия java */
function checkJava() {
  return new Promise((resolve) => {
    execFile(process.platform === "win32" ? "where" : "which", ["java"], (e) => resolve(!e));
  });
}

module.exports = { listVersions, latestRelease, install, isInstalled, launch, checkJava, ROOT };
