# ChatApp — Real-Time Chat Application

A real-time chat application built with **React Native (Expo)** for the frontend and **Node.js + Express + Socket.io** for the backend. Supports instant messaging, typing indicators, online/offline presence, and persistent chat history.

- **Live Backend API:** https://chat-app-backend-m07u.onrender.com
- **GitHub Repository:** https://github.com/PrinceSharma265/chat-app

---

## Features

### Core Requirements
- Clean, dark-themed chat UI (mobile-first, built with React Native/Expo)
- Send and receive messages instantly via **Socket.io**
- View previous messages after refreshing/reopening the app (chat history persists)
- Message timestamps displayed on every message
- REST APIs for sending messages and fetching chat history
- Real-time broadcast to all connected users
- Graceful handling of user connections and disconnections

### Bonus Features Implemented
- ✅ Username-based login (dummy authentication, persisted locally with AsyncStorage)
- ✅ Typing indicator ("X is typing...")
- ✅ Online/offline user status (live count shown in the header)
- ✅ Messages stored in **SQLite** (via `better-sqlite3`)
- ✅ Backend deployed live on **Render**

---

## Tech Stack

**Frontend:**
- React Native (Expo, TypeScript)
- expo-router for navigation
- socket.io-client for real-time communication
- AsyncStorage for local username persistence
- date-fns for timestamp formatting

**Backend:**
- Node.js + Express
- Socket.io for real-time messaging
- SQLite (better-sqlite3) for message persistence
- CORS-enabled REST API

---

## Project Structure

```
Chat_application/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # SQLite connection & schema
│   │   ├── models/messageModel.js # Message CRUD functions
│   │   ├── routes/messageRoutes.js # REST API endpoints
│   │   ├── sockets/chatSocket.js  # Socket.io event handlers
│   │   ├── app.js                # Express app setup
│   │   └── server.js             # HTTP + Socket.io server entry point
│   ├── data/                     # SQLite database file (gitignored)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── _layout.tsx           # Root navigation layout
│   │   ├── index.tsx             # Login screen
│   │   └── chat.tsx              # Chat screen
│   ├── src/
│   │   ├── theme/colors.ts       # Dark theme color palette
│   │   ├── components/           # MessageBubble, ThemedButton
│   │   ├── services/socket.ts    # Socket.io client singleton
│   │   └── constants/config.ts   # API/Socket URLs
│   └── package.json
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm
- Expo Go app (for testing on a physical device) or an Android/iOS emulator

### 1. Clone the repository

```bash
git clone https://github.com/PrinceSharma265/chat-app.git
cd chat-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder (or copy `.env.example`):

```env
PORT=5000
CORS_ORIGIN=*
```

Run the backend:

```bash
npm run dev
```

The backend will start at `http://localhost:5000`. You can verify it's running by visiting `http://localhost:5000/health` — it should return `{"status":"ok"}`.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

By default, `frontend/src/constants/config.ts` points to the **live deployed backend**:

```ts
export const API_URL = "https://chat-app-backend-m07u.onrender.com";
export const SOCKET_URL = "https://chat-app-backend-m07u.onrender.com";
```

If you'd like to run against your **local** backend instead, change both values to:

```ts
export const API_URL = "http://localhost:5000";
export const SOCKET_URL = "http://localhost:5000";
```

Then start the frontend:

```bash
npx expo start
```

- Press `w` to open in a web browser, or
- Scan the QR code with the **Expo Go** app on your phone, or
- Press `a` to open on a connected Android emulator/device

### 4. Building the APK

The project is already configured for EAS Build. To build your own APK:

```bash
cd frontend
npx eas login
npx eas build --platform android --profile preview
```

This produces a downloadable `.apk` file (not an AAB), suitable for direct installation on any Android device.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the Express/Socket.io server listens on | `5000` |
| `CORS_ORIGIN` | Allowed origin(s) for CORS and Socket.io | `*` |

### Frontend (`frontend/src/constants/config.ts`)

| Constant | Description | Example |
|---|---|---|
| `API_URL` | Base URL for REST API calls | `https://chat-app-backend-m07u.onrender.com` |
| `SOCKET_URL` | Base URL for Socket.io connection | `https://chat-app-backend-m07u.onrender.com` |

---

## Design Decisions

- **SQLite over MongoDB:** Chosen for zero-setup persistence — no external database account or connection string needed, while still satisfying the "store messages in a database" requirement. Trade-off: on Render's free tier, the filesystem is ephemeral, so message history resets on server restart/redeploy (not on normal operation).
- **Socket.io for all real-time features:** Messaging, typing indicators, and online/offline presence are all implemented over Socket.io events (`send_message`, `receive_message`, `typing_start`/`typing_stop`, `user_join`, `online_users`), per the assignment's mandatory requirement — no polling or third-party real-time services were used.
- **Dummy username auth:** Since full authentication wasn't required, usernames are self-declared on the login screen and persisted locally via AsyncStorage, so returning users don't have to re-type their name.
- **Dark theme design system:** A consistent color palette (`#080810` background, `#7B61FF` primary, `#00D4FF` accent) was used throughout for a modern, polished look.
- **REST for history, Socket.io for live updates:** Chat history is fetched once via REST on screen load (`GET /api/messages`), and all subsequent updates arrive via Socket.io broadcast — this avoids duplicate messages and keeps the "load once, then stream" pattern clean.
- **APK over AAB:** The EAS build profile is explicitly configured with `"buildType": "apk"` so the output can be installed directly on a device without going through the Play Store.

---

## Assumptions Made

- A single global chat room is assumed (no separate chat rooms/channels), as the assignment did not specify multi-room support.
- "Delivered" status on messages is tracked at the database level (`delivered` column) but not surfaced as a separate UI indicator beyond the message appearing in the recipient's chat in real time, since a full read-receipt system was outside the assignment's mandatory scope.
- Usernames are not required to be unique; two users could join with the same name, consistent with the "dummy authentication" bonus requirement (no real user accounts/backend validation).
- The backend's free-tier hosting (Render) may take 20-50 seconds to respond on the very first request after a period of inactivity (cold start). The frontend handles this by showing a "Connecting..." state rather than an error.

---

## Testing Notes

This app has been tested and confirmed working:
- Across two browser tabs with different usernames (real-time sync, typing indicator, online status, history persistence)
- On two separate physical Android devices simultaneously, using the built APK connected to the live production backend

---

## Submission Checklist

- [x] GitHub repository: https://github.com/PrinceSharma265/chat-app
- [x] Live backend API: https://chat-app-backend-m07u.onrender.com
- [x] APK build (Android)
- [x] README with setup instructions, environment variables, design decisions, and assumptions
