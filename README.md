# Delivery Management System

A comprehensive delivery management system built with Next.js, TypeScript, and Tailwind CSS. The system supports both admin and driver roles with full CRUD operations for orders and real-time delivery tracking.

## Features

### 🔐 Authentication Module
- Email/password registration (Admin or Driver roles)
- JWT-based authentication
- Role-based session handling
- Protected routes with middleware
- Enhanced driver registration with vehicle and license information

### 📦 Order Management (Admin Panel)
- Create, read, update, and delete customer orders
- Filter and search orders by status
- Real-time order tracking
- Customer information management
- Advanced order assignment system

### 🚚 Driver Assignment (Admin Panel)
- Assign orders to available drivers
- View available drivers with detailed information
- Reassign drivers when needed
- Driver availability tracking
- Driver profile management with vehicle and license details

### 📲 Driver Actions (Mobile/Web View)
- View assigned deliveries
- Accept or reject order assignments
- Update delivery status (Picked up, On the way, Delivered)
- Real-time status updates
- Add delivery notes and comments

### 📊 Admin Dashboard
- Real-time statistics and analytics
- Total orders overview with status breakdown
- Available drivers count and status
- Completed orders tracking
- In-progress orders monitoring
- System performance metrics

### 🔧 System Monitoring & Debugging
- **System Status Page**: Real-time health monitoring at `/status`
- **API Debugger**: Development tool for monitoring API calls
- **Test Page**: Authentication testing interface at `/test`
- **Error Boundary**: Graceful error handling and recovery
- **Toast Notifications**: User-friendly feedback system

## Tech Stack

- **Framework**: Next.js 15.4.4 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Authentication**: JWT + bcryptjs
- **Database**: JSON Server (for development)
- **UI Components**: Custom components with Tailwind + Lucide React icons
- **HTTP Client**: Axios with interceptors
- **State Management**: React Context API

## Project Structure

```
delivery-management-system/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── orders/
│   │   │   └── drivers/
│   │   ├── driver/
│   │   │   └── deliveries/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── orders/
│   │   │   ├── drivers/
│   │   │   ├── deliveries/
│   │   │   ├── dashboard/
│   │   │   └── health/
│   │   ├── register/
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── drivers/
│   │   ├── status/
│   │   ├── test/
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   ├── ApiDebugger.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Toast.tsx
│   │   └── ToastContainer.tsx
│   ├── contexts/
│   ├── hooks/
│   ├── lib/
│   └── types/
├── db/
│   └── db.json
└── public/
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd delivery-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Start both servers (recommended):
```bash
npm run dev:full
```

Or start them separately:
```bash
# Terminal 1: Start JSON server (database)
npm run db

# Terminal 2: Start Next.js development server
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Troubleshooting

If you see a blank page, check the system status at [http://localhost:3000/status](http://localhost:3000/status)

### Development with Hot Reload

For the best development experience with hot reload:

```bash
# Start both servers with proper hot reload
npm run dev:full
```

This will start both the JSON server and Next.js development server concurrently, ensuring proper hot reload functionality.

### Database Setup

The system uses JSON Server as a mock database. The database file is located at `db/db.json` and contains:

- **Users**: Admin and driver accounts with enhanced profile information
- **Orders**: Customer orders with status tracking and driver assignment
- **Deliveries**: Delivery assignments and status updates

### Default Accounts

For testing purposes, the following accounts are pre-configured:

**Admin Account:**
- Email: `admin@delivery.com`
- Password: `password123`

**Driver Accounts:**
- Email: `driver1@delivery.com`
- Password: `password123`
- Email: `driver2@delivery.com`
- Password: `password123`

## Usage

### Admin Features

1. **Dashboard**: View real-time statistics and system overview
2. **Orders Management**: 
   - Create new orders with customer details
   - View all orders with advanced filtering
   - Assign drivers to pending orders
   - Delete orders
   - Track order status in real-time
3. **Driver Management**: 
   - View available drivers with detailed profiles
   - Monitor driver availability
   - Manage driver assignments

### Driver Features

1. **Delivery Management**:
   - View assigned deliveries with order details
   - Accept or reject delivery assignments
   - Update delivery status (Picked up → On the way → Delivered)
   - Add notes and comments to deliveries
   - Real-time status synchronization

### Authentication Flow

1. **Registration**: Users can register as either Admin or Driver with enhanced profile information
2. **Login**: Email/password authentication with JWT tokens
3. **Role-based Access**: Different interfaces for Admin and Driver roles
4. **Session Management**: Automatic redirects based on user role

### System Monitoring

1. **Status Page** (`/status`): Monitor system health, database connectivity, and service status
2. **API Debugger**: Development tool for monitoring API calls in real-time
3. **Test Page** (`/test`): Authentication testing interface for development

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Orders
- `GET /api/orders` - Get all orders (with filtering)
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get specific order
- `PUT /api/orders/[id]` - Update order
- `DELETE /api/orders/[id]` - Delete order
- `POST /api/orders/assign` - Assign driver to order

### Drivers
- `GET /api/drivers` - Get available drivers
- `GET /api/drivers/[id]` - Get specific driver
- `PUT /api/drivers/[id]` - Update driver information

### Deliveries
- `GET /api/deliveries` - Get deliveries (with driver filtering)
- `PUT /api/deliveries/[id]` - Update delivery status

### Dashboard
- `GET /api/dashboard` - Get admin dashboard statistics

### Health
- `GET /api/health` - System health check

## Development

### Adding New Features

1. **API Routes**: Add new endpoints in `src/app/api/`
2. **Components**: Create reusable components in `src/components/`
3. **Types**: Define TypeScript interfaces in `src/types/`
4. **Pages**: Add new pages in `src/app/`

### Development Tools

- **API Debugger**: Monitor API calls in real-time during development
- **Error Boundary**: Catch and handle errors gracefully
- **Toast System**: Provide user feedback for actions
- **Loading States**: Consistent loading indicators throughout the app

### Database Schema

The JSON database structure:

```json
{
  "users": [
    {
      "id": "1",
      "email": "admin@delivery.com",
      "password": "hashed_password",
      "role": "admin",
      "name": "Admin User",
      "phone": "1234567890",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "orders": [
    {
      "id": "1",
      "customerName": "Customer Name",
      "customerAddress": "Address",
      "customerPhone": "Phone",
      "productInfo": "Product Description",
      "orderValue": 299.99,
      "status": "pending",
      "assignedDriverId": null,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "deliveries": [
    {
      "id": "1",
      "orderId": "1",
      "driverId": "2",
      "status": "pending",
      "pickupTime": null,
      "deliveryTime": null,
      "notes": "",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

## Deployment

### Environment Variables

Create a `.env.local` file:

```env
JWT_SECRET=your-secret-key-here
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Production Build

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.
