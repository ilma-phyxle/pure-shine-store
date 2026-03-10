import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface LocalProduct {
  id: string;
  name: string;
  description?: string;
  priceAmount?: number;
  currencyCode?: string;
  imageUrl?: string;
  url?: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface LocalProductsState {
  products: LocalProduct[];
  lastUpdatedAt: number;
}

interface LocalProductsStore extends LocalProductsState {
  addProduct: (product: Omit<LocalProduct, "id" | "createdAt" | "updatedAt">) => void;
  updateProduct: (id: string, patch: Partial<Omit<LocalProduct, "id" | "createdAt" | "updatedAt">>) => void;
  removeProduct: (id: string) => void;
  replaceAll: (state: LocalProductsState) => void;
  exportJson: () => string;
}

const now = () => Date.now();

const makeId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${now()}_${Math.random().toString(16).slice(2)}`);

const DEFAULT_STATE: LocalProductsState = {
  products: [],
  lastUpdatedAt: now(),
};

export const useLocalProductsStore = create<LocalProductsStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,
      addProduct: (product) => {
        const id = makeId();
        const ts = now();
        set((s) => ({
          products: [
            ...s.products,
            {
              id,
              name: product.name.trim(),
              description: product.description?.trim() || undefined,
              priceAmount: typeof product.priceAmount === "number" && Number.isFinite(product.priceAmount) ? product.priceAmount : undefined,
              currencyCode: product.currencyCode?.trim() || undefined,
              imageUrl: product.imageUrl?.trim() || undefined,
              url: product.url?.trim() || undefined,
              active: product.active,
              createdAt: ts,
              updatedAt: ts,
            },
          ],
          lastUpdatedAt: ts,
        }));
      },
      updateProduct: (id, patch) => {
        const ts = now();
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...patch,
                  name: patch.name !== undefined ? patch.name.trim() : p.name,
                  description: patch.description !== undefined ? patch.description.trim() || undefined : p.description,
                  currencyCode: patch.currencyCode !== undefined ? patch.currencyCode.trim() || undefined : p.currencyCode,
                  imageUrl: patch.imageUrl !== undefined ? patch.imageUrl.trim() || undefined : p.imageUrl,
                  url: patch.url !== undefined ? patch.url.trim() || undefined : p.url,
                  priceAmount:
                    patch.priceAmount !== undefined
                      ? typeof patch.priceAmount === "number" && Number.isFinite(patch.priceAmount)
                        ? patch.priceAmount
                        : undefined
                      : p.priceAmount,
                  updatedAt: ts,
                }
              : p
          ),
          lastUpdatedAt: ts,
        }));
      },
      removeProduct: (id) => {
        const ts = now();
        set((s) => ({ products: s.products.filter((p) => p.id !== id), lastUpdatedAt: ts }));
      },
      replaceAll: (state) => {
        set({
          products: Array.isArray(state.products) ? state.products : DEFAULT_STATE.products,
          lastUpdatedAt: typeof state.lastUpdatedAt === "number" ? state.lastUpdatedAt : now(),
        });
      },
      exportJson: () => JSON.stringify({ products: get().products, lastUpdatedAt: get().lastUpdatedAt }, null, 2),
    }),
    {
      name: "local-products-admin",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

