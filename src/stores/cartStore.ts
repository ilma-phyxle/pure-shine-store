import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  type ShopifyProduct,
  createShopifyCart,
  addLineToShopifyCart,
  updateShopifyCartLine,
  removeLineFromShopifyCart,
  storefrontApiRequest,
  CART_QUERY,
} from '@/lib/shopify';

export type { ShopifyProduct };

export type CartItemType = 'shopify' | 'catalog';

export interface BaseCartItem {
  type: CartItemType;
  id: string; // Global unique ID for this cart entry
  productId: string; // The source product ID
  name: string;
  image?: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
}

export interface ShopifyCartItem extends BaseCartItem {
  type: 'shopify';
  shopifyVariantId: string;
  shopifyLineId: string | null;
  shopifyData: ShopifyProduct;
  selectedOptions: Array<{ name: string; value: string }>;
}

export interface CatalogCartItem extends BaseCartItem {
  type: 'catalog';
}

export type UnifiedCartItem = ShopifyCartItem | CatalogCartItem;

export type UnifiedCartItemInput =
  | (Omit<ShopifyCartItem, 'id' | 'shopifyLineId'> & { type: 'shopify' })
  | (Omit<CatalogCartItem, 'id'> & { type: 'catalog' });

interface CartStore {
  items: UnifiedCartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  addItem: (item: UnifiedCartItemInput) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,

      addItem: async (itemData) => {
        const { items, cartId, clearCart } = get();

        // Find existing item by product ID (and variant ID for Shopify)
        const existingItem = items.find(i => {
          if (i.type === 'shopify' && itemData.type === 'shopify') {
            return i.shopifyVariantId === itemData.shopifyVariantId;
          }
          return i.productId === itemData.productId && i.type === itemData.type;
        });

        // If it's a catalog item, we don't sync with Shopify
        if (itemData.type === 'catalog') {
          if (existingItem) {
            set({
              items: items.map(i => i.id === existingItem.id ? { ...i, quantity: i.quantity + itemData.quantity } : i)
            });
          } else {
            const newItem: CatalogCartItem = {
              ...itemData,
              type: 'catalog',
              id: `catalog-${Date.now()}-${itemData.productId}`
            };
            set({ items: [...items, newItem] });
          }
          return;
        }

        // Shopify Logic
        set({ isLoading: true });
        try {
          // Convert Unified input to Shopify's expected format for the lib functions
          const shopifyItem = {
            lineId: null,
            product: itemData.shopifyData,
            variantId: itemData.shopifyVariantId,
            variantTitle: itemData.name, // Approximate
            price: itemData.price,
            quantity: itemData.quantity,
            selectedOptions: itemData.selectedOptions
          } as any;

          if (!cartId) {
            const result = await createShopifyCart(shopifyItem);
            if (result) {
              const newItem: ShopifyCartItem = {
                ...itemData,
                id: `shopify-${Date.now()}-${itemData.shopifyVariantId}`,
                shopifyLineId: result.lineId,
              } as ShopifyCartItem;
              set({ cartId: result.cartId, checkoutUrl: result.checkoutUrl, items: [...items, newItem] });
            }
          } else if (existingItem && existingItem.type === 'shopify') {
            const newQuantity = existingItem.quantity + itemData.quantity;
            if (!existingItem.shopifyLineId) return;
            const result = await updateShopifyCartLine(cartId, existingItem.shopifyLineId, newQuantity);
            if (result.success) {
              set({ items: items.map(i => i.id === existingItem.id ? { ...i, quantity: newQuantity } : i) });
            } else if (result.cartNotFound) clearCart();
          } else {
            const result = await addLineToShopifyCart(cartId, shopifyItem);
            if (result.success) {
              const newItem: ShopifyCartItem = {
                ...itemData,
                id: `shopify-${Date.now()}-${itemData.shopifyVariantId}`,
                shopifyLineId: result.lineId ?? null,
              } as ShopifyCartItem;
              set({ items: [...items, newItem] });
            } else if (result.cartNotFound) clearCart();
          }
        } catch (error) {
          console.error('Failed to add item:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (id, quantity) => {
        if (quantity <= 0) { await get().removeItem(id); return; }
        const { items, cartId, clearCart } = get();
        const item = items.find(i => i.id === id);
        if (!item) return;

        if (item.type === 'catalog') {
          set({ items: items.map(i => i.id === id ? { ...i, quantity } : i) });
          return;
        }

        if (!item.shopifyLineId || !cartId) return;
        set({ isLoading: true });
        try {
          const result = await updateShopifyCartLine(cartId, item.shopifyLineId, quantity);
          if (result.success) {
            set({ items: items.map(i => i.id === id ? { ...i, quantity } : i) });
          } else if (result.cartNotFound) clearCart();
        } catch (error) {
          console.error('Failed to update quantity:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (id) => {
        const { items, cartId, clearCart } = get();
        const item = items.find(i => i.id === id);
        if (!item) return;

        if (item.type === 'catalog') {
          const newItems = items.filter(i => i.id !== id);
          set({ items: newItems });
          return;
        }

        if (!item.shopifyLineId || !cartId) return;
        set({ isLoading: true });
        try {
          const result = await removeLineFromShopifyCart(cartId, item.shopifyLineId);
          if (result.success) {
            const newItems = items.filter(i => i.id !== id);
            newItems.length === 0 ? clearCart() : set({ items: newItems });
          } else if (result.cartNotFound) clearCart();
        } catch (error) {
          console.error('Failed to remove item:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
      getCheckoutUrl: () => get().checkoutUrl,

      syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return;
        set({ isSyncing: true });
        try {
          const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
          if (!data) return;
          const cart = data?.data?.cart;
          if (!cart || cart.totalQuantity === 0) clearCart();
        } catch (error) {
          console.error('Failed to sync cart:', error);
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: 'shopify-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, cartId: state.cartId, checkoutUrl: state.checkoutUrl }),
    }
  )
);
