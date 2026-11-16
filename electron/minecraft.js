/* ══════════════════════════════════════════════════════════
   PantenolVisuals — настоящая загрузка и запуск Vanilla Minecraft
   С официальных серверов Mojang (piston-meta / piston-data).
   v2.9: полный парсинг arguments.jvm, лог игры, диагностика падений.
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
  logs: path.join(ROOT, "logs"),
};
for (const d of Object.values(DIRS)) fs.mkdirSync(d, { recursive: true });

const OS_NAME = process.platform === "win32" ? "windows" : process.platform === "darwin" ? "osx" : "linux";
const ARCH = process.arch === "ia32" ? "x86" : process.arch; /* x64 | arm64 | x86 */

/* ───── HTTP helpers ───── */
function get(url, hops = 0) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "PantenolVisuals/2.9" } }, (res) => {
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
    fs.mkdirSync(dest, { recursive: true });
    if (process.platform === "win32") {
      execFile("powershell", ["-NoProfile", "-Command",
        `Expand-Archive -LiteralPath '${jar}' -DestinationPath '${dest}' -Force`], () => resolve());
    } else {
      execFile("unzip", ["-oqq", jar, "-d", dest, "-x", "META-INF/*"], () => resolve());
    }
  });
}

/* ───── Манифест версий ───── */
async function listVersions() {
  const man = await fetchJSON(MANIFEST_URL);
  return man.versions.filter((v) => v.type === "release").slice(0, 25).map((v) => v.id);
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

/* ───── Правила Mojang (os.name / os.arch / features) ───── */
function rulesOk(rules, features) {
  if (!rules || !rules.length) return true;
  let ok = false;
  for (const r of rules) {
    let match = true;
    if (r.os) {
      if (r.os.name && r.os.name !== OS_NAME) match = false;
      if (r.os.arch && r.os.arch !== ARCH) match = false;
    }
    if (r.features) {
      /* мы не поддерживаем демо/quickplay/кастомное разрешение — правило не матчится */
      for (const f of Object.keys(r.features)) if (!features || !features[f]) match = false;
    }
    if (r.action === "allow" && match) ok = true;
    if (r.action === "disallow" && match) ok = false;
  }
  return ok;
}

function nativesKeyFor(lib) {
  let key = (lib.natives || {})[OS_NAME];
  if (!key) return null;
  return key.replace("${arch}", ARCH === "x86" ? "32" : "64");
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
  fs.rmSync(natDir, { recursive: true, force: true });
  fs.mkdirSync(natDir, { recursive: true });
  for (const lib of vjson.libraries || []) {
    if (!rulesOk(lib.rules)) continue;
    const key = nativesKeyFor(lib);
    if (!key) continue;
    const art = lib.downloads && lib.downloads.classifiers && lib.downloads.classifiers[key];
    if (!art) continue;
    const jar = path.join(DIRS.libraries, art.path);
    await downloadRetry(art.url, jar);
    await unzip(jar, natDir);
  }
  /* проверка: нативы реально распаковались (LWJGL .so/.dll лежат в корне natDir) */
  const natFiles = fs.readdirSync(natDir);
  if (natFiles.length === 0) throw new Error("Нативные библиотеки не распаковались для " + OS_NAME);

  /* ассеты */
  const idx = vjson.assetIndex;
  say("Индекс ассетов…", 46);
  const idxPath = path.join(DIRS.assets, "indexes", idx.id + ".json");
  await downloadRetry(idx.url, idxPath);
  const objects = JSON.parse(fs.readFileSync(idxPath, "utf8")).objects || {};
  const entries = Object.values(objects);
  say(`Ассеты… (0/${entries.length})`, 48);
  let ai = 0; const CONC = 8;
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

/* ───── Сборка аргументов из манифеста Mojang ───── */
function buildVars(vjson, version, username, natDir, classpath) {
  const sep = process.platform === "win32" ? ";" : ":";
  return {
    "${auth_player_name}": username || "Player",
    "${version_name}": version,
    "${game_directory}": ROOT,
    "${assets_root}": DIRS.assets,
    "${assets_index_name}": vjson.assets || (vjson.assetIndex && vjson.assetIndex.id) || version,
    "${auth_uuid}": "00000000000000000000000000000000",
    "${auth_access_token}": "0",
    "${auth_xuid}": "0",
    "${user_properties}": "{}",
    "${user_type}": "legacy",
    "${version_type}": vjson.type || "release",
    "${clientid}": "0",
    "${natives_directory}": natDir,
    "${launcher_name}": "PantenolVisuals",
    "${launcher_version}": "2.9",
    "${classpath}": classpath,
    "${classpath_separator}": sep,
    "${library_directory}": DIRS.libraries,
  };
}
function substitute(s, vars) {
  let out = s;
  for (const [k, v] of Object.entries(vars)) if (v != null) out = out.split(k).join(v);
  return out;
}

function collectArgs(list, vars, features) {
  const out = [];
  for (const a of list || []) {
    if (typeof a === "string") { out.push(substitute(a, vars)); continue; }
    if (!rulesOk(a.rules, features)) continue;
    const v = Array.isArray(a.value) ? a.value : [a.value];
    out.push(...v.map((x) => substitute(x, vars)));
  }
  return out;
}

/* ───── Запуск ───── */
async function findJava() {
  const which = process.platform === "win32" ? "where" : "which";
  const probe = (bin) => new Promise((ok) => execFile(which, [bin], (e) => ok(!e)));
  if (process.platform === "win32" && await probe("javaw")) return "javaw"; /* без консоли */
  if (await probe("java")) return "java";
  return null;
}

async function checkJava() { return !!(await findJava()); }

async function launch({ version, username, ramMb, onExit }) {
  const vdir = path.join(DIRS.versions, version);
  const jsonPath = path.join(vdir, version + ".json");
  if (!fs.existsSync(jsonPath)) throw new Error("Версия не установлена: " + version);
  const vjson = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  const natDir = path.join(vdir, "natives");
  if (!fs.existsSync(natDir) || fs.readdirSync(natDir).length === 0) {
    throw new Error("Нативные библиотеки отсутствуют — переустановите версию");
  }

  /* classpath */
  const sep = process.platform === "win32" ? ";" : ":";
  const libs = (vjson.libraries || [])
    .filter((l) => rulesOk(l.rules) && l.downloads && l.downloads.artifact)
    .map((l) => path.join(DIRS.libraries, l.downloads.artifact.path));
  for (const p of libs) if (!fs.existsSync(p)) throw new Error("Отсутствует библиотека: " + path.basename(p));
  const cp = [...libs, path.join(vdir, version + ".jar")].join(sep);

  const vars = buildVars(vjson, version, username, natDir, cp);
  const NO_FEATURES = {}; /* quickPlay, demo, custom resolution — выключены */

  /* JVM-аргументы: берём из манифеста, если есть (современные версии) */
  let jvmArgs;
  if (vjson.arguments && vjson.arguments.jvm) {
    jvmArgs = collectArgs(vjson.arguments.jvm, vars, NO_FEATURES)
      .filter((a) => !a.startsWith("-cp") && a !== "-cp"); /* classpath добавим сами (spawn без shell) */
  } else {
    jvmArgs = [
      "-XX:+UseG1GC", "-XX:+ParallelRefProcEnabled", "-XX:+DisableExplicitGC",
      "-Djava.library.path=" + natDir,
    ];
  }
  /* закрепляем память и classpath последними — они важнее любых дефолтов */
  const ram = Math.max(1024, Math.min(ramMb || 4096, 16384));
  jvmArgs = [`-Xmx${ram}M`, "-Xss1G", ...jvmArgs.filter((a) => !a.startsWith("-Xmx") && !a.startsWith("-Xms")), "-classpath", cp];

  /* игровые аргументы */
  let gameArgs;
  if (vjson.arguments && vjson.arguments.game) {
    gameArgs = collectArgs(vjson.arguments.game, vars, NO_FEATURES);
  } else if (vjson.minecraftArguments) {
    gameArgs = vjson.minecraftArguments.split(" ").map((s) => substitute(s, vars));
  } else {
    throw new Error("В манифесте версии нет аргументов запуска");
  }

  const java = await findJava();
  if (!java) return { ok: false, noJava: true, platform: process.platform };

  /* лог процесса игры в файл + хвост для тоста */
  const logPath = path.join(DIRS.logs, "pv-game.log");
  const logStream = fs.createWriteStream(logPath, { flags: "w" });
  const cmdline = [java, ...jvmArgs, vjson.mainClass, ...gameArgs];
  logStream.write("# " + new Date().toISOString() + "  PantenolVisuals запуск\n# cwd: " + ROOT + "\n# " +
    cmdline.map((a) => (a.includes(" ") ? '"' + a + '"' : a)).join(" ") + "\n\n");

  let tail = [];
  const remember = (chunk) => {
    for (const line of chunk.toString().split(/\r?\n/)) {
      if (!line.trim()) continue;
      tail.push(line.trim());
      if (tail.length > 30) tail.shift();
    }
  };

  const proc = spawn(java, [...jvmArgs, vjson.mainClass, ...gameArgs], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, APPDATA: process.env.APPDATA || os.homedir() }, /* MC пишет в %APPDATA%/.minecraft на win */
  });

  proc.on("error", (err) => {
    logStream.write("SPAWN ERROR: " + err.message + "\n");
    logStream.end();
    if (onExit) onExit({ code: -1, signal: null, logPath, tail: ["Процесс не стартовал: " + err.message] });
  });
  proc.stdout.on("data", (d) => { logStream.write(d); remember(d); });
  proc.stderr.on("data", (d) => { logStream.write(d); remember(d); });
  proc.on("exit", (code, signal) => {
    logStream.write("\n# exit code=" + code + " signal=" + signal + "\n");
    logStream.end();
    if (onExit) onExit({ code, signal, logPath, tail: tail.slice(-8) });
  });

  return { ok: true, pid: proc.pid, logPath };
}

module.exports = { listVersions, latestRelease, install, isInstalled, launch, checkJava, ROOT };
