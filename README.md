# Car Dealership Capstone Project

- **Repository name:** `car-dealership-capstone`
- **Project name:** `Car Dealership Capstone Project`

## Overview
A full-stack capstone for browsing dealership listings, dealer reviews, vehicle makes and models, and review sentiment. Dealer records are imported from OpenStreetMap; vehicle data comes from NHTSA vPIC. The project does not ship hardcoded dealer or review data.

## Features
- Public dealership listings, detail pages, and Kansas state filtering.
- Registration, login, logout, and CSRF-protected session authentication.
- Authenticated review submission with persistence in SQLite.
- VADER sentiment analysis.
- Live vehicle makes and models via NHTSA vPIC.
- Django admin, responsive React UI, About Us and Contact Us pages.
- CI checks and Docker packaging.

## Architecture and dependencies
- Backend: Django 5.2, Django REST Framework, SQLite, VADER, Requests.
- Frontend: React 19, Vite, React Router.
Python requirements are pinned in server/requirements.txt. JavaScript versions are pinned in server/frontend/package.json and package-lock.json. Use Python 3.13, Node 22 or later, and npm.

## Backend setup (PowerShell)
    cd server
    py -3.13 -m venv .venv
    python -m pip install -r requirements.txt
    Copy-Item .env.example .env
    python manage.py migrate
    python manage.py sync_dealers --state Kansas
    python manage.py runserver

Activate the virtual environment before running the commands above. The importer downloads current Kansas car-shop records from OpenStreetMap Overpass and upserts by OpenStreetMap source ID. Listing coverage depends on the live OSM dataset.

Create an admin locally with python manage.py createsuperuser. Enter credentials interactively; do not commit them.

## Frontend setup
In a second terminal:
    cd server/frontend
    npm ci
    npm run dev

Open http://127.0.0.1:5173. Vite proxies /djangoapp API requests to Django on port 8000. Run npm run build to create production static assets.

## Environment variables
Copy server/.env.example to server/.env. Settings load the local file, while process environment variables take precedence.
- DJANGO_SECRET_KEY: required with DJANGO_DEBUG=0; generate a private random value for production.
- DJANGO_DEBUG: use 1 locally and 0 in production.
- DJANGO_ALLOWED_HOSTS: comma-separated hostnames.
- DJANGO_CSRF_TRUSTED_ORIGINS: comma-separated HTTPS origins in production.
- DB_PATH: SQLite path; Docker uses /data/db.sqlite3.
- NHTSA_API_BASE: NHTSA vPIC API base.
- OVERPASS_URL: OpenStreetMap Overpass endpoint.

The root .gitignore excludes .env files, virtual environments, node_modules, build output, and local SQLite databases. Never commit passwords, cookies, tokens, or production secrets.

## Database and migrations
Schema changes are tracked as Django migrations.
    cd server
    python manage.py migrate
    python manage.py showmigrations

Dealer records are sourced from OpenStreetMap. Reviews are created by users. Car makes and models are fetched from NHTSA; no local car-catalog fixture is used.

## API endpoints
Base URL: http://127.0.0.1:8000

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /djangoapp/health | Health check |
| GET | /djangoapp/csrf | CSRF token and cookie |
| GET | /djangoapp/session | Current session status |
| POST | /djangoapp/register | Username, first name, last name, email, password |
| POST | /djangoapp/login | Start a session |
| POST | /djangoapp/logout | End an authenticated session |
| GET | /djangoapp/get_dealers | All imported dealers |
| GET | /djangoapp/get_dealers?state=Kansas | State filter; Kansas or KS |
| GET | /djangoapp/get_dealers/ID | Dealer details and reviews |
| GET | /djangoapp/get_reviews?dealerId=ID | Reviews for one dealer |
| POST | /djangoapp/add_review | Authenticated review creation |
| POST | /djangoapp/analyze_review | VADER analysis of review text |
| GET | /djangoapp/get_cars | NHTSA car makes |
| GET | /djangoapp/get_cars?makeId=474 | Models for an NHTSA make ID |

Example read-only calls:
    curl http://127.0.0.1:8000/djangoapp/get_dealers
    curl "http://127.0.0.1:8000/djangoapp/get_dealers?state=Kansas"
    curl "http://127.0.0.1:8000/djangoapp/get_reviews?dealerId=1"
    curl "http://127.0.0.1:8000/djangoapp/get_cars"
    curl -H "Content-Type: application/json" -d "{\"review\":\"Fantastic services\"}" http://127.0.0.1:8000/djangoapp/analyze_review

POST requests require a CSRF cookie and X-CSRFToken header. The React app manages this flow. Reusable cURL templates are in submission. The makes/models endpoint proxies NHTSA vPIC and returns 502 if the upstream service is unavailable; it does not substitute sample results.

## Tests and CI
    cd server
    python manage.py check
    python manage.py makemigrations --check --dry-run
    python manage.py test

    cd frontend
    npm ci
    npm test
    npm run build

GitHub Actions is configured in .github/workflows/ci.yml. It runs Django checks and tests, migrations, frontend tests/build, and static collection. It only attempts deployment after a manual dispatch when the owner configures the DEPLOY_WEBHOOK_URL secret. A skipped deploy is not a successful deployment.

## Docker deployment
1. Copy server/.env.example to server/.env.
2. Configure a generated DJANGO_SECRET_KEY, set DJANGO_DEBUG=0, and set production hosts and HTTPS CSRF origins.
3. From the repository root, run docker compose up --build.
4. The app listens on port 8000; SQLite persists in the dealership-data volume at /data.
5. Put an HTTPS reverse proxy in front of the service and retain the data volume when replacing containers.

No public deployment has been configured. Populate submission/deploymentURL only after verifying a real public deployment.

## Attribution and contact
OpenStreetMap data is © OpenStreetMap contributors under the Open Database License (ODbL). Vehicle makes and models come from NHTSA vPIC. The About and Contact pages use an original local SVG illustration.

No team names or support email were provided. Contact the project through the public issue tracker: https://github.com/nguyenbao140506-debug/car-dealership-capstone/issues
