# Changelog

All notable changes to the QE Hub project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-15

### Added

#### Role-Based Access Control
- Three-tier role hierarchy: Engineer (view-only), Lead (edit), Manager (admin)
- Protected routes with role-based gating and redirect to login
- Role switcher in header for development and testing
- Environment variable `VITE_DEFAULT_ROLE` for default role configuration

#### Release Readiness Dashboard
- Comprehensive release readiness tracking table with RAG status indicators
- Confidence index scoring with color-coded thresholds (green ≥ 8, amber ≥ 5, red < 5)
- Test execution pass rate visualization
- Inline editing for authorized roles (lead, manager)
- Filterable by domain, release, and status

#### Showstopper Defects Tracking
- Dedicated showstopper defect table with severity and priority badges
- Aging calculation (days since creation) with color-coded indicators
- Domain and severity filtering
- Summary statistics cards for quick KPI visibility
- CSV export functionality

#### Deferred Defects Tracking
- Deferred defect management table with full defect lifecycle tracking
- Priority-based color coding (P1=danger, P2=warning, P3=brand, P4=surface)
- Filterable by domain, severity, and priority
- Inline editing for authorized roles

#### SIT Defect Summary
- SIT defect summary with tabbed charts and table views
- Domain × Severity stacked bar charts
- Per-release defect breakdown with individual chart cards
- Severity distribution visualization
- Detail table with sortable columns and pagination

#### Domain DSR (Daily Status Report)
- Hierarchical drill-down: Domain → Work Request → Application
- Expandable rows with chevron indicators
- Inline editable fields: RAG status, SIT sign-off date, BRD/DOU date, TRD date, code drop date, TDM request number, dependencies, risks, comments, performance testing, DAST testing, and sign-off dates
- Role-gated editing via EditableFieldConfigManager

#### Program DSR (Daily Status Report)
- Program-level drill-down: Program → Work Request → Application
- Confidence index and RAG status tracking
- Inline editable fields with optimistic local state updates
- CSV export for program-level reporting

#### Program Status Dashboard
- Multi-level drill-down with breadcrumb navigation (Program → WR → Application)
- RAG distribution pie charts
- Inline fallback data for development when mock data is empty
- Filterable by program and status

#### Quality Metrics & Analytics
- Quality metrics overview with MetricCard KPI summaries
- Trend indicators comparing current vs. previous month
- Monthly trend charts for test execution and defect rates
- Defect trend analysis with severity breakdown
- Severity distribution charts (pie and bar)
- Environment distribution stacked bar charts
- RCA (Root Cause Analysis) charts with phase-based filtering (SIT/UAT/Prod)

#### Embedded Dashboards
- Sandboxed iframe embedding for Jira, Elastic, and Confluence dashboards
- 30-second load timeout with retry mechanism
- Configurable sandbox policies per embed source
- External link buttons for opening dashboards in new tabs

#### Confluence Links / Quick Links
- Quick links panel with categorized links (confluence, tools, process, reference, other)
- CRUD operations for manager role
- Category filtering with icon mapping
- HTTPS-only URL validation
- Inline delete confirmation pattern

#### Excel/CSV Upload
- Drag-and-drop file upload with visual feedback
- File type validation (CSV, XLSX, XLS)
- File size validation with configurable maximum
- Upload state machine: idle → validating → parsing → processing → success/error
- Support for multiple data types: release readiness, defect data, test execution, program status, SIT defects

#### Admin Configuration
- Tab-based admin panel with field configuration, quick links management, and audit log sections
- Editable field configuration management
- Admin-only access enforcement via AccessControlService

#### Audit Logging
- Comprehensive audit log viewer with DataTable integration
- Action type badges (edit, create, delete, upload, config)
- Old/new value diff display with color-coded backgrounds
- CSV export with native Blob fallback
- Timestamp-descending default sort
- Filterable by action type, user, and date range

#### Core UI Components
- DataTable with sorting, pagination, expandable rows, and inline editing
- FilterBar with dynamic filter configuration
- FilterDropdown with single and multi-select modes
- ChartCard supporting bar, line, pie, and stacked bar chart types
- MetricCard with trend indicators and icon support
- Modal with focus trapping, keyboard navigation, and size variants
- RAGStatusBadge with tooltip and size variants
- ErrorBoundary with retry and custom fallback support
- LoadingSpinner with size variants

#### Layout & Navigation
- Responsive sidebar with collapsible sections and role-gated visibility
- Sticky header with role badge and mobile menu toggle
- Layout shell with ErrorBoundary-wrapped content area
- Mobile sidebar overlay with backdrop blur
- Auto-close sidebar on route change

#### Infrastructure
- Vite 5 build configuration with React plugin and API proxy
- Tailwind CSS with custom brand, accent, and surface color tokens
- Custom shadows (shadow-soft, shadow-card, shadow-card-hover)
- Custom animations (animate-fade-in, animate-slide-up, animate-slide-down)
- Inter and JetBrains Mono font integration
- localStorage-based mock data persistence with seed function
- Vercel deployment configuration with SPA rewrites