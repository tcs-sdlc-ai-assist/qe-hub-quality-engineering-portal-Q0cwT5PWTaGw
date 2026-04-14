# QE Hub

**Quality Engineering Hub** — A centralized dashboard for quality engineering teams to track release readiness, defect metrics, daily status reports, and quality analytics.

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI framework |
| Vite | 5.4.5 | Build tool & dev server |
| Tailwind CSS | 3.4.13 | Utility-first styling |
| React Router DOM | 6.26.2 | Client-side routing |
| Recharts | 2.12.7 | Data visualization |
| Lucide React | 0.441.0 | Icon library |
| PropTypes | 15.8.1 | Runtime prop validation |
| PapaParse | 5.4.1 | CSV parsing |
| XLSX | 0.18.5 | Excel file processing |

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd qe-hub

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Development

```bash
# Start the development server
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

### Build

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## Environment Variables

All environment variables use the `VITE_` prefix for client-side access via `import.meta.env`.

| Variable | Default | Description |
|---|---|---|
| `VITE_DEFAULT_ROLE` | `engineer` | Default user role (`engineer`, `lead`, `manager`) |
| `VITE_JIRA_BASE_URL` | `https://jira.example.com` | Jira instance URL |
| `VITE_ELASTIC_BASE_URL` | `https://elastic.example.com` | Elastic/Kibana URL |
| `VITE_CONFLUENCE_BASE_URL` | `https://confluence.example.com` | Confluence URL |
| `VITE_API_BASE_URL` | `/api` | API base URL |

See `.env.example` for the complete list.

## Project Structure

```
qe-hub/
├── index.html                          # HTML entry point
├── package.json                        # Dependencies and scripts
├── vite.config.js                      # Vite configuration
├── tailwind.config.js                  # Tailwind CSS theme
├── postcss.config.js                   # PostCSS plugins
├── vercel.json                         # Vercel deployment config
├── .env.example                        # Environment variable template
├── src/
│   ├── main.jsx                        # React entry point
│   ├── App.jsx                         # Router and app shell
│   ├── index.css                       # Tailwind directives
│   ├── constants/
│   │   ├── constants.js                # App constants, nav items, roles
│   │   └── mockData.js                 # Mock data with localStorage persistence
│   ├── pages/
│   │   ├── WelcomePage.jsx             # Landing/dashboard page
│   │   ├── LoginPage.jsx               # Login page
│   │   ├── AdminPage.jsx               # Admin configuration
│   │   ├── ReleaseReadinessPage.jsx    # Release readiness dashboard
│   │   ├── ShowstopperDefectsPage.jsx  # Showstopper defects
│   │   ├── DeferredDefectsPage.jsx     # Deferred defects
│   │   ├── SITDefectSummaryPage.jsx    # SIT defect summary
│   │   ├── DomainDSRPage.jsx           # Domain daily status report
│   │   ├── ProgramDSRPage.jsx          # Program daily status report
│   │   ├── ProgramStatusPage.jsx       # Program status overview
│   │   ├── QualityMetricsPage.jsx      # Quality metrics analytics
│   │   ├── EmbeddedDashboardsPage.jsx  # Embedded external dashboards
│   │   ├── ConfluenceLinksPage.jsx     # Quick links / Confluence
│   │   └── NotFoundPage.jsx            # 404 page
│   ├── components/
│   │   ├── common/                     # Reusable UI components
│   │   │   ├── ChartCard.jsx           # Chart wrapper (bar, line, pie, stacked)
│   │   │   ├── DataTable.jsx           # Sortable, paginated, editable table
│   │   │   ├── EditableCell.jsx        # Inline edit cell
│   │   │   ├── ErrorBoundary.jsx       # Error boundary with retry
│   │   │   ├── FilterBar.jsx           # Filter bar with dynamic config
│   │   │   ├── FilterDropdown.jsx      # Dropdown with single/multi select
│   │   │   ├── LoadingSpinner.jsx      # Loading indicator
│   │   │   ├── MetricCard.jsx          # KPI metric card with trends
│   │   │   ├── Modal.jsx              # Accessible modal dialog
│   │   │   ├── ProtectedRoute.jsx      # Role-based route protection
│   │   │   └── RAGStatusBadge.jsx      # RAG status indicator
│   │   ├── layout/                     # Layout components
│   │   │   ├── Header.jsx             # Top navigation bar
│   │   │   ├── Layout.jsx             # App shell (sidebar + header + content)
│   │   │   └── Sidebar.jsx            # Collapsible sidebar navigation
│   │   ├── dashboards/                 # Dashboard-specific components
│   │   │   ├── ReleaseReadinessTable.jsx
│   │   │   ├── ShowstopperDefectsTable.jsx
│   │   │   ├── DeferredDefectsTable.jsx
│   │   │   ├── SITDefectSummary.jsx
│   │   │   ├── DomainDSR.jsx
│   │   │   ├── ProgramDSR.jsx
│   │   │   ├── ProgramStatus.jsx
│   │   │   └── QualityMetricsOverview.jsx
│   │   ├── analytics/                  # Analytics chart components
│   │   │   ├── DefectTrendCharts.jsx
│   │   │   ├── EnvironmentDistribution.jsx
│   │   │   ├── MonthlyTrends.jsx
│   │   │   ├── RCACharts.jsx
│   │   │   └── SeverityDistribution.jsx
│   │   ├── embedding/                  # External dashboard embedding
│   │   │   └── EmbeddingDashboard.jsx
│   │   ├── embedding/                  # Quick links
│   │   │   └── QuickLinksPanel.jsx
│   │   └── admin/                      # Admin components
│   │       ├── AdminConfigPanel.jsx
│   │       ├── AuditLogViewer.jsx
│   │       └── InterimUploadDialog.jsx
│   ├── services/                       # Business logic services
│   │   ├── AccessControlService.js
│   │   ├── AuditLogManager.js
│   │   ├── DashboardService.js
│   │   ├── EditableFieldConfigManager.js
│   │   ├── EditableFieldManager.js
│   │   ├── UploadProcessor.js
│   │   ├── embeddingService.js
│   │   ├── quickLinksService.js
│   │   └── uploadService.js
│   └── utils/                          # Utility functions
│       ├── chartUtils.js
│       ├── filterUtils.js
│       ├── formatUtils.js
│       └── storageUtils.js
```

## Features

### Dashboards

- **Release Readiness** — Track release readiness across domains with confidence scoring and RAG status
- **Showstopper Defects** — Monitor critical defects blocking releases with aging indicators
- **Deferred Defects** — Manage deferred defects with priority tracking
- **SIT Defect Summary** — Analyze SIT defects with severity distribution charts
- **Domain DSR** — Daily status reports with Domain → WR → Application drill-down
- **Program DSR** — Program-level daily status with hierarchical drill-down
- **Program Status** — Program overview with RAG distribution and multi-level navigation

### Analytics

- **Quality Metrics** — KPI summaries with month-over-month trend indicators
- **Monthly Trends** — Test execution and defect rate trend lines
- **Defect Trends** — Defect creation/resolution trends with severity breakdown
- **Severity Distribution** — Pie and bar charts for defect severity analysis
- **Environment Distribution** — Stacked bar charts showing defects by environment
- **RCA Charts** — Root cause analysis with phase-based filtering (SIT/UAT/Prod)

### Integration

- **Embedded Dashboards** — Sandboxed iframe embedding for Jira, Elastic, and Confluence
- **Quick Links** — Categorized link management for team resources

### Administration

- **Admin Panel** — Field configuration, quick links management, audit log viewer
- **Interim Upload** — Drag-and-drop CSV/Excel upload for data refresh
- **Audit Logging** — Track all data changes with user, timestamp, and diff

## Roles

| Role | Access Level | Capabilities |
|---|---|---|
| `engineer` | View Only | View all dashboards and analytics |
| `lead` | Edit | View + edit inline fields in DSR and tables |
| `manager` | Admin | View + edit + admin panel, upload, configuration |

## Data Persistence

The application uses `localStorage` for mock data persistence during development. Data is seeded automatically on first load via `seedMockData()` in `main.jsx`.

- Storage key: `qe-hub-data`
- Namespace prefix: `qe_hub_`
- Initialization sentinel: `__qe_hub_initialized__`

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

## License

Proprietary — Internal use only.