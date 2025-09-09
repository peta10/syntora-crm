# Authentication System

Expert-level authentication system built with React, TypeScript, and Supabase.

## Architecture Overview

```
src/app/
├── components/auth/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.tsx         # Polymorphic button component
│   │   ├── Input.tsx          # Enhanced input with validation
│   │   └── ErrorMessage.tsx   # Consistent error display
│   ├── AuthGuard.tsx         # Global route protection
│   ├── ProtectedRoute.tsx    # Individual route wrapper
│   ├── SignInForm.tsx        # Form logic and validation
│   ├── SignInLayout.tsx      # Layout and visual structure
│   ├── SignInPage.tsx        # Main sign-in container
│   └── NavigationWrapper.tsx # Smart navigation management
├── contexts/
│   └── AuthContext.tsx       # Authentication state management
├── types/
│   └── auth.ts              # TypeScript interfaces
└── utils/
    └── validation.ts        # Form validation utilities
```

## Key Features

### 🔒 **Security**
- Mandatory authentication on all routes
- Proper session management
- CSRF protection via Supabase
- Secure OAuth flow with Google

### 🎨 **UX/UI**
- Beautiful, accessible design
- Loading states and error handling
- Responsive layout
- Focus management
- Screen reader support

### 🏗️ **Architecture**
- TypeScript strict mode
- Component composition
- Separation of concerns
- Reusable UI components
- Proper error boundaries

### 🧪 **Developer Experience**
- Full type safety
- Comprehensive validation
- Clear component APIs
- Consistent patterns
- Easy to extend

## Component Documentation

### AuthGuard
Global authentication guard that:
- Protects all routes by default
- Redirects unauthenticated users to login
- Handles loading states
- Configurable public paths

### SignInPage
Main authentication container that:
- Manages form state and validation
- Handles authentication flow
- Provides error feedback
- Coordinates with AuthContext

### SignInForm
Pure form component that:
- Handles user input
- Client-side validation
- Accessibility compliance
- Loading states

### UI Components
Reusable, composable UI elements:
- **Button**: Multiple variants, loading states, accessibility
- **Input**: Validation, error states, proper labeling
- **ErrorMessage**: Consistent error display

## Usage Examples

### Protecting a Route
```tsx
import { ProtectedRoute } from '@/app/components/auth/ProtectedRoute';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

### Using Auth Context
```tsx
import { useAuth } from '@/app/contexts/AuthContext';

function UserProfile() {
  const { user, signOut, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Custom Validation
```tsx
import { validateSignInForm } from '@/app/utils/validation';

const errors = validateSignInForm({
  email: 'test@example.com',
  password: 'password123'
});
```

## Best Practices

1. **Type Safety**: All components use strict TypeScript
2. **Error Handling**: Comprehensive error boundaries and user feedback
3. **Accessibility**: ARIA labels, focus management, keyboard navigation
4. **Performance**: Lazy loading, memoization where appropriate
5. **Testing**: Components designed for easy unit testing
6. **Security**: Input sanitization, proper session management

## Environment Configuration

Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Authentication Flow

1. **Unauthenticated Access** → Redirect to `/login`
2. **Sign In Attempt** → Form validation → Supabase auth
3. **Success** → Update context → Redirect to dashboard
4. **Error** → Display user-friendly message
5. **Sign Out** → Clear session → Redirect to login

This architecture provides a solid foundation for enterprise-level applications with proper security, maintainability, and user experience.
