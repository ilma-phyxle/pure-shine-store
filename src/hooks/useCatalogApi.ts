import { useQuery } from '@tanstack/react-query';
import { getCategories, getProducts, ApiCategory, ApiProduct } from '@/lib/api';

export interface CatalogData {
    categories: ApiCategory[];
    products: ApiProduct[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Hook to fetch catalog (categories + products) from the Laravel database API.
 * Uses React Query for caching and request de-duplication.
 */
export const useCatalogApi = (): CatalogData => {
    const categoriesQuery = useQuery({
        queryKey: ['catalog-categories'],
        queryFn: getCategories,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const productsQuery = useQuery({
        queryKey: ['catalog-products'],
        queryFn: getProducts,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return {
        categories: categoriesQuery.data || [],
        products: productsQuery.data || [],
        isLoading: categoriesQuery.isLoading || productsQuery.isLoading,
        error: (categoriesQuery.error as Error)?.message || (productsQuery.error as Error)?.message || null,
        refetch: () => {
            categoriesQuery.refetch();
            productsQuery.refetch();
        }
    };
};
