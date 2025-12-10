# FilaZero Saúde - Backend (PocketBase)

## Quick Start

### 1. Download PocketBase
```bash
# macOS (Apple Silicon)
curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.22.27/pocketbase_0.22.27_darwin_arm64.zip -o pocketbase.zip
unzip pocketbase.zip
rm pocketbase.zip
chmod +x pocketbase
```

### 2. Start PocketBase
```bash
./pocketbase serve
```

The admin UI will be available at: http://127.0.0.1:8090/_/

### 3. Create Collections (First Run)

On first run, go to http://127.0.0.1:8090/_/ and create admin account.

Then create the following collections:

#### Collection: `tickets`
| Field | Type | Options |
|-------|------|---------|
| number | Number | Required |
| status | Select | Options: waiting, called, in_service, done, cancelled |
| clinicId | Text | Required |
| patientName | Text | - |
| channel | Text | Default: web |
| calledAt | Date | - |
| startedAt | Date | - |
| finishedAt | Date | - |

**API Rules for `tickets`:**
- List/View: Allow all (no auth required for MVP)
- Create: Allow all
- Update: Allow all
- Delete: Admin only

## API Endpoints

PocketBase automatically creates REST API:

- `GET /api/collections/tickets/records` - List tickets
- `POST /api/collections/tickets/records` - Create ticket
- `PATCH /api/collections/tickets/records/:id` - Update ticket
- `GET /api/collections/tickets/records/:id` - Get single ticket

## Real-time Subscriptions

PocketBase supports real-time via SSE at:
`/api/realtime`

The frontend SDK handles this automatically.
