import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import catalogData from "../cleaners_outlet_catalog.json";

export interface StoreInfo {
  name: string;
  tagline: string;
  website: string;
  currency: string;
  location: string;
  logo_url: string;
}

export interface NavItem {
  id: string;
  label: string;
  path: string;
}

export interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  brand: string;
  short_description: string;
  description: string;
  category_id: string;
  category_name: string;
  subcategory: string;
  image_url: string;
  gallery: string[];
  tags: string[];
  in_stock: boolean;
  product_url: string;
  sku: string;
  price: string;
  currency: string;
  specifications?: Record<string, string>;
  variants?: { name: string; sku: string }[];
}

export interface FullCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color_hex: string;
  background_hex: string;
  image_url: string;
  banner_url: string;
  product_count: number;
  source_url: string;
  products: ProductDetail[];
}

export interface CatalogState {
  store: StoreInfo;
  navigation: NavItem[];
  categories: FullCategory[];
  lastUpdatedAt: number;
}

interface CatalogStore extends CatalogState {
  // Store Settings
  updateStore: (patch: Partial<StoreInfo>) => void;
  // Navigation
  addNavItem: (item: Omit<NavItem, "id">) => void;
  updateNavItem: (id: string, patch: Partial<Omit<NavItem, "id">>) => void;
  removeNavItem: (id: string) => void;
  // Categories
  addCategory: (category: Omit<FullCategory, "id" | "products">) => string;
  updateCategory: (id: string, patch: Partial<Omit<FullCategory, "id" | "products">>) => void;
  removeCategory: (id: string) => void;
  // Products
  addProduct: (categoryId: string, product: Omit<ProductDetail, "id">) => string;
  updateProduct: (categoryId: string, productId: string, patch: Partial<Omit<ProductDetail, "id">>) => void;
  removeProduct: (categoryId: string, productId: string) => void;
  // Global
  replaceAll: (state: CatalogState) => void;
  exportJson: () => string;
}

const now = () => Date.now();

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const makeId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${now()}_${Math.random().toString(16).slice(2)}`);

const DEFAULT_CATALOG: CatalogState = {
  store: catalogData.store,
  navigation: catalogData.navigation.map((n, i) => ({ ...n, id: `nav-${i}` })),
  categories: catalogData.categories as FullCategory[],
  lastUpdatedAt: now(),
};

export const useCatalogStore = create<CatalogStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_CATALOG,
      updateStore: (patch) => set((s) => ({ store: { ...s.store, ...patch }, lastUpdatedAt: now() })),
      addNavItem: (item) => set((s) => ({ navigation: [...s.navigation, { ...item, id: makeId() }], lastUpdatedAt: now() })),
      updateNavItem: (id, patch) =>
        set((s) => ({
          navigation: s.navigation.map((n) => (n.id === id ? { ...n, ...patch } : n)),
          lastUpdatedAt: now(),
        })),
      removeNavItem: (id) => set((s) => ({ navigation: s.navigation.filter((n) => n.id !== id), lastUpdatedAt: now() })),
      addCategory: (cat) => {
        const id = makeId();
        const slug = cat.slug?.trim() ? slugify(cat.slug) : slugify(cat.name);
        set((s) => ({
          categories: [...s.categories, { ...cat, id, slug, products: [] }],
          lastUpdatedAt: now(),
        }));
        return id;
      },
      updateCategory: (id, patch) => {
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id
              ? {
                ...c,
                ...patch,
                slug: patch.slug ? slugify(patch.slug) : c.slug,
              }
              : c
          ),
          lastUpdatedAt: now(),
        }));
      },
      removeCategory: (id) => set((s) => ({ categories: s.categories.filter((c) => c.id !== id), lastUpdatedAt: now() })),
      addProduct: (categoryId, prod) => {
        const id = makeId();
        const slug = prod.slug?.trim() ? slugify(prod.slug) : slugify(prod.name);
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === categoryId
              ? {
                ...c,
                products: [...c.products, { ...prod, id, slug, currency: prod.currency || s.store.currency }],
              }
              : c
          ),
          lastUpdatedAt: now(),
        }));
        return id;
      },
      updateProduct: (categoryId, productId, patch) => {
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === categoryId
              ? {
                ...c,
                products: c.products.map((p) =>
                  p.id === productId
                    ? {
                      ...p,
                      ...patch,
                      slug: patch.slug ? slugify(patch.slug) : p.slug,
                    }
                    : p
                ),
              }
              : c
          ),
          lastUpdatedAt: now(),
        }));
      },
      removeProduct: (categoryId, productId) => {
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === categoryId ? { ...c, products: c.products.filter((p) => p.id !== productId) } : c
          ),
          lastUpdatedAt: now(),
        }));
      },
      replaceAll: (state) => set({ ...state, lastUpdatedAt: now() }),
      exportJson: () => JSON.stringify({ store: get().store, navigation: get().navigation.map(({ id, ...n }) => n), categories: get().categories, lastUpdatedAt: get().lastUpdatedAt }, null, 2),
    }),
    {
      name: "catalog-admin-pro",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
