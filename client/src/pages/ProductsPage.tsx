import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Product } from '../types';
import ProductList from '../components/products/ProductList';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    },
  });

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ['products', { page, search: searchQuery, category: selectedCategory }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const res = await api.get(`/products?${params.toString()}`);
      return res.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((category: string | null) => {
    setSelectedCategory(category);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">همه محصولات</h1>
          <p className="mt-2 text-gray-600">پیدا کنید که به دنبال چه هستید</p>
        </div>
        <ProductList
          products={productsResponse?.products || []}
          total={productsResponse?.total || 0}
          page={page}
          limit={12}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          onCategoryChange={handleCategoryChange}
          categories={categories}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          isLoading={isLoading || categoriesLoading}
        />
      </div>
    </div>
  );
}