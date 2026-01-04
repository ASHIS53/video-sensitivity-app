# Multi-Tenant Video Platform (Frontend)

Complete SaaS Video Management System with Tenant Isolation + Admin Superpowers

## Live Demo Features

- Tenant-wise video isolation
- Role-based access (Viewer/Editor/Admin)
- Real-time video processing (Socket.io)
- Secure video streaming (Token auth)
- Admin dashboard + user/tenant management
- AI risk scoring badges
- Upload progress + processing status

## Demo Flow (8 minutes)

1. User register → Auto "default" tenant
2. Viewer mode = Read-only videos
3. Editor upload → Processing → Player
4. Admin login → Role/Tenant changes
5. Create tenant → Reassign users
6. Cross-tenant verification

## Tech Stack

Frontend: React 18 + Vite + Tailwind CSS
State: React Context (Auth)
Real-time: Socket.io-client
API: Axios + Token Auth
UI: Lucide React Icons + React Toastify
Routing: React Router DOM

## Key Features Demo-ready

- Compact mobile-first design
- No scroll Register/Login forms
- Real-time progress bars
- Tenant badges everywhere
- Secure video player (no download)
- Admin superpowers UI

## Backend Routes

- /api/auth/register → Auto default tenant
- /api/admin/users → Role + tenant changes
- /api/admin/tenants → Tenant CRUD
- /api/videos → Tenant-isolated
- /api/videos/public-stream → Secure streaming

## Quick Start

```bash
npm install
npm run dev
Backend: http://localhost:5000
Frontend: http://localhost:5173
```
