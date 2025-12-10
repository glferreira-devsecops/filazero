# CONTRIBUTING.md

# Contributing to FilaZero Saúde

Thank you for your interest in contributing to FilaZero Saúde! This document provides guidelines for developers who want to work on this project after acquisition.

---

## Code of Conduct

- Be respectful and professional
- Focus on constructive feedback
- Help maintain code quality

---

## Development Workflow

### Prerequisites

- Node.js 18+
- npm 9+
- Git
- Code editor (VS Code recommended)

### Setup

```bash
# Clone repository
git clone https://github.com/your-org/filazero-saude.git
cd filazero-saude

# Install frontend dependencies
cd frontend
npm install

# Setup backend
cd ../backend
# Download PocketBase for your platform
# See DEPLOYMENT_GUIDE.md for instructions
```

### Running Locally

```bash
# Terminal 1: Backend
cd backend
./pocketbase serve

# Terminal 2: Frontend
cd frontend
npm run dev
```

Access:

- Frontend: <http://localhost:5173>
- Backend API: <http://localhost:8090/api>
- Admin UI: <http://localhost:8090/_/>

---

## Code Style Guidelines

### JavaScript/React

**Formatting**:

- 2 spaces for indentation
- Single quotes for strings
- Semicolons optional (consistent with existing code)
- Max line length: 100 characters

**Naming Conventions**:

- Components: PascalCase (`TicketStatus.jsx`)
- Functions: camelCase (`createTicket()`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- CSS classes: kebab-case (`btn-primary`)

**React Best Practices**:

```javascript
// ✅ Good: Functional components with hooks
function TicketCard({ ticket }) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Cleanup subscriptions
    return () => unsubscribe();
  }, []);

  return <div className="card">...</div>;
}

// ❌ Avoid: Class components
class TicketCard extends React.Component { ... }
```

### CSS

**Organization**:

1. Design tokens (`:root` variables)
2. Global resets
3. Components (`.card`, `.btn`)
4. Utilities (`.flex-center`, `.text-muted`)
5. Animations (`@keyframes`)

**Naming**:

- Use semantic class names (`.btn-primary`, not `.btn-green`)
- BEM methodology for complex components (`.ticket-card__header`)

---

## Component Structure

### File Organization

```
src/
├── components/        # Reusable components
│   ├── ErrorBoundary.jsx
│   └── RequireAuth.jsx
├── context/          # Global state
│   ├── AuthContext.jsx
│   └── ToastContext.jsx
├── pages/            # Route components
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── TicketStatus.jsx
│   ├── Reception.jsx
│   ├── RoomPanel.jsx
│   └── Dashboard.jsx
├── services/         # API clients
│   ├── pocketbase.js
│   └── ticketService.js
├── index.css         # Design system
├── App.jsx           # Root component
└── main.jsx          # Entry point
```

### Component Template

```javascript
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function MyComponent({ prop1, prop2 }) {
  // 1. Hooks
  const { currentUser } = useAuth();
  const [state, setState] = useState(null);

  // 2. Effects
  useEffect(() => {
    // Setup
    return () => {
      // Cleanup
    };
  }, [dependencies]);

  // 3. Event handlers
  const handleClick = () => {
    setState(newValue);
  };

  // 4. Render
  return (
    <div className="my-component">
      <h2>{prop1}</h2>
      <button onClick={handleClick}>
        {prop2}
      </button>
    </div>
  );
}
```

---

## Testing

### Manual Testing Checklist

Before committing:

- [ ] Test in Chrome, Safari, Firefox
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Test authentication flow (login, logout)
- [ ] Test real-time sync (open 2+ browser windows)
- [ ] Test offline mode (disconnect network)

### Future: Automated Tests

```bash
# Unit tests (when implemented)
npm test

# E2E tests (when implemented)
npm run test:e2e
```

---

## Git Workflow

### Branching

- `main`: Production-ready code
- `develop`: Integration branch
- `feature/feature-name`: New features
- `fix/bug-description`: Bug fixes

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add WhatsApp notification integration
fix: resolve real-time sync issue on slow networks
docs: update API documentation for new endpoint
refactor: extract queue logic into reusable service
style: fix button padding inconsistency
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes, commit with clear messages
3. Test thoroughly (manual checklist)
4. Push branch and open PR
5. Request review from team
6. Address feedback, merge to `develop`
7. Periodically merge `develop` → `main` for releases

---

## Architecture Decisions

### Why React Context (not Redux)?

- **Simplicity**: Only 2 contexts needed (Auth, Toast)
- **Performance**: No excessive re-renders for this app scale
- **Bundle Size**: Avoid 15KB+ Redux overhead

**When to add Redux**: If state grows to 5+ contexts with complex interactions.

### Why PocketBase (not Firebase/Supabase)?

- **Single Binary**: No multi-service complexity
- **Cost**: Free self-hosted vs. $25-100/month cloud
- **Real-Time**: Native WebSockets (no extra subscription)
- **Portability**: SQLite file = easy backups/migrations

**When to migrate**: If database size > 100MB or need advanced features.

### Why No TypeScript?

- **Speed**: Faster prototyping for MVP
- **Simplicity**: Lower barrier for contributors
- **Trade-off**: Accept runtime type errors for development velocity

**When to add TypeScript**: If team grows to 3+ developers or codebase > 10K lines.

---

## Common Tasks

### Add a New Page

1. Create component in `src/pages/NewPage.jsx`
2. Add route in `src/App.jsx`:

   ```javascript
   <Route path="/new-page" element={<NewPage />} />
   ```

3. Update navigation/links

### Add a New API Endpoint

1. PocketBase auto-generates CRUD for collections
2. For custom logic, add hook in `backend/pb_hooks/`
3. Document in `API_DOCUMENTATION.md`

### Update Design System

1. Edit `src/index.css`
2. Update CSS variables in `:root` for colors/spacing
3. Test across all pages

---

## Deployment

### Before Deploying

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md`
- [ ] Test in production-like environment
- [ ] Verify all environment variables
- [ ] Database backup

### Deploy to VPS

```bash
# Build frontend
cd frontend
npm run build

# Upload to server
scp -r dist user@server:/opt/filazero/frontend/

# Restart backend (if needed)
ssh user@server 'sudo systemctl restart pocketbase'
```

See **DEPLOYMENT_GUIDE.md** for full instructions.

---

## Troubleshooting

### Frontend won't start

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+
```

### Backend won't connect

```bash
# Check PocketBase is running
ps aux | grep pocketbase

# Check port
lsof -i :8090

# View logs
./pocketbase serve --dev
```

### Real-time not working

- Verify WebSocket proxy in Nginx config
- Check browser console for connection errors
- Test with `pb.collection('tickets').subscribe('*', console.log)`

---

## Support & Questions

- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues (or internal tracker)
- **Contact**: Project maintainer via email/Slack

---

## License

By contributing, you agree that your contributions will be licensed under the same proprietary license as the project.

---

**Happy Coding! 🚀**
