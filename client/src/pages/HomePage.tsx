import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ShoppingCart, Truck, Shield, Headphones } from 'lucide-react';
import api from '../lib/api';
import { Product } from '../types';
import ProductCard from '../products/ProductCard';

const features = [
  { icon: Truck, title: 'ارسال رایگان', description: 'برای سفارش‌های بالای ۲ میلیون تومان' },
  { icon: Shield, title: 'پرداخت امن', description: 'تراکنش‌های رمزنگاری شده و مطمئن' },
  { icon: Headphones, title: 'پشتیبانی ۲۴/۷', description: 'تیم پشتیبانی همیشه در خدمت شما' },
];

export default function HomePage() {
  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const res = await api.get('/products?limit=8');
      return res.data;s
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
              خرید آنلاین <span className="text-primary-600">آسان</span> و <span className="text-primary-600">امن</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              بهترین محصولات را با بهترین قیمت‌ها پیدا کنید. تجربه خرید سریع، لذت‌بخش و بدون نگرانی.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/products"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                خریداکنون
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/products"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                مشاهده محصولات
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 mb-4">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">محصولات پیشنهادی</h2>
              <p className="mt-2 text-gray-600">انتخاب‌های ما برای شما</p>
            </div>
            <Link
              to="/products"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              مشاهده همه
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : productsResponse?.products && productsResponse.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productsResponse.products.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">محصولی برای نمایش وجود ندارد</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">آماده‌ید خرید را شروع کنید؟</h2>
          <p className="mt-4 text-lg text-primary-100 max-w-2xl mx-auto">
            همین الان ثبت‌نام کنید و از تخفیف‌های ویژه و ارسال رایگان بهره‌مند شوید.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3.5 text-base font-semibold text-primary-600 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            >
              ثبت‌نام رایگان
            </Link>
            <Link
              to="/products"
              className="px-8 py-3.5 text-base font-semibold text-white border-2 border-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              خرید بدون ثبت‌نام
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}