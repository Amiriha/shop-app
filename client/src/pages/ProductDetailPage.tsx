import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { Product } from '../../types';
import { formatPrice } from '../../lib/utils';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { token } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
            <div className="space-y-6">
              <div className="h-8 bg-gray-100 rounded w-1/3 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
              <div className="h-12 bg-gray-100 rounded w-1/4 animate-pulse" />
              <div className="h-48 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RotateCcw className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">محصول یافت نشد</h2>
          <p className="mt-2 text-gray-600">محصولی با این شناسه وجود ندارد یا حذف شده است.</p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            بازگشت به محصولات
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!token) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    addItem({
      product_id: product.id,
      quantity,
      name: product.name,
      price: product.price,
      image_url: product.image_url || '',
      stock: product.stock,
    });
    // Could show a toast notification here
  };

  const handleBuyNow = () => {
    if (!token) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    addItem({
      product_id: product.id,
      quantity,
      name: product.name,
      price: product.price,
      image_url: product.image_url || '',
      stock: product.stock,
    });
    navigate('/cart');
  };

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-600" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-gray-900">خانه</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/products" className="hover:text-gray-900">محصولات</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="px-6 py-3 bg-red-600 text-white text-lg font-medium rounded-xl">موجود نیست</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {product.category && (
              <span className="inline-block px-3 py-1 text-sm font-medium text-primary-700 bg-primary-100 rounded-full">
                {product.category}
              </span>
            )}

            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-sm text-gray-600">(۰ نظر)</span>
            </div>

            <div className="text-3xl font-bold text-primary-600">
              {formatPrice(product.price)}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">توضیحات محصول</h3>
              <p className="text-gray-600 whitespace-pre-line">{product.description || 'توضیحات موجود نیست'}</p>
            </div>

            {/* Quantity Selector */}
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">تعداد</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="کاهش تعداد"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="px-6 py-2 text-lg font-medium text-gray-900 min-w-[50px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="افزایش تعداد"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  موجود در انبار: {product.stock}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  افزودن به سبد خرید
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  خرید فوری
                </button>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Heart className="h-5 w-5" />
                  علاقه‌مندی
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="h-5 w-5" />
                  اشتراک‌گذاری
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="pt-6 border-t border-gray-200 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Truck className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="font-medium text-gray-900">ارسال رایگان</p>
                  <p className="text-sm text-gray-500">برای سفارش‌های بالای ۲ میلیون</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Shield className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="font-medium text-gray-900">ضمانت اصالت</p>
                  <p className="text-sm text-gray-500">محصولات ۱۰۰٪ اورجینال</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <RotateCcw className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="font-medium text-gray-900">مرجوعی آسان</p>
                  <p className="text-sm text-gray-500">۷ روز مرجوعی تضمینی</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Shield className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="font-medium text-gray-900">پرداخت امن</p>
                  <p className="text-sm text-gray-500">تراکنش‌های رمزنگاری شده</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}