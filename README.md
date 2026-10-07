# Horario universitario — Cloudflare Pages

```
horario-pages/
├── index.html · styles.css · app.js     ← la página (estática)
├── functions/api/                        ← Pages Functions (servidor)
│   ├── schedule.js   GET público · PUT con llave
│   ├── team.js       GET público · PUT con llave (o TEAM_OPEN=true)
│   ├── board.js      avisos y tareas: GET público · PUT con llave
│   ├── auth.js       valida la llave
│   └── _lib.js
├── .env.example · dev.sh · push-secret.sh ← tu .env local y scripts
└── .gitignore
```

## Cómo funciona la llave
La llave vive **solo en el servidor** como variable de entorno `EDIT_KEY`. El navegador la envía en el
header `X-Edit-Key` y la Function la compara; nunca aparece en el código de la página.

## Despliegue
1. Sube la carpeta a un repo de GitHub (`git init && git add . && git commit -m "horario" && git push`).
2. Cloudflare → **Workers & Pages → Create → Pages → Connect to Git** → elige el repo.
   *Framework preset:* None · *Build command:* (vacío) · *Output directory:* `/` (o `.`).
3. Crea el almacenamiento: **Storage & Databases → KV → Create namespace** (ej. `horario`).
4. En el proyecto Pages: **Settings → Bindings → Add → KV namespace**
   - Variable name: `HORARIO_KV` · Namespace: el que creaste.
5. **Settings → Variables and Secrets → Add** → `EDIT_KEY` (tipo *Secret*) con tu llave.
   Opcional: `TEAM_OPEN` = `true` para que tus amigos agreguen su nombre sin llave.
6. Haz un nuevo deploy (o `git push`) para que tome los bindings. Listo: cada `git push` redepliega.

Agrega los bindings/variables tanto en *Production* como en *Preview* si quieres usar ramas.

## Desarrollo local (Linux/Mac)
```bash
cp .env.example .env     # edita EDIT_KEY
./dev.sh                 # abre http://localhost:8788
```
## Subir la llave de tu .env a Cloudflare
```bash
npx wrangler login
./push-secret.sh NOMBRE_DEL_PROYECTO_PAGES
```
(Cloudflare en producción no lee archivos .env: por eso el script la sube como secreto.)

## Notas
- Sin servidor (abrir `index.html` directo), la página funciona con los datos por defecto y guarda el equipo en el navegador.
- Los datos se sincronizan cada 20 s entre visitantes.
- Carrera, trimestre, materias y horarios se editan desde ✏️ Editar (con la llave). Los créditos totales se calculan solos sumando las materias.
- Para cambiar la llave: modifica el secreto `EDIT_KEY` y redepliega.
# horario-universidad
