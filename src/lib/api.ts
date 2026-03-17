import axios from 'axios';

// Detect if we are running locally or on the production server
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BASE_URL = isLocal ? 'http://127.0.0.1:8000/api/' : '/api/';

// Create an Axios instance configured for the Laravel API
export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

export interface ApiSubCategory {
    id: number;
    category_id: number;
    name: string;
    slug: string;
    description: string | null;
    category?: ApiCategory;
    created_at: string;
    updated_at: string;
}

export interface ApiCategory {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    sub_categories?: ApiSubCategory[];
    created_at: string;
    updated_at: string;
}

export interface ApiProductVariant {
    id?: number;
    product_id?: number;
    name: string;
    price: number;
    discount_price: number | null;
    created_at?: string;
    updated_at?: string;
}

export interface ApiProduct {
    id: number;
    category_id: number;
    sub_category_id: number | null;
    name: string;
    brand: string | null;
    slug: string;
    description: string | null;
    price: number;
    image_url: string | null;
    image_url_2: string | null;
    image_url_3: string | null;
    category?: ApiCategory;
    sub_category?: ApiSubCategory;
    is_new_arrival: boolean;
    is_hot_deal: boolean;
    discount_price: number | null;
    variants?: ApiProductVariant[];
    created_at: string;
    updated_at: string;
}

export interface ApiContactMessage {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    created_at: string;
    updated_at: string;
}

// Category Services
export const getCategories = () => api.get<ApiCategory[]>('categories').then(res => res.data);
export const createCategory = (data: Partial<ApiCategory>) => api.post<ApiCategory>('categories', data).then(res => res.data);
export const updateCategory = (id: number, data: Partial<ApiCategory>) => api.put<ApiCategory>(`categories/${id}`, data).then(res => res.data);
export const deleteCategory = (id: number) => api.delete(`categories/${id}`);

// SubCategory Services
export const getSubCategories = () => api.get<ApiSubCategory[]>('sub-categories').then(res => res.data);
export const createSubCategory = (data: Partial<ApiSubCategory>) => api.post<ApiSubCategory>('sub-categories', data).then(res => res.data);
export const updateSubCategory = (id: number, data: Partial<ApiSubCategory>) => api.put<ApiSubCategory>(`sub-categories/${id}`, data).then(res => res.data);
export const deleteSubCategory = (id: number) => api.delete(`sub-categories/${id}`);

// Product Services
export const getProducts = (params?: { category_id?: number | null, sub_category_id?: number | null, limit?: number, is_new_arrival?: boolean, is_hot_deal?: boolean, brand?: string | null }) => 
    api.get<ApiProduct[]>('products', { params }).then(res => res.data);
export const getProduct = (id: number | string) => api.get<ApiProduct>(`products/${id}`).then(res => res.data);
export const createProduct = (data: Partial<ApiProduct>) => api.post<ApiProduct>('products', data).then(res => res.data);
export const updateProduct = (id: number, data: Partial<ApiProduct>) => api.put<ApiProduct>(`products/${id}`, data).then(res => res.data);
export const deleteProduct = (id: number) => api.delete(`products/${id}`);

// Contact Message Services
export const getContactMessages = () => api.get<ApiContactMessage[]>('contact-messages').then(res => res.data);
export const createContactMessage = (data: Partial<ApiContactMessage>) => api.post<ApiContactMessage>('contact-messages', data).then(res => res.data);
export const deleteContactMessage = (id: number) => api.delete(`contact-messages/${id}`);

export interface ApiOrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    currency: string;
    image?: string;
    variant_id?: string;
}

export interface ApiOrder {
    id: number;
    customer: string;
    mobile: string | null;
    total: string | null;
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    payment: 'Paid' | 'Pending' | 'Refunded';
    info: string | null;
    items: ApiOrderItem[] | null;
    created_at: string;
    updated_at: string;
}

// Order Services
export const getOrders = () => api.get<ApiOrder[]>('orders').then(res => res.data);
export const createOrder = (data: Partial<ApiOrder>) => api.post<ApiOrder>('orders', data).then(res => res.data);
export const updateOrder = (id: number, data: Partial<ApiOrder>) => api.put<ApiOrder>(`orders/${id}`, data).then(res => res.data);
export const deleteOrder = (id: number) => api.delete(`orders/${id}`);

export interface ApiDashboardStats {
    kpis: {
        total_orders: number;
        total_revenue: number;
        active_products: number;
        low_stock: number;
    };
    recent_orders: ApiOrder[];
}

export const getDashboardStats = () => api.get<ApiDashboardStats>('stats/dashboard').then(res => res.data);

// Site Settings Services
export const getSiteSettings = () => api.get<Record<string, any>>('site-settings').then(res => res.data);
export const updateSiteSettings = (settings: Record<string, any>) => api.post('site-settings/bulk', settings).then(res => res.data);

