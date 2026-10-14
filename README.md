# Elderlink

Elderlink is a community assistance network for older adults, family members, volunteers, and network coordinators. The React app is backed by a Spring Boot REST API with JWT role tokens and JPA persistence.

## Run Locally

Requirements: Java 21 or newer, Maven, and Node.js 20 or newer.

For Windows, double-click `start-elderlink.bat`. It opens the API and frontend in separate command windows. Keep both windows open while using the app; you can close VS Code after they start.

Alternatively, start the API in one terminal:

```sh
cd backend
mvn spring-boot:run
```

Start the web app in another terminal:

```sh
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the frontend terminal, usually `http://localhost:5173`. The frontend proxies `/api` calls to the API on port 8080. The default database is seeded file-backed H2 in `backend/data`; accounts and requests persist when the API restarts.

## MySQL

Create a database named `elderlink`, then set these environment variables before starting Spring Boot:

```text
DB_URL=jdbc:mysql://localhost:3306/elderlink
DB_USERNAME=your_mysql_user
DB_PASSWORD=your_mysql_password
JWT_SECRET=replace-with-a-long-random-secret
```

The MySQL JDBC driver is included. Hibernate creates or updates tables on startup.

## Deploy to Render

The root `Dockerfile` builds the React UI into the Spring Boot application so one web service serves both the site and API. `render.yaml` configures a persistent data disk for H2 and generates a deployment JWT secret. Deploy from a connected Git repository using Render's Blueprint flow; Render requires an account, a Git repository, and a paid Starter instance for persistent disks. The public URL is assigned by Render after deployment. Do not use the demo JWT secret or an ephemeral filesystem for real user accounts.

## Demo Roles

The welcome screen provides passwordless demo sessions for a senior, family member, volunteer, and administrator. These sessions use signed JWTs. Demo login is intentionally open and fixed-profile; configure real identity verification, consent, notification delivery, database backups, secret rotation, and deployment-specific CORS before using this as a production service.

## Included Workflows

- Create and track medicine, grocery, transport, hospital visit, digital support, and other assistance requests.
- Flag urgent requests for priority in the dashboard and in-app notification area.
- Recommend available, verified volunteers using specialty, neighborhood, and rating signals; volunteers can claim open requests.
- Move assigned requests through matched, in-progress, and completed states.
- Monitor care activity from the family view, rate completed help, and update volunteer ratings.
- Verify volunteer profiles from the coordinator view.

## API Overview

- `POST /api/auth/demo`
- `GET /api/dashboard`
- `POST /api/requests`
- `GET /api/requests/{id}/matches`
- `POST /api/requests/{id}/match`
- `POST /api/requests/{id}/claim`
- `PATCH /api/requests/{id}/status`
- `POST /api/requests/{id}/feedback`
- `PUT /api/volunteers/{id}/verification`