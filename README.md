# SatQuery AI 🌍🛰️

**SatQuery AI** is a vision-language and geospatial intelligence platform for understanding satellite imagery using natural-language queries.

Rather than relying on complex GIS workflows, SatQuery allows you to upload imagery (e.g., GeoTIFFs), ask questions in plain English ("Where is the vegetation concentrated?"), and receive grounded, explainable answers powered by computer vision and Large Language Models.

---

## 🏗️ Architecture

The platform follows a modern decoupled architecture using Next.js (React) for the frontend and FastAPI (Python) for the geospatial backend, fully containerized with Docker.

```mermaid
graph TD
    %% Styling
    classDef frontend fill:#182438,stroke:#315FA8,stroke-width:2px,color:#fff;
    classDef backend fill:#5E8C61,stroke:#4A6F4D,stroke-width:2px,color:#fff;
    classDef db fill:#D9D5CC,stroke:#7A838C,stroke-width:2px,color:#182438;
    classDef ai fill:#315FA8,stroke:#243451,stroke-width:2px,color:#fff;

    Client([Web Client / Browser]) -->|HTTP / JSON| Frontend

    subgraph "Docker Compose Network"
        Frontend[Next.js Frontend\nReact & Tailwind]:::frontend
        Backend[FastAPI Backend\nPython CV Pipeline]:::backend
        DB[(PostgreSQL + PostGIS\nDatabase)]:::db
        
        Frontend -->|REST API calls| Backend
        Backend -->|SQL / ORM| DB
    end

    Backend -->|Prompts & Structured Data| LLM[Google Gemini API]:::ai
    LLM -->|Grounded Explanations| Backend
```

## 🛠️ Tech Stack

### Frontend
* **Framework:** Next.js 14 (App Router)
* **Styling:** Tailwind CSS (Vanilla CSS utilities)
* **Icons:** Lucide React
* **Mapping:** React Simple Maps / Leaflet (for geospatial viz)

### Backend
* **Framework:** FastAPI (Python 3.11)
* **Authentication:** JWT via `python-jose`, passwords via `passlib[bcrypt]`
* **Database:** PostgreSQL with PostGIS extension
* **ORM:** SQLAlchemy + Alembic
* **Geospatial & ML:** `rasterio`, `scikit-image`, `numpy`
* **LLM Integration:** `google-generativeai` (Gemini)

---

## 🚀 Getting Started

The entire application is containerized and requires only Docker and Docker Compose to run locally.

### 1. Prerequisites
- Docker Engine & Docker Compose installed.

### 2. Environment Variables
Create a `.env` file in the `backend/` directory with the following variables:
```env
# backend/.env
GEMINI_API_KEY="your-google-gemini-api-key"
DEMO_MODE="true"  # Set to "false" to use real Gemini API instead of mocks
```

### 3. Build and Run
Start the application network using Docker Compose from the root directory:
```bash
docker compose up --build -d
```
This command spins up three containers:
1. `satquery-ai-db-1` (PostgreSQL running on port 5433)
2. `satquery-ai-backend-1` (FastAPI running on port 8000)
3. `satquery-ai-frontend-1` (Next.js running on port 3000)

### 4. Create an Admin Account
To access the platform, you must securely seed an Administrator account in the backend container:
```bash
docker exec satquery-ai-backend-1 python create_admin.py --name "Admin User" --email "admin@satquery.ai" --password "SatQuery123!"
```

### 5. Access the Application
- **Landing Page:** [http://localhost:3000](http://localhost:3000)
- **Application Dashboard:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Backend API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📂 Project Structure

```mermaid
gitGraph
   commit id: "SatQuery AI"
   branch frontend
   checkout frontend
   commit id: "/app (Pages & Layout)"
   commit id: "/components (UI & Charts)"
   commit id: "/lib (API Interceptors)"
   checkout main
   branch backend
   checkout backend
   commit id: "/api (FastAPI Routes)"
   commit id: "/services (CV & LLM Logic)"
   commit id: "/models (SQLAlchemy)"
   checkout main
   commit id: "docker-compose.yml"
```

### Key Directories
- `frontend/`: Next.js web application. Handles state management, JWT persistence, and data visualization.
- `backend/app/api/`: REST API endpoints grouped by feature (Auth, Admin, Imagery, Projects).
- `backend/app/services/`: Core logic layers. Contains the CV pipeline (segmentation, object detection) and the `vision_language_service.py` that translates data into prompts.
- `backend/app/models/`: SQLAlchemy ORM database schemas.

---

## 🔒 Authentication & Roles
SatQuery uses a strict Role-Based Access Control (RBAC) system. 
- **USER:** Default role. Can upload imagery, create projects, and run queries.
- **ADMIN:** Granted securely via backend. Has access to the `/admin` dashboard to view system stats, manage users, and inspect API usage.

The frontend never transmits role data directly; it is exclusively determined and enforced by the FastAPI backend during the JWT lifecycle.
