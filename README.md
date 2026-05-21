# 🌌 SID — Space Intelligence Dashboard

![SID Hero Image](https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop)

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs" alt="Node.js" />
  <img src="https://img.shields.io/badge/Frontend-Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript" alt="Vanilla JS" />
  <img src="https://img.shields.io/badge/AI-LLaMA_3.3-0466C8?style=for-the-badge" alt="LLaMA 3" />
  <img src="https://img.shields.io/badge/API-NASA-0B3D91?style=for-the-badge&logo=nasa" alt="NASA API" />
</p>

> A luxury, minimalist Space Intelligence Dashboard that monitors real-time planetary threats using NASA's DONKI/NeoWs APIs and Groq's LLaMA 3.3 model.

---

## ✨ Features

*   **Planetary Threat Index:** Real-time `0-100` gauge indicating the current threat level to Earth based on live telemetry.
*   **Solar Flux Registry:** Live monitoring and historical (30-day) data on solar flares with interactive sparklines.
*   **Orbital Radar:** Interactive sweep detecting Near-Earth Objects (NEOs) and classifying their hazardous status in real-time.
*   **Geomagnetic Storms & CMEs:** Alerts and tracking for major space weather events that could impact global grids.
*   **ARIA AI Assistant:** Integrated LLaMA 3.3 chatbot via Groq for natural language queries about current space conditions.
*   **Impact Map:** Leaflet.js-based global map correlating solar events with potential Earth impact zones (Auroras, signal disruptions).
*   **Cinematic UI/UX:** Built with a "Midnight Blue" aesthetic, glassmorphism components, and a distraction-free layout.

## 🛠️ Technology Stack

*   **Frontend:** Vanilla JavaScript, HTML5, CSS3 (CSS Grid, Glassmorphism)
*   **Backend:** Node.js, Express.js
*   **APIs:** 
    *   [NASA DONKI](https://api.nasa.gov/) (Space Weather)
    *   [NASA NeoWs](https://api.nasa.gov/) (Asteroids)
*   **AI Engine:** [Groq Cloud](https://console.groq.com/) (LLaMA-3.3-70b-versatile)
*   **Visualizations:** Three.js (3D Space Environment), Chart.js (Telemetry Data), Leaflet.js (Impact Map)

## 🚀 Getting Started Locally

### Prerequisites

You need [Node.js](https://nodejs.org/en/) installed on your machine. You will also need active API keys from NASA and Groq.

1.  **NASA API Key:** Claim one at [api.nasa.gov](https://api.nasa.gov/)
2.  **Groq API Key:** Generate one at [console.groq.com/keys](https://console.groq.com/keys)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/mohasbks/sid-nasa-tracker.git
    cd sid-nasa-tracker
    ```

2.  Install all backend dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    NASA_API_KEY=your_nasa_api_key_here
    GROQ_API_KEY=your_groq_api_key_here
    ```

4.  Start the development server:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## ☁️ Deployment on Vercel

This project includes a `vercel.json` file, making it instantly ready for production deployment on Vercel.

1. Connect your GitHub account to [Vercel](https://vercel.com/).
2. Import the `sid-nasa-tracker` repository.
3. In the project setup, navigate to **Environment Variables**.
4. Add your `NASA_API_KEY` and `GROQ_API_KEY`.
5. Click **Deploy**. Vercel will automatically route the Node.js backend as Serverless Functions and serve the frontend statically.

## 📄 License

This project is licensed under the MIT License. Feel free to use and modify it.
