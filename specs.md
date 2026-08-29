# Project Overview & Tech Stack

## Project Overview
Build a full-stack AI-assisted **College Complaint & Operations Management System** called **CampusVoice AI** (or **EduResolve**). The platform bridges students, college administrators, and department staff by digitizing and automating the entire campus complaint lifecycle. Students can log issues regarding classrooms, laboratories, hostels, Wi-Fi, infrastructure, transportation, and cleanliness, attached with images and precise campus locations. The system uses AI to auto-categorize issues, detect duplicates, generate summary digests for administrators, and classify uploaded issue photos. Administrators can assign complaints to responsible department heads, track resolution progress in real time, auto-escalate stagnant complaints, and analyze resolution efficiency through detailed department analytics.

## Tech Stack
- **Frontend**: Next.js (Pages Router or App Router with React 19 / 18), Tailwind CSS, Zustand (state management), Axios, Socket.IO client, Chart.js / Recharts (analytics graphs), Lucide React (icons), and Lucide UI components.
- **Backend**: Node.js, Express, MongoDB with Mongoose ODM, JSON Web Tokens (JWT), bcryptjs, Multer (multipart handling), Cloudinary SDK (or local fallback storage), Socket.IO, Nodemailer / Resend API (email notifications), and Node-Cron / BullMQ on Redis (for auto-escalation queues).
- **AI Integration**: Google Generative AI SDK (Gemini API) or OpenAI / Groq API for complaint auto-categorization, AI summary generation, duplicate complaint detection, and visual issue classification.
- **Real-Time & Communications**: Socket.IO for live status updates & admin updates timeline, and Nodemailer / Resend for automated transactional emails (submission receipts, status updates, escalation alerts).

---

# Authentication, Workflows, and System Architecture

## Authentication & Role-Based Access Control (RBAC)
- **Roles**: 
  - `Student`: Can submit complaints, track progress, view complaint history, post clarification comments, and rate resolved issues.
  - `Admin`: System administrator with access to all complaints, assignment controls, department management, analytics dashboard, and system settings.
  - `Department Staff / Head`: Departmental manager (e.g., Hostel Warden, IT Admin, Maintenance In-charge) responsible for working on assigned complaints, updating status, and providing resolution details.
- **Security & Session**: Registration with email domain verification (`@college.edu` optional), login, JWT session management stored securely in HTTP-only cookies or local client headers with Zustand persistence, password hashing via `bcryptjs` (cost factor 12), and protected routes middleware enforcing role permissions.

## Complaint Lifecycle Workflow
The complaint transitions through six standardized states:
1. **Submitted**: Initial state upon student creation.
2. **Under Review**: Admin/Department lead opens and reviews complaint details.
3. **Assigned**: Admin maps complaint to a specific department (e.g., IT, Maintenance, Hostel, Transport) and staff member.
4. **In Progress**: Staff works on resolving the physical or operational issue.
5. **Resolved**: Staff marks issue complete and posts resolution details/proof.
6. **Closed**: Student verifies resolution and provides feedback/rating, closing the ticket.

```
[Student Submits] ──> (Submitted) ──> (Under Review) ──> (Assigned) 
                                                             │
[Closed] <── (Resolved) <────────────────────────── (In Progress)
```

## AI & Intelligent Automation Features
- **AI Auto-Categorization**: Analyzes user description text and auto-assigns category (Classroom, Wi-Fi, Hostel, Cleanliness, Infrastructure, Transport) with a confidence score.
- **AI Complaint Summarization**: Generates 1-2 sentence executive summaries for admin overview tables.
- **Duplicate Complaint Detector**: Embeds/compares recent submissions within the same location/category to flag potential duplicates to admins (e.g., multiple students reporting "Wi-Fi down in Hostel Block B").
- **Image-Based Issue Classification**: Analyzes attached photos to verify and detail the reported issue (e.g., damaged bench, water leak).

---

# Integrations, Executions, AI Generation, and Real-Time Layer

## Media Storage & Email Integrations
- **Cloudinary / Local Attachment Handler**: Multi-file upload support (JPEG, PNG, PDF up to 5MB per file) for issue proof and resolution evidence.
- **Email Notification Service**: Sends automated HTML email notifications via Nodemailer / Resend on key events:
  - Complaint Submission Confirmation (to Student)
  - Department Assignment Alert (to Department Staff)
  - Status Update Notifications (`Under Review` -> `In Progress` -> `Resolved`)
  - Escalation Warning (to Admin when complaint exceeds resolution threshold)

## Real-Time & Live Activity Layer
- **Socket.IO Real-Time Updates**:
  - Broadcasts live status changes to student complaint detail pages without requiring refresh.
  - Pushes real-time notification alerts to the Admin dashboard when critical/high-priority complaints are logged.
  - Live activity feed showing newly assigned or resolved tickets.

## Automatic Escalation Engine
- **Background Scheduler (Node-Cron / BullMQ)**: Runs periodic jobs (every hour) checking unresolved complaints:
  - If status remains `Submitted` or `Assigned` for > 48 hours without progress, priority auto-escalates to `High` or `Critical`.
  - Sends escalation alerts to the Chief Admin and logs an escalation event in the timeline.

---

# Frontend Pages

- **`/` – Landing Page**: Overview of CampusVoice platform, live resolution stats, public announcement ticker, and Quick Report CTA button.
- **`/login`**: Multi-role login page (Student / Admin / Staff) with form validation and JWT authentication.
- **`/register`**: Student registration page with college ID, branch, hostel block, and password input validation.
- **`/student/dashboard`**: Student home portal displaying active complaints progress bar, recent activity, quick action buttons, and resolution statistics.
- **`/student/complaints/new`**: Intuitive complaint submission form with category dropdown, AI Auto-Suggest category button, location selector (Block, Floor, Room), image uploader, and priority indicator.
- **`/student/complaints`**: Filterable & searchable list of student's own complaints with status badges, date filters, and quick view cards.
- **`/student/complaints/[id]`**: Interactive complaint details view with visual step tracker (`Submitted` -> `Closed`), live comment/clarification drawer, attached image lightbox, resolution details, and feedback/rating form.
- **`/admin/dashboard`**: Command center for admins featuring metric cards (Total, Pending, In Progress, Resolved), interactive complaint queue, AI duplicate warnings banner, quick department assign modal, and search/filter filters.
- **`/admin/analytics`**: Detailed reporting dashboard showing department resolution speed, category breakdown pie charts, student satisfaction ratings, and monthly resolution trends.
- **`/admin/departments`**: Department management portal to create departments (IT, Maintenance, Housekeeping), assign department leads, and monitor workload distribution.
- **`/settings`**: Account profile details, notification preferences, dark/light theme toggle, and security control settings.

---

# Backend Architecture & Database Collections

## Backend Architecture
- **Routes**: Clean API routing (`/api/auth`, `/api/complaints`, `/api/departments`, `/api/ai`, `/api/analytics`).
- **Controllers**: Thin controllers handling HTTP requests, input validation via `express-validator`, and standard JSON responses.
- **Services**: Dedicated business logic layer handling Complaint CRUD, AI categorization API calls, Cloudinary uploads, Email delivery, and Analytics calculations.
- **Middlewares**: `authMiddleware` (JWT verification), `roleMiddleware` (RBAC checking), `uploadMiddleware` (Multer), and `errorHandlerMiddleware`.

## Database Collections (MongoDB / Mongoose)

### `Users`
- `_id`: ObjectId
- `name`: String
- `email`: String (unique)
- `password`: String (hashed, select: false)
- `role`: Enum [`student`, `admin`, `staff`]
- `collegeId`: String
- `department`: String (optional, for staff)
- `phone`: String
- `createdAt`: Date

### `Complaints`
- `_id`: ObjectId
- `ticketId`: String (unique, e.g. `CMP-2026-0801`)
- `studentId`: ObjectId (ref: `Users`)
- `title`: String
- `description`: String
- `category`: Enum [`Classroom`, `Laboratory`, `Hostel`, `Wi-Fi`, `Infrastructure`, `Transportation`, `Cleanliness`, `Other`]
- `location`: Object `{ block: String, floor: String, roomNumber: String, customDetails: String }`
- `attachments`: Array of `{ url: String, publicId: String }`
- `priority`: Enum [`Low`, `Medium`, `High`, `Critical`] (Default: `Medium`)
- `status`: Enum [`Submitted`, `Under Review`, `Assigned`, `In Progress`, `Resolved`, `Closed`]
- `assignedDepartment`: ObjectId (ref: `Departments`)
- `assignedStaff`: ObjectId (ref: `Users`)
- `aiSummary`: String
- `aiCategoryConfidence`: Number
- `isDuplicate`: Boolean
- `duplicateOfTicketId`: String
- `resolutionDetails`: Object `{ summary: String, resolvedAt: Date, resolvedBy: ObjectId, proofAttachment: String }`
- `isEscalated`: Boolean
- `escalatedAt`: Date
- `createdAt`: Date
- `updatedAt`: Date

### `Departments`
- `_id`: ObjectId
- `name`: String (e.g. "IT & Network Support")
- `code`: String (e.g. "IT")
- `headId`: ObjectId (ref: `Users`)
- `staffCount`: Number
- `activeTicketsCount`: Number
- `createdAt`: Date

### `ComplaintTimelineLogs`
- `_id`: ObjectId
- `complaintId`: ObjectId (ref: `Complaints`)
- `actionBy`: ObjectId (ref: `Users`)
- `previousStatus`: String
- `newStatus`: String
- `comment`: String
- `timestamp`: Date

### `Feedback`
- `_id`: ObjectId
- `complaintId`: ObjectId (ref: `Complaints`)
- `studentId`: ObjectId (ref: `Users`)
- `rating`: Number (1 to 5 stars)
- `reviewComment`: String
- `createdAt`: Date

### `Notifications`
- `_id`: ObjectId
- `userId`: ObjectId (ref: `Users`)
- `title`: String
- `message`: String
- `link`: String
- `isRead`: Boolean
- `createdAt`: Date

---

# API Endpoints

## Health and Authentication
- `GET /api/health` – System health check and database connectivity heartbeat.
- `POST /api/auth/register` – Register student or staff account.
- `POST /api/auth/login` – Authenticate user and return JWT token.
- `GET /api/auth/me` – Fetch current authenticated profile.

## Complaints Management
- `GET /api/complaints` – Query complaints (Student sees own, Admin/Staff sees assigned/all with search, pagination, status & category filters).
- `POST /api/complaints` – Submit new complaint (with image upload & optional AI categorization trigger).
- `GET /api/complaints/:id` – Fetch complaint details, timeline history, and attachments.
- `PUT /api/complaints/:id/status` – Update complaint status (`Under Review` -> `In Progress` -> `Resolved` -> `Closed`).
- `PUT /api/complaints/:id/assign` – Admin endpoint to assign department and staff.
- `POST /api/complaints/:id/comments` – Add comment or clarification update to timeline.
- `POST /api/complaints/:id/feedback` – Student submits rating (1-5 stars) and feedback review upon resolution.
- `DELETE /api/complaints/:id` – Delete complaint (Admin only).

## AI Engine Endpoints
- `POST /api/ai/categorize` – Pass title & description to return predicted category and confidence.
- `POST /api/ai/summarize` – Generate AI summary for long complaint descriptions.
- `POST /api/ai/detect-duplicates` – Check text similarity against open complaints in the same location.

## Departments & Analytics
- `GET /api/departments` – List all college departments and assigned leads.
- `POST /api/departments` – Create new department (Admin only).
- `GET /api/admin/analytics/overview` – Overall resolution stats, average resolution time, satisfaction score.
- `GET /api/admin/analytics/department-wise` – Department performance comparison metrics.

## Notifications & Uploads
- `GET /api/notifications` – Fetch unread notifications for logged-in user.
- `PUT /api/notifications/read` – Mark notifications as read.
- `POST /api/upload` – Image and attachment upload endpoint.

---

# Folder Structure & Development Phases

## Frontend Structure
```
client/
└── src/
    ├── components/
    │   ├── AppShell/
    │   │   ├── Navbar.jsx
    │   │   └── Sidebar.jsx
    │   ├── UI/
    │   │   ├── StatusBadge.jsx
    │   │   ├── MetricCard.jsx
    │   │   └── StarRating.jsx
    │   ├── Complaints/
    │   │   ├── ComplaintCard.jsx
    │   │   ├── ComplaintTable.jsx
    │   │   ├── StatusTimeline.jsx
    │   │   ├── AssignDepartmentModal.jsx
    │   │   └── AIAutoCategoryBadge.jsx
    │   └── Layout/
    │       └── ProtectedRoute.jsx
    ├── pages/
    │   ├── _app.jsx
    │   ├── index.jsx
    │   ├── login.jsx
    │   ├── register.jsx
    │   ├── settings.jsx
    │   ├── student/
    │   │   ├── dashboard.jsx
    │   │   └── complaints/
    │   │       ├── index.jsx
    │   │       ├── new.jsx
    │   │       └── [id].jsx
    │   └── admin/
    │       ├── dashboard.jsx
    │       ├── analytics.jsx
    │       └── departments.jsx
    ├── store/
    │   ├── authStore.js
    │   └── complaintStore.js
    └── services/
        ├── api.js
        └── socket.js
```

## Backend Structure
```
server/
└── src/
    ├── config/
    │   ├── db.js
    │   ├── env.js
    │   └── cloudinary.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── complaintRoutes.js
    │   ├── departmentRoutes.js
    │   ├── aiRoutes.js
    │   ├── analyticsRoutes.js
    │   └── notificationRoutes.js
    ├── controllers/
    │   ├── authController.js
    │   ├── complaintController.js
    │   ├── departmentController.js
    │   ├── aiController.js
    │   └── analyticsController.js
    ├── services/
    │   ├── authService.js
    │   ├── complaintService.js
    │   ├── aiService.js
    │   ├── emailService.js
    │   └── escalationService.js
    ├── models/
    │   ├── User.js
    │   ├── Complaint.js
    │   ├── Department.js
    │   ├── ComplaintTimelineLog.js
    │   ├── Feedback.js
    │   └── Notification.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   ├── roleMiddleware.js
    │   ├── uploadMiddleware.js
    │   └── errorMiddleware.js
    └── utils/
        ├── ticketIdGenerator.js
        └── socket.js
```

## Development Phases
- **Phase 1: Environment Setup & Core Auth**: Initial project structure (Next.js + Express + MongoDB), JWT authentication, User schemas (`Student`, `Admin`, `Staff`), Auth routes, bcrypt hashing, and Zustand auth state store.
- **Phase 2: Core Complaint Engine (CRUD)**: Complaint submission form with category selection and location picker, image attachment upload, database storage, student complaints list, and complaint detail page with static timeline.
- **Phase 3: Admin Console & Department Management**: Admin dashboard table view with search/filter, department creation API, assignment modal mapping complaints to departments/staff, status transition controllers (`Submitted` -> `Resolved`).
- **Phase 4: AI Smart Layer**: Integrate Gemini/OpenAI API for auto-categorizing complaint description, AI summary generation for admin table, image problem classification, and duplicate detection check.
- **Phase 5: Real-Time Socket.IO & Email Notifications**: Wire Socket.IO for live status timeline updates & admin alerts, implement Nodemailer/Resend transactional emails on status changes and assignments.
- **Phase 6: Analytics, Auto-Escalation, Feedback & Polish**: Build `/admin/analytics` with resolution charts, resolution rating & student feedback modal, setup Node-Cron auto-escalation engine for stale complaints (>48h), responsive styling polish, and error boundary safety.

---

# UI, Security, Outcome, and Codex Instructions

## UI & UX Requirements
- **Theme & Aesthetics**: Clean, modern, accessible institutional operations dashboard UI using Tailwind CSS. Professional dark/light mode support, vibrant status badges (e.g., Green for `Resolved`, Yellow for `In Progress`, Blue for `Submitted`, Red for `Critical`).
- **Feedback & Loading States**: Skeleton placeholders for lists, clear toast notifications for API actions (submission success, status updated), drag-and-drop file upload indicator with instant image preview.
- **Visual Progress Pipeline**: Color-coded step-by-step progress bar on complaint details page displaying timestamped transitions.

## Security Requirements
- **Password Protection**: Hashing via `bcryptjs` with cost factor 12.
- **Role Enforcement**: Strict route-level and API endpoint middleware checks (`requireRole('admin')`, `requireRole('student')`).
- **Data Protection**: Input sanitization and payload validation using `express-validator`.
- **Upload Safety**: Strict file type validation (images/PDFs only, max 5MB) before processing.
- **Environment Variables**: Keep API keys, JWT secrets, database connection strings, and Cloudinary keys strictly inside `.env`.

## Final Expected Outcome
The resulting **CampusVoice AI** application provides a seamless, end-to-end digital complaint tracking platform for educational institutions. Students can submit complaints in seconds with attached proof and AI auto-assistance, while admins and department heads gain a complete control tower to assign, monitor, resolve, and analyze campus issues efficiently. Stagnant tickets are automatically escalated, status changes sync live across screens, and campus administrators receive actionable analytical insights to continuously improve campus operations.

## AI Agent & Developer Execution Guidelines
- Build step-by-step according to the 6 Development Phases.
- Never write database calls directly inside controllers; keep data operations inside services.
- Ensure standard RESTful error response formats `{ success: false, message: "..." }`.
- Ensure frontend components are modular and decoupled.
- Always verify API routes with test calls after finishing each Phase.
