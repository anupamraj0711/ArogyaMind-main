# Agentic Healthcare Platform

A production-ready MERN (MongoDB, Express, React, Node.js) stack healthcare application designed to automate the patient journey. This platform leverages Google's Gemini AI model to perform real-time symptom analysis, match patients with relevant medical specialists, handle appointment scheduling, and provide end-to-end travel assistance for hospital visits.

## 🚀 Core Functionalities

### 1. AI-Powered Symptom Checker
- **Intelligent Triage**: Patients enter their symptoms in plain text.
- **Gemini Integration**: The backend leverages `@google/genai` to analyze symptoms, returning structured data including potential medical conditions, severity levels (e.g., Low, Critical), and the recommended specialist type (e.g., Cardiologist, Neurologist).
- **History Tracking**: All AI analyses are stored securely in the database and can be reviewed chronologically.

### 2. Specialist Recommendation Engine
- **Dynamic Database Matching**: Instantly cross-references the AI's specialist recommendation with a MongoDB database of real-world doctors.
- **Rich Specialist Profiles**: Displays doctor experience, consultation fees, available timings, hospital location, and whether they accept online consultations.
- **Seamless Handoff**: Patients can instantly click "Book Appointment" right from the AI recommendation screen, carrying the doctor's context over to the scheduling system.

### 3. Patient Dashboard & Appointment Management
- **Centralized Hub**: A personalized dashboard that aggregates "Recent Activity" (both past symptom checks and appointments) chronologically.
- **Live Status Tracking**: Displays pending actions and highlights the Next Upcoming Appointment.
- **Full Lifecycle Control**: Patients can schedule, view, **reschedule**, and **cancel** their appointments seamlessly. Action buttons are dynamically disabled based on appointment state (e.g., cannot cancel an already completed appointment).

### 4. Agentic Travel Assistance & Routing
*A standout feature designed to handle the logistics of visiting a hospital.*
- **Live Google Maps Integration**: Dynamically loads an interactive Google Map displaying the route from the patient's current location to the specific hospital.
- **Gemini Hotel Engine**: Automatically prompts the AI backend to act as a travel agent, returning real-world, realistic hotel accommodations near the specific hospital in INR pricing.
- **Advanced UI Filtering**: Patients can filter the AI's hotel results in real-time using:
  - Price range slider (₹500 - ₹10,000)
  - Star rating toggle (1 to 5 stars)
  - Specific amenities (Free WiFi, Parking, Restaurant, Hospital Shuttle)
- **Direct Booking Integration**: Clicking a hotel opens a targeted Google search to instantly book the accommodation.
- **Comprehensive Travel Itinerary**: An AI-generated, perfectly formatted modal that provides a full breakdown of the trip, including packing instructions, primary/alternative transport routes, the top matched hotel, and nearby dining options.

### 5. Secure Authentication & Authorization
- **Role-Based Access**: Distinguishes between Patients, Specialists, and Admins.
- **JWT Implementation**: Fully secure JSON Web Token integration for persistent login sessions.
- **Protected Routes**: Restricts unauthorized access to sensitive pages like the Admin Panel or patient dashboards.

### 6. Production-Ready DevOps
- **Dockerized Architecture**: Both the frontend (Client) and backend (Server) are containerized using Docker.
- **Docker Compose**: A unified `docker-compose.yml` orchestrates the multi-container environment, ensuring it runs identically on any machine with zero local setup required.

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, React Router, Axios, Lucide React (Icons).
- **Backend**: Node.js, Express.js, Mongoose.
- **Database**: MongoDB Atlas (Cloud).
- **AI Integration**: Google Gemini (`@google/genai`).
- **Containerization**: Docker, Docker Compose.

## ⚙️ How to Run Locally

1. **Clone the repository.**
2. **Setup Environment Variables**:
   Create a `.env` file in the `server` directory with:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
3. **Run with Docker Compose** (Recommended):
   ```bash
   docker-compose up --build
   ```
   *The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:5000`.*

4. **Run Manually**:
   - Open terminal in `/server` -> `npm install` -> `npm start`
   - Open terminal in `/client` -> `npm install` -> `npm run dev`

---
*Built to redefine digital healthcare by bridging the gap between medical diagnostics and real-world logistics.*
