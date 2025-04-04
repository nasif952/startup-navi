# StartupNavi - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Stack](#technical-stack)
3. [Core Features](#core-features)
4. [Database Structure](#database-structure)
5. [Components](#components)
6. [Integration Points](#integration-points)
7. [State Management](#state-management)
8. [Security Features](#security-features)
9. [Development Guidelines](#development-guidelines)

## Project Overview
StartupNavi is a comprehensive startup management and analytics platform designed to help startups track metrics, manage valuations, and handle investor relations.

### Project Goals
- Provide startups with tools for financial management
- Facilitate investor relations and due diligence
- Streamline valuation and cap table management
- Enable data-driven decision making

## Technical Stack

### Frontend
- React 18.3.1
- TypeScript
- Vite 5.4.1
- TailwindCSS 3.4.11
- shadcn/ui components

### State Management & Data Fetching
- TanStack Query (React Query) 5.56.2
- React Context API
- Zod for schema validation

### Backend & Database
- Supabase
- Real-time subscriptions
- Authentication services

### Key Dependencies
```json
{
  "react": "^18.3.1",
  "react-router-dom": "^6.26.2",
  "@supabase/supabase-js": "^2.49.3",
  "@tanstack/react-query": "^5.56.2",
  "date-fns": "^3.6.0",
  "zod": "^3.23.8"
}
```

## Core Features

### Authentication System
- Email/password authentication
- Session management
- Protected routes
- User profiles

### Dashboard Features
1. Company Overview
   - Basic company information
   - Industry classification
   - Stage tracking
   - Profile completion

2. Financial Metrics
   - Revenue tracking
   - Gross margin analysis
   - Cash flow monitoring
   - Performance vs targets

3. Investment Management
   - Total investment tracking
   - Share price calculations
   - Valuation history
   - Cap table management

### Module-specific Features
1. Valuation Module
   ```typescript
   interface ValuationData {
     selected_valuation: number;
     valuation_date: Date;
     methodology: string;
     assumptions: string[];
   }
   ```

2. Financial Overview
   ```typescript
   interface FinancialMetrics {
     revenue: number;
     grossMargin: number;
     cashOnHand: number;
     burnRate: number;
   }
   ```

3. Performance Tracking
   ```typescript
   interface PerformanceMetric {
     name: string;
     actual: number;
     target: number;
     unit: string;
     month: number;
     year: number;
   }
   ```

## Database Structure

### Supabase Tables

1. profiles
   ```sql
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users PRIMARY KEY,
     full_name TEXT,
     avatar_url TEXT,
     updated_at TIMESTAMP WITH TIME ZONE
   );
   ```

2. companies
   ```sql
   CREATE TABLE companies (
     id UUID PRIMARY KEY,
     name TEXT,
     industry TEXT,
     founded_year DATE,
     stage TEXT,
     business_activity TEXT
   );
   ```

3. valuations
   ```sql
   CREATE TABLE valuations (
     id UUID PRIMARY KEY,
     company_id UUID REFERENCES companies(id),
     selected_valuation DECIMAL,
     valuation_date TIMESTAMP WITH TIME ZONE
   );
   ```

4. investments
   ```sql
   CREATE TABLE investments (
     id UUID PRIMARY KEY,
     company_id UUID REFERENCES companies(id),
     capital_invested DECIMAL,
     number_of_shares INTEGER,
     investment_date TIMESTAMP WITH TIME ZONE
   );
   ```

5. performance_values
   ```sql
   CREATE TABLE performance_values (
     id UUID PRIMARY KEY,
     metric_id UUID REFERENCES performance_metrics(id),
     actual DECIMAL,
     target DECIMAL,
     month INTEGER,
     year INTEGER
   );
   ```

## Components

### Core Components
1. Layout
   ```typescript
   interface LayoutProps {
     children: React.ReactNode;
   }
   ```

2. AuthGuard
   ```typescript
   interface AuthGuardProps {
     children: React.ReactNode;
   }
   ```

### UI Components
1. Card
2. Button
3. ProgressBar
4. DataTable
5. Charts

## Integration Points

### Supabase Integration
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
```

### Authentication Flow
```typescript
const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { error };
};
```

## State Management

### Global State (AuthContext)
```typescript
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
```

### React Query Usage
```typescript
const { data: company } = useQuery({
  queryKey: ['company'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .limit(1)
      .single();
    return data;
  },
});
```

## Security Features

### Route Protection
```typescript
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!session) return <Navigate to="/auth" />;
  
  return <>{children}</>;
};
```

### Data Access Patterns
- Row Level Security (RLS) in Supabase
- Authentication checks
- Role-based access control

## Development Guidelines

### Code Organization
src/
├── components/ # Reusable UI components
├── contexts/ # React contexts
├── hooks/ # Custom hooks
├── lib/ # Utility functions
├── pages/ # Route components
└── integrations/ # External service integrations


