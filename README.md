# Syntora Todo App

A modern todo application with spiritual and gratitude features, built with Next.js, Tauri, and Supabase.

## Project Structure

```
syntora-todo-app/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── components/         # React components
│   │   │   ├── common/        # Shared UI components
│   │   │   ├── forms/         # Form components
│   │   │   ├── layout/        # Layout components
│   │   │   └── todos/         # Todo-specific components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Core libraries and configurations
│   │   │   ├── supabase/      # Supabase client and utilities
│   │   │   └── constants/     # App constants and configs
│   │   ├── store/             # State management
│   │   │   └── slices/        # Store slices (Zustand)
│   │   ├── styles/            # Global styles
│   │   ├── types/             # TypeScript definitions
│   │   └── utils/             # Helper functions
├── src-tauri/                 # Tauri desktop app
│   ├── src/                   # Rust source code
│   ├── capabilities/          # Tauri capabilities config
│   └── icons/                 # Desktop app icons
├── public/                    # Static assets
├── tests/                     # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                      # Documentation
├── scripts/                   # Build and utility scripts
└── config/                    # Configuration files
    ├── eslint/
    ├── tailwind/
    └── typescript/
```

## Features

- ✅ Task management with priorities and categories
- 🙏 Spiritual and gratitude task tracking
- 🌓 Dark mode support
- 🖥️ Cross-platform desktop app with Tauri
- 🔄 Real-time sync with Supabase backend
- 📱 Responsive design

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. For desktop development:
   ```bash
   npm run tauri:dev
   ```

## Building

- Web app:
  ```bash
  npm run build
  ```

- Desktop app:
  ```bash
  npm run tauri:build
  ```

## Technology Stack

- **Frontend:**
  - Next.js 14
  - React
  - TypeScript
  - Tailwind CSS
  - Framer Motion
  - Zustand

- **Desktop:**
  - Tauri
  - Rust

- **Backend:**
  - Supabase
  - PostgreSQL

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
