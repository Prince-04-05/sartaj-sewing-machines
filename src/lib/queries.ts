import { queryOptions } from "@tanstack/react-query";
import { getHomeData, getProduct, getSettings, listCategories, listGallery, listProducts } from "./catalog.functions";

export const settingsQuery = queryOptions({ queryKey: ["settings"], queryFn: () => getSettings(), staleTime: 60_000 });
export const homeQuery = queryOptions({ queryKey: ["home"], queryFn: () => getHomeData(), staleTime: 30_000 });
export const productsQuery = queryOptions({ queryKey: ["products"], queryFn: () => listProducts(), staleTime: 30_000 });
export const categoriesQuery = queryOptions({ queryKey: ["categories"], queryFn: () => listCategories(), staleTime: 60_000 });
export const galleryQuery = queryOptions({ queryKey: ["gallery"], queryFn: () => listGallery(), staleTime: 30_000 });
export const productQuery = (slug: string) =>
  queryOptions({ queryKey: ["product", slug], queryFn: () => getProduct({ data: { slug } }), staleTime: 30_000 });
