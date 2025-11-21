# TravelNest

An interactive full-stack resort booking application. TravelNest includes an Express + MongoDB backend and a static frontend (HTML/CSS/JS) with a small admin React component. It supports user authentication, image uploads, bookings and Stripe payments.

Features
- Resort listing and details
- User signup / login with JWT
- Admin area for adding/editing resorts and packages
- Image upload support for resorts (stored in `uploads/`)
- Booking creation and payment processing with Stripe
- Basic dashboard and user management pages

Prerequisites
- Node.js 16+ and npm
- MongoDB (Atlas recommended) or a local MongoDB server


Quick install
1. Clone the repository:

```powershell
git clone https://github.com/AnushkaHiremath13/TravelNest.git
cd "D:\Projects\Tannu final project\minor-project2"
```

2. Install backend dependencies and frontend dependencies:

```powershell
cd backend
npm install

cd ../frontend
npm install
```

Environment variables
Create a `.env` file in the `backend/` directory. Typical variables used by this project:

```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/travelnest
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_...
ADMIN_KEY=<optional-admin-key-if-used>
```

How it works (high level)
- Backend:
	- `server.js` wires Express, connects to MongoDB, and mounts routes.
	- Models (`backend/models/`) include `User`, `Resort`, `Booking`, and `Payment`.
	- Controllers handle auth, resort CRUD, bookings, and payments.
	- `multer` handles multipart image uploads and stores them under `uploads/`.
	- Stripe integration is used for payment intent creation and payment processing.

- Frontend:
	- Static HTML/CSS/JS pages under `frontend/html` and `frontend/js` for the public site and admin UI.
	- A small React admin component exists in `frontend/src` for forms and uploads.

Deployment notes
- For hosting the backend: consider Render, Railway, Heroku, or an Azure App Service. Ensure `MONGODB_URI` and `STRIPE_SECRET_KEY` are set in the environment of the deployed service.
- For a single-server deploy, configure Express to serve the frontend static files and host both backend and frontend from one service.

Large files
- This repository uses Git LFS for large uploaded assets (images). When cloning, install Git LFS and run `git lfs install` so LFS files are pulled correctly.

Useful commands
- Run backend tests / start dev server:
	- `cd backend && npm run dev`
- Start frontend server:
	- `cd frontend && npm start`
- Create a branch and push:
	- `git checkout -b feature/your-feature`
	- `git add . && git commit -m "Add feature"`
	- `git push -u origin feature/your-feature`

Dependencies (high level)
- Backend: `express`, `mongoose`, `jsonwebtoken`, `multer`, `stripe`, `bcrypt`/`bcryptjs`, `dotenv`, `morgan`
- Frontend: static files (HTML/CSS/JS), a small React component; `express` used to serve static files; `axios` for HTTP requests

Contributing
- Please open issues or pull requests. If you'd like, I can add a `CONTRIBUTING.md` with guidelines.


Acknowledgments
- Built using Node.js, Express and MongoDB
- Stripe for payments
- Thanks to the open-source libraries used throughout the project
