# StartupNavi - Comprehensive Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Stack](#technical-stack)
3. [Project Structure](#project-structure)
4. [Core Features & Implementation](#core-features--implementation)
5. [Database Architecture](#database-architecture)
6. [State Management](#state-management)
7. [Components Architecture](#components-architecture)
8. [Valuation System](#valuation-system)
9. [Authentication](#authentication)
10. [Integration Points](#integration-points)
11. [Development Practices](#development-practices)

## Project Overview

StartupNavi is a comprehensive startup management platform that helps founders track metrics, manage valuations, and handle investor relations. The application uses a multi-faceted valuation methodology that combines five different approaches to provide a balanced startup valuation.

### Business Logic

The core business logic centers on:
- Generating accurate startup valuations through multiple methodologies
- Tracking financial metrics over time
- Managing cap tables and investor relationships
- Providing data-driven insights for decision-making

## Technical Stack

### Frontend
- **React 18.3.1**: Core UI library
- **TypeScript**: For type safety across the codebase
- **Vite 5.4.1**: Build tool and development server
- **TailwindCSS 3.4.11**: Utility-first CSS framework for styling
- **shadcn/ui**: Component library based on Radix UI primitives
- **Lucide Icons**: SVG icon library

### State Management & Data Fetching
- **TanStack Query 5.56.2**: For data fetching, caching, and state management
- **React Context API**: For global state (auth, theme, etc.)
- **Zod**: Schema validation library for form and data validation
- **Custom hooks**: For encapsulating and reusing complex logic

### Backend & Database
- **Supabase**: Backend-as-a-Service platform providing:
  - PostgreSQL database
  - Authentication services
  - Row-level security
  - Real-time subscriptions
  - Storage solutions

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── ui/         # Basic UI elements (buttons, cards, etc.)
│   └── shared/     # Shared composite components
├── contexts/       # React contexts for global state
├── hooks/          # Custom hooks (incl. useValuation)
├── lib/            # Utility functions & business logic
│   └── valuationCalculator.ts # Core valuation algorithms
├── pages/          # Route components organized by feature
│   ├── auth/       # Authentication-related pages
│   ├── dashboard/  # Dashboard views
│   └── valuation/  # Valuation-specific pages
│       └── ValuationContent.tsx # Main valuation UI
├── integrations/   # External service integration code
│   └── supabase.ts # Supabase client configuration
├── schemas/        # Zod schemas for validation
├── utils/          # Helper functions
├── App.tsx         # Main application component
└── main.tsx        # Application entry point
```

## Core Features & Implementation

### Valuation System

The valuation system is the cornerstone of the application, implementing five different valuation methodologies:

1. **Scorecard Method**: Compares the startup to similar funded companies
2. **Checklist Method**: Evaluates the startup against a series of criteria
3. **Venture Capital Method**: Calculates based on expected ROI and exit value
4. **DCF with Long-Term Growth**: Discounted cash flow with terminal growth
5. **DCF with Multiples**: Discounted cash flow with industry multiples

#### Implementation Details

- **Calculation Engine**: `src/lib/valuationCalculator.ts` contains all valuation algorithms
- **Questionnaire System**: Gathers inputs for the valuation methods
- **Weighting System**: Each method is weighted based on company stage
- **Visual Representation**: Charts display the breakdown of values

#### Valuation Data Flow
1. User completes questionnaire
2. `useValuation` hook triggers calculation
3. `valuationCalculator.ts` processes the data
4. Results are stored in Supabase
5. UI updates with visualization in `ValuationContent.tsx`

### Financial Dashboard

The financial dashboard tracks key metrics including:
- Revenue
- Burn rate
- Cash runway
- Key performance indicators
- Growth metrics

## Database Architecture

### Supabase Tables

1. **profiles**
   - Stores user profile information
   - Linked to auth.users via RLS policies

2. **companies**
   - Central table for company information
   - Fields: name, industry, founded_year, stage, etc.
   - One-to-many relationship with other entities

3. **valuations**
   - Stores valuation history and calculations
   - Fields:
     - selected_valuation: User-selected final valuation
     - pre_money_valuation: Calculated pre-money value
     - investment: Current round investment amount
     - post_money_valuation: Value after investment
     - valuation_min/max: Range boundaries
     - valuation_methods: JSON field with method calculations
   - Foreign key to companies table

4. **questionnaires**
   - Stores questionnaire responses for valuation
   - Linked to valuations via valuation_id
   - Questions organized by category

5. **investments**
   - Tracks investment rounds
   - Fields: capital_invested, shares, investment_date
   - Foreign key to companies table

6. **performance_metrics**
   - Defines trackable metrics
   - Fields: name, unit, description

7. **performance_values**
   - Stores actual metric values over time
   - Fields: actual, target, month, year
   - Foreign key to performance_metrics

### Row-Level Security

```sql
-- Example RLS policy for companies table
CREATE POLICY "Users can only access their own companies" ON companies
  FOR ALL USING (auth.uid() IN (
    SELECT user_id FROM company_users WHERE company_id = id
  ));
```

## State Management

### Authentication Context
Located in `src/contexts/AuthContext.tsx`, manages:
- User authentication state
- Login/logout operations
- Profile information
- Session persistence

### Valuation Hook
The `useValuation` hook in `src/hooks/useValuation.ts` manages:
- Fetching valuation data
- Calculation status (idle, calculating, error)
- Updating selected valuation
- Triggering recalculation
- Checking questionnaire completion status

```typescript
// Key types in useValuation
interface ValuationMethods {
  scorecard: number;
  checklist: number;
  ventureCap: number;
  dcfGrowth: number;
  dcfMultiple: number;
  weights: Record<string, { weight: number; enabled: boolean }>;
}

interface UseValuationReturn {
  valuation: ValuationData | null;
  isLoading: boolean;
  error: Error | null;
  calculationStatus: 'idle' | 'calculating' | 'error';
  isQuestionnaireComplete: boolean;
  hasFinancialsData: boolean;
  updateSelectedValuation: (value: number) => void;
  recalculateValuation: () => void;
}
```

### Data Fetching Pattern
Uses TanStack Query for data management:
```typescript
// Example query pattern
const { data, isLoading, error } = useQuery({
  queryKey: ['valuation', valuationId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('valuations')
      .select('*, companies(*)')
      .eq('id', valuationId)
      .single();
      
    if (error) throw error;
    return data;
  }
});

// Example mutation pattern
const mutation = useMutation({
  mutationFn: async (newValue: number) => {
    const { error } = await supabase
      .from('valuations')
      .update({ selected_valuation: newValue })
      .eq('id', valuationId);
      
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['valuation'] });
    toast.success('Valuation updated successfully');
  },
  onError: (error) => {
    toast.error(`Error updating valuation: ${error.message}`);
  }
});
```

## Components Architecture

### UI Component Structure
Components follow a clear hierarchy:
- **Primitive Components**: Buttons, inputs, cards, etc.
- **Composite Components**: Combinations of primitives for specific purposes
- **Page Components**: Full page layouts combining multiple composites

### ValuationContent Component

The `ValuationContent` component in `src/pages/valuation/ValuationContent.tsx` implements:
1. Valuation summary display
2. Interactive slider for manual valuation adjustment
3. Visualization of valuation methods
4. Current funding round information
5. Method weight visualization

Key implementation features:
- Uses fixed-height bars for visualization due to extreme value differences
- Implements logarithmic normalization for better visual representation
- Handles edge cases with mock data for improved UX

### Charts and Visualizations

The application uses custom chart components:
- **ValuationBarChart**: Shows the value of each methodology
- **MethodWeightGauge**: Displays the relative importance of each method

### Component Event Flow

For the valuation slider:
1. User moves the slider
2. `handleRangeChange` updates local state
3. User clicks "Save Valuation"
4. `saveSelectedValuation` calls the mutation function
5. Database is updated with the new value
6. UI refreshes to reflect changes

## Valuation System

### Calculation Algorithm

The valuation calculation in `valuationCalculator.ts` follows these steps:
1. Fetch questionnaire data
2. Determine company stage and set appropriate weights
3. Calculate each method individually:
   - Scorecard: Compares to similar companies with adjustment factors
   - Checklist: Evaluates against success criteria
   - Venture Capital: Calculates based on terminal value and expected ROI
   - DCF Growth: Discounted cash flow with growth rate
   - DCF Multiple: Discounted cash flow with industry multiple
4. Apply normalization to handle extreme value differences
5. Calculate weighted average based on company stage
6. Update database with results

### Value Normalization

Due to large differences between valuation methods (from $19 to $10M+), the system implements:
- Logarithmic normalization for visualization
- Median-based adjustments for calculation
- Handling of zero or negative values
- Data formatting for readable display

## Authentication

Authentication uses Supabase Auth with:
- Email/password authentication
- Session persistence
- Protected routes via AuthGuard
- User profile management

## Integration Points

### Supabase Integration

```typescript
// src/integrations/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

Query patterns:
- Select with joins: `supabase.from('table').select('*, relation(*)')`
- Filtered queries: `.eq('field', value)`
- Updates: `.update({ field: value })`
- Inserts: `.insert([{ field: value }])`

## Development Practices

### Error Handling Pattern
```typescript
try {
  // Operation that might fail
} catch (error) {
  if (error instanceof Error) {
    toast.error(`Specific error: ${error.message}`);
  } else {
    toast.error('An unknown error occurred');
  }
}
```

### Form Validation with Zod
```typescript
const valuationSchema = z.object({
  initial_estimate: z.number().min(1000, 'Minimum valuation is $1,000'),
  industry_multiple: z.number().min(0.1).max(20),
  annual_roi: z.number().min(10).max(100)
});
```

### Component Props Pattern
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```


