import { json, keyOk, str, readBody } from "./_lib.js";

// GET /api/team -> { members: [{ n, m: [códigos] }] }
export async function onRequestGet({ env }) {
  const raw = await env.HORARIO_KV.get("team");
  return json(raw ? JSON.parse(raw) : { members: [] });
}

// PUT /api/team -> requiere la llave, salvo que TEAM_OPEN="true" (cualquiera puede editar el equipo)
export async function onRequestPut({ request, env }) {
  const open = env.TEAM_OPEN === "true";
  if (!open) {
    const ok = keyOk(request, env);
    if (ok === null) return json({ error: "EDIT_KEY no configurada" }, 503);
    if (!ok) return json({ error: "Llave incorrecta" }, 401);
  }
  let body;
  try { body = await readBody(request, 50_000); } catch { return json({ error: "JSON inválido o muy grande" }, 400); }
  if (!Array.isArray(body.members) || body.members.length > 60) return json({ error: "members inválido" }, 400);

  const members = body.members.map((t) => ({
    n: str(t.n, 40),
    m: (Array.isArray(t.m) ? t.m : []).slice(0, 40).map((c) => str(c, 20)),
  })).filter((t) => t.n.trim());

  await env.HORARIO_KV.put("team", JSON.stringify({ members, updated: Date.now() }));
  return json({ ok: true });
}
