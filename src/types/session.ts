export interface TableSession {
  id: string;
  tenantId: string;
  locationId: string;
  tableId: string;
  status:
    | "pending"
    | "active"
    | "paying"
    | "closed"
    | "abandoned"
    | "cancelled";
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  partySize: number;
  startedAt: Date;
  endedAt?: Date;
  lastActivity: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionCart {
  id: string;
  sessionId: string;
  tenantId: string;
  locationId: string;
  status: "active" | "locked" | "abandoned";
  items: CartItem[];
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
  currency?: string;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  cartId: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  customizations?: Record<string, any>;
  specialInstructions?: string;
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  spicyLevel: number;
  addedAt: Date;
}

export interface DineInOrder {
  id: string;
  orderNumber: string;
  tenantId: string;
  locationId: string;
  sessionId: string;
  tableId: string;
  customerId?: string;
  status:
    | "placed"
    | "confirmed"
    | "preparing"
    | "ready"
    | "served"
    | "delivering"
    | "paying"
    | "paid"
    | "closed"
    | "cancelled";
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  tipAmount: number;
  totalAmount: number;
  specialInstructions?: string;
  assignedStaffId?: string;
  estimatedReadyAt?: Date;
  confirmedAt?: Date;
  readyAt?: Date;
  servedAt?: Date;
  paidAt?: Date;
  closedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  priority: "normal" | "high" | "urgent";
  placedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status:
    | "queued"
    | "in_progress"
    | "ready_item"
    | "served_item"
    | "held"
    | "cancelled_item";
  station: string;
  customizations?: Record<string, any>;
  specialInstructions?: string;
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  spicyLevel: number;
  preparationTime?: number;
  startedAt?: Date;
  readyAt?: Date;
  servedAt?: Date;
  assignedChef?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  orderId: string;
  sessionId: string;
  tenantId: string;
  amount: number;
  method: "cash" | "card" | "digital";
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  transactionId?: string;
  processedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RealtimeEvent {
  type:
    | "table.session.started"
    | "table.session.closed"
    | "table.status.changed"
    | "cart.locked"
    | "cart.unlocked"
    | "order.placed"
    | "order.confirmed"
    | "order.preparing"
    | "order.ready"
    | "order.served"
    | "order.assigned"
    | "order.delivering"
    | "order.paying"
    | "order.paid"
    | "order.closed"
    | "order.cancelled"
    | "item.started"
    | "item.ready"
    | "item.held"
    | "item.served"
    | "item.cancelled";
  tenantId: string;
  locationId: string;
  tableId?: string;
  sessionId?: string;
  orderId?: string;
  itemId?: string;
  data: any;
  timestamp: Date;
  actor?: {
    userId: string;
    role: string;
    name: string;
  };
}

export interface SessionFilters {
  status: string;
  table: string;
  dateRange: string;
  staff: string;
}

export interface OrderFilters {
  status: string;
  table: string;
  staff: string;
  priority: string;
  dateRange: string;
}
