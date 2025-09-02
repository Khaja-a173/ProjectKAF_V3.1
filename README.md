# ProjectKAF

A comprehensive multi-tenant restaurant management platform built with modern technologies.

## 🏗️ Architecture

- **Multi-tenant SaaS**: Isolated data per restaurant
- **Microservices**: API, Web, Control Plane
- **Real-time**: WebSocket updates for orders
- **Scalable**: Docker + PostgreSQL + Redis

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/Khaja-a173/ProjectKAF.git
cd ProjectKAF

# Install dependencies
npm install

# Set up environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/control-plane/.env.example apps/control-plane/.env

# Start development
npm run dev
```

## 📦 Applications

### 🍽️ Web App (`apps/web`)
- Customer-facing restaurant interface
- Menu browsing and ordering
- Real-time order tracking
- Multi-tenant support

### 🎛️ Control Plane (`apps/control-plane`)
- Admin dashboard for restaurant management
- Analytics and reporting
- User management
- System monitoring

### 🔧 API Server (`apps/api`)
- RESTful API with Fastify
- Multi-tenant RBAC
- Real-time WebSocket support
- PostgreSQL + Prisma ORM

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Fastify, Node.js, TypeScript
- **Database**: PostgreSQL, Prisma ORM
- **Cache**: Redis
- **Auth**: JWT with RBAC
- **Deployment**: Docker, Vercel
- **Monitoring**: Built-in logging and metrics

## 🏃‍♂️ Development

```bash
# Start all services
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Database operations
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:migrate   # Run migrations
```

## 🐳 Docker Deployment

### Staging
```bash
npm run docker:staging
```

### Production
```bash
npm run docker:prod
```

## 🌐 Environment Variables

### API Server
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/projectkaf
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Web App
```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

### Control Plane
```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
NEXT_PUBLIC_TENANT_ID=seed-tenant
```

## 📁 Project Structure

```
ProjectKAF/
├── apps/
│   ├── api/           # Fastify API server
│   ├── web/           # Next.js web application
│   └── control-plane/ # Admin dashboard
├── packages/
│   ├── db/            # Prisma database layer
│   ├── ui/            # Shared UI components
│   └── utils/         # Common utilities
├── scripts/           # Deployment scripts
└── docker/            # Docker configurations
```

## 🔐 Security Features

- **Multi-tenant isolation**: Complete data separation
- **RBAC**: Role-based access control
- **JWT Authentication**: Secure token-based auth
- **Input validation**: Comprehensive request validation
- **CORS protection**: Configurable origins
- **Rate limiting**: API protection

## 📊 Features

### Restaurant Management
- Menu management with categories
- Order processing and tracking
- Table management
- Staff management with roles
- Real-time kitchen display system (KDS)

### Analytics & Reporting
- Sales analytics
- Order trends
- Performance metrics
- Custom reports

### Multi-tenant Support
- Tenant isolation
- Custom branding per tenant
- Scalable architecture
- Centralized management

## 🚀 Deployment

### Vercel (Recommended)
1. Deploy API to your preferred hosting
2. Deploy Web and Control Plane to Vercel
3. Configure environment variables
4. Set up custom domains

### Docker
Use the provided Docker configurations for containerized deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the example configurations

---

Built with ❤️ for the restaurant industry