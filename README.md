# Telecheck - Healthcare Management Platform

A comprehensive healthcare management platform built with modern web technologies, featuring AI-powered lab analysis, patient management, telemedicine capabilities, and wearable device integration.

## 🏥 Features

### Core Healthcare Management

- **Patient Records Management**: Complete patient demographic and health record management
- **Lab Report Analysis**: AI-powered analysis of uploaded lab reports with intelligent insights
- **Medication Management**: Comprehensive medication tracking with drug interaction checking
- **Appointment Scheduling**: Advanced appointment management with telemedicine integration
- **Vital Signs Monitoring**: Real-time vital signs tracking and trend analysis

### AI-Powered Features

- **Lab Report Analysis**: Automated extraction and analysis of lab results
- **Drug Interaction Checking**: Advanced medication interaction analysis
- **Predictive Analytics**: Health risk assessment and predictive modeling
- **Clinical Decision Support**: AI-powered clinical recommendations
- **Image Analysis**: Medical image processing and analysis

### Telemedicine & Communication

- **Video Consultations**: Integrated video consultation platform
- **Provider Collaboration**: Multi-provider care coordination
- **Patient Portal**: Secure patient access to health information
- **Messaging System**: Secure provider-patient communication

### Wearable Integration

- **Apple Health Integration**: Sync with Apple Health data
- **Fitbit Integration**: Connect with Fitbit devices
- **CGM Integration**: Continuous glucose monitoring support
- **Aggregated Analytics**: Comprehensive health data analysis

### Security & Compliance

- **HIPAA Compliance**: Built with healthcare privacy standards
- **JWT Authentication**: Secure user authentication and authorization
- **Role-Based Access Control**: Granular permission management
- **Audit Logging**: Comprehensive activity tracking
- **Data Encryption**: End-to-end data protection

## 🛠 Technology Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Router** for navigation
- **React Query** for data fetching

### Backend

- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** for primary database
- **Redis** for caching and sessions
- **JWT** for authentication
- **Multer** for file uploads

### AI & ML

- **TensorFlow.js** for client-side ML
- **OpenAI API** for natural language processing
- **Computer Vision** for image analysis
- **Predictive Analytics** for health insights

### DevOps & Testing

- **Vitest** for testing
- **Docker** for containerization
- **GitHub Actions** for CI/CD
- **Netlify** for deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/telecheck.git
   cd telecheck
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp docs/ENVIRONMENT_SETUP.md .env
   # Edit .env with your configuration
   ```

   > **Security Note:** Patient APIs now require authenticated requests by default. Only set `ENABLE_DEMO_AUTH_BYPASS=true` in `.env` for controlled demo environments, and keep it `false` for staging and production.

4. **Set up databases**

   ```bash
   # Create PostgreSQL databases
   createdb telecheck
   createdb telecheck_test

   # Start Redis
   redis-server
   ```

5. **Bootstrap an administrator account (one-time per environment)**

   ```bash
   export ADMIN_BOOTSTRAP_EMAIL="founder@example.com"
   export ADMIN_BOOTSTRAP_PASSWORD="ChangeMeNow123!"
   export ADMIN_BOOTSTRAP_FIRST_NAME="Telecheck"
   export ADMIN_BOOTSTRAP_LAST_NAME="Admin"
   npm run bootstrap:admin
   unset ADMIN_BOOTSTRAP_EMAIL ADMIN_BOOTSTRAP_PASSWORD ADMIN_BOOTSTRAP_FIRST_NAME ADMIN_BOOTSTRAP_LAST_NAME
   ```

   > The bootstrap script reads credentials from environment variables and exits if the account already exists. Set
   > `ADMIN_BOOTSTRAP_ROTATE=true` when re-issuing credentials. Do **not** commit the secrets to version control and clear the
   > variables once the script finishes.

6. **(Optional) Generate anonymized QA fixtures**

   ```bash
   # Seed ten anonymized patients plus supporting provider data
   npm run seed:test-data

   # Remove previously seeded demo fixtures and create five fresh patients
   TEST_DATA_RESET=true TEST_DATA_PATIENT_COUNT=5 npm run seed:test-data
   ```

   > The fixture generator only touches accounts that use the `@demo.telecheck` domain (configurable via
   > `TEST_DATA_EMAIL_DOMAIN`). Use this script in QA/staging environments to populate realistic-but-anonymized records without
   > polluting production data or migrations.

7. **Start development server**

   ```bash
   npm run dev
   ```

8. **Run tests**
   ```bash
   npm test
   ```

## 🔐 Secrets Management

Telecheck resolves sensitive configuration values through a pluggable secret manager so production environments can fetch
credentials from a vault instead of storing them in plaintext environment files.

1. **Select a provider** – Set `SECRETS_PROVIDER` to a comma-separated priority list (e.g., `file,env` for local testing or
   `aws-sm,file,env` in production). The runtime consults providers in order until a value resolves.
2. **Provide vault references** – Point configuration variables at secret references using the `_SECRET_REF` suffix. For
   example, `DB_PASSWORD_SECRET_REF=secret://database/primary#password` or `DB_PASSWORD_SECRET_REF=aws-sm://telecheck/prod/database#password`
   to pull from AWS Secrets Manager. JSON descriptors such as `{"provider":"file","key":"database.primary.password"}` are also
   supported for structured lookups.
3. **Create a local secrets bundle** – For local development, copy `secrets.local.example.json` to `secrets.local.json` (or the
   file specified by `SECRETS_FILE`) and populate it with structured data that mirrors your vault layout. A minimal example:

   ```json
   {
     "database": {
       "primary": {
         "password": "local-db-password",
         "url": "postgresql://postgres:local-db-password@localhost:5432/telecheck"
       }
     },
     "redis": {
       "password": "redis-secret"
     }
   }
   ```

4. **Reference secrets in configuration** – Replace plaintext values with references:

   ```bash
   # database
   DATABASE_URL_SECRET_REF=secret://database/primary#url
   DB_PASSWORD_SECRET_REF=secret://database/primary#password

   # redis
   REDIS_PASSWORD_SECRET_REF=secret://redis#password

   # optional TLS materials
   DB_SSL_CA_SECRET_REF=secret://database/tls#ca
   DB_SSL_CERT_SECRET_REF=secret://database/tls#cert
   DB_SSL_KEY_SECRET_REF=secret://database/tls#key
   ```

   At runtime the Express config loader resolves each reference via the configured providers, falling back to environment
   variables only when no secret reference is supplied. Missing production secrets trigger descriptive errors so deployments
   fail fast instead of silently using insecure defaults.

5. **Validate managed secrets before deploys** – Run `npm run secrets:check` to load the desired environment file (defaults to `production.env`) and confirm every referenced secret resolves via the configured providers. Provide a secrets bundle path with `--secrets` when testing local JSON files:

   ```bash
   npm run secrets:check -- --env production.env --secrets ./secrets.local.example.json
   ```

6. **Enforce dependency vulnerability gates** – Execute `npm run security:scan` to run the scripted `npm audit` wrapper. The command blocks on any reported high or critical vulnerabilities, prints a severity summary, and is wired into the Readiness CI workflow so pull requests surface dependency issues automatically.

   The script reports any references that fall back to plaintext environment values or cannot be resolved so vault gaps can be closed before promotion.

7. **Enable AWS Secrets Manager (optional/production)** – Configure the following environment variables to allow Telecheck to sign AWS SigV4 requests and cache responses for faster startups:

   ```bash
   SECRETS_PROVIDER=aws-sm,file,env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-iam-access-key
   AWS_SECRET_ACCESS_KEY=your-iam-secret
   # Optional for temporary credentials or local testing
   # AWS_SESSION_TOKEN=temporary-session-token
   # AWS_SECRETS_MANAGER_ENDPOINT=http://localhost:4566        # LocalStack or VPC endpoint URL
   # AWS_SECRETS_MANAGER_CACHE_TTL_MS=60000                    # Cache duration in milliseconds (0 to disable)
   ```

   With these settings in place, references using the `aws-sm://` scheme resolve against AWS Secrets Manager while retaining the existing file/env fallbacks for development workflows.

## 🎯 Feature Flag Management

Telecheck now ships with a lightweight feature-flag service so releases can be toggled per environment without redeploying the stack. Flags load in the following priority order and are injected into every Express request via `req.featureFlags` for downstream handlers and middleware:

1. **Defaults** – Optional baseline flags supplied when the server boots (currently empty unless overridden in tests).
2. **Configuration File** – Point `FEATURE_FLAGS_FILE` at a JSON document on disk (e.g., `/etc/telecheck/feature-flags.json`).
3. **Environment Variable** – Set `FEATURE_FLAGS` to either a JSON object or a comma-separated list of `flag=value` pairs for ad-hoc overrides.

Example configuration for local experiments:

```bash
# Enable the redesigned insights page and disable AI scribe suggestions
FEATURE_FLAGS_FILE=./feature-flags.local.json
FEATURE_FLAGS=insights-redesign=true,ai-scribe=false
```

`FEATURE_FLAGS_FILE` accepts absolute or relative paths and expects JSON booleans/strings/numbers. Non-boolean values are coerced (`"true"`, `"1"`, `"yes"` → `true`). Runtime overrides through `setFeatureFlag` allow targeted experiments inside integration tests without mutating process environment state.

> **Operational Tip:** Store production/staging flag files in the secrets bucket or configuration management system alongside a change-approval workflow so releases can be coordinated with audit trails.

### Admin Feature Flag Console

- **Route:** `/admin/feature-flags` (admin role required)
- **Capabilities:**
  - View the active flag inventory with loaded timestamps.
  - Toggle individual flags or create new overrides without redeploying services.
  - Persist overrides in-memory for the running process while audit logging every change for compliance review.
- **API Endpoints:**
  - `GET /api/feature-flags` – Retrieve the current flag snapshot and metadata.
  - `PATCH /api/feature-flags` – Apply one or more flag overrides (body: `{ "flags": { "flag-name": true } }`).

> Administrators must authenticate first; the console automatically attaches the stored auth token to API requests.

## 📁 Project Structure

```
telecheck/
├── client/                 # Frontend React application
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React contexts
│   └── services/         # API service layer
├── server/               # Backend Node.js application
│   ├── routes/           # API route handlers
│   ├── middleware/       # Express middleware
│   ├── config/           # Configuration files
│   └── utils/            # Utility functions
├── shared/               # Shared types and utilities
├── tests/                # Test files
│   ├── api/             # API integration tests
│   ├── unit/            # Unit tests
│   └── utils/           # Test utilities
├── docs/                 # Documentation
└── public/               # Static assets
```

## 🗂 Compliance & Readiness Documentation

- [Production Readiness Checklist](docs/PRODUCTION_READINESS_CHECKLIST.md)
- [Incident Response Plan](docs/INCIDENT_RESPONSE_PLAN.md)
- [ONC Certification Gap Assessment](docs/ONC_GAP_ASSESSMENT.md)
- [Support Runbooks & Escalation Playbooks](docs/RUNBOOKS_AND_SUPPORT.md)

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### User Management

- `GET /api/users` - List all users (admin)
- `GET /api/users/:id` - Get user by ID (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

### Patient Management

- `GET /api/patients` - List all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create patient record
- `PUT /api/patients/:id` - Update patient record
- `DELETE /api/patients/:id` - Delete patient record

### Lab Management

- `GET /api/labs/reports/:userId?` - Get lab reports
- `POST /api/labs/upload` - Upload lab report
- `GET /api/labs/results/:reportId` - Get lab results
- `POST /api/labs/results` - Add lab results manually

### Medication Management

- `GET /api/medications/:userId?` - Get medications
- `POST /api/medications` - Add medication
- `PUT /api/medications/:id` - Update medication
- `DELETE /api/medications/:id` - Delete medication

### Platform Controls

- `GET /api/feature-flags` - Retrieve current feature flag state (admin)
- `PATCH /api/feature-flags` - Update feature flag overrides (admin)

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:api
npm run test:unit
npm run test:integration
# Run readiness-auth regression suite without external services
npm run test:phase1
```

### Test Structure

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and database interactions
- **API Tests**: Test complete API workflows
- **E2E Tests**: Test complete user workflows
- **Phase 1 Readiness Suite**: Uses the focused auth test harness to validate register/login/refresh/logout flows with refresh-token invalidation rules and negative cases without requiring external databases.

## 🚀 Deployment

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```bash
docker build -t telecheck .
docker run -p 3000:3000 telecheck
```

## 📊 Monitoring & Analytics

- **Health Checks**: `/api/health` endpoint for system status
- **Performance Monitoring**: Built-in performance tracking
- **Error Logging**: Comprehensive error tracking and reporting
- **Audit Trails**: Complete activity logging for compliance

### Structured Logging & Forwarding

- The API now emits structured JSON logs for every request/response cycle and infrastructure event using the built-in logger in `server/utils/logger.ts`.
- Configure log behavior with the `SERVICE_NAME`, `LOG_LEVEL`, and optional `LOG_FORWARD_*` environment variables defined in `local.env` / `production.env`.
- When `LOG_FORWARD_ENDPOINT` is set, logs are asynchronously forwarded via HTTPS (with optional bearer token or API key headers) so they can be ingested by a SIEM or observability platform while still streaming to stdout for containerized environments.
- Every request receives an `x-request-id` header, and downstream code can emit correlated messages via `req.log` exposed by the request logging middleware.

### Metrics & Alerting Hooks

- The Express server exposes a Prometheus-compatible snapshot at `GET /internal/metrics` when `METRICS_ENABLED=true`, capturing request totals, latency summaries, and in-flight gauges per method and normalized route.
- Secure the endpoint by setting `METRICS_TOKEN` (preferred) or enumerating explicit source IPs via `METRICS_ALLOWED_IPS`; otherwise the endpoint only responds to loopback requests, preventing accidental public exposure.
- The metrics middleware runs alongside the structured logger so dashboards and alerting rules can share consistent labels (`service`, `environment`, `route`, `method`).

## 🔒 Security Features

- **Authentication**: JWT-based secure authentication
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: Protection against abuse
- **CORS**: Configurable cross-origin resource sharing
- **HTTPS**: Secure communication in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@telecheck.com or join our Slack channel.

## 🙏 Acknowledgments

- Healthcare professionals who provided domain expertise
- Open source community for amazing tools and libraries
- AI/ML community for advancing healthcare technology
