# ExecFlow AI

ExecFlow AI is an AI based productivity platform for managing inputs, documents, recordings and action items in one place.

This project is built as a full stack application with a Spring Boot backend and Next.js frontend.

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.3.4
- Spring Security
- JWT Authentication
- Spring Data JPA
- PostgreSQL
- Maven
- Groq API

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios
- TanStack React Query

### Other
- Docker
- Docker Compose

## Main Features

- User registration and login
- JWT based authentication
- Dashboard
- Manage inputs and documents
- Action item management
- AI based analysis
- Audio recording and transcription
- Groq AI integration
- PostgreSQL database
- Local file storage

## Project Structure

```text
ExecFlowAI/
│
├── execflow-backend/
│   ├── src/
│   ├── target/
│   ├── pom.xml
│   ├── Dockerfile
│   └── .env.example
│
├── execflow-frontend/
│
├── docker-compose.yml
├── .env.example
└── README.md


Backend Setup

Go to the backend folder:

cd execflow-backend

Create the environment file:

cp .env.example .env

Update the required values such as database details, JWT secret and Groq API key.

Then run:

mvn spring-boot:run

Backend will run on:

http://localhost:8080
Docker Setup

The project also contains a Docker Compose configuration.

From the project root:

docker compose up --build

This starts the required services such as PostgreSQL, backend and frontend.

Database

The backend uses PostgreSQL.

Default development database details are:

Database: execflow
Username: execflow
Password: execflow
Port: 5432

These values can be changed in the environment configuration.

API

The backend APIs are available under:

/api/v1

Health check:

/api/v1/health
Note

This is a student project and is still under development. Some features may change as the project is developed further.


This version deliberately avoids claiming features that aren't supported by the uploaded project files, and it keeps the wording reasonably human instead of sounding like a corporate committee spent three weeks deciding whether "AI-powered" needed a hyphen.
