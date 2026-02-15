# Weavy.ai Workflow Builder Clone

A pixel-perfect UI/UX clone of the Weavy.ai workflow builder, focused exclusively on LLM workflows.

## 🎯 Features

### Core Functionality
- ✅ **6 Node Types**: Text, Upload Image, Upload Video, LLM, Crop Image, Extract Frame
- ✅ **React Flow Canvas**: Dot grid background, smooth pan/zoom, minimap
- ✅ **DAG Validation**: Prevents circular dependencies
- ✅ **Undo/Redo**: Full history tracking (50 entries)
- ✅ **Workflow Execution**: Run entire workflow, single node, or selected nodes
- ✅ **Parallel Execution**: Independent nodes run concurrently
- ✅ **Export/Import**: Save and load workflows as JSON

### Technical Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Authentication**: Clerk
- **Background Jobs**: Trigger.dev v3
- **LLM**: Google Gemini API
- **File Processing**: Transloadit + FFmpeg
- **UI**: Tailwind CSS + shadcn/ui

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or pnpm

### Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure required environment variables:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/workflow_builder

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Trigger.dev
TRIGGER_API_KEY=your_trigger_api_key
TRIGGER_API_URL=https://api.trigger.dev

# Google Gemini
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Transloadit
VITE_TRANSLOADIT_KEY=your_transloadit_key
TRANSLOADIT_TEMPLATE_ID=your_template_id
```

### Installation

```bash
# Install dependencies
npm install

# Generate database migrations
npx drizzle-kit generate

# Push schema to database
npx drizzle-kit push

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`

## 📦 Deployment (Vercel)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
- `DATABASE_URL`
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `VITE_CLERK_PUBLISHABLE_KEY`
- `TRIGGER_API_KEY`
- `GOOGLE_AI_API_KEY`
- `VITE_TRANSLOADIT_KEY`
- `TRANSLOADIT_TEMPLATE_ID`

## 🏗️ Architecture

### Node Execution Flow
1. User clicks "Run Workflow"
2. DAG validation ensures no cycles
3. Topological sort determines execution order
4. Independent nodes execute in parallel via Trigger.dev
5. Results stored in workflow_runs table
6. UI updates with execution status

### Database Schema
- `workflows`: Stores workflow metadata, nodes, and edges
- `workflow_runs`: Execution history with node-level details

### API Routes
- `GET /api/workflows` - List all workflows
- `POST /api/workflows` - Create workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow
- `GET /api/workflows/:id/runs` - Get workflow execution history

## 🎨 UI Components

### Left Sidebar
- Collapsible
- Search functionality
- Quick Access with exactly 6 node buttons

### Center Canvas
- React Flow with dot grid background
- Smooth pan/zoom (scroll wheel)
- MiniMap in bottom-right corner
- Purple animated edges

### Right Sidebar
- Workflow History Panel
- Shows all workflow runs with timestamps
- Click to view node-level execution details

### Bottom Bar
- Run controls (entire workflow, single node, selected nodes)
- Cost estimation display

## 🔧 Development

### Build
```bash
npm run build
```

### Type Check
```bash
npm run typecheck
```

### Database Migrations
```bash
# Generate migration
npx drizzle-kit generate

# Push to database
npx drizzle-kit push

# Studio (database viewer)
npx drizzle-kit studio
```

## 📝 Assignment Requirements Checklist

- ✅ Pixel-perfect Weavy clone UI
- ✅ Clerk authentication
- ✅ Left sidebar with 6 nodes
- ✅ Right sidebar with workflow history
- ✅ Node-level execution history
- ✅ React Flow canvas with dot grid
- ✅ All 6 nodes fully functional
- ✅ All executions via Trigger.dev
- ✅ Pulsating glow effect during execution
- ✅ Animated purple edges
- ✅ Zod validation on API routes
- ✅ TypeScript strict mode
- ✅ PostgreSQL + Drizzle ORM
- ✅ Workflow save/load
- ✅ Export/import as JSON
- ✅ Pre-built sample workflow
- ✅ Undo/Redo functionality
- ✅ DAG validation
- ✅ Parallel execution

## 📄 License

MIT
