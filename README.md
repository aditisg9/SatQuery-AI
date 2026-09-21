# SatQuery AI

A vision-language assistant for satellite imagery. Upload one or two
satellite images and ask questions in plain language — land cover,
water bodies, vegetation, buildings, roads, and before/after change
detection — and get back a natural-language answer, statistics,
evidence, and annotated imagery.

```
Satellite Image + Question
  → Query Understanding        (VisionLanguageService)
  → Vision / Geospatial Analysis (Segmentation / Detection / Change / Geo)
  → Evidence Extraction
  → Natural-Language Explanation (grounded — never hallucinated)
  → Visual Result (overlay, charts, change map)
```

**Runs fully offline out of the box.** `DEMO_MODE=true` (the default) uses
deterministic, real pixel-analysis heuristics — HSV-based land-cover
segmentation, connected-component object detection, before/after mask
diffing — no GPU, no API key, no internet connection required. Flip one
setting to route the natural-language phrasing through Gemini instead.

---

## Architecture

```
satquery-ai/
├── backend/                  FastAPI + SQLAlchemy
│   └── app/
│       ├── services/         SegmentationService, ObjectDetectionService,
│       │                     ChangeDetectionService, GeospatialService,
│       │                     VisionLanguageService (Mock + Gemini)
│       ├── core/              intent_classifier, pipeline_orchestrator
│       ├── api/                upload / analyze / status routes
│       ├── models/, schemas/  SQLAlchemy models, Pydantic contracts
│       └── utils/              image I/O, GeoTIFF metadata, storage
└── frontend/                 Next.js 14 + Tailwind + Recharts
    ├── app/                   dashboard, analyze, compare, history, settings
    ├── components/            ImageViewer, ChatPanel, StatsCharts, Upload…
    └── lib/                   typed API client
```

Every CV/geospatial capability sits behind an abstract service
(`SegmentationService`, `ObjectDetectionService`, `ChangeDetectionService`,
`GeospatialService`, `VisionLanguageService`). The default implementations
are real, deterministic, dependency-light algorithms — not the app
pretending to be modular. Swap any one of them for a trained model later
without touching the API layer, by changing what its `get_*_service()`
factory returns.

---

## Quick start (no Docker, no GPU)

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # DEMO_MODE=true by default, SQLite by default
uvicorn app.main:app --reload --port 8000
```

**Frontend** (separate terminal)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**. The backend runs on `:8000`; the frontend
proxies `/backend/*` to it (see `frontend/next.config.js`), so no CORS
setup is needed for local dev beyond what's already configured.

---

## Quick start (Docker Compose, with Postgres/PostGIS)

```bash
docker compose up --build
```

This starts Postgres+PostGIS, the FastAPI backend on `:8000`, and the
Next.js frontend on `:3000`. Uploaded images and generated overlays persist
in a named Docker volume.

---

## Turning on Gemini

By default SatQuery AI's `VisionLanguageService` uses an offline,
deterministic mock (`MockVisionLanguageService`) so the whole app runs with
zero setup. To have Gemini generate the natural-language explanations:

1. Get a key at https://aistudio.google.com/apikey
2. In `backend/.env`:
   ```
   DEMO_MODE=false
   GEMINI_API_KEY=your-key-here
   GEMINI_MODEL=gemini-2.0-flash
   ```
3. Restart the backend.

**What Gemini is (and isn't) allowed to do:** it classifies intent and
phrases the final answer. It is never given raw pixels and never asked to
report a statistic — every number in a Gemini-backed answer is supplied to
it as grounding JSON computed by the CV/geospatial services, and the prompt
explicitly forbids inventing figures. This is the "LLM should not
hallucinate visual facts" requirement from the spec, enforced structurally
rather than by hoping the model behaves.

Check current mode any time at **Settings** in the app, or `GET /api/status`.

---

## Deploying (Render + Vercel)

The frontend (Next.js) deploys to **Vercel**; the backend (FastAPI) deploys
to **Render**, since it needs a real running process and persistent
storage, not a serverless function.

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "SatQuery AI"
git remote add origin https://github.com/YOUR_USERNAME/satquery-ai.git
git branch -M main
git push -u origin main
```

### 2. Backend → Render
This repo includes `render.yaml`, a Blueprint that provisions everything
in one step — a **managed Postgres database** plus the backend web
service, on Render's **free tier for both**. No persistent disk is
needed: every uploaded image, thumbnail, and generated overlay/change-map
is stored as binary data directly in Postgres (an `assets` table, served
back out via `/api/assets/{id}`), not on the filesystem. This matters
because Render's free web services don't support attaching a persistent
disk at all — only paid instance types do — so a disk-based design simply
wouldn't deploy on free tier. Storing everything in the database sidesteps
that limitation entirely, and it means uploads survive redeploys and
idle spin-downs exactly the same as any other data in your database.

1. On [Render](https://dashboard.render.com), click **New → Blueprint**
   and point it at your GitHub repo. It reads `render.yaml` automatically
   and creates the web service + database together, both on the free plan.
2. Once created, open the **satquery-backend** service → **Environment**
   and set `GEMINI_API_KEY` (left blank in the blueprint on purpose — never
   commit real keys to git).
3. Set `DEMO_MODE` to `false` there too, once you're ready to go live with
   Gemini.
4. Note your backend's public URL (e.g. `https://satquery-backend.onrender.com`).

*No Blueprint access, or prefer manual setup?* Create a Postgres instance
and a Python web service by hand (both free tier is fine), set `rootDir`
to `backend`, build command `pip install -r requirements.txt`, start
command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, and set
`DATABASE_URL` to the Postgres connection string. No disk, no `STORAGE_DIR`
— nothing else to configure.

### 3. Frontend → Vercel
1. Import the repo on [Vercel](https://vercel.com/new), set the project's
   **Root Directory** to `frontend`.
2. Add an environment variable: `NEXT_PUBLIC_API_URL` = your Render backend
   URL from step 2 (e.g. `https://satquery-backend.onrender.com`).
3. Deploy.

### 4. Close the loop on CORS
Back in Render, update the backend's `FRONTEND_ORIGIN` environment variable
to your real Vercel URL (e.g. `https://satquery-ai.vercel.app`), then
redeploy the backend so it accepts requests from it.

### A note on Render's free tier
Free web services spin down after ~15 minutes of no traffic and take
10–30 seconds to wake back up on the next request — your *database and
every uploaded image are unaffected* (they're in Postgres, not on any
disk that could be wiped), but the very first request after idle time
will feel slow. Before a live judging round, open the app a couple of
minutes early to "wake" it, or upgrade the Render service to a paid
instance for the day to avoid cold starts entirely. Separately, Render's
free Postgres databases expire 30 days after creation — fine for a
hackathon timeline, but worth knowing if this needs to stay live longer.

---

## Supported questions (Workflow A — single image)

- "What is present in this image?"
- "How much agricultural land is visible?"
- "Identify the water bodies."
- "Find buildings in this image."
- "Where is vegetation concentrated?"
- "Calculate the percentage of land covered by water."

## Supported questions (Workflow B — two images)

- "What changed between these two satellite images?"
- "Has urbanization increased?"
- "Are there new roads or buildings?"
- "Show areas where vegetation decreased."

---

## Projects

Group repeat monitoring of the same area of interest under one named
project (e.g. "Yamuna Floodplain Watch"). From a project page you can kick
off new single-image or change-detection sessions that stay linked to it,
rename or delete the project, and see every session run against that site
in one place. Sessions created outside a project (from the Dashboard) work
exactly as before — Projects are an optional layer on top, not a
requirement. Every session (in History or inside a Project) can also be
deleted individually.

## Mobile

The whole app — dashboard, analyze workspace, compare workspace, chat
panel, and navigation — is responsive down to phone widths. Below the
`md` breakpoint the sidebar collapses into a hamburger menu (top-left)
that opens a slide-in drawer with the same navigation. The analyze/compare
workspaces stack vertically on phones instead of forcing a desktop-only
split layout.

## Design system

Dark "mission-control" theme (navy background, teal signal accent, amber
change accent) built entirely on a **system font stack** — no external
font fetch at build time, so builds are deterministic and fast on any
machine or CI, including Vercel. Reusable `Button` component, consistent
card shadows/glows, skeleton loaders on data-fetching pages, and a
four-stage pipeline visual on the dashboard.

---

## Notes on scope

- **Segmentation / detection** use real, deterministic pixel-analysis
  (HSV color thresholds + connected-component blob analysis) rather than a
  trained deep model, so the whole stack runs on CPU with no downloads.
  The service interfaces are model-shaped on purpose — this is the
  intended integration point for a real segmentation/detection network.
- **GeoTIFF** support (CRS, bounding box, real-world hectares) activates
  automatically if `rasterio`/GDAL are installed and the upload is a
  `.tif`/`.tiff` with embedded georeferencing; JPG/PNG uploads always fall
  back to pixel-percentage-only statistics, and the UI is explicit about
  which mode it's in.
- **Co-registration** for the compare workflow is a simple common-size
  resize, not feature-based alignment — sufficient for demo pairs, called
  out in `preprocessing.coregister_pair` as the spot to upgrade.
- **Auth and tiling for very large rasters** are not implemented, to keep
  this buildable end-to-end; the `preprocessing` module's tiling note marks
  where that work plugs in. Projects, History, and session/project
  deletion are fully implemented, not stubbed.
