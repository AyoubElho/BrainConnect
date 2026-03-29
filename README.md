# BrainConnect

BrainConnect is a full-stack collaborative whiteboard platform where users can create rooms, join by room code, and collaborate on a shared canvas.

This repository contains:
- Spring Boot backend API + WebSocket configuration
- Angular 19 frontend with TailwindCSS, NG-ZORRO, and Fabric.js

## Application Screenshots

These screenshots are stored in `docs/screenshots` and use relative paths so they render automatically on GitHub:

<table>
  <tr>
    <td align="center">
      <strong>Home</strong><br />
      <a href="./docs/screenshots/home.png">
        <img width="1920" height="1080" alt="home" src="https://github.com/user-attachments/assets/ad33d3b2-d756-43af-af1b-d2afe8ce45fc" />
      </a>
    </td>
    <td align="center">
      <strong>Login</strong><br />
      <a href="./docs/screenshots/login.png">
        <img width="1920" height="1080" alt="login" src="https://github.com/user-attachments/assets/d3fbf8a5-b735-4a2b-85a7-caf7ce0089a1" />
      </a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>Signup</strong><br />
      <a href="./docs/screenshots/signup.png">
        <img width="1920" height="1080" alt="signup" src="https://github.com/user-attachments/assets/523ec3ad-ac8e-4c71-9a1e-251b8054609f" />
      </a>
    </td>
    <td align="center">
      <strong>Create and Join</strong><br />
      <a href="./docs/screenshots/create-join.png">
        <img width="1920" height="1080" alt="create-join" src="https://github.com/user-attachments/assets/9bea02c5-6669-4b01-b9d9-04d66943ffcf" />
      </a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>My Rooms</strong><br />
      <a href="./docs/screenshots/my-rooms.png">
        <img width="1920" height="1080" alt="create-join" src="https://github.com/user-attachments/assets/e82375e4-7bb7-4b3f-bd26-c6a486a378ce" />
      </a>
    </td>
    <td align="center">
      <strong>Editor</strong><br />
      <a href="./docs/screenshots/editor.png">
        <img width="1920" height="1080" alt="editor" src="https://github.com/user-attachments/assets/8f3b67aa-81ca-4771-b7c9-31f8d01f1147" />
      </a>
    </td>
  </tr>
  <tr>
    <td align="center" colspan="2">
      <strong>Profile</strong><br />
      <a href="./docs/screenshots/profile.png">
        <img width="1920" height="1080" alt="profile" src="https://github.com/user-attachments/assets/5c51649d-3ab0-4d91-ba7d-6a69d6cdeea2" />
      </a>
    </td>
  </tr>
</table>

## Features

- User signup and login
- Protected routes with auth guard
- Profile page with avatar upload and save
- Create room and join room by code
- Not-found feedback if room code does not exist
- My Rooms page with room preview, open, and delete
- Canvas editor tools: draw, text, erase selected objects, color picker
- Canvas controls: zoom in/out/reset, space + drag pan, clear canvas
- Room info drawer with copy room code button
- Room state persistence in MySQL
- Canvas preview generation from saved Fabric JSON

## Tech Stack

Backend:
- Java 17
- Spring Boot 3.4.1
- Spring Web
- Spring Data JPA
- Spring WebSocket
- MySQL
- Maven Wrapper

Frontend:
- Angular 19
- TypeScript
- TailwindCSS
- NG-ZORRO
- Angular Material
- Fabric.js
- Axios

## Project Structure

```text
BrainConnect/
|- src/main/java/com/example/brainconnect
|  |- config/            # CORS + WebSocket config
|  |- dao/               # JPA repositories
|  |- dto/               # DTO classes
|  |- entity/            # JPA entities
|  |- service/           # business logic
|  `- ws/                # REST controllers
|- src/main/resources
|  `- application.properties
|- front/
|  |- src/app/core       # services, guard, models
|  |- src/app/features   # pages/components
|  `- src/assets         # static assets
`- pom.xml
```

## Frontend Routes

- `/` Home
- `/login` Login
- `/signup` Signup
- `/create` Create and Join rooms (protected)
- `/my-rooms` User room list (protected)
- `/profile` Profile (protected)
- `/editor/:roomId` Canvas editor (protected)

## Backend API

Base URL:
- `http://localhost:8080`

### User endpoints

- `POST /api/user/signup`
- `POST /api/user/login`
- `POST /api/user/save`
- `PUT /api/user/{userId}/profile-picture`
- `DELETE /api/user/{userId}`
- `GET /api/user/`

### Room endpoints

- `POST /api/rooms/save/{userId}` create room for a user
- `POST /api/rooms/saveRoomState/{roomId}` save canvas JSON
- `DELETE /api/rooms/{code}` delete room by code
- `GET /api/rooms/user/{userId}` list rooms by user
- `GET /api/rooms/room/{roomId}` get room details
- `GET /api/rooms/roomCode/{roomCode}` resolve room ID from room code

Invalid room code behavior:
- returns `404 Not Found`
- body: `{ "message": "Room code does not exist" }`

### WebSocket and STOMP

- Endpoint: `/ws` (SockJS enabled)
- Application destination prefix: `/app`
- Broker destination prefix: `/topic`
- Server handler: `@MessageMapping("/canvas/update")`

Note:
- Current frontend room sync is implemented with polling (`getRoomById` every 1 second) and save events.

## Data Model

### User

- `id: Long`
- `username: String` (unique)
- `email: String` (unique)
- `password: String`
- `profilePicture: LONGTEXT` (base64 data URL)
- `rooms: List<Room>`

### Room

- `id: Long`
- `title: String`
- `codeRoom: String` (UUID generated)
- `design: TEXT` (Fabric JSON)
- `user: User`

## Prerequisites

- Java 17+
- Node.js + npm
- MySQL server
- Git

## Local Setup

### 1. Clone repository

```bash
git clone <your-repo-url>
cd BrainConnect
```

### 2. Create MySQL database

```sql
CREATE DATABASE brainconnect;
```

Current DB config is in `src/main/resources/application.properties`:
- `spring.datasource.url=jdbc:mysql://localhost:3306/brainconnect`
- `spring.datasource.username=root`
- `spring.datasource.password=`
- `spring.jpa.hibernate.ddl-auto=update`

If needed, update this file with your own MySQL credentials.

### 3. Run backend

Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

macOS/Linux:

```bash
./mvnw spring-boot:run
```

Backend URL:
- `http://localhost:8080`

### 4. Run frontend

In a new terminal:

```bash
cd front
npm install
npm start
```

Frontend URL:
- `http://localhost:4200`

## Build Commands

Backend compile:

```powershell
.\mvnw.cmd -DskipTests compile
```

Backend package:

```powershell
.\mvnw.cmd clean package -DskipTests
```

Frontend build:

```bash
cd front
npm run build
```

## Authentication and Session Behavior

- Login state is stored in browser `localStorage`.
- Protected routes use `AuthGuard` and check `isLoggedIn === 'true'`.
- Stored user key is `data`.
- Logout clears `isLoggedIn` and `data`.

## Styling and UI

- Shared Tailwind utility patterns are in `front/src/styles.css`.
- Fonts used: `Urbanist` and `Mogra`.
- Component libraries: `NG-ZORRO` and `Angular Material`.

## Troubleshooting

1. Backend cannot connect to DB: verify MySQL is running, `brainconnect` DB exists, and credentials in `application.properties` are correct.
2. CORS issues: allowed origins currently include `http://localhost:4200` and `https://eclectic-tulumba-3b6203.netlify.app`. Update `WebConfig.java` if needed.
3. WebSocket origin issues: update allowed origins in `WebSocketConfig.java`.
4. Frontend cannot reach backend: ensure backend is running on `8080` and verify API URLs in `front/src/app/core/service/UserService.ts` and `front/src/app/core/service/RoomService.ts`.

## Docker (Backend)

A Dockerfile is included for backend packaging.

```bash
docker build -t brainconnect-backend .
docker run -p 8080:8080 brainconnect-backend
```

Important:
- Container still needs access to a MySQL instance.
- Configure DB host and credentials for container runtime.

## Important Notes

- Passwords are currently stored in plain text in DB. For production, use hashing (for example BCrypt).
- Current session model is localStorage based, no JWT/session tokens yet.
- Add request validation and centralized exception handling before production deployment.

## License

No license file is currently defined in this repository.
