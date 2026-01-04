# Video Sensitivity App  
Multi-Tenant Video Management SaaS Platform

## Overview

Video Sensitivity App is a full-stack, enterprise-grade video management system built with a multi-tenant architecture. The platform ensures complete tenant isolation, role-based access control, secure video streaming, and real-time processing updates. It supports background video processing with risk analysis and provides powerful admin-level controls across all tenants.

---

## Features

### Core Features
- Multi-tenant architecture with strict data isolation
- Role-based access control (viewer, editor, admin)
- Secure video upload and streaming
- Real-time video processing using WebSockets
- AI-based video risk scoring
- Tenant-scoped dashboards and video listings

### Admin Capabilities
- Global user management
- Tenant creation and reassignment
- Cross-tenant video visibility
- Role updates without downtime
- Tenant-level usage statistics

### User Experience
- Mobile-first responsive interface
- Real-time upload progress tracking
- Read-only access for viewers
- Upload and management tools for editors
- Secure fullscreen video player

---

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Socket.io
- Multer (file uploads)
- FFmpeg (video processing)

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- React Context API
- Lucide React
- React Toastify

---

## Project Structure

video-sensitivity-app/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── admin.controller.js
│   │   │   └── video.controller.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Video.js
│   │   │   └── Tenant.js
│   │   ├── routes/
│   │   │   ├── admin.routes.js
│   │   │   └── video.routes.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── role.middleware.js
│   │   └── services/
│   │       ├── socket.service.js
│   │       └── videoProcessor.js
│   ├── uploads/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   └── Player.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── VideoCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   └── services/
│   │       ├── api.js
│   │       └── socket.js
│   └── public/
├── .gitignore
└── README.md

---



## Quick Start

### Backend Setup
cd backend  
npm install  
cp .env.example .env  
npm run dev  

Backend runs on http://localhost:5000

### Frontend Setup
cd frontend  
npm install  
npm run dev  

Frontend runs on http://localhost:5173

---

## API Endpoints

### Authentication
POST /api/auth/register  
POST /api/auth/login  

### Videos (Tenant Scoped)
GET  /api/videos  
POST /api/videos/upload  
GET  /api/videos/:id  
GET  /api/videos/public-stream/:id  

### Admin Routes (Admin Only)
GET    /api/admin/users  
POST   /api/admin/users/reassign-tenant  
PUT    /api/admin/users/:id/role  

GET    /api/admin/videos  

GET    /api/admin/tenants  
POST   /api/admin/tenants  
PUT    /api/admin/tenants/:id  
DELETE /api/admin/tenants/:id  

---

## Database Models

### User
_id  
name  
email  
password  
role (viewer | editor | admin)  
tenantId  
tenantName  
createdAt  

### Video
_id  
title  
owner  
tenantId  
filePath  
status (processing | published)  
riskScore  
assignedUsers  
createdAt  

### Tenant
_id  
name  
organization  
userCount  
videoCount  

---

## Demo Flow

1. Register a new user (auto-assigned to default tenant)
2. Viewer dashboard shows published videos only
3. Editor uploads a video
4. Processing status updates in real time
5. Video becomes published after processing
6. Secure fullscreen playback
7. Admin accesses global dashboard
8. Admin manages users, roles, and tenants
9. User relogs and sees tenant-specific content only

---

## Production Deployment

Frontend: Vercel or Netlify  
Backend: Render or Railway  
Database: MongoDB Atlas  
Storage: AWS S3 or Cloudinary  
Streaming CDN: Cloudflare (HLS)

---

## Security Notes

- JWT-based authentication
- Tenant isolation at database query level
- Role-based route protection
- Secure streaming endpoints
- Upload directories excluded from version control

---

## License

This project is intended for educational and internal SaaS use. Modify and extend as required.
