import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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

const INITIAL_ORDERS: Order[] = [
    {
        id: "ORD-9281",
        date: "2024-03-08",
        customer: "Amjad H.",
        mobile: "+61 412 345 678",
        total: "AUD 124.50",
        status: "Processing",
        info: "3x Heavy Duty Degreaser",
        payment: "Paid",
        items: [{ id: "p1", name: "Heavy Duty Degreaser", quantity: 3, price: 41.50, currency: "AUD" }]
    },
    {
        id: "ORD-9280",
        date: "2024-03-08",
        customer: "Sarah M.",
        mobile: "+61 488 765 432",
        total: "AUD 45.20",
        status: "Shipped",
        info: "1x Glass Shine Spray",
        payment: "Paid",
        items: [{ id: "p2", name: "Glass Shine Spray", quantity: 1, price: 45.20, currency: "AUD" }]
    }
];

export const useOrderStore = create<OrderStore>()(
    persist(
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
        }),
        {
            name: 'pure-shine-orders',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
