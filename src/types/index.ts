export interface User {
  id: number;
  email: string;
  password: string;
  role: 'admin' | 'driver';
  name: string;
  phone?: string;
  isAvailable?: boolean;
  createdAt: string;
}

export interface Order {
  id: number;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  productInfo: string;
  orderValue: number;
  status: 'pending' | 'assigned' | 'in_progress' | 'delivered' | 'cancelled';
  assignedDriverId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Delivery {
  id: number;
  orderId: number;
  driverId: number;
  status: 'pending' | 'accepted' | 'rejected' | 'picked_up' | 'on_way' | 'delivered';
  pickupTime: string | null;
  deliveryTime: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderWithDelivery extends Order {
  delivery?: Delivery;
  assignedDriver?: User;
}

export interface DashboardStats {
  totalOrders: number;
  totalAvailableDrivers: number;
  totalCompletedOrders: number;
  totalInProgressOrders: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'driver';
  phone?: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface CreateOrderRequest {
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  productInfo: string;
  orderValue: number;
}

export interface UpdateOrderRequest extends Partial<CreateOrderRequest> {
  status?: Order['status'];
  assignedDriverId?: number | null;
}

export interface AssignDriverRequest {
  orderId: string | number;
  driverId: string | number;
}

export interface UpdateDeliveryStatusRequest {
  deliveryId: string | number;
  status: Delivery['status'];
  notes?: string;
}

export interface UpdateDriverAvailabilityRequest {
  driverId: string | number;
  isAvailable: boolean;
} 