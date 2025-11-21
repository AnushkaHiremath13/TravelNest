# TravelNest

TravelNest is an interactive full-stack resort booking platform powered by Express and MongoDB with a modern HTML/CSS/JavaScript frontend. It lets users explore destinations, view detailed resort pages, and make secure bookings through Stripe payments. Each resort includes trusted YouTube vlog links for authentic visual insights and better decision-making. The platform supports user authentication, dynamic search, image uploads, and smooth page transitions. Admins can easily manage resorts and content through a built-in admin panel, ensuring a seamless booking experience.

This unique feature sets TravelNest apart from typical resort booking platforms by giving users real, trusted visual reviews through YouTube vlogs—helping them experience the resort before they book.

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
cd TravelNest
# Example local path used in this workspace:
# cd "d:\Projects\minor_project1\minor-project"
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
	- Public static HTML/CSS/JS pages are under `frontend/html`, `frontend/css`, and `frontend/js`.
	- Admin UI static files live under `frontend/admin/html`, `frontend/admin/css`, and `frontend/admin/js`.
	- A small React admin component exists in `frontend/src/components/` (e.g. `ResortForm.jsx`) for forms and uploads.
	

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

