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
                    │   ResNet-50    │
                    └────────────────┘
