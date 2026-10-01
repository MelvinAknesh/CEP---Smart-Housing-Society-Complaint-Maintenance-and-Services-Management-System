# Housing Society Management System 🏢

A modern, full-stack web application designed to streamline the management of housing societies and residential complexes. Built with a robust **Java Spring Boot** backend and a dynamic **React** frontend, this platform bridges the gap between administrators, residents, and service workers.

## ✨ Features

### 👑 Admin Dashboard
* **Member Management:** Securely approve new residents/workers and manage the society directory.
* **Service Dispatching:** View all maintenance and service requests and assign them to available workers.
* **Automated Billing:** Generate, track, and manage monthly maintenance bills, penalties, and event fees.
* **Community Feedback:** Monitor anonymous or attributed feedback from society members.

### 🏠 Resident Dashboard
* **Complaints & Services:** Lodge complaints (e.g., plumbing, electrical) and track their real-time resolution status.
* **Financial Tracking:** View due maintenance bills and complete digital payments effortlessly.
* **Feedback System:** Share suggestions or grievances directly with the administration.

### 🛠️ Worker Dashboard
* **Task Management:** Receive real-time task assignments and update their status (Pending, In-Progress, Completed).
* **Service Logs:** Maintain a history of completed jobs across different society wings and flats.

## 💻 Tech Stack

**Frontend:**
* React.js (Vite)
* Lucide React (Icons)
* Modern CSS (Glassmorphism & Responsive Design)

**Backend:**
* Java Spring Boot
* Spring Security (JWT-based Authentication)
* Spring Data JPA (Hibernate)

**Database:**
* MySQL

## 🚀 Getting Started

### Prerequisites
* Java 17+
* Node.js (v18+)
* MySQL Server (running on default port 3306)

### Backend Setup
1. Navigate to the root directory.
2. Ensure your local MySQL server is running and matches the credentials in `src/main/resources/application.properties`.
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
*(The backend runs on `localhost:8080`)*

### Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
*(The frontend runs on `localhost:5173`)*

## 🔐 Role-Based Access
This application enforces strict role-based access control (RBAC). The endpoints and UI dynamically adapt based on whether the logged-in user holds the `ADMIN`, `RESIDENT`, or `WORKER` role.
