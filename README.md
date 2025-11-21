# TravelNest

A full-stack resort booking project (backend + frontend). This repository contains an Express/MongoDB backend and a static/Node-based frontend used to serve the client files.

**Overview**
- Backend: Node.js + Express, using `mongoose` for MongoDB, authentication with JWT, file uploads with `multer`, and Stripe for payments.
- Frontend: static HTML/CSS/JS files plus a small React component under `frontend/src` for admin forms. The frontend is served by `frontend/server.js`.

**Requirements**
- Node.js v16+ (or a current LTS)
- npm
- MongoDB (Atlas or local)

**Repository layout**
- `backend/` — Express server, models, controllers, routes
- `frontend/` — client files (static HTML/CSS/JS + small React component in `src`)
- `uploads/` — uploaded images and files (ignored by `.gitignore`)

**Environment variables**
Create a `.env` file in `backend/` with the values your app expects. Example variables (adjust names if your code uses different keys):

```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/your-db
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_...
```

Replace placeholders with your real values.

**Install dependencies**
Run the following from the project root to install backend and frontend dependencies:

```powershell
cd "D:\Projects\Tannu final project\minor-project2\backend"
npm install

cd "D:\Projects\Tannu final project\minor-project2\frontend"
npm install
```

**Run (development)**
- Start the backend (development with auto-reload):

```powershell
cd "D:\Projects\Tannu final project\minor-project2\backend"
npm run dev
```

- Start the frontend server (serves static files):

```powershell
cd "D:\Projects\Tannu final project\minor-project2\frontend"
npm start
```

Open your browser to the frontend entry (for example `http://localhost:3000` or check `frontend/server.js` for the port).

**Git LFS**
This repository uses Git LFS for large uploaded assets. When cloning, ensure `git lfs` is installed so LFS files are pulled correctly:

```powershell
# Install Git LFS (Windows)
choco install git-lfs    # if you use Chocolatey
# then run once per machine
git lfs install
```

**Deployment**
- For simple deployments you can host the backend on services like Heroku, Railway, Render or an Azure App Service and point the frontend to that backend.
- If you want a single server deployment, serve the built frontend from the backend (or keep the static files in `frontend/` and configure the backend to serve them).

**Useful Git commands**
- Create a feature branch: `git checkout -b feature/xyz`
- Push current branch: `git push -u origin <branch>`

**Contributing**
- If you accept contributions, add a `CONTRIBUTING.md` with guidelines.

**Notes**
- Sensitive files and `node_modules/` are ignored by `.gitignore`.
- Check `backend/package.json` and `frontend/package.json` for the exact scripts used; the README commands match the scripts found in this repo.

If you want, I can:
- add a short `Getting Started` section with exact ports read from `server.js`,
- add example `.env` variables to a `.env.example` file, or
- create a nicer project description and badges.

---
Generated README for `TravelNest`.
# TravelNest
minor project
