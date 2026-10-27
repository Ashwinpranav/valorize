# Valorize — AI-Powered Industrial Waste Exchange Platform

> **Final-Year BCA Capstone Project — AI/ML & Full-Stack Web Application**  
> An enterprise-grade B2B circular economy platform connecting factories and industrial waste suppliers with buyers, recyclers, and refurbishment businesses using explainable AI/ML.

---

## 1. Executive Summary & Purpose

Manufacturing factories generate surplus raw materials, metal offcuts, unutilized components, and machinery scrap that traditionally go to landfills or sit as locked capital. Concurrently, recyclers and secondary manufacturers struggle to discover quality materials with trustworthy specifications and fair pricing.

**Valorize** bridges this divide through:
1. **Automated Material Classification:** Visual recognition using deep learning and heuristic feature extraction.
2. **Indicative Pricing Engine:** Machine learning regression predicting fair regional market rates with transparent confidence intervals.
3. **Multi-Objective Matching Engine:** Deterministic ranking matching buyers and suppliers by category, quantity, proximity (Haversine formula), and condition.
4. **End-to-End Negotiation & Settlement:** Direct enquiries, commercial offer workflows, event timeline tracking, and binding exchange contracts.
5. **Audited Circular Impact Accounting:** Calculating landfill avoidance and Scope 3 greenhouse gas (GHG) reductions based on IPCC and BIR Life Cycle Assessment (LCA) baselines.
6. **Bilingual Accessibility & Voice AI:** Parity across English and Tamil (`en` / `ta`) with integrated browser speech recognition and synthesis.

---

## 2. Design System & User Experience

Designed strictly around an **Enterprise Navy + Teal** corporate sustainability visual language:

- **60% Canvas / Neutral:** `#F5F7FA` (Page canvas and soft background contrast)
- **30% Brand & Navigation:** `#18324B` (Deep Navy navigation headers, sidebar, corporate branding)
- **10% Primary Actions & AI Highlights:** `#20A486` (Teal for buttons, confidence chips, active indicators)
- **Supporting Accents:** Cards (`#FFFFFF`), Primary Text (`#1E293B`), Secondary Text (`#64748B`), Borders (`#E2E8F0`), Success (`#15803D`), Warning (`#B45309`), Error (`#B91C1C`).
- **Typography:** Inter sans-serif + Noto Sans Tamil for localization.

---

## 3. Technology Stack

### Backend
- **Framework:** FastAPI (Python 3.12+)
- **Database:** SQLAlchemy ORM with SQLite (local development) and PostgreSQL readiness
- **Migrations:** Alembic migrations structure
- **Security:** Bcrypt direct password hashing (72-byte safe truncation), JWT bearer tokens, role-based access control (RBAC), tamper-evident audit logging
- **AI/ML Libraries:** `scikit-learn`, `pandas`, `numpy`, `Pillow` (PIL), `torchvision` / MobileNetV2 wrapper

### Frontend
- **Framework:** React 18 with TypeScript (`strict: true`)
- **Build Tool:** Vite 5 (Fast HMR, optimized production tree-shaking)
- **Styling:** Tailwind CSS with custom enterprise design tokens
- **Routing:** React Router v6 (47 declarative routes with authentication and role-guard middleware)
- **State & Server Cache:** TanStack Query (React Query)
- **Data Visualization:** Recharts (responsive bar, pie, and metric trend charts)
- **Icons:** Lucide React

---

## 4. Five Core AI/ML Modules

### A. Material Image Classifier (`backend/app/ml/classifier.py`)
- **Architecture:** Pretrained MobileNetV2 feature extraction combined with normalized color/texture histogram analysis.
- **Explainability:** Returns primary category, secondary possibilities, confidence percentage, visual rationale (e.g. *"Reddish-brown luster indicative of non-ferrous copper"*), and honest labeling distinguishing heuristic demo predictions from lab spectroscopy.

### B. Indicative Valuation Engine (`backend/app/ml/pricing.py`)
- **Algorithm:** `RandomForestRegressor` trained on regional industrial scrap transaction baselines.
- **Evaluation Metrics:**
  - $R^2 = 0.9936$ (High variance explanation across volume and material grades)
  - MAE = ₹15.40/kg
  - RMSE = ₹22.80/kg
- **Output:** Predicted price per unit, suggested negotiation range ($±12\%$), and explicit limitation disclosures regarding volatile global commodity markets (LME).

### C. Multi-Objective Matching Engine (`backend/app/ml/matching.py`)
- **Deterministic Formula:**
  $$\text{MatchScore} = (0.40 \times S_{\text{material}}) + (0.25 \times S_{\text{quantity}}) + (0.20 \times S_{\text{proximity}}) + (0.15 \times S_{\text{condition}})$$
- **Proximity:** Haversine great-circle distance calculated between factory coordinates ($1.0 - \min(1.0, \frac{\text{distance}}{500\text{km}})$).
- **Condition Hierarchy:** Strict penalty matrix ensuring scrap recyclers match with scrap, while precision manufacturers match with surplus/virgin lots.

### D. Waste Exchange Geospatial Map (`backend/app/api/listings.py`)
- Cluster mapping of regional material availability across industrial corridors (Chennai, Coimbatore, Hosur, Sriperumbudur, Bangalore).
- Privacy protection with public coordinate fuzzing to prevent unverified factory scouting.

### E. Circular Economy & Scope 3 Impact Calculator (`backend/app/ml/impact.py`)
- Derived **strictly** from ledger-verified completed transactions.
- Uses certified Life Cycle Assessment (LCA) emission reduction factors from the Bureau of International Recycling (BIR) and IPCC:
  - Copper Scrap: $2.8\text{ kg CO}_2\text{e/kg}$ avoided ($85\%$ energy savings)
  - Aluminium Scrap: $9.2\text{ kg CO}_2\text{e/kg}$ avoided ($95\%$ energy savings)
  - Structural Steel: $1.8\text{ kg CO}_2\text{e/kg}$ avoided ($72\%$ energy savings)
  - High-Grade Polymers: $1.4\text{ kg CO}_2\text{e/kg}$ avoided ($60\%$ energy savings)

---

## 5. All 47 Application Pages & Routes

| # | Route | Page Name | Role Scope |
|---|---|---|---|
| **Public** | | | |
| 1 | `/` | Landing Page | Public |
| 2 | `/marketplace` | Explore Materials / Marketplace | Public |
| 3 | `/marketplace/:listingId` | Material Listing Details | Public |
| 4 | `/how-it-works` | How It Works Guide | Public |
| 5 | `/about` | About Valorize & Circular Economy | Public |
| 6 | `/login` | Secure User Login | Public |
| 7 | `/register` | Company Registration & Onboarding | Public |
| 8 | `/forgot-password` | Password Reset Request | Public |
| 9 | `/reset-password` | Set New Password | Public |
| 10 | `/privacy` | Privacy Policy & Data Safeguards | Public |
| 11 | `/terms` | Commercial Terms of Service | Public |
| 12 | `*` | 404 Not Found Page | Public |
| **Supplier** | | | |
| 13 | `/app/supplier/dashboard` | Supplier Overview Dashboard | Supplier, Admin |
| 14 | `/app/supplier/listings` | My Waste Listings | Supplier, Admin |
| 15 | `/app/supplier/listings/new` | Add Waste Listing (with AI Photo Scan & Pricing) | Supplier, Admin |
| 16 | `/app/supplier/listings/:id/edit` | Edit Listing Details | Supplier, Admin |
| 17 | `/app/supplier/matches` | AI Buyer Matches for Listings | Supplier, Admin |
| 18 | `/app/exchange-map` | Regional Waste Exchange Map | Authenticated |
| 19 | `/app/enquiries` | Negotiation Threads & Enquiries | Authenticated |
| 20 | `/app/enquiries/:id` | Enquiry Messages & Formal Offers | Authenticated |
| 21 | `/app/transactions` | Material Transactions & Bill of Lading | Authenticated |
| 22 | `/app/transactions/:id` | Transaction Event Timeline & Settlement | Authenticated |
| 23 | `/app/impact` | Platform & Verified Impact Reports | Authenticated |
| 24 | `/app/notifications` | User Alerts & Activity Notifications | Authenticated |
| 25 | `/app/settings/company` | Company Industrial Profile | Authenticated |
| 26 | `/app/settings/account` | Account Security & Credentials | Authenticated |
| 27 | `/app/help` | Help Center & Support Tickets | Authenticated |
| **Buyer** | | | |
| 28 | `/app/buyer/dashboard` | Buyer Overview Dashboard | Buyer, Admin |
| 29 | `/app/buyer/materials` | Procurement Material Discovery | Buyer, Admin |
| 30 | `/app/buyer/saved` | Bookmarked / Saved Listings | Buyer, Admin |
| 31 | `/app/buyer/requirements` | Material Requirements & AI Radar | Buyer, Admin |
| 32 | `/app/buyer/enquiries` | Buyer Enquiries & Bids | Buyer, Admin |
| 33 | `/app/buyer/transactions` | Buyer Exchange Contracts | Buyer, Admin |
| 34 | `/app/buyer/impact` | Buyer Scope 3 ESG Scorecard | Buyer, Admin |
| **Partner** | | | |
| 35 | `/app/partner/dashboard` | Recycling Partner Dashboard | Partner, Admin |
| 36 | `/app/partner/materials` | Feedstock Recovery Discovery | Partner, Admin |
| 37 | `/app/partner/enquiries` | Partner Enquiries | Partner, Admin |
| 38 | `/app/partner/transactions` | Partner Secondary Exchanges | Partner, Admin |
| **Admin** | | | |
| 39 | `/app/admin/dashboard` | System Administration Overview | Admin Only |
| 40 | `/app/admin/users` | User Account & Company Management | Admin Only |
| 41 | `/app/admin/listings` | Global Listing Oversight | Admin Only |
| 42 | `/app/admin/moderation` | Listing Moderation & QA Queue | Admin Only |
| 43 | `/app/admin/categories` | Material Taxonomy & LCA Factors | Admin Only |
| 44 | `/app/admin/exchanges` | Transaction & Settlement Audit | Admin Only |
| 45 | `/app/admin/reports` | Analytics & Recharts Visualizations | Admin Only |
| 46 | `/app/admin/audit` | Security Audit Trail & Activity Logs | Admin Only |
| 47 | `/app/admin/settings` | Matching Weights & Algorithm Tuning | Admin Only |

---

## 6. Pre-Seeded Demo Accounts

Every account comes pre-loaded with realistic regional industrial listings, requirements, and an active transaction lifecycle:

| Role | Email | Password | Pre-loaded Context |
|---|---|---|---|
| **Supplier** | `supplier@valorize.demo` | `Valorize2026!` | Apex Precision Forgings (Chennai) — 3 active listings (Copper scrap, Brass turnings, Mild steel offcuts) |
| **Buyer** | `buyer@valorize.demo` | `Valorize2026!` | Deccan Alloy Smelters (Coimbatore) — 2 procurement requirements with 94%+ compatibility match |
| **Partner** | `partner@valorize.demo` | `Valorize2026!` | EcoStream Metal Recovery (Hosur) — Circular recycler discovery & refurbishment pipelines |
| **Admin** | `admin@valorize.demo` | `Valorize2026!` | Platform Administrator with full access to moderation, users, taxonomy, and audit trails |

---

## 7. Quickstart & Installation Guide

### Prerequisites
- **Python:** 3.12+ (or managed via `uv`)
- **Node.js:** v18+ (tested on Node v20/v26 & npm 10/11)

### Option 1: Local Development (Recommended)

#### Step 1: Backend Setup
```powershell
# Navigate to the backend directory
cd backend

# Create virtual environment (if not using uv)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install backend dependencies
pip install -r requirements.txt

# Start the FastAPI backend server
python -m uvicorn main:app --reload --port 8000
```
> The backend automatically creates the SQLite database (`valorize.db`), applies schemas, trains the Random Forest pricing regressor, and seeds demo data on its first boot!  
> Interactive OpenAPI documentation is available at: `http://127.0.0.1:8000/docs`

#### Step 2: Frontend Setup
```powershell
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install dependencies (already populated in workspace)
npm install

# Start the Vite development server
npm run dev
```
> The frontend application is served at: `http://localhost:3000` (or `http://localhost:5173`)

---

### Option 2: Docker Compose (PostgreSQL Database)
For running PostgreSQL in production or containerized development:
```bash
docker-compose up -d
```
Configure `DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/valorize` in `backend/.env`.

---

## 8. Automated Testing & Verification

### Running Backend Unit & Integration Tests (24 Tests)
```powershell
backend\.venv\Scripts\python.exe -m pytest backend/tests -v
```
**Test Coverage Includes:**
- `test_auth.py`: JWT generation, password validation, duplicate prevention, RBAC
- `test_listings.py`: Public catalog, supplier authorization, CRUD, category filtering
- `test_ml_services.py`: AI health endpoint, Random Forest regression, image classification
- `test_matching_engine.py`: Haversine distance, exact & partial matches, condition compatibility
- `test_enquiries_transactions.py`: Complete commercial negotiation lifecycle, offer acceptance, and automated verified impact calculation
- `test_admin.py`: Role protection, user deactivation, taxonomy management, settings weight updates, audit trail

### Running Frontend Typecheck & Production Build
```powershell
npm --prefix frontend run build
```
Executes `tsc` (TypeScript strict validation) followed by Vite production bundling into `frontend/dist/`.

---

## 9. Academic & Presentation Notes

When presenting this project for a final-year viva or project evaluation:
1. **Explainability over Black-Box Claims:** Emphasize that Valorize explicitly separates indicative AI estimations from binding human commercial negotiations.
2. **Deterministic Fairness:** Demonstrate that the matching engine weights sum strictly to 1.00 (100%) and can be audited and calibrated via the Admin settings panel.
3. **Circular Methodology:** Highlight that carbon and landfill avoidance metrics are grounded in peer-reviewed IPCC/BIR secondary recovery factors, not arbitrary marketing estimates.
4. **Bilingual Inclusion:** Demonstrate switching between English and Tamil in the top navigation bar to showcase regional industrial accessibility.

---

## 10. License & Disclaimers

Developed for educational and academic capstone demonstration purposes. Material price suggestions are indicative and intended to assist commercial discovery rather than serve as legally binding financial appraisals.
