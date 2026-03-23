# Workspace

## Overview

pnpm workspace monorepo using TypeScript. ElderAssist is a mobile app that uses Gemini AI to help elderly users change phone settings via voice/text instructions. The AI gives clear, numbered, step-by-step guidance.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: Gemini AI via Replit AI Integrations (`@workspace/integrations-gemini-ai`)
- **Mobile**: Expo (React Native) with Expo Router

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── mobile/             # Expo mobile app (ElderAssist)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── integrations-gemini-ai/ # Gemini AI client + utilities
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

- `conversations` — stores conversation sessions (id, title, createdAt)
- `messages` — stores chat messages (id, conversationId, role, content, createdAt)
- Relations: conversations has many messages

## API Routes

- `GET /api/gemini/conversations` — list all conversations
- `POST /api/gemini/conversations` — create a new conversation
- `GET /api/gemini/conversations/:id` — get conversation with messages
- `DELETE /api/gemini/conversations/:id` — delete a conversation
- `GET /api/gemini/conversations/:id/messages` — list messages
- `POST /api/gemini/conversations/:id/messages` — send message (streams SSE response from Gemini)

## Mobile App (artifacts/mobile)

- **Entry**: `app/_layout.tsx` — sets up providers (QueryClient, SafeArea, Keyboard, ErrorBoundary)
- **Home**: `app/index.tsx` — shows quick help shortcuts + past sessions list
- **Chat**: `app/chat/[id].tsx` — AI chat screen with streaming Gemini responses
- **API lib**: `lib/api.ts` — API calls including SSE streaming
- **Theme**: `constants/colors.ts` — navy/teal/gold color palette

## Key Patterns

- Gemini AI model: `gemini-2.5-flash` with a specialized system prompt for elderly phone setting assistance
- SSE streaming: Server sends chunks via `text/event-stream`, client reads with `expo/fetch` and `ReadableStream`
- Responses are parsed for numbered steps and rendered with visual step indicators
- Quick help buttons for common tasks (Bluetooth, Wi-Fi, Volume, Brightness, Silent, Battery Saver)
- Conversation history stored in PostgreSQL and loaded on chat screen open
