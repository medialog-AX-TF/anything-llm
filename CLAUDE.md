# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AnythingLLM is a full-stack application that enables you to turn any document, resource, or piece of content into context that any LLM can use as a reference during chatting. It's a monorepo consisting of three main applications: frontend (React), server (Node.js), and collector (Node.js document processor).

## Development Commands

### Initial Setup
```bash
# Install dependencies and set up environment files
yarn setup

# Generate Prisma client, run migrations, and seed database
yarn prisma:setup
```

### Development Server
```bash
# Start all services in development mode (recommended)
yarn dev:all

# Or start individual services (separate terminals):
yarn dev:server    # Node.js API server on port 3001
yarn dev:frontend  # React frontend on port 3000  
yarn dev:collector # Document processing server on port 8888
```

### Production Build
```bash
yarn prod:frontend  # Build React frontend for production
yarn prod:server    # Start server in production mode
```

### Code Quality
```bash
yarn lint           # Run linting across all projects
yarn test           # Run Jest tests

# Individual project linting:
cd server && yarn lint
cd frontend && yarn lint
cd collector && yarn lint
```

### Database Management
```bash
yarn prisma:generate  # Generate Prisma client
yarn prisma:migrate   # Run database migrations
yarn prisma:seed      # Seed database with initial data
yarn prisma:reset     # Reset database and rerun migrations
```

### Testing Individual Components
```bash
# Run specific test files
cd server && npm test -- utils/TextSplitter/index.test.js
cd server && npm test -- __tests__/utils/agents/

# For frontend testing, tests are typically run with:
cd frontend && npm test
```

## Architecture Overview

### Monorepo Structure
- **frontend/**: React application (Vite + TailwindCSS)
- **server/**: Node.js Express API server with Prisma ORM
- **collector/**: Node.js document processing service
- **docker/**: Docker configuration files
- **embed/**: Embeddable chat widget (submodule)
- **browser-extension/**: Chrome extension (submodule)

### Key Architectural Patterns

#### Multi-Service Architecture
- **Frontend**: React SPA handling UI and real-time chat
- **Server**: Express API managing workspaces, users, LLM integrations, and vector databases
- **Collector**: Dedicated service for document parsing and processing

#### Database Layer
- **Primary**: SQLite with Prisma ORM (development)
- **Production**: PostgreSQL support available
- **Migrations**: Located in `server/prisma/migrations/`
- **Models**: Defined in `server/prisma/schema.prisma`

#### WebSocket Integration
- Real-time chat streaming via `@mintplex-labs/express-ws`
- Agent WebSocket endpoints in `server/endpoints/agentWebsocket.js`
- Client-side streaming in frontend chat components

### Document Processing Pipeline
1. **Upload**: Files uploaded to collector service
2. **Detection**: MIME type detection and routing to appropriate parser
3. **Processing**: Text extraction using specialized parsers (PDF, DOCX, etc.)
4. **Chunking**: LangChain TextSplitters for optimal token management
5. **Embedding**: Vector generation using selected embedding engine
6. **Storage**: Vectors stored in configured vector database

### LLM Provider Integration
The system supports 25+ LLM providers through a unified interface:
- **Pattern**: Provider-specific classes in `server/utils/AiProviders/`
- **Example**: OpenAI integration at `server/utils/AiProviders/openAi/index.js`
- **Configuration**: Provider selection and credentials via settings UI

### Vector Database Support
Multiple vector DB providers supported via adapter pattern:
- **Location**: `server/utils/vectorDbProviders/`
- **Default**: LanceDB (`server/utils/vectorDbProviders/lance/`)
- **Setup Docs**: Each provider has setup documentation (e.g., `PINECONE_SETUP.md`)

## Key Development Patterns

### Environment Configuration
- **Development**: `server/.env.development`
- **Production**: `server/.env`
- **Setup Script**: `yarn setup:envs` copies example files

### API Endpoint Structure
```
server/endpoints/
├── admin.js           # Admin management
├── chat.js           # Chat functionality
├── workspaces.js     # Workspace CRUD
├── api/              # Developer API
└── embed/            # Embeddable widget API
```

### Frontend Component Organization
```
frontend/src/
├── components/       # Reusable UI components
├── pages/           # Route-level components
├── models/          # API client functions
├── utils/           # Utility functions
└── hooks/           # Custom React hooks
```

### Testing Patterns
- **Backend**: Jest tests in `server/__tests__/`
- **Structure**: Tests mirror source code structure
- **Coverage**: Focus on utils, agents, and core business logic

### State Management
- **Frontend**: React Context API for global state
- **Key Contexts**: AuthContext, ThemeContext, LogoContext
- **Pattern**: Provider components wrapping App.jsx

### Error Handling
- **Server**: Winston logger with structured logging
- **Frontend**: Toast notifications via react-toastify
- **Pattern**: Centralized error handling in API client layer

## Database Schema Key Points

### Core Entities
- **workspaces**: Container for documents and chats
- **workspace_documents**: Document metadata and relationships
- **workspace_chats**: Chat history and metadata
- **users**: User accounts (multi-user mode)
- **system_settings**: Global configuration

### Multi-tenancy
- Workspace-based isolation
- User permissions per workspace
- Role-based access control (admin, manager, default)

## Integration Points

### MCP (Model Context Protocol) Support
- **Location**: `server/utils/MCP/`
- **Endpoints**: `server/endpoints/mcpServers.js`
- **Pattern**: Hypervisor pattern for managing MCP servers

### Agent Flows System
- **No-code builder**: Visual workflow creation
- **Execution**: `server/utils/agentFlows/executor.js`
- **Types**: API calls, web scraping, LLM instructions

### Embedding System
- **Chat Widget**: Embeddable for external websites
- **API Compatibility**: OpenAI-compatible endpoints
- **Mobile**: Native app integration points

## Security Considerations

### Authentication & Authorization
- **JWT Tokens**: Primary authentication mechanism
- **API Keys**: Developer API access control
- **Password Policy**: joi-password-complexity validation
- **Session Management**: Temporary auth tokens for secure operations

### Data Protection
- **File Upload Limits**: 3GB maximum
- **CORS Configuration**: Configurable origin policies
- **Input Validation**: Request body validation throughout

### Multi-user Security
- **Workspace Isolation**: Users can only access assigned workspaces
- **Role-based Permissions**: Granular control over features
- **Invite System**: Secure user onboarding

## Performance Optimization

### Vector Search
- **Caching**: Vector cache system prevents reprocessing
- **Chunking Strategy**: Adaptive chunking based on content type
- **Reranking**: Advanced search modes for better relevance

### Streaming & Real-time
- **Chat Streaming**: Token-by-token response delivery
- **Background Jobs**: Bree scheduler for long-running tasks
- **WebSocket Management**: Efficient connection handling

### Resource Management
- **Memory**: Garbage collection optimizations
- **Storage**: Automatic cleanup of temporary files
- **Disk Space**: Monitoring and alerts for storage limits

## Deployment Patterns

### Docker Support
- **Multi-stage builds**: Optimized container images
- **Environment**: Full Docker Compose setup
- **Health Checks**: Container health monitoring

### Cloud Deployment
- **AWS**: CloudFormation templates
- **GCP**: Deployment manager configs
- **Generic**: Railway, Render.com templates

### Bare Metal
- **Process Management**: PM2 or systemd service files
- **Reverse Proxy**: Nginx configuration examples
- **SSL**: Built-in HTTPS support or proxy termination

## Common Development Tasks

### Adding New LLM Provider
1. Create provider class in `server/utils/AiProviders/[provider]/`
2. Implement required interface methods
3. Add provider to model selection logic
4. Create frontend configuration component
5. Update provider documentation

### Adding Vector Database Support
1. Create adapter in `server/utils/vectorDbProviders/[db]/`
2. Implement CRUD operations and similarity search
3. Add configuration UI components
4. Document setup requirements

### Extending Document Support
1. Add parser to `collector/processSingleFile/convert/`
2. Update MIME type detection
3. Test with various file formats
4. Update supported formats documentation

### Creating API Endpoints
1. Add route in appropriate `server/endpoints/` file
2. Implement middleware (auth, validation)
3. Create corresponding frontend API client
4. Add OpenAPI documentation

## Troubleshooting

### Common Issues
- **Database Locked**: Reset with `yarn prisma:reset`
- **Port Conflicts**: Check ports 3000, 3001, 8888
- **Memory Issues**: Increase Node.js heap size for large documents
- **Vector DB Connection**: Verify provider credentials and network access

### Debug Mode
- Set `NODE_ENV=development` for detailed logging
- Use `--trace-warnings` flag for Node.js debugging
- Frontend debug mode in browser dev tools

### Log Locations
- **Server**: Console output with Winston formatting
- **Collector**: Document processing logs
- **Frontend**: Browser console for client-side issues