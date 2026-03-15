import { create } from 'zustand';

export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    currency: string;
    image?: string;
}

export interface Order {
    id: string;
    date: string;
    customer: string;
    mobile: string;
    total: string;
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    info: string;
    payment: 'Paid' | 'Pending' | 'Refunded';
    items: OrderItem[];
}

interface OrderStore {
    orders: Order[];
    addOrder: (order: Omit<Order, 'id' | 'date' | 'status'>) => void;
    updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const INITIAL_ORDERS: Order[] = [];

export const useOrderStore = create<OrderStore>()(
    (set) => ({
        orders: INITIAL_ORDERS,
        addOrder: (orderData) => {
            const newOrder: Order = {
                ...orderData,
                id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
                date: new Date().toISOString().split('T')[0],
                status: 'Processing',
            };
            set((state) => ({ orders: [newOrder, ...state.orders] }));
        },
        updateOrderStatus: (orderId, status) => {
            set((state) => ({
                orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
            }));
        },
    })
);
