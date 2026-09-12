# PawMatch

PawMatch is a web app that helps people find lost pets by connecting lost and spotted pet reports.

Instead of relying on scattered posts and hoping someone recognizes a pet, users can upload a photo, provide details about where and when the pet was last seen, and find potential matches from existing reports.

The app combines photo matching with location-based search so users can approach the problem from both directions: finding visually similar pets or scouting the local area on a map.

# How It Works

## 1. Create a Report

A user creates a report for either a lost or spotted pet and provides basic information:

> Pet name
> 
> Description
> 
> Photo
> 
> Location
> 
> Date and time last seen

Reports are securely saved with their location so they can later be used for matching and nearby map searches.

## 2. Analyze the Photo
When a pet photo is submitted, our Artificial Intelligence analyzes the image to identify the pet's unique physical features. It converts the photo into a digital "fingerprint." This allows the system to accurately compare shapes, colors, and patterns rather than just looking at standard image files.

## 3. Smart Matching
The system instantly compares the new digital fingerprint against all other active reports in the database to find the highest-probability matches. The matching process calculates a score based on three factors:

Visual similarity: 70%

Location distance: 25%

Time elapsed: 5%

To keep results accurate, only unresolved, active reports are considered when generating matches. Once a pet is marked as safely reunited, it is removed from the search pool.

## 4. Scout Nearby
Users can search for reports around a specific location using a search radius. These nearby reports are calculated using map coordinates and displayed on an interactive community map. When several reports are close together, they are automatically grouped into neat clusters to make the map easy to explore.

## Architecture

PawMatch is split into a Next.js application and a separate Python service for image processing.

```text
                    ┌─────────────────────┐
                    │      Next.js UI     │
                    │ React + TypeScript  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    Server Actions   │
                    │      Prisma ORM     │
                    └───────┬───────┬─────┘
                            │       │
                ┌───────────▼──┐  ┌─▼──────────────┐
                │ PostgreSQL   │  │ Supabase       │
                │ + pgvector   │  │ Image Storage  │
                └──────────────┘  └────────────────┘
                            ▲
                            │
                    ┌───────┴────────┐
                    │   FastAPI      │
                    │   PyTorch      │
                    └────────────────┘
```
## Running Locally

### Prerequisites

Ensure your local development environment has the following installed:
*   **Node.js** (v18+) and **npm**
*   **Python** (v3.9+)
*   **PostgreSQL** (must have the `pgvector` extension enabled)
*   **Supabase** (an active project for image storage)

---

### 1. Clone the Repository
```bash
git clone [https://github.com/Ayush-Chauhan025/PawMatch.git](https://github.com/Ayush-Chauhan025/PawMatch.git)
cd PawMatch
```

### 2. Set Up the Frontend
Navigate to the frontend directory and install the necessary packages:
```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` directory and add your connection strings:
```env
DATABASE_URL="your-database-url"
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
ML_SERVICE_URL="[http://127.0.0.1:8000](http://127.0.0.1:8000)"
```

Apply the database schema to PostgreSQL and generate the Prisma client:
```bash
npx prisma db push
npx prisma generate
```

### 3. Set Up the ML Service
Open a new terminal window from the project root and navigate to the Python service:
```bash
cd backend/ml-service
python -m venv venv
```

Activate the virtual environment:
```bash
# Linux / macOS
source venv/bin/activate

# Windows
venv\Scripts\activate
```

Install the required Python dependencies:
```bash
pip install fastapi uvicorn python-multipart torch torchvision Pillow
```

### 4. Start the ML Service
Verify that your trained model checkpoint is available in the expected location, then boot the FastAPI server:
```bash
uvicorn main:app --reload
```
*The ML service is now active at `http://127.0.0.1:8000`.*

### 5. Start the Frontend
Open a final terminal window, navigate back to the frontend, and start the Next.js development server:
```bash
cd frontend
npm run dev
```

### Verification
You should now have both core services running concurrently:
*   **Frontend UI:** `http://localhost:3000`
*   **ML API Service:** `http://127.0.0.1:8000`

> **Note:** The trained model checkpoint is not included in the repository due to
> file size. The demo video shows the complete working application and its
> image-matching functionality.

# Demo

[![PawMatch Demo](https://img.youtube.com/vi/GiAwnsMdjXA/0.jpg)](https://youtube.com/shorts/GiAwnsMdjXA?feature=share)
