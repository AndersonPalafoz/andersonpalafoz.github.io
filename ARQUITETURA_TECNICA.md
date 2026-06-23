# Arquitetura Técnica - Anderson Palafoz Platform

Documentação técnica para desenvolvedores e administradores.

---

## 🏗️ Stack Tecnológico

### Frontend
- **Vite 7**: Build tool e dev server
- **React 19**: UI framework
- **TypeScript 5.9**: Type safety
- **Tailwind CSS 4**: Styling com OKLCH colors
- **shadcn/ui**: Component library
- **Wouter 3**: Lightweight router
- **tRPC Client 11**: Type-safe RPC client
- **React Query 5**: Data fetching e caching

### Backend
- **Express 4**: HTTP server
- **tRPC 11**: Type-safe RPC framework
- **Drizzle ORM 0.44**: Database ORM
- **MySQL2 3.15**: Database driver

### Database
- **Supabase**: PostgreSQL managed service
- **Drizzle Kit**: Schema management e migrations

### Authentication
- **OAuth 2.0**: Google OAuth via Manus
- **Jose 6.1**: JWT signing/verification
- **Cookie-based sessions**: Secure session management

### Deployment
- **Vercel**: Serverless hosting (Autoscale)
- **GitHub**: Source control
- **Node.js**: Runtime

---

## 📁 Estrutura de Diretórios

```
andersonpalafoz.github.io/
├── client/                          # Frontend (Vite + React)
│   ├── src/
│   │   ├── pages/                   # Page components
│   │   │   ├── Home.tsx             # Public home
│   │   │   ├── About.tsx            # About page
│   │   │   ├── Courses.tsx          # Public courses list
│   │   │   ├── Materials.tsx        # Public materials library
│   │   │   ├── Blog.tsx             # Public blog
│   │   │   ├── Contact.tsx          # Contact form
│   │   │   ├── DashboardCourses.tsx # Private: enrolled courses
│   │   │   ├── DashboardActivities.tsx
│   │   │   ├── DashboardLibrary.tsx
│   │   │   ├── DashboardCalendar.tsx
│   │   │   ├── DashboardCertificates.tsx
│   │   │   ├── DashboardProfile.tsx
│   │   │   └── NotFound.tsx
│   │   ├── components/
│   │   │   ├── Navbar.tsx           # Sticky navbar (72px)
│   │   │   ├── Footer.tsx           # Footer with Colossenses 3:23
│   │   │   ├── StudentDashboardLayout.tsx  # Dashboard sidebar (280px)
│   │   │   ├── SkeletonLoader.tsx   # Loading skeleton
│   │   │   ├── AIChatBox.tsx        # Pre-built chat component
│   │   │   ├── DashboardLayout.tsx  # Pre-built dashboard layout
│   │   │   ├── Map.tsx              # Pre-built map component
│   │   │   └── ui/                  # shadcn/ui components
│   │   ├── hooks/
│   │   │   ├── useAuth.ts           # Auth state hook
│   │   │   ├── useProtectedRoute.ts # Route protection hook
│   │   │   └── ...
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx     # Dark mode context
│   │   ├── lib/
│   │   │   ├── trpc.ts              # tRPC client setup
│   │   │   └── utils.ts             # Utility functions
│   │   ├── constants.ts             # Global constants
│   │   ├── index.css                # Global styles + design tokens
│   │   ├── App.tsx                  # Main router
│   │   └── main.tsx                 # Entry point
│   ├── public/
│   │   ├── favicon.ico              # Favicon
│   │   ├── robots.txt               # SEO
│   │   └── __manus__/               # Manus runtime
│   └── index.html                   # HTML template
│
├── server/                          # Backend (Express + tRPC)
│   ├── routers.ts                   # tRPC router definition
│   ├── db.ts                        # Database query helpers
│   ├── storage.ts                   # S3 storage helpers
│   ├── _core/
│   │   ├── index.ts                 # Express app setup
│   │   ├── context.ts               # tRPC context (auth, user)
│   │   ├── trpc.ts                  # tRPC instance
│   │   ├── oauth.ts                 # OAuth handler
│   │   ├── cookies.ts               # Cookie management
│   │   ├── env.ts                   # Environment variables
│   │   ├── llm.ts                   # LLM integration
│   │   ├── imageGeneration.ts       # Image generation
│   │   ├── voiceTranscription.ts    # Voice-to-text
│   │   ├── notification.ts          # Push notifications
│   │   ├── dataApi.ts               # External data API
│   │   ├── storageProxy.ts          # S3 proxy
│   │   ├── vite.ts                  # Vite dev server
│   │   └── systemRouter.ts          # System routes
│   └── auth.logout.test.ts          # Example test
│
├── drizzle/                         # Database schema
│   ├── schema.ts                    # Table definitions
│   ├── relations.ts                 # Table relationships
│   ├── migrations/                  # SQL migrations
│   │   ├── 0000_initial.sql
│   │   ├── 0001_lame_major_mapleleaf.sql
│   │   └── ...
│   └── meta/
│
├── shared/                          # Shared code
│   ├── types.ts                     # Shared TypeScript types
│   ├── const.ts                     # Shared constants
│   └── _core/
│       └── errors.ts                # Error definitions
│
├── references/                      # Integration guides
│   ├── llm-integration.md           # AI/LLM usage
│   ├── file-storage.md              # S3 file storage
│   ├── voice-transcription.md       # Whisper API
│   ├── image-generation.md          # Image generation
│   ├── maps-integration.md          # Google Maps
│   ├── data-api.md                  # External data
│   ├── owner-notifications.md       # Push notifications
│   ├── manus-oauth.md               # OAuth flow
│   └── periodic-updates.md          # Scheduled tasks
│
├── drizzle.config.ts                # Drizzle configuration
├── vite.config.ts                   # Vite configuration
├── vitest.config.ts                 # Vitest configuration
├── tsconfig.json                    # TypeScript config
├── package.json                     # Dependencies
├── pnpm-lock.yaml                   # Lock file
└── README.md                        # Project readme
```

---

## 🗄️ Database Schema

### Tables

#### `users`
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  lastSignedIn TIMESTAMP DEFAULT NOW()
);
```

#### `courses`
```sql
CREATE TABLE courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  level ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2'),
  modules INT,
  instructor VARCHAR(255) DEFAULT 'Anderson Palafoz',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);
```

#### `enrollments`
```sql
CREATE TABLE enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  courseId INT NOT NULL,
  progress INT DEFAULT 0,
  currentModule INT,
  status ENUM('active', 'completed', 'paused') DEFAULT 'active',
  enrolledAt TIMESTAMP DEFAULT NOW(),
  completedAt TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (courseId) REFERENCES courses(id)
);
```

#### `materials`
```sql
CREATE TABLE materials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category ENUM('Worksheets', 'Slides', 'Áudios', 'Exercícios', 'Artigos'),
  level ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2'),
  fileUrl TEXT,
  downloads INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);
```

#### `articles`
```sql
CREATE TABLE articles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  content LONGTEXT,
  category VARCHAR(100),
  readingTime INT,
  published BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);
```

#### `certificates`
```sql
CREATE TABLE certificates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  courseId INT NOT NULL,
  issuedAt TIMESTAMP DEFAULT NOW(),
  expiresAt TIMESTAMP,
  certificateUrl TEXT,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (courseId) REFERENCES courses(id)
);
```

#### `activities`
```sql
CREATE TABLE activities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  courseId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  dueDate TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (courseId) REFERENCES courses(id)
);
```

#### `userActivityProgress`
```sql
CREATE TABLE userActivityProgress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  activityId INT NOT NULL,
  status ENUM('pending', 'completed', 'submitted') DEFAULT 'pending',
  submittedAt TIMESTAMP,
  grade INT,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (activityId) REFERENCES activities(id)
);
```

---

## 🔌 tRPC Procedures

### Authentication
```typescript
auth.me              // GET: Current user
auth.logout          // POST: Logout
```

### Courses
```typescript
courses.list         // GET: All courses (public)
courses.enrollments  // GET: User's enrolled courses (protected)
courses.enroll       // POST: Enroll in course (protected)
```

### Materials
```typescript
materials.list       // GET: All materials with filters (public)
```

### Articles
```typescript
articles.list        // GET: All published articles (public)
articles.bySlug      // GET: Article by slug (public)
```

### System
```typescript
system.health        // GET: Health check
```

---

## 🔐 Authentication Flow

1. **User clicks "Entrar"** → Redirected to OAuth portal
2. **Google OAuth** → User authenticates with Google
3. **Callback** → `/api/oauth/callback` receives code
4. **Token Exchange** → Code exchanged for user info
5. **Session Created** → Secure cookie set
6. **Redirect** → User sent to dashboard
7. **Protected Routes** → `useProtectedRoute()` checks session
8. **Auto-logout** → Session expires or user clicks logout

---

## 🚀 Development Workflow

### Local Setup
```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Type check
pnpm check

# Run tests
pnpm test

# Build for production
pnpm build

# Start production server
pnpm start
```

### Database Migrations
```bash
# Generate migration from schema changes
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit migrate

# Or use webdev_execute_sql to apply manually
```

### Environment Variables
```
DATABASE_URL              # Supabase PostgreSQL connection
JWT_SECRET                # Session signing secret
VITE_APP_ID               # OAuth app ID
OAUTH_SERVER_URL          # OAuth backend URL
VITE_OAUTH_PORTAL_URL     # OAuth portal URL
OWNER_OPEN_ID             # Owner's OAuth ID
OWNER_NAME                # Owner's name
BUILT_IN_FORGE_API_URL    # Manus API endpoint
BUILT_IN_FORGE_API_KEY    # Manus API key
VITE_FRONTEND_FORGE_API_KEY  # Frontend API key
VITE_ANALYTICS_ENDPOINT   # Analytics endpoint
VITE_ANALYTICS_WEBSITE_ID # Analytics ID
```

---

## 📊 Performance Considerations

- **Skeleton Loaders**: Used instead of spinners for better UX
- **Query Caching**: React Query caches tRPC responses
- **Lazy Loading**: Images and components load on demand
- **CSS-in-JS**: Tailwind generates only used styles
- **Code Splitting**: Vite automatically splits chunks

---

## 🔧 Maintenance Tasks

### Regular
- Monitor error logs in `.manus-logs/`
- Check database performance
- Review user feedback

### Monthly
- Update dependencies: `pnpm update`
- Run security audit: `pnpm audit`
- Backup database

### Quarterly
- Review and optimize database queries
- Analyze user behavior and metrics
- Plan feature updates

---

## 🐛 Debugging

### Dev Server Logs
```bash
tail -f .manus-logs/devserver.log
tail -f .manus-logs/browserConsole.log
tail -f .manus-logs/networkRequests.log
```

### Common Issues

**Build fails with TypeScript errors**
```bash
pnpm check
# Fix errors, then rebuild
```

**Database connection fails**
- Check `DATABASE_URL` environment variable
- Verify Supabase credentials
- Check network connectivity

**OAuth not working**
- Verify `VITE_APP_ID` and `OAUTH_SERVER_URL`
- Check redirect URL configuration
- Clear browser cookies

---

## 📚 References

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com)

---

*Last updated: June 2026*
