# SmartCampus - Student Resource Exchange Platform

A clean, full-stack student-to-student marketplace built for a specific college campus. Students can list, discover, request, and exchange textbooks, handwritten lecture notes, and engineering stationery without middleman commissions or third-party delivery fees.

---

## 1. What SmartCampus Is

SmartCampus is a campus-isolated resource marketplace designed for a single college institution. 
- **Campus Isolation**: When deployed, an administrator configures the campus name and a secret **Campus Code**. Normal students must enter this exact campus code upon registration. Students from outside institutions cannot view or interact with items.
- **Resource Categories**:
  1. **Books** (Textbooks, reference books, study guides)
  2. **Notes / Study Material** (Handwritten lecture notes, question banks, diagrams)
  3. **Stationery** (Drafters, compass sets, scientific calculators, rulers)
- **Peer-to-Peer Handover**: Every listing is paid (no free items, no online credit card/payment gateways). The buyer and seller coordinate directly on campus for cash/UPI payment and physical handover once the request is accepted.

---

## 2. Technologies Used

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas with Mongoose ODM (includes automatic in-memory compatibility fallback for zero-configuration testing)
- **Authentication**: Session-based authentication with `express-session` and `bcryptjs` password hashing (No JWT, passwords never stored in plain text)
- **Image Storage**: Direct MongoDB document storage with client-side canvas compression

---

## 3. How to Configure MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in or create a free account.
2. Create a free **M0 Sandbox Cluster**.
3. Under **Database Access**, create a database user with username and password (e.g. `campus_admin` and a strong password).
4. Under **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere** (`0.0.0.0/0`) for dev/cloud deployment.
5. In your cluster dashboard, click **Connect** → **Drivers** (Node.js).
6. Copy the connection string, which looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/smartcampus?retryWrites=true&w=majority
   ```
7. Paste this string into your `.env` file as `MONGODB_URI`.

> **Viva Note**: If `MONGODB_URI` is not set or network is offline during your presentation, the application automatically runs in local in-memory storage mode so your presentation never crashes!

---

## 4. How to Start the Application

### Combined Full-Stack Server (Recommended)
The project runs full-stack with Express serving API endpoints and mounting Vite dev middleware:

```bash
# 1. Install dependencies
npm install

# 2. Run dev server (Express + Vite on Port 3000)
npm run dev
```

Open your browser at `http://localhost:3000`.

### Production Build & Run
```bash
# Build frontend assets
npm run build

# Start production server
npm start
```

---

## 5. Required Environment Variables

Create a `.env` file in the root directory:

```env
# Server Port
PORT=3000

# Secret string used to sign session cookies
SESSION_SECRET="smartcampus-college-viva-session-secret-2025"

# MongoDB Atlas Connection String
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/smartcampus?retryWrites=true&w=majority"
```

---

## 6. Basic Project Structure

```
smartcampus/
├── package.json               # Scripts and dependencies
├── server.ts                  # Express server entry point + Vite dev middleware
├── index.html                 # HTML entry point with metadata
├── server/
│   ├── db.ts                  # Mongoose connection & storage repository
│   ├── models.ts              # Mongoose Schemas (Campus, User, Resource, Request, Review, ReviewReport)
│   └── routes/
│       ├── campus.ts          # Setup & status endpoints
│       ├── auth.ts            # Register, Login, Session, Profile routes
│       ├── resources.ts       # CRUD operations for marketplace resources
│       ├── requests.ts        # Request, Accept, Reject, Complete workflow
│       └── reviews.ts         # Seller rating, Review creation, Report review
├── src/
│   ├── main.tsx               # React DOM entry point
│   ├── App.tsx                # Main state controller & view router
│   ├── types.ts               # Shared TypeScript interfaces
│   ├── utils.ts               # Currency formatting & image compression
│   └── components/
│       ├── Navbar.tsx         # Header conforming to standard top bar contract
│       ├── SetupScreen.tsx    # One-time college instance setup screen
│       ├── AuthModal.tsx      # Student registration & login dialog
│       ├── HomeView.tsx       # Campus landing page with hero & categories
│       ├── BrowseView.tsx     # Filterable marketplace (search, condition, price)
│       ├── ProfileView.tsx    # Student dashboard (My Listings, Requests, Reviews)
│       ├── ResourceCard.tsx   # Marketplace card with unboxed metadata
│       ├── ResourceDetailModal.tsx # Full item details & seller reputation
│       ├── AddEditResourceModal.tsx # Form to list or edit resources + photo upload
│       ├── DeleteConfirmModal.tsx   # Confirmation dialog before deletion
│       ├── ReviewModal.tsx          # 1-5 star review form for completed orders
│       └── ReportReviewModal.tsx    # Report inappropriate reviews
└── README.md
```

---

## 7. Explanation for College Viva

### A. Authentication Architecture
- **Session-Based vs JWT**: Session authentication keeps session identifiers stored in HTTP-only browser cookies (`connect.sid`). On every request, Express matches the session ID in server memory/database to retrieve `userId` and `campusId`.
- **Password Security**: Passwords are never stored in plain text. Before saving to MongoDB, the backend calls `bcrypt.hash(password, 10)` to compute a one-way cryptographic hash with salt rounds. During login, `bcrypt.compare()` verifies the entered password against the stored hash.

### B. Complete Request / Sale / Review Workflow
1. **Listing Creation**: A logged-in student fills out title, category (Books, Notes, Stationery), description, condition, price (> 0), and uploads an image from their device.
2. **Resource Request**: A buyer browses listings and clicks "Request Resource". A `Request` document is created in MongoDB with status `Pending`.
3. **Seller Decision**:
   - The seller visits **Profile → My Listings** to inspect incoming requests.
   - The seller can accept one request.
   - Upon acceptance:
     - The selected request becomes `Accepted`.
     - The resource status automatically becomes `Sold`.
     - All other pending requests for that resource become `Rejected`.
     - The resource is now read-only (it cannot be edited or deleted).
4. **Contact Info Reveal**:
   - For privacy, seller email is **never** publicly displayed on resource cards.
   - Only when a request is `Accepted`, the buyer's **My Requests** view reveals the seller's email address so they can coordinate physical campus meetup.
5. **Transaction Completion**:
   - Once the physical item and payment are exchanged on campus, **only the buyer** can click **"Mark Transaction Completed"**.
   - The request status updates to `Completed`.
6. **Seller Review**:
   - After completion, the buyer can leave a 1 to 5 star rating and written review.
   - Duplicate reviews for the same transaction are prevented at both database and API levels.
   - Other students can read these reviews on the seller's profile and item pages.
7. **Reporting**:
   - Any inappropriate review can be flagged with the "Report Review" button, recording the report reason and reporting user ID into the `ReviewReport` collection.
