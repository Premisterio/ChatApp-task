# 💬 Real-Time Messenger Application

**Full-stack messenger application built with:**
- React (Vite) + TypeScript
- Python + FastAPI
- WebSockets 

Features: 
- real-time messaging
- file attachments 
- user authentication
- responsive UI

## ✨ Features:

### Authentication & Security:
- **JWT Authentication** with 30-minute session persistence
- **Secure user registration** and login
- **Password hashing** with bcrypt
- **Token persistence** across page refreshes
- **Automatic session expiry** and logout

### Real-Time Messaging:
- WebSocket connections for instant message delivery
- Live typing indicators - see when others are typing
- Online/offline status indicators
- Message editing and deletion
- Message timestamps with edit history
- Real-time notifications for new messages
- File Attachments


###  Project Structure:

```
📁 root
├── 📁 backend/                 # FastAPI Backend
│   ├── 📁 routes/             # API route handlers
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── messages.py       # Messaging endpoints
│   │   ├── users.py          # User management
│   │   └── websocket.py      # WebSocket handlers
│   ├── auth.py               # Authentication utilities
│   ├── database.py           # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── websocket_manager.py # WebSocket connection manager
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile          # Backend container config
├── 📁 frontend/               # React Frontend
│   ├── 📁 src/
│   │   ├── 📁 components/    # React components
│   │   │   ├── 📁 Auth/     # Authentication components
│   │   │   ├── 📁 Chat/     # Chat interface components
│   │   │   └── Navbar.tsx   # Navigation component
│   │   ├── 📁 context/      # React context providers
│   │   ├── 📁 api/          # API client functions
│   │   ├── 📁 pages/        # Page components
│   │   └── App.tsx          # Main application component
│   ├── package.json         # Node.js dependencies
│   └── Dockerfile          # Frontend container config
├── docker-compose.yml       # Multi-container orchestration
└── README.md               # Documentation
```

## How to Launch locally:

### Prerequisites
- Docker and Docker Compose installed
- Node Packed Manager installed
- Git for cloning the repository

### 1. Clone the Repository into your workspace
```bash
git clone https://github.com/Premisterio/ChatApp-task.git
cd <your-workspace-dir>
```

### 2. Environment Setup
Create a `.env` file in the backend directory:
```env
# Database Configuration
POSTGRES_USER=messenger_user
POSTGRES_PASSWORD=messenger_password
POSTGRES_DB=messenger_db
POSTGRES_PORT=5432

# Backend Configuration
BACKEND_PORT=8000
SECRET_KEY=your-super-secret-jwt-key-change-this
ENVIRONMENT=development

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```
This is an example of a `.env` for local development,  if you wish to deploy the app, replace the `.env` values with actual configuration.

### 3. Start with Docker Compose
```bash
# Start all services (database, backend, frontend)
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation (SwaggerUI)**: http://localhost:8000/docs


## API Endpoints:

### 1. Authentication
- `POST /auth/register` — Register new user
- `POST /auth/token` — Login and get JWT token
- `GET /auth/me` — Get current user profile

### 2. Messages
- `GET /messages/chats` — Get user's chat list
- `GET /messages/{user_id}` — Get messages with specific user
- `POST /messages/` — Send new message (supports file attachments)
- `PUT /messages/{message_id}` — Edit a message
- `DELETE /messages/{message_id}` — Delete a message
- `GET /messages/attachments/{filename}` — Download file attachment

### 3. Users
- `GET /users/search` — Search users by username
- `GET /users/` — Get all users (paginated)
- `GET /users/{user_id}` — Get user by ID

### 4. WebSocket
- `ws://localhost:8000/ws` — Real-time messaging, typing indicators, and online status

### 5. Health & Root
- `GET /` — API root info
- `GET /health` — Health check endpoint

### 6. Static Files
- `/uploads/{filename}` — Serve uploaded files (attachments)
