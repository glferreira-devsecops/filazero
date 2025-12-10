# FilaZero Saúde - API Documentation

## Overview

FilaZero Saúde uses **PocketBase** as the backend, which provides a REST API and real-time WebSocket subscriptions. This document covers all available endpoints and usage examples.

**Base URL**: `https://your-domain.com/api` (or `http://localhost:8090/api` for development)

---

## Authentication

### Login

**Endpoint**: `POST /api/collections/users/auth-with-password`

**Request Body**:

```json
{
  "identity": "admin@clinic.com",
  "password": "securepassword123"
}
```

**Response** (200 OK):

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "record": {
    "id": "abc123xyz",
    "collectionId": "_pb_users_auth_",
    "collectionName": "users",
    "created": "2024-12-01 10:00:00.000Z",
    "updated": "2024-12-09 21:00:00.000Z",
    "email": "admin@clinic.com",
    "verified": true,
    "name": "Clinic Admin"
  }
}
```

**Notes**:

- Token stored as httpOnly cookie automatically
- Token valid for 7 days (default PocketBase)
- Use token for authenticated requests

---

### Logout

**Endpoint**: `POST /api/collections/users/auth-refresh`

**Request**: Empty body (cookie-based)

**Response** (204 No Content)

**Notes**:

- Clears authentication cookie
- Client should redirect to `/login`

---

### Get Current User

**Endpoint**: `GET /api/collections/users/records/:id`

**Headers**:

```
Authorization: Bearer {token}
```

**Response** (200 OK):

```json
{
  "id": "abc123xyz",
  "email": "admin@clinic.com",
  "name": "Clinic Admin",
  "created": "2024-12-01 10:00:00.000Z"
}
```

---

## Tickets

### Create Ticket

**Endpoint**: `POST /api/collections/tickets/records`

**Request Body**:

```json
{
  "clinicId": "clinic_abc123",
  "patientName": "João Silva",
  "channel": "web"
}
```

**Fields**:

- `clinicId` (required): Unique clinic identifier
- `patientName` (optional): Patient's name
- `channel` (optional): Source (web, mobile, kiosk) - defaults to "web"
- `number` (auto-generated): Sequential ticket number per clinic
- `status` (auto-set): "waiting"

**Response** (200 OK):

```json
{
  "id": "ticket123",
  "number": 42,
  "status": "waiting",
  "clinicId": "clinic_abc123",
  "patientName": "João Silva",
  "channel": "web",
  "created": "2024-12-09T21:05:00.000Z",
  "updated": "2024-12-09T21:05:00.000Z",
  "calledAt": null,
  "startedAt": null,
  "finishedAt": null,
  "collectionId": "pdom17wqk116bld",
  "collectionName": "tickets"
}
```

**Errors**:

- `400`: Missing required fields
- `500`: Server error

---

### Get Ticket

**Endpoint**: `GET /api/collections/tickets/records/:id`

**Example**: `GET /api/collections/tickets/records/ticket123`

**Response** (200 OK):

```json
{
  "id": "ticket123",
  "number": 42,
  "status": "waiting",
  "clinicId": "clinic_abc123",
  "patientName": "João Silva",
  "created": "2024-12-09T21:05:00.000Z",
  ...
}
```

**Errors**:

- `404`: Ticket not found

---

### Update Ticket

**Endpoint**: `PATCH /api/collections/tickets/records/:id`

**Request Body** (example: call patient):

```json
{
  "status": "called",
  "calledAt": "2024-12-09T21:10:00.000Z"
}
```

**Status Values**:

- `waiting`: Patient in queue
- `called`: Patient called to attend room
- `in_service`: Patient currently being attended
- `done`: Service completed
- `cancelled`: Ticket cancelled

**Timestamp Fields** (auto-populated by status):

- `calledAt`: Set when status → "called"
- `startedAt`: Set when status → "in_service"
- `finishedAt`: Set when status → "done"

**Response** (200 OK):

```json
{
  "id": "ticket123",
  "number": 42,
  "status": "called",
  "calledAt": "2024-12-09T21:10:00.000Z",
  ...
}
```

---

### List Tickets (Queue)

**Endpoint**: `GET /api/collections/tickets/records`

**Query Parameters**:

- `filter`: Filter expression (PocketBase SQL-like syntax)
- `sort`: Sort field (`created`, `-created`, `number`)
- `page`: Page number (1-indexed)
- `perPage`: Results per page (default 30, max 100)

**Example: Get waiting tickets for a clinic**:

```
GET /api/collections/tickets/records?filter=clinicId="clinic_abc123"&&status="waiting"&sort=created&perPage=100
```

**Response** (200 OK):

```json
{
  "page": 1,
  "perPage": 100,
  "totalItems": 5,
  "totalPages": 1,
  "items": [
    {
      "id": "ticket120",
      "number": 40,
      "status": "waiting",
      "clinicId": "clinic_abc123",
      "created": "2024-12-09T20:00:00.000Z"
    },
    {
      "id": "ticket121",
      "number": 41,
      "status": "waiting",
      "clinicId": "clinic_abc123",
      "created": "2024-12-09T20:15:00.000Z"
    },
    ...
  ]
}
```

**Common Filters**:

Get waiting tickets:

```
filter=clinicId="clinic_abc123"&&status="waiting"
```

Get active tickets (called or in service):

```
filter=clinicId="clinic_abc123"&&(status="called"||status="in_service")
```

Get all tickets for today:

```
filter=clinicId="clinic_abc123"&&created>="2024-12-09 00:00:00"
```

---

### Delete Ticket

**Endpoint**: `DELETE /api/collections/tickets/records/:id`

**Headers**: Requires admin authentication

**Response** (204 No Content)

**Errors**:

- `403`: Unauthorized (not admin)
- `404`: Ticket not found

---

## Real-Time Subscriptions

PocketBase provides Server-Sent Events (SSE) for real-time updates.

### Subscribe to Ticket Updates

**JavaScript SDK**:

```javascript
import PocketBase from 'pocketbase';
const pb = new PocketBase('https://your-domain.com');

// Subscribe to specific ticket
const unsubscribe = await pb.collection('tickets').subscribe(ticketId, (event) => {
  console.log(event.action);  // 'create', 'update', 'delete'
  console.log(event.record);  // Updated ticket object

  if (event.action === 'update') {
    // Update UI with new status
    updateTicketDisplay(event.record);
  }
});

// Cleanup when component unmounts
unsubscribe();
```

**Event Structure**:

```json
{
  "action": "update",
  "record": {
    "id": "ticket123",
    "number": 42,
    "status": "called",
    "calledAt": "2024-12-09T21:10:00.000Z",
    ...
  }
}
```

---

### Subscribe to Queue (All Clinic Tickets)

```javascript
// Subscribe to all ticket changes
await pb.collection('tickets').subscribe('*', (event) => {
  // Filter by clinic
  if (event.record.clinicId === 'clinic_abc123') {
    console.log('Queue changed:', event.action, event.record.number);
    refreshQueue();  // Refetch entire queue
  }
});
```

---

## Health Check

**Endpoint**: `GET /api/health`

**Response** (200 OK):

```json
{
  "code": 200,
  "message": "API is healthy.",
  "data": {}
}
```

**Use Cases**:

- Uptime monitoring (UptimeRobot, Pingdom)
- Load balancer health checks
- Offline detection in frontend

---

## Error Responses

### Standard Error Format

```json
{
  "code": 400,
  "message": "Failed to create record.",
  "data": {
    "clinicId": {
      "code": "validation_required",
      "message": "Missing required value."
    }
  }
}
```

### HTTP Status Codes

- `200`: Success
- `204`: Success (no content, e.g., delete)
- `400`: Bad request (validation error)
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `500`: Server error

---

## Rate Limiting

**Default PocketBase Limits**:

- No built-in rate limiting (recommended to add Nginx limit_req)
- WebSocket connections: Limited by server resources

**Recommended Nginx Rate Limit**:

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://127.0.0.1:8090;
}
```

---

## CORS

**Default**: CORS enabled for all origins in development

**Production**: Configure in PocketBase settings:

```
Settings > Application > CORS
Allowed Origins: https://your-domain.com
```

---

## Pagination

**Default**: 30 items per page

**Max**: 100 items per page

**Example**:

```
GET /api/collections/tickets/records?page=2&perPage=50
```

**Response includes**:

```json
{
  "page": 2,
  "perPage": 50,
  "totalItems": 150,
  "totalPages": 3,
  "items": [...]
}
```

---

## Filtering Syntax

PocketBase uses SQL-like filter expressions.

**Operators**:

- `=`: Equal
- `!=`: Not equal
- `>`, `<`, `>=`, `<=`: Comparison
- `~`: Like (case-insensitive)
- `!~`: Not like
- `&&`: AND
- `||`: OR

**Examples**:

Equal:

```
filter=status="waiting"
```

And:

```
filter=clinicId="abc"&&status="waiting"
```

Or:

```
filter=status="called"||status="in_service"
```

Date range:

```
filter=created>="2024-12-01 00:00:00"&&created<"2024-12-10 00:00:00"
```

Like (partial match):

```
filter=patientName~"Silva"
```

---

## Code Examples

### JavaScript/React

#### Create Ticket

```javascript
import pb from './pocketbase';

async function createTicket(clinicId, patientName) {
  const ticket = await pb.collection('tickets').create({
    clinicId,
    patientName,
    channel: 'web'
  });

  return ticket;
}
```

#### Update Status

```javascript
async function callPatient(ticketId) {
  const updated = await pb.collection('tickets').update(ticketId, {
    status: 'called',
    calledAt: new Date().toISOString()
  });

  return updated;
}
```

#### List Queue

```javascript
async function getQueue(clinicId) {
  const result = await pb.collection('tickets').getList(1, 100, {
    filter: `clinicId="${clinicId}"&&(status="waiting"||status="called"||status="in_service")`,
    sort: 'created'
  });

  return result.items;
}
```

#### Real-Time Subscribe

```javascript
function subscribeToTicket(ticketId, callback) {
  pb.collection('tickets').subscribe(ticketId, (event) => {
    if (event.action === 'update' || event.action === 'create') {
      callback(event.record);
    }
  });

  // Return unsubscribe function
  return () => pb.collection('tickets').unsubscribe(ticketId);
}
```

---

### cURL Examples

#### Create Ticket

```bash
curl -X POST https://your-domain.com/api/collections/tickets/records \
  -H "Content-Type: application/json" \
  -d '{
    "clinicId": "clinic_abc123",
    "patientName": "João Silva",
    "channel": "web"
  }'
```

#### Update Ticket

```bash
curl -X PATCH https://your-domain.com/api/collections/tickets/records/ticket123 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "called",
    "calledAt": "2024-12-09T21:10:00.000Z"
  }'
```

#### List Waiting Tickets

```bash
curl "https://your-domain.com/api/collections/tickets/records?filter=clinicId=%22clinic_abc123%22%26%26status=%22waiting%22"
```

---

## WebSocket Protocol

PocketBase uses **Server-Sent Events (SSE)**, not traditional WebSockets.

**Connection**:

```javascript
// Automatic via SDK
pb.collection('tickets').subscribe(...)

// Manual (not recommended)
const eventSource = new EventSource('https://your-domain.com/api/realtime');
eventSource.onmessage = (e) => {
  const data = JSON.parse(e.data);
  console.log(data);
};
```

**Event Format**:

```
event: PB_CONNECT
data: {"clientId": "abc123"}

event: tickets/ticket123
data: {"action": "update", "record": {...}}
```

---

## Admin UI

**URL**: `https://your-domain.com/_/`

**Features**:

- View/edit all collections
- User management
- Logs and backups
- Settings configuration
- API rules editor

**Access**: Requires admin account created on first setup

---

## Best Practices

### Error Handling

```javascript
try {
  const ticket = await pb.collection('tickets').create(data);
} catch (error) {
  if (error.status === 400) {
    // Validation error
    console.error('Invalid data:', error.data);
  } else if (error.status === 401) {
    // Not authenticated
    window.location.href = '/login';
  } else {
    // Server error
    console.error('Server error:', error);
  }
}
```

### Real-Time Cleanup

```javascript
useEffect(() => {
  const unsubscribe = pb.collection('tickets').subscribe(id, callback);

  // Cleanup on component unmount
  return () => unsubscribe();
}, [id]);
```

### Pagination for Large Datasets

```javascript
async function getAllTickets(clinicId) {
  let page = 1;
  let allTickets = [];

  while (true) {
    const result = await pb.collection('tickets').getList(page, 100, {
      filter: `clinicId="${clinicId}"`
    });

    allTickets = [...allTickets, ...result.items];

    if (page >= result.totalPages) break;
    page++;
  }

  return allTickets;
}
```

---

## Future API Enhancements (Roadmap)

- [ ] GraphQL endpoint (alternative to REST)
- [ ] Webhook notifications (HTTP callbacks on events)
- [ ] Bulk operations (create/update multiple tickets)
- [ ] Advanced analytics endpoints (aggregations)
- [ ] Export endpoints (CSV, PDF)

---

**API Version**: 1.0 (PocketBase 0.21.5)
**Last Updated**: December 2024
**Support**: Contact developer for API questions
