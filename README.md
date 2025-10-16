# Team Management App (Next.js)

## Prerequisites
- Node.js 18+
- npm
- MongoDB Atlas connection string

## Setup
1. Create `.env.local` in project root:
```
MONGODB_URI="your-mongodb-atlas-connection-string"
```

2. Install dependencies:
```
npm install
```

## Development
```
npm run dev
```
Open http://localhost:3000

## Production
```
npm run build
npm run start
```

## Features
- Create/edit teams with members (all fields required)
- Three-state approval (Approved / Not Approved / No Action Taken) with instant save and toast
- Drag-and-drop team reordering (persists)
- Expand row to view members, delete member
- Search by team or member
- Multi-select + bulk delete

## Notes
- API routes: `app/api/teams` and nested routes handle CRUD, approvals, reorder.
- Uses React Query provider via `app/layout.tsx` and `app/providers.tsx`.
