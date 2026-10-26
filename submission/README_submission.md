# Car Dealership Capstone — Submission Readiness

## Current assessment

The new Django/React project has been implemented in this workspace from the brief, following the owner's selection to build it from scratch. Backend/frontend checks pass. Final evaluation evidence still depends on publishing, a working real-data source, an owner-provided or created account, and a public deployment.

The full project is public in [car-dealership-capstone](https://github.com/nguyenbao140506-debug/car-dealership-capstone). The complete README and source were pushed to `main` in commit `583615c1e663ff6b6d97f0b6dee746277fcfeb29`. The GitHub Actions run for that commit completed successfully: backend/frontend checks passed; the deployment job was skipped because no provider webhook secret is configured.

## Task checklist (1–28)

| # | Requirement / evidence | Status | Verified result or remaining step |
|---:|---|---|---|
| 1 | Full README and public README URL | PASS | Full project guide is public at the README URL below; commit 583615c. |
| 2 | Django server and submission/django_server | PASS | Server started from server/; verified startup output recorded. |
| 3 | About Us page | PARTIAL | Responsive page, CSS and local SVG are present and published. Genuine team names, roles, biographies and email addresses were not supplied, so the page says details are pending instead of inventing them. |
| 4 | Contact Us page | PASS | Responsive Contact page has Contact Us active and uses the public issue tracker as its verified contact channel. Django static-file discovery now includes the built frontend assets, including this page and its CSS. |
| 5 | Login cURL and verified response | PARTIAL | Route, CSRF/session behavior, and response verified in automated tests; live cURL output/account not available. Template is in submission/loginuser. |
| 6 | Logout cURL and invalidated session | PARTIAL | Logout response 200, subsequent session anonymous, repeat logout 401 in tests; live cURL output unavailable. |
| 7 | Five-field registration component | PASS | Public Register.jsx has Username, First Name, Last Name, Email, Password and Register button; CSS/API dependencies are published. Frontend tests pass. |
| 8 | Dealer reviews cURL for valid real ID | PARTIAL | Route and test-fixture response verified; no imported real dealer or review data. |
| 9 | All dealers cURL/output | PARTIAL | Route returns HTTP 200 and local database currently returns []; real OSM import failed due public service timeouts. |
| 10 | Dealer by ID cURL/output | PARTIAL | Detail and not-found behavior tested; no real dealership ID in local database. |
| 11 | Kansas filter cURL/output | PARTIAL | Kansas/KS case-insensitive filter tested; database has no dealer rows, so no real results. |
| 12 | Admin login and admin_login.png | PARTIAL | A local `root` superuser exists and Django startup was verified. A genuine post-login screenshot is still missing; in-app browser access to the isolated local server timed out. |
| 13 | Admin logout and admin_logout.png | PARTIAL | Django admin logout is implemented. A genuine screenshot after logging out is still missing. |
| 14 | Car makes API/output | PARTIAL | Live NHTSA upstream returned HTTP 200 and 195 makes; proxy logic is tested with a mocked upstream but not through app cURL. |
| 15 | Car models/API structure | PARTIAL | Live NHTSA Honda model endpoint returned HTTP 200 and 361 records; app exposes makeId but live app cURL was unavailable. |
| 16 | Exact “Fantastic services” sentiment | PARTIAL | VADER returned positive, compound=0.5574 and the response is recorded in submission/analyzereview. It was verified through Django's request client, not captured from a live cURL request. |
| 17 | Public home page listing and get_dealers.png | PARTIAL | Home route returns HTTP 200; no real dealer records and no screenshot. |
| 18 | Logged-in homepage and get_dealers_loggedin.png | PARTIAL | Session display and review action are implemented; browser evidence requires an owner-created test user and real dealers. |
| 19 | Kansas filter UI and dealersbystate.png | PARTIAL | Filter UI/API are implemented; needs real data and screenshot. |
| 20 | Dealer detail/reviews and dealer_id_reviews.png | PARTIAL | Detail/reviews UI/API are implemented; needs real dealer data and screenshot. |
| 21 | Filled review form and dealership_review_submission.png | PARTIAL | Review form is implemented; screenshot requires a browser session and dealer. |
| 22 | Persisted review and added_review.png | PARTIAL | Authenticated review creation/retrieval passes tests; screenshot requires a browser session and dealer. |
| 23 | GitHub Actions and successful run | PASS | Actions run 40270658609 completed successfully for commit 583615c. The backend/frontend checks and deployment-gate jobs passed; deploy was skipped because no deploy webhook secret is configured. |
| 24 | Real deployment URL | BLOCKED | Docker configuration and production settings are prepared; provider, credentials, persistent host and public domain are not configured. |
| 25 | deployed_landingpage.png | BLOCKED | Requires a verified public deployment. |
| 26 | deployed_loggedin.png | BLOCKED | Requires a verified deployment and account. |
| 27 | deployed_dealer_detail.png | BLOCKED | Requires a verified deployment and dealer data. |
| 28 | deployed_add_review.png | BLOCKED | Requires a verified deployment, account, dealer and persisted review. |

## Files implemented

- Root: README.md, .gitignore, Dockerfile, compose.yaml.
- CI: .github/workflows/ci.yml.
- Django: server/config/, server/dealerships/, server/requirements.txt, server/.env.example.
- React: server/frontend/src/, server/frontend/static/, Vite config and package lockfile.
- Submission evidence and task report: files in this submission directory.

## Commands and verified checks

Executed on 2026-10-26:
- python manage.py check — passed after the static-file settings update.
- python manage.py makemigrations --check --dry-run — no changes detected.
- python manage.py test — 10 tests passed.
- python manage.py check --deploy with production environment variables — no issues.
- python manage.py findstatic About.html Contact.html site.css project-logo.svg — all four frontend assets found in the selected static directory.
- python manage.py collectstatic --noinput --clear — passed after avoiding duplicate static directory discovery.
- npm test -- --run — 2 tests passed after the static-file settings update.
- npm run build — passed after the static-file settings update.
- python manage.py runserver 127.0.0.1:8000 --noreload — startup succeeded; see submission/django_server.
- GitHub Actions run 40270658609 — completed successfully at https://github.com/nguyenbao140506-debug/car-dealership-capstone/actions/runs/40270658609; backend/frontend checks success, deploy skipped by the missing webhook secret.
- Django request-client checks: homepage, About, Contact, admin login, and health returned HTTP 200. Empty dealer list/Kansas list returned HTTP 200 and []; ID 1 returned HTTP 404 because there are no dealer rows.
- Sentiment endpoint returned the VADER response recorded in submission/analyzereview.
- Live NHTSA vPIC requests returned HTTP 200: 195 car makes; Honda make ID 474 returned 361 models.
- Dealer import attempted with Overpass: default host timed out, Private.coffee timed out, and maps.mail.ru returned HTTP 504. A direct Overpass API URL was also inaccessible via the web reader. No records were inserted.
- PyYAML successfully parsed .github/workflows/ci.yml; actionlint and Docker are not installed. No Docker image build, GitHub Actions run, or public deployment was performed.
- Separate cURL calls could not reach the local dev server because the execution sandbox isolates loopback listeners. A same-command server/cURL smoke check also timed out from its parent shell. cURL templates are included; test-client verification is labeled accordingly.
- Full source was pushed to public `main` at commit 583615c; GitHub Actions run 40270658609 completed successfully. GitHub CLI is not installed; GitHub integration is not needed for the verified push.

## Data and evidence integrity

Dealer records are sourced from OpenStreetMap shop=car records using python manage.py sync_dealers --state Kansas. Public Overpass services were unavailable during this run, so the local database contains zero dealers. The app does not ship fabricated dealership or review data. Automated dealer fixtures exist only in the test database.

No screenshots, cURL cookies, CSRF tokens, API keys, or deployment secrets were created. A temporary local-only `root` superuser was created for Task 12; its password was provided to the project owner in this chat. The local database is ignored by Git and is not published.

## Manual steps remaining

1. Retry the OSM import when a public Overpass endpoint is healthy or provide an alternate authorized data source. Confirm real records appear before capturing dealer evidence.
2. Run the app from a local terminal that can reach the browser and capture genuine admin login/logout screenshots without showing credentials.
3. Retry the OSM import when an Overpass endpoint is reachable. Use real dealer IDs and a test account to capture local dealer/review evidence and live cURL responses.
4. Choose/configure a public deployment provider with persistent storage and secrets, deploy, and verify /djangoapp/health.
5. Capture deployed screenshots only after a real deployment and public health check succeed.

## URLs

- Public repository: https://github.com/nguyenbao140506-debug/car-dealership-capstone
- Public README URL: https://github.com/nguyenbao140506-debug/car-dealership-capstone/blob/main/README.md
- Public About page: https://github.com/nguyenbao140506-debug/car-dealership-capstone/blob/main/server/frontend/static/About.html (commit 5201fb7)
- Public Contact page: https://github.com/nguyenbao140506-debug/car-dealership-capstone/blob/main/server/frontend/static/Contact.html (commit 4c9244c)
- Public Register component: https://github.com/nguyenbao140506-debug/car-dealership-capstone/blob/main/server/frontend/src/components/Register/Register.jsx (commit 72e276e)
- Full application source and README: https://github.com/nguyenbao140506-debug/car-dealership-capstone/tree/main (commit 583615c)
- Successful GitHub Actions run: https://github.com/nguyenbao140506-debug/car-dealership-capstone/actions/runs/40270658609
- Public deployment URL: NONE — no deployment exists.
- Git remote in this workspace: origin points to the public car-dealership-capstone repository; local master has no commits.

The complete Django/React application, full README, CI workflow and submission guide are now public. Tasks still marked PARTIAL or BLOCKED require genuine screenshots, real OSM data/reviews, a public deployment provider, or real cURL access from a non-isolated local terminal.
