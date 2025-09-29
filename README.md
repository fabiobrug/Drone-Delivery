# Drone Operations Management System (DroneOps)

A comprehensive web application for managing drone delivery operations, featuring real-time monitoring, route optimization, and fleet management capabilities.

## 🚁 Overview

DroneOps is a full-stack application designed to manage drone delivery operations efficiently. It provides real-time monitoring of drone fleets, intelligent route optimization, order management, and comprehensive analytics for drone delivery services.

### Key Features

- **Real-time Drone Monitoring**: Live tracking of drone positions, status, and battery levels
- **Intelligent Route Planning**: A\* pathfinding algorithm with no-fly zone avoidance
- **Order Management**: Complete order lifecycle from creation to delivery
- **Fleet Management**: Drone registration, type management, and capacity planning
- **Analytics Dashboard**: Performance metrics and efficiency analysis
- **Interactive Map**: Visual representation of drone operations with terrain simulation
- **Flight Simulation**: Realistic drone movement simulation with delivery timing

## 🏗️ Architecture

### Technology Stack

#### Backend

- **Node.js** with Express.js framework
- **Supabase** for database and real-time features
- **PostgreSQL** database
- **Winston** for logging
- **JWT** for authentication
- **WebSocket** for real-time communication

#### Frontend

- **React 19** with modern hooks
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Heroicons** for iconography

#### Development Tools

- **ESLint** for code linting
- **Nodemon** for development server
- **Jest** for testing
- **Git** for version control

### Project Structure

```
TesteDTI/
├── backend/                 # Backend API server
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   └── server.js         # Main server file
├── frontend/DroneOps/     # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   └── assets/        # Static assets
│   └── public/            # Public assets
└── package.json           # Root package configuration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **Supabase** account and project
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/fabiobrug/Drone-Delivery.git
   cd Drone-Delivery
   ```

2. **Install dependencies**

   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend/DroneOps
   npm install
   ```

3. **Environment Setup**

   **Backend Environment** (`backend/.env`):

   ```env
   NODE_ENV=development
   PORT=3001

   # Database (Supabase)
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_KEY=your_supabase_service_role_key_here

   # Security
   ENCRYPTION_KEY=your_32_character_encryption_key_here

   # CORS
   FRONTEND_URL=http://localhost:5173
   ```

   **Frontend Environment** (`frontend/DroneOps/.env`):

   ```env
   VITE_API_BASE_URL=http://localhost:3001/api
   VITE_WS_URL=ws://localhost:3002
   VITE_NODE_ENV=development
   ```

4. **Database Setup**

   Create the following tables in your Supabase database:

   ```sql
   -- Drone Types Table
   CREATE TABLE drone_types (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name VARCHAR(100) NOT NULL,
     capacity DECIMAL(10,2) NOT NULL,
     battery_range DECIMAL(10,2) NOT NULL,
     max_speed DECIMAL(10,2) NOT NULL,
     description TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Drones Table
   CREATE TABLE drones (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     serial_number VARCHAR(50) UNIQUE NOT NULL,
     type_id UUID REFERENCES drone_types(id),
     x DECIMAL(10,2) DEFAULT 25.0,
     y DECIMAL(10,2) DEFAULT 25.0,
     status VARCHAR(20) DEFAULT 'idle',
     battery DECIMAL(5,2) DEFAULT 100.0,
     capacity DECIMAL(10,2) NOT NULL,
     current_load DECIMAL(10,2) DEFAULT 0.0,
     target_x DECIMAL(10,2),
     target_y DECIMAL(10,2),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Orders Table
   CREATE TABLE orders (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     x DECIMAL(10,2) NOT NULL,
     y DECIMAL(10,2) NOT NULL,
     weight DECIMAL(10,2) NOT NULL,
     priority VARCHAR(20) DEFAULT 'medium',
     status VARCHAR(20) DEFAULT 'pending',
     drone_id UUID REFERENCES drones(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- No-Fly Zones Table
   CREATE TABLE no_fly_zones (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name VARCHAR(100) NOT NULL,
     description TEXT,
     points JSONB NOT NULL,
     min_x DECIMAL(10,2),
     max_x DECIMAL(10,2),
     min_y DECIMAL(10,2),
     max_y DECIMAL(10,2),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- System Config Table
   CREATE TABLE system_config (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     optimization_enabled BOOLEAN DEFAULT true,
     optimization_method VARCHAR(50) DEFAULT 'priority-distance-weight',
     delivery_priority VARCHAR(20) DEFAULT 'priority',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. **Start the application**

   **Terminal 1 - Backend Server**:

   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 - Frontend Development Server**:

   ```bash
   cd frontend/DroneOps
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

## 📖 Usage Guide

### Dashboard Overview

The main dashboard provides a comprehensive view of your drone operations:

- **Interactive Map**: Real-time visualization of drone positions and delivery routes
- **Statistics Panel**: Key performance indicators and system metrics
- **Drone Status**: Live status updates for all drones in the fleet

### Managing Drones

1. **Add New Drone**:

   - Navigate to "Drone Management"
   - Click "Add New Drone"
   - Fill in serial number and select drone type
   - Configure initial position (defaults to base at 25,25)

2. **Monitor Drone Status**:

   - **Idle**: Drone is at base, ready for orders
   - **Loading**: Drone is being loaded with orders
   - **Flying**: Drone is en route to delivery locations
   - **Returning**: Drone is returning to base

3. **Drone Operations**:
   - Allocate orders to drones
   - Start flight simulation
   - Monitor battery levels and capacity
   - Track delivery progress

### Order Management

1. **Create Orders**:

   - Navigate to "Order Management"
   - Click "Create New Order"
   - Set delivery coordinates (x, y)
   - Specify weight and priority level

2. **Order Priorities**:

   - **High**: Urgent deliveries (red indicator)
   - **Medium**: Standard deliveries (yellow indicator)
   - **Low**: Non-urgent deliveries (green indicator)

3. **Order Allocation**:
   - Automatic allocation based on optimization settings
   - Manual allocation for specific requirements
   - Capacity validation before allocation

### Route Optimization

The system uses intelligent algorithms for optimal route planning:

1. **A\* Pathfinding**: Finds shortest paths while avoiding obstacles
2. **No-Fly Zone Avoidance**: Automatically routes around restricted areas
3. **Priority-Based Routing**: Prioritizes high-priority deliveries
4. **Capacity Optimization**: Maximizes drone utilization

### System Configuration

Configure system behavior through the settings panel:

1. **Optimization Methods**:

   - Priority-Distance-Weight: Balances priority and distance
   - Priority-Only: Prioritizes by order priority
   - Distance-Only: Minimizes total distance

2. **Delivery Priority**:
   - Priority-based delivery order
   - Distance-based delivery order
   - First-come-first-served

## 🔧 API Documentation

### Base URL

```
http://localhost:3001/api
```

### Authentication

Currently, the API operates without authentication. For production deployment, implement JWT-based authentication.

### Endpoints

#### Drones

- `GET /drones` - Get all drones
- `GET /drones/:id` - Get specific drone
- `POST /drones` - Create new drone
- `PUT /drones/:id` - Update drone
- `DELETE /drones/:id` - Delete drone
- `PUT /drones/:id/status` - Update drone status
- `GET /drones/:id/orders` - Get drone orders
- `POST /drones/:id/orders` - Allocate order to drone
- `DELETE /drones/:id/orders/:orderId` - Remove order from drone

#### Orders

- `GET /orders` - Get all orders
- `GET /orders/:id` - Get specific order
- `POST /orders` - Create new order
- `PUT /orders/:id` - Update order
- `DELETE /orders/:id` - Delete order
- `PUT /orders/:id/status` - Update order status

#### Drone Types

- `GET /drone-types` - Get all drone types
- `GET /drone-types/:id` - Get specific drone type
- `POST /drone-types` - Create new drone type
- `PUT /drone-types/:id` - Update drone type
- `DELETE /drone-types/:id` - Delete drone type

#### No-Fly Zones

- `GET /no-fly-zones` - Get all no-fly zones
- `GET /no-fly-zones/:id` - Get specific no-fly zone
- `POST /no-fly-zones` - Create new no-fly zone
- `PUT /no-fly-zones/:id` - Update no-fly zone
- `DELETE /no-fly-zones/:id` - Delete no-fly zone

#### Statistics

- `GET /stats/dashboard` - Get dashboard statistics
- `GET /stats/drones` - Get drone statistics
- `GET /stats/orders` - Get order statistics
- `GET /stats/efficiency` - Get efficiency metrics

#### Configuration

- `GET /config` - Get system configuration
- `PUT /config` - Update system configuration

### Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

## 🧪 Testing

### Running Tests

**Backend Tests**:

```bash
cd backend
npm test
```

**Frontend Tests**:

```bash
cd frontend/DroneOps
npm test
```

### Test Coverage

The project includes comprehensive tests for:

- API endpoints and controllers
- Business logic services
- Database models
- React components
- Utility functions

## 🚀 Deployment

### Production Build

**Backend**:

```bash
cd backend
npm run build
npm start
```

**Frontend**:

```bash
cd frontend/DroneOps
npm run build
```

### Environment Variables

Set the following environment variables for production:

**Backend**:

- `NODE_ENV=production`
- `PORT=3001`
- `SUPABASE_URL=your_production_supabase_url`
- `SUPABASE_ANON_KEY=your_production_anon_key`
- `SUPABASE_KEY=your_production_service_role_key`
- `ENCRYPTION_KEY=your_production_encryption_key`

**Frontend**:

- `VITE_API_BASE_URL=https://your-api-domain.com/api`
- `VITE_WS_URL=wss://your-websocket-domain.com`

### Docker Deployment

Create a `Dockerfile` for containerized deployment:

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
EXPOSE 3001
CMD ["npm", "start"]
```

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY frontend/DroneOps/package*.json ./
RUN npm ci
COPY frontend/DroneOps/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔒 Security Considerations

### Data Protection

- Environment variables for sensitive configuration
- Input validation and sanitization
- SQL injection prevention through parameterized queries
- CORS configuration for API access control

### Authentication (Future Implementation)

- JWT-based authentication
- Role-based access control
- Session management
- Password hashing with bcrypt

### API Security

- Rate limiting to prevent abuse
- Request validation middleware
- Error handling without sensitive information exposure
- HTTPS enforcement in production

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests**:
   ```bash
   npm test
   ```
5. **Commit your changes**:
   ```bash
   git commit -m "Add your feature"
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Code Standards

- **ESLint**: Follow the configured ESLint rules
- **Prettier**: Use consistent code formatting
- **Comments**: Document complex logic and functions
- **Testing**: Write tests for new features
- **TypeScript**: Consider migrating to TypeScript for better type safety

### Commit Convention

Use conventional commits format:

```
feat: add new drone allocation algorithm
fix: resolve route calculation bug
docs: update API documentation
style: format code with prettier
refactor: improve drone service structure
test: add tests for order management
```

## 📊 Performance Optimization

### Backend Optimization

- Database query optimization
- Caching with Redis (future implementation)
- Connection pooling
- Compression middleware
- Rate limiting

### Frontend Optimization

- Code splitting and lazy loading
- Image optimization
- Bundle size optimization
- Service worker for caching
- Virtual scrolling for large lists

### Database Optimization

- Proper indexing on frequently queried columns
- Query optimization
- Connection pooling
- Read replicas for scaling

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**:

   - Verify Supabase credentials
   - Check network connectivity
   - Ensure database tables exist

2. **CORS Errors**:

   - Verify frontend URL in backend CORS configuration
   - Check environment variables

3. **Build Errors**:

   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

4. **Real-time Updates Not Working**:
   - Check WebSocket connection
   - Verify Supabase real-time configuration
   - Check browser console for errors

### Debug Mode

Enable debug logging:

**Backend**:

```env
LOG_LEVEL=debug
NODE_ENV=development
```

**Frontend**:

```env
VITE_DEBUG_MODE=true
```

## 📈 Roadmap

### Planned Features

- [ ] User authentication and authorization
- [ ] Multi-tenant support
- [ ] Advanced analytics and reporting
- [ ] Mobile application
- [ ] Integration with external mapping services
- [ ] Machine learning for route optimization
- [ ] Real-time notifications
- [ ] API rate limiting and monitoring
- [ ] Automated testing pipeline
- [ ] Performance monitoring

### Technical Improvements

- [ ] Migration to TypeScript
- [ ] GraphQL API implementation
- [ ] Microservices architecture
- [ ] Container orchestration with Kubernetes
- [ ] CI/CD pipeline setup
- [ ] Comprehensive test coverage
- [ ] Performance optimization
- [ ] Security audit and hardening

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Fabio Brugnara** - Project Lead & Full-Stack Developer

## 📞 Support

For support, questions, or contributions:

- **Issues**: [GitHub Issues](https://github.com/fabiobrug/Drone-Delivery/issues)
- **Discussions**: [GitHub Discussions](https://github.com/fabiobrug/Drone-Delivery/discussions)
- **Email**: fabiobrug2006@gmail.com

## 🙏 Acknowledgments

- **Supabase** for providing the backend-as-a-service platform
- **Tailwind CSS** for the utility-first CSS framework
- **Heroicons** for the beautiful icon set
- **React** and **Node.js** communities for excellent documentation and support

---

**DroneOps** - Revolutionizing drone delivery operations through intelligent automation and real-time monitoring.
