import { json, keyOk, str, readBody } from "./_lib.js";

// GET  /api/schedule -> { subjects } (o { subjects: null, meta: null } si nunca se ha editado)
export async function onRequestGet({ env }) {
  const raw = await env.HORARIO_KV.get("schedule");
  return json(raw ? JSON.parse(raw) : { subjects: null, meta: null });
}

// PUT /api/schedule -> requiere header X-Edit-Key == EDIT_KEY
export async function onRequestPut({ request, env }) {
  const ok = keyOk(request, env);
  if (ok === null) return json({ error: "EDIT_KEY no configurada" }, 503);
  if (!ok) return json({ error: "Llave incorrecta" }, 401);

  let body;
  try { body = await readBody(request); } catch { return json({ error: "JSON inválido o muy grande" }, 400); }
  if (!Array.isArray(body.subjects) || body.subjects.length > 40) return json({ error: "subjects inválido" }, 400);

  const subjects = body.subjects.map((m) => ({
    n: str(m.n, 80), c: str(m.c, 20), cr: Math.max(0, Math.min(20, Number(m.cr) || 0)),
    p: str(m.p, 60), col: /^#[0-9a-f]{6}$/i.test(m.col) ? m.col : "#6366f1",
    ...(m.as ? { as: str(m.as, 80) } : {}),
    s: (Array.isArray(m.s) ? m.s : []).slice(0, 10).map((x) => ({
      d: [...new Set((x.d || []).map(Number).filter((d) => d >= 1 && d <= 5))].sort(),
      a: Number(x.a), b: Number(x.b), r: str(x.r, 40),
    })).filter((x) => x.d.length && x.a >= 0 && x.b <= 24 && x.a < x.b),
  }));

  const meta = {
    tri: str(body.meta?.tri, 60) || "Noviembre 2026 – Enero 2027",
    car: str(body.meta?.car, 60) || "Ingeniería Eléctrica",
  };
  await env.HORARIO_KV.put("schedule", JSON.stringify({ subjects, meta, updated: Date.now() }));
  return json({ ok: true });
}
