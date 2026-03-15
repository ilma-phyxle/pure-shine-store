import { useQuery } from '@tanstack/react-query';
import { getCategories, getProducts, getProduct, getSubCategories, ApiCategory, ApiProduct, ApiSubCategory } from '@/lib/api';

export interface CatalogData {
    categories: ApiCategory[];
    subCategories: ApiSubCategory[];
    products: ApiProduct[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Hook to fetch catalog (categories + subcategories + products) from the Laravel database API.
 * Uses React Query for caching and request de-duplication.
 */
export const useCatalogApi = (params?: { category_id?: number | null, sub_category_id?: number | null, limit?: number, is_new_arrival?: boolean, is_hot_deal?: boolean, brand?: string | null }): CatalogData => {
    const categoriesQuery = useQuery({
        queryKey: ['catalog-categories'],
        queryFn: getCategories,
        staleTime: 1000 * 60 * 60, // 1 hour (categories don't change often)
    });

    const subCategoriesQuery = useQuery({
        queryKey: ['catalog-subcategories'],
        queryFn: getSubCategories,
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    const productsQuery = useQuery({
        queryKey: ['catalog-products', params?.category_id, params?.sub_category_id, params?.limit, params?.is_new_arrival, params?.is_hot_deal, params?.brand],
        queryFn: () => getProducts(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        placeholderData: (previousData) => previousData, // Keep data while loading next category
    });

    return {
        categories: Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [],
        subCategories: Array.isArray(subCategoriesQuery.data) ? subCategoriesQuery.data : [],
        products: Array.isArray(productsQuery.data) ? productsQuery.data : [],
        isLoading: categoriesQuery.isLoading || subCategoriesQuery.isLoading || (productsQuery.isLoading && !productsQuery.data),
        error: (categoriesQuery.error as Error)?.message || (subCategoriesQuery.error as Error)?.message || (productsQuery.error as Error)?.message || null,
        refetch: () => {
            categoriesQuery.refetch();
            subCategoriesQuery.refetch();
            productsQuery.refetch();
        }
    };
};

export const useCatalogProduct = (id: number | string | null) => {
    return useQuery({
        queryKey: ['catalog-product', id],
        queryFn: () => getProduct(id!),
        enabled: !!id,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
};
