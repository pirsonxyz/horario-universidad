// Utilidades compartidas. (Archivo sin onRequest*: Pages no lo expone como ruta.)
export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

// Comparación en tiempo constante para no filtrar la llave por tiempos de respuesta.
export function keyOk(request, env) {
  const expected = env.EDIT_KEY;
  if (!expected) return null; // no configurada
  const given = request.headers.get("X-Edit-Key") || "";
  const a = new TextEncoder().encode(given);
  const b = new TextEncoder().encode(expected);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] || 0) ^ (b[i] || 0);
  return diff === 0;
}

export const str = (v, max) => String(v ?? "").slice(0, max);

export async function readBody(request, maxBytes = 100_000) {
  const text = await request.text();
  if (text.length > maxBytes) throw new Error("too_large");
  return JSON.parse(text);
}
