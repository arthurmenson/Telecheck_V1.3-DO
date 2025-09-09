# API Architecture & Best Practices

## 🏗️ **API Architecture Overview**

This project implements a modern, type-safe API architecture following industry best practices:

```
client/
├── lib/
│   ├── api-client.ts        # Centralized HTTP client
│   └── api-endpoints.ts     # Endpoint configuration
├── services/
│   └── api.service.ts       # Domain-specific API methods
└── hooks/
    └── api/
        ├── useQuery.ts      # React Query integration
        └── index.ts         # Ready-to-use hooks
```

## 🎯 **Best Practices Implemented**

### 1. **Centralized API Client** (`client/lib/api-client.ts`)

- **Type Safety**: Full TypeScript support
- **Error Handling**: Automatic error processing
- **Retry Logic**: Configurable retry with exponential backoff
- **Request/Response Interceptors**: Authentication, logging, etc.
- **Request Cancellation**: Automatic cleanup
- **Timeout Management**: Configurable timeouts

```typescript
import { apiClient } from "../lib/api-client";

// Automatic auth headers, retries, error handling
const response = await apiClient.get<User[]>("/users");
```

### 2. **Endpoint Configuration** (`client/lib/api-endpoints.ts`)

- **Centralized Endpoints**: All URLs in one place
- **Type Safety**: TypeScript endpoint definitions
- **Dynamic Parameters**: Template-based URL building

```typescript
import { API_ENDPOINTS } from "../lib/api-endpoints";

// Instead of hardcoding URLs
const url = API_ENDPOINTS.EHR.PROGRAMS.UPDATE("123");
// Generates: '/ehr/programs/123'
```

### 3. **Domain Services** (`client/services/api.service.ts`)

- **Type-Safe Methods**: Full TypeScript interfaces
- **Domain Organization**: Grouped by business logic
- **Consistent API**: Standardized method signatures

```typescript
import { ProgramService } from "../services/api.service";

// Type-safe with autocomplete
const programs = await ProgramService.getPrograms();
const newProgram = await ProgramService.createProgram({
  title: "Diabetes Management",
  type: "rolling-start",
  // ... fully typed
});
```

### 4. **React Query Integration** (`client/hooks/api/`)

- **Caching**: Intelligent data caching
- **Background Updates**: Automatic data freshness
- **Optimistic Updates**: Immediate UI feedback
- **Error Boundaries**: Graceful error handling
- **Loading States**: Built-in loading management

```typescript
import { usePrograms, useCreateProgram } from '../hooks/api';

function ProgramsList() {
  const { data: programs, isLoading, error } = usePrograms();
  const createProgram = useCreateProgram();

  const handleCreate = async (programData) => {
    try {
      await createProgram.mutateAsync(programData);
      // Automatic cache invalidation and UI updates
    } catch (error) {
      // Error handling
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;

  return <ProgramsGrid programs={programs} />;
}
```

## 📁 **Where to Place API Code**

### **1. API Client Configuration** → `client/lib/api-client.ts`

- HTTP client setup
- Global interceptors
- Authentication logic
- Error handling
- Retry configuration

### **2. Endpoint Definitions** → `client/lib/api-endpoints.ts`

- All API URLs
- URL templates
- Endpoint grouping

### **3. Service Layer** → `client/services/api.service.ts`

- Domain-specific API methods
- Request/response transformation
- Business logic abstraction

### **4. React Hooks** → `client/hooks/api/`

- React Query integration
- Caching strategies
- Optimistic updates
- Loading states

### **5. Type Definitions** → `shared/types.ts`

- API request/response types
- Shared interfaces
- Domain models

## 🚀 **Usage Examples**

### **Simple Data Fetching**

```typescript
import { useLabResults } from '../hooks/api';

function LabResultsComponent() {
  const { data, isLoading, error, refetch } = useLabResults();

  return (
    <div>
      {isLoading && <Spinner />}
      {error && <ErrorMessage error={error} />}
      {data && <LabResultsList results={data} />}
    </div>
  );
}
```

### **Data Mutations with Optimistic Updates**

```typescript
import { useAddMedication } from "../hooks/api";

function AddMedicationForm() {
  const addMedication = useAddMedication();

  const handleSubmit = async (medicationData) => {
    try {
      await addMedication.mutateAsync({
        medication: medicationData,
      });
      // UI updates immediately (optimistic)
      // Cache refreshes automatically
    } catch (error) {
      // Error handling
    }
  };
}
```

### **File Uploads**

```typescript
import { useUploadLabReport } from "../hooks/api";

function LabUpload() {
  const uploadReport = useUploadLabReport();

  const handleFileUpload = async (file: File) => {
    try {
      const result = await uploadReport.mutateAsync({ file });
      console.log("Upload successful:", result);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };
}
```

### **Pagination**

```typescript
import { usePagination } from '../hooks/api';
import { ProgramService } from '../services/api.service';

function PaginatedPrograms() {
  const {
    data,
    isLoading,
    page,
    totalPages,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage
  } = usePagination(
    ['programs', 'paginated'],
    ProgramService.getProgramsPaginated,
    10 // items per page
  );

  return (
    <div>
      <ProgramsList programs={data?.items} />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onNext={nextPage}
        onPrevious={previousPage}
        hasNext={hasNextPage}
        hasPrevious={hasPreviousPage}
      />
    </div>
  );
}
```

## 🔧 **Configuration**

### **Environment Variables**

```bash
# .env
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000
VITE_API_MAX_RETRIES=3
```

### **API Client Setup**

```typescript
// client/lib/api-client.ts
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "/api",
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};
```

## 🛡️ **Error Handling Strategy**

### **1. Client-Side Errors**

- Network errors (connection issues)
- Timeout errors
- Request cancellation

### **2. Server-Side Errors**

- 4xx: Client errors (validation, auth)
- 5xx: Server errors (automatic retry)

### **3. Error Boundaries**

```typescript
// Automatic error handling in hooks
const { data, error } = usePrograms();

if (error) {
  // Error UI component
  return <ErrorBoundary error={error} />;
}
```

## 🔄 **Caching Strategy**

### **Cache Keys**

- Hierarchical key structure
- Automatic invalidation
- Selective updates

```typescript
export const queryKeys = {
  programs: {
    all: ["programs"],
    list: () => [...queryKeys.programs.all, "list"],
    details: (id: string) => [...queryKeys.programs.all, "details", id],
  },
};
```

### **Cache Invalidation**

```typescript
// Automatic invalidation after mutations
const updateProgram = useUpdateProgram();

// Cache automatically updates after successful mutation
await updateProgram.mutateAsync({ id: "123", updates });
```

## 📊 **Performance Optimizations**

1. **Request Deduplication**: Identical requests are merged
2. **Background Updates**: Data refreshes automatically
3. **Optimistic Updates**: Immediate UI feedback
4. **Intelligent Retries**: Only retry appropriate errors
5. **Request Cancellation**: Cleanup on component unmount

## 🔐 **Security Best Practices**

1. **Authentication**: Automatic token management
2. **HTTPS Only**: Secure transport
3. **Request Validation**: Client-side validation
4. **Error Sanitization**: No sensitive data in errors
5. **CORS Configuration**: Proper cross-origin setup

## 🧪 **Testing Strategy**

```typescript
// Mock API client for testing
import { vi } from "vitest";
import { apiClient } from "../lib/api-client";

vi.mock("../lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));
```

This architecture provides a robust, scalable, and maintainable foundation for API interactions in your React application.
