import { useQuery } from '@tanstack/react-query';
import { storefrontApiRequest, PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY, type ShopifyProduct } from '@/lib/shopify';

export function useShopifyProducts(first = 50, queryFilter?: string) {
  return useQuery({
    queryKey: ['shopify-products', first, queryFilter],
    queryFn: async () => {
      const data = await storefrontApiRequest(PRODUCTS_QUERY, { first, query: queryFilter || null });
      return (data?.data?.products?.edges || []) as ShopifyProduct[];
    },
  });
}

export function useShopifyProduct(handle: string) {
  return useQuery({
    queryKey: ['shopify-product', handle],
    queryFn: async () => {
      const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
      return data?.data?.productByHandle || null;
    },
    enabled: !!handle,
  });
}
