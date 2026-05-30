# Invoice AI Manager

AI-powered invoice management system built with **Spring Boot** + **React**.  
Uses **Tesseract OCR** for text extraction and **Claude AI** for field parsing, status summaries, and anomaly detection.

---

## Project Structure

```
invoice-ai-manager/
├── backend/                          # Spring Boot 3 (Java 21)
│   ├── src/main/java/com/invoiceai/
│   │   ├── config/                   # CORS, OpenAPI
│   │   ├── controller/               # InvoiceController, ExportController, HealthController
│   │   ├── dto/
│   │   │   ├── request/              # InvoiceStatusUpdateRequest, InvoiceSearchRequest
│   │   │   └── response/             # InvoiceResponse, PagedResponse, AiExtractionResult
│   │   ├── exception/                # GlobalExceptionHandler, ResourceNotFoundException
│   │   ├── model/                    # Invoice (JPA entity)
│   │   ├── repository/               # InvoiceRepository (JPA + custom JPQL)
│   │   ├── service/                  # Interfaces: InvoiceService, OcrService, AiService, ExportService, StorageService
│   │   │   └── impl/                 # OcrServiceImpl, AiServiceImpl, InvoiceServiceImpl, ExportServiceImpl, StorageServiceImpl
│   │   └── util/                     # InvoiceUtils (date parsing, status derivation)
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/V1__create_invoices.sql
│
├── frontend/                         # React 18 + Vite
│   └── src/
│       ├── components/
│       │   ├── layout/               # Sidebar
│       │   ├── modals/               # InvoiceModal, AiChatPanel, NotificationPanel
│       │   └── ui/                   # StatCard, StatusBadge, CategoryBadge, Spinner, Toggle, Skeleton
│       ├── constants/                # Statuses, categories, colors, icons, nav items
│       ├── dto/                      # InvoiceDTO factory + API mapper
│       ├── hooks/                    # useInvoiceUpload, useInvoiceFilter, useAiChat
│       ├── pages/                    # DashboardPage, InvoiceListPage, UploadPage,
│       │                             # PaymentTrackerPage, RecurringPage, AnalyticsPage,
│       │                             # ExportPage, SettingsPage
│       ├── services/                 # claudeService, invoiceApiService, invoiceProcessingService
│       ├── store/                    # invoiceStore (useReducer + Context), seedData
│       ├── styles/                   # global.css
│       └── utils/                    # formatters, invoiceHelpers, exportHelpers, ocrSimulator
│
├── docker-compose.yml
└── README.md
```

---

## Quick Start

### Option A — Docker Compose (recommended)

```bash
# 1. Clone and set your Claude API key
export CLAUDE_API_KEY=sk-ant-...

# 2. Start everything
docker-compose up --build

# App runs at:
#   Frontend → http://localhost:5173
#   Backend  → http://localhost:8080
#   API docs → http://localhost:8080/swagger-ui.html
```

### Option B — Local Development

**Backend prerequisites**
- Java 21, Maven 3.9+
- PostgreSQL 16 running locally
- Tesseract OCR installed (`brew install tesseract` / `apt install tesseract-ocr`)

```bash
cd backend

# Set environment variables
export DB_USER=postgres
export DB_PASS=postgres
export DB_NAME=invoicedb
export CLAUDE_API_KEY=sk-ant-...
export TESSDATA_PREFIX=/usr/share/tessdata   # or /opt/homebrew/share/tessdata on macOS

./mvnw spring-boot:run
# Backend: http://localhost:8080
```

**Frontend prerequisites**
- Node.js 20+

```bash
cd frontend
npm install
npm run dev
# Frontend: http://localhost:5173
```

---

## AI Pipeline

Every uploaded invoice flows through:

```
File Upload
    │
    ▼
OcrService (Tesseract)          ← extracts raw text from PDF/image
    │
    ▼
AiService.extractFields()       ← Claude parses vendor, amount, dates, category
    │
    ▼
InvoiceUtils.deriveStatus()     ← OVERDUE / PENDING based on due date
    │
    ▼
AiService.generateSummary()     ← "This invoice is overdue by 12 days."
    │
    ▼
AiService.detectAnomaly()       ← compares vs vendor history, flags if >150% avg
    │
    ▼
InvoiceRepository.save()        ← persists to PostgreSQL
```

---

## API Reference

| Method | Endpoint                       | Description                    |
|--------|--------------------------------|--------------------------------|
| POST   | `/api/invoices`                | Upload file → OCR → AI → save  |
| GET    | `/api/invoices`                | Search + filter + paginate      |
| GET    | `/api/invoices/{id}`           | Get single invoice              |
| PATCH  | `/api/invoices/{id}/status`    | Update status                   |
| DELETE | `/api/invoices/{id}`           | Delete invoice                  |
| GET    | `/api/export/csv`              | Download CSV                    |
| GET    | `/api/export/pdf`              | Download PDF (iText)            |
| GET    | `/api/health`                  | Health check                    |

---

## Environment Variables

| Variable         | Default              | Description                        |
|------------------|----------------------|------------------------------------|
| `CLAUDE_API_KEY` | —                    | **Required.** Your Anthropic key   |
| `DB_HOST`        | `localhost`          | PostgreSQL host                    |
| `DB_PORT`        | `5432`               | PostgreSQL port                    |
| `DB_NAME`        | `invoicedb`          | Database name                      |
| `DB_USER`        | `postgres`           | Database user                      |
| `DB_PASS`        | `postgres`           | Database password                  |
| `TESSDATA_PREFIX`| `/usr/share/tessdata`| Path to Tesseract language data    |
| `STORAGE_PATH`   | `/tmp/invoice-uploads` | Local file storage path          |
| `CORS_ORIGINS`   | `http://localhost:5173` | Allowed frontend origins         |

---

## Frontend Demo Mode

If no API URL is set in **Settings**, the frontend runs fully standalone:
- OCR is simulated client-side (`ocrSimulator.js`)
- Claude API is called directly from the browser
- All state is in-memory (resets on refresh)

To connect to Spring Boot: open **Settings → Spring Boot Backend** and enter `http://localhost:8080/api`.
