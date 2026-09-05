import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { formatPrice, formatDate, getOrderStatusLabel, getOrderStatusColor } from '../../lib/utils';
import { ChevronRight, Package, CreditCard, Truck, CheckCircle, XCircle } from 'lucide-react';
import api from '../../lib/api';
import { Order } from '../../types';
import { useAuthStore } from '../../store/authStore';

export default function OrdersPage() {
  const { token } = useAuthStore();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data;
    },
    enabled: !!token,
  });

  if (!token) {
    return (
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center py-16">
          <Package className="mx-auto h-16 w-16 text-gray-400" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">برای مشاهده سفارش‌ها وارد شوید</h2>
          <p className="mt-2 text-gray-600">ورود به حساب کاربری خود برای دسترسی به تاریخچه سفارش‌ها</p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            ورود به حساب
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">سفارش‌های من</h1>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="h-12 bg-gray-100 rounded w-1/4" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">سفارش‌های من</h1>

        {orders && orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">سفارشی یافت نشد</h2>
            <p className="mt-2 text-gray-600">شما هنوز سفارشی ثبت نکرده‌اید.</p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              خرید محصول
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders?.map((order: Order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-100 rounded-xl">
                      <Package className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">سفارش #{order.id}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 md:flex-row flex-col md:flex-row md:items-center">
                    <div className="text-right md:text-left">
                      <p className="text-lg font-bold text-gray-900">{formatPrice(order.total_amount)}</p>
                      <p className="text-sm text-gray-500">{order.items?.length || 0} آیتم</p>
                    </div>

                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusLabel(order.status)}
                    </span>

                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}