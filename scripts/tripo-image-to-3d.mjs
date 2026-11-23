// Foto → texturiertes 3D-Modell über die Tripo-API v3 (developers.tripo3d.ai).
// node scripts/tripo-image-to-3d.mjs <out_dir> <sku>=<bild> [<sku>=<bild> ...]
// Optionen per Umgebung: TRIPO_MODEL (Standard v3.1-20260211), TRIPO_FACES (Standard 40000),
//   TRIPO_TEXTURE (standard|detailed, Standard detailed), TRIPO_DRY=1 (nur Kontostand).
// Schlüssel: ~/.config/onme/tripo.env (TRIPO_API_KEY=…), wird nie ausgegeben.
// Erfolg wird nur gemeldet, wenn Tripo "success" liefert UND die GLB-Datei geladen ist.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = "https://openapi.tripo3d.ai/v3";
const envFile = path.join(os.homedir(), ".config/onme/tripo.env");
const KEY = (fs.readFileSync(envFile, "utf8").match(/^TRIPO_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error(`Kein TRIPO_API_KEY in ${envFile}`);
const H = { Authorization: `Bearer ${KEY}` };
const MODEL = process.env.TRIPO_MODEL || "v3.1-20260211";
const FACES = Number(process.env.TRIPO_FACES || 40000);
const TEXQ = process.env.TRIPO_TEXTURE || "detailed";

async function api(method, url, body, isForm = false) {
  for (let attempt = 0; attempt < 10; attempt++) {
    let res;
    try {
      res = await fetch(BASE + url, {
        method,
        headers: isForm ? H : { ...H, "Content-Type": "application/json" },
        body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
      });
    } catch (e) {
      // Netzaussetzer (WLAN): GET immer wiederholen; POST nur, wenn die Verbindung gar nicht
      // zustande kam – sonst könnte ein zweiter bezahlter Auftrag entstehen.
      const code = e.cause?.code || "";
      if (method === "GET" || /CONNECT|ENOTFOUND|EAI_AGAIN|ECONNREFUSED/.test(code)) {
        await new Promise((r) => setTimeout(r, 15000));
        continue;
      }
      throw e;
    }
    const json = await res.json().catch(() => ({}));
    if (res.status === 429) {
      const wait = Number(res.headers.get("retry-after") || 10) * 1000;
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    if (!res.ok || json.code !== 0) {
      throw new Error(`${method} ${url} → HTTP ${res.status} code ${json.code} ${json.message || ""} ${json.suggestion || ""}`.trim());
    }
    return json.data;
  }
  throw new Error(`${method} ${url} → zu viele 429/Netzfehler`);
}

const balance = async () => api("GET", "/account/balance");

async function one(outDir, sku, img) {
  const form = new FormData();
  const buf = fs.readFileSync(img);
  form.append("file", new Blob([buf], { type: img.endsWith(".png") ? "image/png" : "image/jpeg" }), path.basename(img));
  const up = await api("POST", "/files", form, true);
  const task = await api("POST", "/generation/image-to-model", {
    input: up.file_token,
    model: MODEL,
    texture: true,
    pbr: true,
    texture_quality: TEXQ,
    face_limit: FACES,
    orientation: "align_image",
    auto_size: true,
  });
  const t0 = Date.now();
  for (;;) {
    await new Promise((r) => setTimeout(r, 8000));
    const st = await api("GET", `/tasks/${task.task_id}`);
    if (st.status === "success") {
      const url = st.output?.model_url;
      if (!url) throw new Error(`${sku}: success ohne model_url`);
      let res;
      for (let a = 0; a < 8; a++) {
        res = await fetch(url).catch(() => null);
        if (res?.ok) break;
        await new Promise((r) => setTimeout(r, 15000));
      }
      if (!res?.ok) throw new Error(`${sku}: Download fehlgeschlagen (Task ${task.task_id} ist bezahlt – mit \`tripo task get\` nachholen)`);
      const glb = Buffer.from(await res.arrayBuffer());
      if (glb.toString("ascii", 0, 4) !== "glTF") throw new Error(`${sku}: Download ist kein GLB`);
      const out = path.join(outDir, `${sku}-tripo.glb`);
      fs.writeFileSync(out, glb);
      if (st.output?.rendered_image_url) {
        const r2 = await fetch(st.output.rendered_image_url).catch(() => null);
        if (r2?.ok) fs.writeFileSync(path.join(outDir, `${sku}-tripo-preview.webp`), Buffer.from(await r2.arrayBuffer()));
      }
      return { sku, ok: true, task: task.task_id, credits: st.credits_consumed, kb: Math.round(glb.length / 1024), s: Math.round((Date.now() - t0) / 1000) };
    }
    if (["failed", "cancelled", "banned", "expired", "unknown"].includes(st.status)) {
      return { sku, ok: false, task: task.task_id, status: st.status, error: `${st.error_code || ""} ${st.error_message || ""}`.trim() };
    }
    if (Date.now() - t0 > 15 * 60 * 1000) return { sku, ok: false, task: task.task_id, status: "timeout" };
  }
}

const [outDir, ...pairs] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const b0 = await balance();
console.log(`Kontostand vorher: ${b0.balance} Credits (reserviert ${b0.frozen})`);
if (process.env.TRIPO_DRY) process.exit(0);
const jobs = pairs.map((p) => p.split("="));
const results = [];
const CONC = 3; // Tripo erlaubt 10 gleichzeitig; 3 schont Kontingent und Rechner
for (let i = 0; i < jobs.length; i += CONC) {
  const part = await Promise.all(jobs.slice(i, i + CONC).map(([sku, img]) => one(outDir, sku, img).catch((e) => ({ sku, ok: false, error: e.message }))));
  for (const r of part) { console.log(JSON.stringify(r)); results.push(r); }
}
const b1 = await balance();
console.log(`Kontostand nachher: ${b1.balance} Credits; erfolgreich ${results.filter((r) => r.ok).length}/${results.length}`);
fs.appendFileSync(path.join(outDir, "tripo-log.jsonl"), results.map((r) => JSON.stringify({ ...r, at: new Date().toISOString() })).join("\n") + "\n");
