# Praxis — Premium Municipal Reporting & Civic AI Platform

Praxis is a high-performance, full-stack civic technology platform engineered to bridge the gap between citizens and municipal authorities. By fusing real-time spatial mapping, dynamic 3D visualizations, secure biometric/OAuth credentials, server-authoritative logic, and state-of-the-art predictive AI engines, Praxis streamlines infrastructure maintenance, eliminates fraudulent claims, and coordinates modern municipal responses.

---

## 🏗️ Architectural Overview & Data Flow

The platform is designed around a decoupled, full-stack architecture that guarantees high speed, total data safety, and offline/online resilient client state management:

*   **Client Interface**: Built with React 18 and compiled via Vite, using Tailwind CSS for state-driven styling, Three.js for immersive WebGL overlays, and Recharts for interactive analytics dashboard rendering.
*   **Secure API Gateway**: A custom Node.js and Express backend that acts as the exclusive gatekeeper. The server validates payloads, sanitizes requests, extracts metadata, and securely executes backend transactions.
*   **Durable Persistent Storage**: Firestore acts as the real-time document store, maintaining authoritative states for municipal issues, user profiles, timelines, and community comments.
*   **Cognitive Analysis Layer**: Integrates the official `@google/genai` SDK in a server-isolated context using secure environment variables to predict hotspots, evaluate municipal risk, and assign severity indexes.

### 1. The Client-Server Decoupling Strategy
*   **Zero Client-Side Secrets**: No database write/read credentials, third-party authentication tokens, or Gemini API keys are loaded directly in the browser context. The client exclusively executes HTTPS queries against the secure Node.js proxy server.
*   **Optimistic Real-Time UI Store**: Managed with a robust central React store. Action dispatches immediately update local state for instantaneous tactile responsiveness, subsequently syncing asynchronously with the backend database. If an API request fails, state rollback safeguards data integrity.

### 2. Full-Stack Dev & Bundling Pipelines
*   **Development Phase**: Powered by `tsx` (TypeScript Execute) to provide native, superfast runtime compilation for Express in background mode on host `0.0.0.0` at port `3000`.
*   **Production Build Process**: 
    1. The React SPA is bundled using `vite build` into highly-optimized, code-split static assets residing in `/dist`.
    2. The Node.js Express server (`server.ts`) is bundled via `esbuild` with the command `--platform=node --format=cjs --packages=external --outfile=dist/server.cjs`. This compiles all backend TypeScript modules, helper scripts, and endpoint routes into a single, lightning-fast, self-contained file.
    3. The production engine boots natively via `node dist/server.cjs` serving static assets and proxying backend queries seamlessly.

---

## 🎨 Visual Identity & Dynamic UI System

Praxis implements an elite, desktop-first responsive **Cosmic Slate Theme** structured to mimic the premium, polished smoothness of native macOS and iOS widgets.

### 1. Typography & Grid Hierarchy
*   **Display Elements**: Styled using **Space Grotesk** and **Outfit** for progressive, tech-forward, high-contrast headings paired with micro-scaled letter spacing (`letter-spacing: 0.05em`).
*   **Technical Data**: Rendered in **JetBrains Mono** or **Fira Code** for EXIF data readouts, coordinates, timestamp logs, and authority action lists.
*   **Body Content**: Set in **Inter** to maximize reading speed, optimize paragraph contrast, and support modern fluid widths (`max-w-7xl mx-auto`).

### 2. Dynamic Premium Vector Engine
All missing issue media fallbacks utilize our custom vector engine (`/src/utils/issuePlaceholder.ts`). Each category is rendered as a standalone, mathematical, ultra-smooth SVG:
*   **Road Damage / Potholes**: Embedded warning orange linear gradients (`#FF9500` to `#FF5E00`), warning cones, and 3-dimensional dark craters resting on concentric ripple waves representing physical road strain.
*   **Water Leaks & Outages**: Sky blue to deep ocean linear gradients (`#00D2FF` to `#0066FF`) backed by glassmorphic squircle backing plates (`stroke-opacity="0.22"`), cascading light-leak orbs, and organic bezier wave crests.
*   **Electrical & Lighting**: Midnight violet to starburst black backgrounds paired with a neon-lightning striking an abstract lightbulb dome, complete with feGaussianBlur filters simulating high-end glow matrices.
*   **Waste & Environment**: Mossy emerald and vibrant green gradients (`#34C759` to `#248A3D`) coupled with elegant vector leaf geometries promoting environmental rejuvenation.

---

## 💻 Deep-Dive: Core Engineering Capabilities

### 1. Photographic Audit & EXIF Validation
To eliminate fake, unverified, or spam reports, the platform integrates a strict photographic audit during client-side image uploads:
*   **Metadata Parser**: Uses low-level array-buffer extraction (`/src/utils/exif.ts`) to read internal JPEG tags containing original latitude, longitude, camera model, lens parameters, and exact timestamps.
*   **Coordinate Audit Logic**: When a user reports an issue, the system calculates the Haversine distance between the device's live browser geolocation and the image's original EXIF metadata.
*   **Authority Verification Flag**: If the distance exceeds **50 meters**, the issue is automatically marked as "Suspicious Geo-Match" and flagged on the Inspector's Console for verification.

### 2. 3D Spatial Canvas (Three.js & Leaflet)
*   **Interlocking Map Architecture**: Combining an interactive, low-altitude 2D Leaflet system mapping local coordinate clusters with a high-fidelity 3D WebGL Globe Canvas.
*   **ThreeJS Overlays**: Generates animated node rings, particle systems, and wave ripples directly on top of the map layer to identify dynamic civic issues without dragging browser frame performance.

### 3. Gamification and Social Ledger
*   **Deterministic Experience System**: Every verified report grants the citizen **+100 XP**. Upvoted or community-supported tickets increase profile level boundaries.
*   **Badges Engine**: Generates badges dynamically based on contributions (e.g. *Water Watcher* for 3 resolved leak tickets, *Night Owl* for streetlight reports).
*   **Dynamic Avatar Generator**: Employs mathematically unique, beautiful geometric SVG profile avatars hashed directly from the user's permanent database identifier (`uid`).

### 4. Gemini AI-Powered Hotspot Prediction
The platform features server-side AI logic using the modern `@google/genai` TypeScript SDK:
*   **Data Aggregation**: Collects historical category trends, local population report density, and coordinates.
*   **Predictive Inference**: Gemini evaluates clusters of active "open" issues (e.g., repeating low water pressure reports combined with minor road cracks) to warn authorities of imminent structural failures before they become severe hazards.
*   **Severity Assessment**: Dynamically generates severity flags (Low, Medium, High, Critical) using LLM reasoning to help dispatch teams prioritize their daily pipeline.

### 5. Google Workspace Integration Hub & Project Documentation
*   **On-Demand Hackathon Documentation**: Seamlessly compiles a professional, high-fidelity project specification sheet directly inside your personal Google Docs and Google Drive.
*   **Accessing the Document**: Navigate to the **Impact Analytics** tab from the main navigation menu, scroll down to the **📝 Google Workspace Integration Hub**, sign in / authorize using your Google account, and click the **Authorize & Generate Project Doc** button. The system will programmatically draft, format with executive styling, and establish public read-only view permissions, providing an immediate clickable redirection link.

---

## 📂 Exhaustive Data Schemas & API Reference

### 1. Database Interfaces (Firestore / TypeScript Types)

#### `Issue` Object Structure
```typescript
interface Issue {
  id: string;                         // Unique Firestore document ID
  title: string;                      // Concise user-supplied title
  description: string;                // Issue details
  aiDescription?: string;             // Detailed analysis from Gemini
  category: 'Pothole' | 'Water' | 'Light' | 'Waste' | 'Infrastructure' | 'Other';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'open' | 'in_progress' | 'resolved' | 'rejected';
  lat: number;                        // Latitude coordinates
  lng: number;                        // Longitude coordinates
  address: string;                    // Reverse geocoded physical address
  landmark?: string;                  // User-supplied landmarks
  mediaUrls: string[];                // Array of media storage links
  reportedBy: string;                 // Reporter's User ID (uid)
  reportedByName: string;             // Display name of reporter
  reportedByPhoto?: string;           // Avatar URL of reporter
  reportedAt: number;                 // Unix epoch timestamp (ms)
  upvoteCount: number;                // Total upvotes received
  verifications: Verification[];      // Peer-review logs
  timeline: TimelineEntry[];          // Chronological activity history
  resolvedAt?: number;                // Resolution timestamp
  resolvedBy?: string;                // Authority ID who completed repair
  aiCategoryConfidence?: number;      // AI categorization score (0.00 - 1.00)
  aiTags?: string[];                  // Dynamic tags predicted by Gemini
  upvotedBy?: string[];               // Arrays of user UIDs who upvoted
  comments?: Comment[];               // Array of user comments
}
```

#### `UserProfile` Object Structure
```typescript
interface UserProfile {
  uid: string;                        // Unique identifier matching Auth accounts
  displayName: string;                // Public display name
  photoURL: string;                   // Public SVG avatar path or image link
  email: string;                      // Private email address
  role: 'citizen' | 'authority' | 'admin'; // Authorization levels
  xp: number;                         // Accumulative Experience Points
  level: number;                      // Current gamified level rank
  badges: string[];                   // Earned achievement identifiers
  issuesReported: number;             // Count of successfully logged issues
  issuesVerified: number;             // Count of validated peer reports
  issuesResolved: number;             // Count of repaired issues (Authority-only)
  joinedAt: number;                   // Registration timestamp
  streak: number;                     // Daily active consecutive streak count
}
```

---

### 2. Express Server Endpoint Reference

#### `GET /api/firebase-config`
Retrieves client-safe Firebase project credentials to initialize connections dynamically on client load.
*   **Response**: `200 OK` (JSON config variables)

#### `GET /api/issues`
Fetches all municipal reports ordered chronologically by reporting timestamp.
*   **Response**: `200 OK` (JSON array of `Issue` records)

#### `POST /api/gemini/predict-hotspots`
Leverages the Gemini SDK to analyze active issue clusters and predict infrastructure anomalies.
*   **Payload**:
    ```json
    {
      "lat": 40.7128,
      "lng": -74.0060,
      "recentIssues": [...]
    }
    ```
*   **Response**: `200 OK` (Risk percentage, predicted coordinates, hazard category, confidence score, and descriptive reasoning).

#### `GET /api/analytics/summary`
Calculates cumulative municipal performance statistics, active/resolved distribution, and category density maps.
*   **Response**: `200 OK` (Summary JSON for Recharts components)

#### `GET /api/leaderboard`
Queries users collection, ordering by Experience Points (XP) to return the top 15 community contributors.
*   **Response**: `200 OK` (Sorted array of `UserProfile` objects)

---

## 🛠️ Step-by-Step Installation & Setup

### 1. Clone the Workspace & Install Packages
Ensure Node.js 18+ is installed on your local environment. Run:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file at the project root matching the schema in `.env.example`:
```env
# Server Secret Keys (Never exposed to client)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Admin Configurations
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
```

### 3. Spin Up the Development Engine
Boots the background Express proxy server, mounts the Vite dev middleware, and maps routing to host `0.0.0.0` at port `3000`:
```bash
npm run dev
```

### 4. Build & Production Check
Verify TypeScript configurations, execute the code linter, compile the static bundle, and package the Express server using esbuild:
```bash
npm run build
```
Once built successfully, launch the standalone production bundle:
```bash
npm start
```
The application will operate securely in production mode at `http://localhost:3000`.
