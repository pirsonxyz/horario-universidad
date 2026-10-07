import { json, keyOk, str, readBody } from "./_lib.js";

const date = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "");
const time = (v) => (/^\d{2}:\d{2}$/.test(v) ? v : "");

// GET /api/board -> { notices: [...], tasks: [...] }
export async function onRequestGet({ env }) {
  const raw = await env.HORARIO_KV.get("board");
  return json(raw ? JSON.parse(raw) : { notices: [], tasks: [] });
}

// PUT /api/board -> requiere llave (o TEAM_OPEN="true")
export async function onRequestPut({ request, env }) {
  if (env.TEAM_OPEN !== "true") {
    const ok = keyOk(request, env);
    if (ok === null) return json({ error: "EDIT_KEY no configurada" }, 503);
    if (!ok) return json({ error: "Llave incorrecta" }, 401);
  }
  let body;
  try { body = await readBody(request, 150_000); } catch { return json({ error: "JSON inválido o muy grande" }, 400); }
  if (!Array.isArray(body.notices) || !Array.isArray(body.tasks)) return json({ error: "formato inválido" }, 400);

  const notices = body.notices.slice(0, 100).map((x) => ({
    id: str(x.id, 24), t: str(x.t, 100), txt: str(x.txt, 600), at: date(x.at),
  })).filter((x) => x.id && x.t.trim());

  const tasks = body.tasks.slice(0, 200).map((x) => ({
    id: str(x.id, 24), kind: x.kind === "proyecto" ? "proyecto" : "tarea",
    t: str(x.t, 100), c: str(x.c, 20), due: date(x.due), time: time(x.time), note: str(x.note, 600),
  })).filter((x) => x.id && x.t.trim());

  await env.HORARIO_KV.put("board", JSON.stringify({ notices, tasks, updated: Date.now() }));
  return json({ ok: true });
}
