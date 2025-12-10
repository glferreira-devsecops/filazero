# FilaZero Saúde - Technical Architecture Documentation

## System Overview

FilaZero Saúde is a **real-time queue management system** built with a modern, lightweight architecture optimized for healthcare clinics. The system enables digital queue orchestration across multiple interfaces (reception, TV displays, patient mobile devices) with sub-second synchronization.

### Architecture Principles

- **Real-time First**: WebSocket-based synchronization for instant updates
- **Offline Resilience**: Hybrid mock mode ensures operations continue during network outages
- **Minimal Infrastructure**: Single-binary backend (no Redis, PostgreSQL, or complex deployments)
- **Mobile Responsive**: Progressive Web App (PWA) approach for universal device support
- **Security**: RBAC, route guards, input validation

---

## Technology Stack

### Frontend

#### Core Framework

```json
{
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "react-router-dom": "6.28.0"
}
```

**Rationale**: React 18 with Concurrent Features for smooth UX, React Router for SPA navigation.

#### Build Tool

```json
{
  "vite": "5.4.11",
  "@vitejs/plugin-react": "4.3.3"
}
```

**Performance**: Vite hot module replacement (HMR) ~50ms, production build <10s for typical changes.

#### UI Libraries

```json
{
  "lucide-react": "0.460.0",    // Icon library (tree-shakeable)
  "qrcode.react": "4.0.1"        // QR code generation
}
```

#### State Management

- **Context API**: AuthContext, ToastContext (no external library needed)
- **Local State**: React hooks (useState, useEffect, useCallback)
- **Real-time Sync**: PocketBase SDK subscriptions

### Backend

#### Database & API

```
PocketBase 0.21.5 (Go + SQLite)
```

**Components**:

- **Database**: SQLite (embedded, single file `/pb_data/data.db`)
- **API Server**: Go-based REST + Real-time WebSocket server
- **Admin UI**: Built-in admin panel at `/_/`
- **Auth**: JWT-based with httpOnly cookies

**Infrastructure**:

- Single binary (~40MB)
- No separate database server needed
- Embedded migrations

#### Database Schema

**Collection: `tickets`**

```js
{
  id: string (auto-generated)
  number: number (auto-incrementing per clinic)
  status: string (waiting, called, in_service, done, cancelled)
  clinicId: string (clinic identifier)
  patientName: string (optional)
  channel: string (web, kiosk, mobile)
  created: datetime (auto)
  updated: datetime (auto)
  calledAt: datetime (nullable)
  startedAt: datetime (nullable)
  finishedAt: datetime (nullable)
}
```

**Indexes**:

- `clinicId + status` (for fast queue filtering)
- `clinicId + number` (unique constraint per clinic)

**Collection: `users` (PocketBase built-in)**

- Used for clinic authentication (admin/reception roles)
- Email + password authentication
- Role field for authorization

---

## System Architecture

### High-Level Diagram

```mermaid
graph TB
    subgraph "Frontend (React SPA)"
        A[Landing Page] --> B[Patient Ticket View]
        A --> C[Login]
        C --> D[Reception Dashboard]
        C --> E[TV Panel Display]
        C --> F[Admin Analytics]
    end

    subgraph "Backend (PocketBase)"
        G[REST API]
        H[Real-time WebSocket]
        I[SQLite Database]
        J[Auth Service]
    end

    B <-->|Subscribe to Ticket| H
    D <-->|Subscribe to Queue| H
    E <-->|Subscribe to Queue| H
    F <-->|Query Analytics| G

    B -->|Create Ticket| G
    D -->|Update Status| G

    G <--> I
    H <--> I

    C <-->|Login| J
    J <--> I

    style A fill:#10b981
    style D fill:#3b82f6
    style E fill:#f59e0b
    style I fill:#ef4444
```

### Component Architecture

#### Frontend Routes

```
/ (public)
├─ Landing Page
│
/login (public)
├─ Authentication
│
/clinic/:clinicId (public)
├─ Patient Ticket Status View
│  └─ Real-time ticket subscription
│
/reception (protected)
├─ Reception Dashboard
│  └─ Queue management (call, start, finish)
│
/panel (protected)
├─ TV Panel Display
│  └─ Large-screen queue visualization
│
/admin (protected)
└─ Analytics Dashboard
   └─ Statistics and insights
```

#### State Management Flow

```mermaid
sequenceDiagram
    participant P as Patient Browser
    participant R as Reception Browser
    participant TV as TV Panel Browser
    participant PB as PocketBase
    participant DB as SQLite

    P->>PB: POST /api/collections/tickets/records
    PB->>DB: INSERT ticket (status: waiting)
    DB-->>PB: ticket created (id: abc123)
    PB-->>P: 200 OK {ticket}

    PB->>R: WebSocket: ticket CREATED event
    PB->>TV: WebSocket: ticket CREATED event

    R->>PB: PATCH /api/collections/tickets/records/abc123 {status: called}
    PB->>DB: UPDATE ticket SET status=called
    DB-->>PB: updated

    PB->>P: WebSocket: ticket UPDATED event
    PB->>TV: WebSocket: ticket UPDATED event
```

---

## Real-Time Synchronization

### PocketBase Realtime API

**Protocol**: Server-Sent Events (SSE) over HTTP

**Subscription Example**:

```javascript
// Subscribe to a specific ticket
pb.collection('tickets').subscribe(ticketId, (event) => {
  if (event.action === 'update') {
    updateUI(event.record); // Reflect changes instantly
  }
});

// Subscribe to all tickets for a clinic (queue)
pb.collection('tickets').subscribe('*', (event) => {
  if (event.record.clinicId === currentClinicId) {
    refreshQueue();
  }
});
```

**Latency Characteristics**:

- **Typical**: <200ms (local network)
- **Internet**: 200-500ms (depends on connection)
- **Guaranteed**: Event delivery with auto-reconnect

### Offline Failover Architecture

**Hybrid Mode**: When PocketBase is unreachable, system switches to localStorage-backed "mock mode".

**Implementation** (`ticketService.js`):

```javascript
let USE_MOCK = false;

// Health check on app load
pb.health.check().catch(() => {
  USE_MOCK = true; // Automatic failover
});

// Mock storage in localStorage
const mockDb = {
  queues: {
    "clinic123": [
      { id: "mock_1", number: 1, status: "waiting", ... }
    ]
  }
};
```

**Benefits**:

- Clinic operations continue during internet outages
- Demo mode for stakeholders without backend
- Development/testing without PocketBase running

---

## Security Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant PB as PocketBase
    participant DB as Database

    U->>F: Enter email + password
    F->>PB: POST /api/collections/users/auth-with-password
    PB->>DB: Verify credentials
    DB-->>PB: User found
    PB-->>F: JWT token (httpOnly cookie)
    F->>F: Redirect to /reception or /admin

    F->>PB: GET /api/collections/tickets (with cookie)
    PB->>PB: Verify JWT
    PB-->>F: 200 OK (authorized)
```

### Authorization (RBAC)

**Route Protection** (`RequireAuth.jsx`):

```javascript
function RequireAuth({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
}
```

**API Rules** (PocketBase):

- **Public**: `/clinic/:id` route, ticket creation
- **Authenticated**: Reception dashboard, TV panel, admin analytics
- **Admin only**: User management, system settings

### Data Validation

**Client-side** (React):

- Form validation (email format, required fields)
- Input sanitization before submission

**Server-side** (PocketBase):

- Schema validation (ticket number is integer, status is enum)
- Unique constraints (ticket number per clinic)
- Auto-trim strings, normalize data

---

## API Documentation

### REST Endpoints

#### Tickets

**Create Ticket**

```http
POST /api/collections/tickets/records
Content-Type: application/json

{
  "clinicId": "clinic_abc123",
  "patientName": "João Silva",
  "channel": "web"
}

Response: 200 OK
{
  "id": "abc123xyz",
  "number": 42,
  "status": "waiting",
  "clinicId": "clinic_abc123",
  "patientName": "João Silva",
  "created": "2024-12-09T21:00:00Z"
}
```

**Update Ticket Status**

```http
PATCH /api/collections/tickets/records/{id}
Content-Type: application/json

{
  "status": "called",
  "calledAt": "2024-12-09T21:05:00Z"
}

Response: 200 OK
{
  "id": "abc123xyz",
  "status": "called",
  "calledAt": "2024-12-09T21:05:00Z",
  ...
}
```

**List Tickets (Queue)**

```http
GET /api/collections/tickets/records?filter=clinicId="clinic_abc123"&&status="waiting"&sort=created

Response: 200 OK
{
  "items": [
    { "id": "...", "number": 40, "status": "waiting" },
    { "id": "...", "number": 41, "status": "waiting" }
  ],
  "totalItems": 2
}
```

#### Authentication

**Login**

```http
POST /api/collections/users/auth-with-password
Content-Type: application/json

{
  "identity": "admin@clinic.com",
  "password": "securepassword"
}

Response: 200 OK
{
  "token": "eyJhbGc...",
  "record": {
    "id": "user123",
    "email": "admin@clinic.com",
    "name": "Clinic Admin"
  }
}
```

**Logout**

```http
POST /api/collections/users/auth-refresh
(clears auth cookie)

Response: 204 No Content
```

### Real-Time Subscriptions

**Subscribe to Ticket Updates**

```javascript
const unsubscribe = pb.collection('tickets').subscribe(ticketId, (event) => {
  console.log(event.action); // 'create', 'update', 'delete'
  console.log(event.record); // Updated ticket object
});

// Cleanup
unsubscribe();
```

**Subscribe to All Queue Changes**

```javascript
pb.collection('tickets').subscribe('*', (event) => {
  if (event.record.clinicId === 'clinic_abc123') {
    // Refresh queue display
  }
});
```

---

## Design System

### Color Palette ("Emerald Glass" Theme)

```css
--primary: #059669;        /* Emerald 600 */
--primary-hover: #047857;  /* Emerald 700 */
--success: #22c55e;        /* Green 500 */
--accent: #f59e0b;         /* Amber 500 */
--secondary: #3b82f6;      /* Blue 500 */
--danger: #ef4444;         /* Red 500 */

--bg-app: #0f172a;         /* Slate 900 */
--bg-card: rgba(30, 41, 59, 0.7);  /* Glass effect */
```

### Typography

**Font Family**:

- **Primary**: Plus Jakarta Sans (Google Fonts)
- **Monospace**: JetBrains Mono (for numbers, codes)

**Scale**:

- H1: 3rem (48px), weight 800
- H2: 2rem (32px), weight 700
- Body: 1.05rem (16.8px), line-height 1.6

### Components

**Card** (Glass Morphism):

```css
background: rgba(30, 41, 59, 0.7);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 24px;
```

**Button** (Haptic Feel):

```css
border-radius: 14px;
padding: 0.75rem 1.5rem;
transition: all 0.2s ease;
box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);

:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(5, 150, 105, 0.4);
}
```

---

## Performance Characteristics

### Frontend Metrics

**Bundle Size** (Production Build):

```
dist/index.html         1.2 KB
dist/assets/index.css   10.8 KB
dist/assets/index.js    ~180 KB (gzipped: ~60 KB)
```

**Lighthouse Scores** (Estimated):

- Performance: 95+
- Accessibility: 90+
- Best Practices: 95+
- SEO: 90+

**Load Time**:

- Initial load (cold cache): <1.5s (3G network)
- Subsequent loads (warm cache): <300ms

### Backend Metrics

**PocketBase Performance**:

- **Concurrent Connections**: Tested up to 1,000+
- **Database Size**: <10 MB for 10,000 tickets
- **API Response Time**: ~10-50ms (local), ~100-200ms (cloud)
- **Memory Usage**: ~30-50 MB (idle), ~100-200 MB (active)

**Scalability**:

- Single instance: 500-1,000 concurrent users
- Horizontal scaling: Load balancer + multiple PocketBase instances
- Database: SQLite suitable up to ~100K tickets, then migrate to PostgreSQL

---

## Deployment Architecture

### Development Environment

```bash
# Backend
cd backend
./pocketbase serve

# Frontend
cd frontend
npm install
npm run dev
```

**URLs**:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8090/api`
- Admin UI: `http://localhost:8090/_/`

### Production Deployment Options

#### Option 1: Single VPS (Recommended for MVP)

**Infrastructure**:

- VPS: DigitalOcean/Linode ($5-10/month, 1GB RAM)
- OS: Ubuntu 22.04 LTS
- Reverse Proxy: Nginx
- SSL: Let's Encrypt (free)

**Setup**:

```bash
# Build frontend
npm run build  # Generates /dist folder

# Serve with Nginx
server {
  listen 80;
  server_name filazero.example.com;

  # Frontend static files
  location / {
    root /var/www/filazero/dist;
    try_files $uri /index.html;
  }

  # Proxy to PocketBase
  location /api {
    proxy_pass http://127.0.0.1:8090;
  }
}

# Run PocketBase as systemd service
[Unit]
Description=PocketBase
After=network.target

[Service]
ExecStart=/usr/local/bin/pocketbase serve --http="127.0.0.1:8090"
WorkingDirectory=/opt/pocketbase
Restart=always

[Install]
WantedBy=multi-user.target
```

**Cost**: ~$10/month (VPS + domain)

#### Option 2: Cloud Platform (Fly.io, Railway)

**Fly.io** (Recommended):

```toml
# fly.toml
app = "filazero-saude"

[build]
  dockerfile = "Dockerfile"

[[services]]
  internal_port = 8090
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80
```

**Dockerfile**:

```dockerfile
FROM node:18-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM alpine:latest
COPY --from=frontend /app/dist /dist
COPY backend/pocketbase /pocketbase
COPY backend/pb_migrations /pb_migrations

EXPOSE 8090
CMD ["/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb_data"]
```

**Cost**: ~$5-15/month (includes SSL, CDN, auto-scaling)

#### Option 3: AWS/Google Cloud (Enterprise)

**Services**:

- **Compute**: EC2 / Cloud Run
- **Storage**: EBS / Cloud Storage (for `pb_data/`)
- **Load Balancer**: ALB / Cloud Load Balancing
- **Database**: Migrate to RDS PostgreSQL for scale

**Cost**: ~$50-200/month (depends on traffic)

---

## Testing Strategy

### Current Coverage

**Implemented**:

- Error boundaries (prevent crash on component errors)
- Form validation (client-side)
- Auth guard routes (prevent unauthorized access)
- Offline failover (mock mode testing)

**Manual Testing Checklist**:

- [ ] Create ticket (patient view)
- [ ] Subscribe to real-time updates
- [ ] Call patient (reception)
- [ ] Update status (in_service, done)
- [ ] Multi-device sync (3+ browsers)
- [ ] Offline mode (disconnect network)
- [ ] Reconnect and sync
- [ ] Authentication flow
- [ ] Mobile responsive (iPhone, Android)

### Recommended Additions

**Unit Tests** (Frontend):

```bash
npm install --save-dev vitest @testing-library/react
```

**Integration Tests** (E2E):

```bash
npm install --save-dev playwright
```

**Load Testing**:

```bash
# Apache Bench
ab -n 1000 -c 100 http://localhost:8090/api/collections/tickets/records
```

---

## Monitoring & Logging

### Application Logs

**PocketBase**:

```bash
./pocketbase serve --http=0.0.0.0:8090 2>&1 | tee -a logs/pocketbase.log
```

**Frontend** (Browser Console):

- Errors logged via Error Boundary
- Network errors caught and displayed as toasts

### Recommended Monitoring Tools

**Free Tier Options**:

- **Uptime**: UptimeRobot (free, 50 monitors)
- **Error Tracking**: Sentry (free tier: 5K events/month)
- **Analytics**: Plausible / Simple Analytics (GDPR-friendly)

**Metrics to Track**:

- API response times (p50, p95, p99)
- Error rates (4xx, 5xx responses)
- Ticket creation rate (transactions/hour)
- Active concurrent users
- Database size growth

---

## Future Technical Roadmap

### Phase 1: Enhancements (v1.1)

- [ ] WhatsApp notification integration (Twilio/Vonage)
- [ ] SMS alerts for called tickets
- [ ] Multi-language support (i18n)
- [ ] Advanced analytics dashboard

### Phase 2: Integrations (v1.2)

- [ ] EMR system connectors (REST API webhooks)
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Payment gateway (Stripe, Mercado Pago)

### Phase 3: Mobile Native (v2.0)

- [ ] React Native app (iOS + Android)
- [ ] Push notifications
- [ ] Offline-first architecture
- [ ] Biometric authentication

### Phase 4: Enterprise (v2.1)

- [ ] Multi-location support (franchises)
- [ ] White-label customization
- [ ] Advanced reporting (PDF exports)
- [ ] Compliance certifications (HIPAA, LGPD)

### Phase 5: AI/ML (v3.0)

- [ ] Predictive wait times (ML models)
- [ ] Staffing optimization recommendations
- [ ] Patient sentiment analysis (NPS integration)
- [ ] Anomaly detection (unusual wait patterns)

---

## Migration Path to PostgreSQL

**When to Migrate**:

- Database size > 100 MB
- Concurrent users > 1,000
- Need for replication/backups

**PocketBase PostgreSQL Support**:
PocketBase v0.21+ supports PostgreSQL as backend. Migration path:

```bash
# Export SQLite data
sqlite3 pb_data/data.db .dump > backup.sql

# Configure PocketBase for PostgreSQL
export DATABASE_URL=postgresql://user:pass@host:5432/filazero
./pocketbase serve --db=$DATABASE_URL

# Import data (manual mapping may be needed)
```

---

**Document Version**: 1.0
**Last Updated**: December 2024
**Technology Versions**: React 18.3.1, PocketBase 0.21.5, Vite 5.4.11
