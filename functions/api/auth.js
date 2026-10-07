import { json, keyOk } from "./_lib.js";

// GET /api/auth  con header X-Edit-Key  ->  200 si la llave es correcta
export async function onRequestGet({ request, env }) {
  const ok = keyOk(request, env);
  if (ok === null) return json({ error: "EDIT_KEY no configurada" }, 503);
  return ok ? json({ ok: true }) : json({ error: "Llave incorrecta" }, 401);
}
