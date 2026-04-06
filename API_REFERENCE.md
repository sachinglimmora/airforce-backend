# IAF Training Platform — Backend API Reference

> **Base URL:** `http://localhost:5000/api`  
> **Auth:** Bearer JWT in `Authorization` header  
> **Default password for all demo accounts:** `password`

## Demo Accounts

| Email | Role |
|-------|------|
| `arjun.singh@iaf.gov.in` | trainee |
| `vikram.rao@iaf.gov.in` | instructor |
| `priya.sharma@iaf.gov.in` | admin |

## Starting the Server

```bash
cd server
npm run dev   # hot-reload with nodemon
npm start     # production
```

---

## Auth Endpoints `/api/auth`

### 1. Login
- **Method & Path:** `POST /api/auth/login`
- **Auth:** None
- **Payload:**
  ```json
  {
    "email": "arjun.singh@iaf.gov.in",
    "password": "password"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "_id": "60a...",
      "name": "Arjun Singh",
      "email": "arjun.singh@iaf.gov.in",
      "role": "trainee"
    }
  }
  ```

### 2. Get Current User
- **Method & Path:** `GET /api/auth/me`
- **Auth:** Bearer
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "_id": "60a...",
      "name": "Arjun Singh",
      "email": "arjun.singh@iaf.gov.in",
      "role": "trainee",
      "createdAt": "2023-01-01T00:00:00Z"
    }
  }
  ```

### 3. Change Password
- **Method & Path:** `POST /api/auth/change-password`
- **Auth:** Bearer
- **Payload:**
  ```json
  {
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword456"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Password updated successfully"
  }
  ```

### 4. Logout
- **Method & Path:** `POST /api/auth/logout`
- **Auth:** Bearer
- **Response:**
  ```json
  {
    "success": true,
    "message": "Logged out effectively"
  }
  ```

---

## Users `/api/users`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/` | admin, instructor | List users (Query: `?role=&search=`) |
| POST | `/` | admin | Enlist new personnel |
| GET | `/:id` | admin/instructor/own | Get user profile by ID |
| PATCH | `/:id` | admin/own | Update user details by ID |
| DELETE | `/:id` | admin | Purge user record |

### Example payload (POST `/api/users`)
```json
{
  "name": "Arjun Singh",
  "email": "arjun.new@iaf.gov.in",
  "password": "securepassword",
  "role": "trainee"
}
```

### Example response (GET `/api/users`)
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
       "_id": "60a...",
       "name": "Arjun Singh",
       "role": "trainee"
    }
  ]
}
```

---

## Courses `/api/courses`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/` | all | Filter `?category=&status=&difficulty=&search=` |
| GET | `/categories` | all | List of all distinct categories |
| GET | `/:id` | all | Course details by ID |
| PATCH | `/:id` | instructor, admin | Update existing course |
| POST | `/` | instructor, admin | Create course |
| DELETE | `/:id` | admin | Delete course |

### Example payload (POST `/api/courses`)
```json
{
  "title": "Aero-Dynamics 101",
  "description": "Introduction to basic aero dynamic principles.",
  "category": "Flight Basics",
  "difficulty": "Beginner",
  "coverImage": "http://example.com/image.png"
}
```

### Example response (GET `/api/courses/:id`)
```json
{
  "success": true,
  "data": {
    "_id": "60b...",
    "title": "Aero-Dynamics 101",
    "modules": [ { "_id": "60c...", "title": "Lift and Drag" } ],
    "createdAt": "2023-01-02T00:00:00Z"
  }
}
```

---

## Modules `/api/modules`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/` | all | Filter `?courseId=` |
| GET | `/:id` | all | Module details |
| POST | `/:id/complete` | all | Mark module as completed |
| POST | `/` | instructor, admin | Create new module |
| PATCH | `/:id` | instructor, admin | Update module |
| DELETE | `/:id` | admin | Delete module |

### Example payload (POST `/:id/complete`)
*No payload needed, inferred by `Bearer` token and `:id` in URL parameters.*

### Example response (POST `/:id/complete`)
```json
{
  "success": true,
  "message": "Module marked as completed.",
  "data": {
    "courseProgress": 25.0
  }
}
```

---

## Simulations `/api/simulations`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/` | all | Filter `?type=&difficulty=&status=` |
| POST | `/:id/start` | all | Log start of a simulation |
| POST | `/:id/complete`| all | Submit simulation score |
| POST | `/` | instructor, admin | Create new simulation config |
| PATCH | `/:id` | instructor, admin | Edit simulation config |
| DELETE | `/:id` | admin | Delete simulation |

### Example payload (POST `/:id/complete`)
```json
{
  "score": 95,
  "timeSpent": 1200, 
  "metrics": {
    "accuracy": 92,
    "completionRate": 100
  }
}
```

### Example response
```json
{
  "success": true,
  "data": {
    "progressUpdated": true,
    "achievements": ["Perfect Run"]
  }
}
```

---

## Progress `/api/progress`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/` | trainee/all | trainee gets own; instructor gets all |
| GET | `/:traineeId` | instructor, ad | Get specific trainee's progress |
| PATCH | `/:traineeId` | instructor, ad | Override progress parameters |

### Example response (GET `/api/progress`)
```json
{
  "success": true,
  "data": {
    "completedCourses": 4,
    "ongoingCourses": 2,
    "totalScore": 850
  }
}
```

---

## Digital Twin `/api/digital-twin`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/` | all | View available systems (Query `?category=&status=`) |
| GET | `/:id` | all | Single system detail |
| GET | `/:id/components`| all | Components of a system |
| PATCH | `/:systemId/components/:componentId` | inst, admin | Edit component state |

### Example response (GET `/:id/components`)
```json
{
  "success": true,
  "data": [
    {
      "componentId": "ENG-01",
      "name": "Main Thruster",
      "status": "Operational",
      "health": 98
    }
  ]
}
```

---

## AI Assistant `/api/ai-assistant`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/history` | Fetch chat history |
| POST | `/message` | Send message to AI |
| DELETE| `/history` | Clear chat history |

### Example payload (POST `/message`)
```json
{
  "content": "What is the procedure for engine failure?",
  "contextId": "sim-492"
}
```

### Example response
```json
{
  "success": true,
  "reply": "In the event of an engine failure, you must first...",
  "sources": ["Emergency Procedures Manual Ch 3"]
}
```

---

## Admin & Security `/api/admin`

Dedicated administrative console for high-level platform control.

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/dashboard` | admin | Strategic overview stats |
| GET | `/roles` | admin | List authorization roles |
| POST | `/roles` | admin | Initialize new role |
| PATCH | `/roles/:id` | admin | Modify role permissions |
| DELETE | `/roles/:id` | admin | Purge authorization role |
| GET | `/audit-logs` | admin | Tactical audit trail (`?module=&userId=`) |
| GET | `/system-status` | admin | Monitor infrastructure health |
| PATCH | `/system-status/:service`| admin | Override service status |
| GET | `/security-settings`| admin | Fetch security & MFA policies |
| PATCH | `/security-settings`| admin | Update global security perimeter |
| GET | `/analytics` | admin | Aggregate training performance data |

### Example Payload (PATCH `/api/admin/security-settings`)
```json
{
  "mfaEnabled": true,
  "passwordPolicy": {
    "minLength": 14,
    "requireSpecialChar": true
  },
  "sessionTimeout": 45
}
```

### Example Response (GET `/api/admin/dashboard`)
```json
{
  "totalUsers": 250,
  "totalTrainees": 180,
  "systemStatus": [
    { "service": "Simulation Engine", "status": "operational" }
  ]
}
```

---

## Rate Limits
- All routes: **500 req / 15 min** (Increased for training sims)
- Auth routes: **100 req / 15 min**
