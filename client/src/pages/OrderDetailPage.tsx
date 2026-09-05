import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatPrice, formatDate, getOrderStatusLabel, getOrderStatusColor } from '../lib/utils';
import { Package, CreditCard, Truck, CheckCircle, XCircle, MapPin, User, Mail, Phone, ChevronLeft } from 'lucide-react';
import api from '../lib/api';
import { Order } from '../types';
import { useAuthStore } from '../store/authStore';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuthStore();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`);
      return res.data;
    },
    enabled: !!token && !!id,
  });

  if (isLoading) {
    return (
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/orders" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">جزئیات سفارش</h1>
          </div>
          <div className="space-y-6">
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

  if (error || !order) {
    return (
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center py-16">
          <Package className="mx-auto h-16 w-16 text-gray-400" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">سفارش یافت نشد</h2>
          <p className="mt-2 text-gray-600">سفارش مورد نظر وجود ندارد یا دسترسی به آن ندارید.</p>
          <Link
            to="/orders"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            بازگشت به سفارش‌ها
          </Link>
        </div>
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    shipped: 'bg-blue-100 text-blue-800',
    delivered: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusIcons = {
    pending: <XCircle className="h-5 w-5" />,
    paid: <CheckCircle className="h-5 w-5" />,
    shipped: <Truck className="h-5 w-5" />,
    delivered: <CheckCircle className="h-5 w-5" />,
    cancelled: <XCircle className="h-5 w-5" />,
  };

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/orders" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">سفارش #{order.id}</h1>
            <p className="text-gray-600">تاریخ ثبت: {formatDate(order.created_at)}</p>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">محصولات سفارش</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {order.items?.map((item) => (
                  <div key={item.id} className="p-6 flex gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">تعداد: {item.quantity}</p>
                      <p className="text-sm text-gray-500">قیمت واحد: {formatPrice(item.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shipping_address && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  آدرس تحویل
                </h2>
                <p className="text-gray-600 whitespace-pre-line">{order.shipping_address}</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Status Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">وضعیت سفارش</h3>
                <div className="space-y-4">
                  {[
                    { key: 'pending', label: 'در انتظار پرداخت', icon: CreditCard },
                    { key: 'paid', label: 'پرداخت شده', icon: CheckCircle },
                    { key: 'shipped', label: 'ارسال شده', icon: Truck },
                    { key: 'delivered', label: 'تحویل داده شده', icon: CheckCircle },
                    { key: 'cancelled', label: 'لغو شده', icon: XCircle },
                  ].map((step) => (
                    <div key={step.key} className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        order.status === step.key || 
                        (step.key !== 'cancelled' && 
                          ['pending', 'paid', 'shipped', 'delivered'].indexOf(step.key) < 
                          ['pending', 'paid', 'shipped', 'delivered'].indexOf(order.status))
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        <step.icon className="h-4 w-4" />
                      </div>
                      <span className={`text-sm font-medium ${
                        order.status === step.key || 
                        (step.key !== 'cancelled' && 
                          ['pending', 'paid', 'shipped', 'delivered'].indexOf(step.key) < 
                          ['pending', 'paid', 'shipped', 'delivered'].indexOf(order.status))
                          ? 'text-gray-900'
                          : 'text-gray-500'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                    {statusIcons[order.status as keyof typeof statusIcons]}
                    {getOrderStatusLabel(order.status)}
                  </span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">اطلاعات پرداخت</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">مبلغ کل</dt>
                    <dd className="font-semibold text-gray-900">{formatPrice(order.total_amount)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">وضعیت پرداخت</dt>
                    <dd className="font-medium text-gray-900">
                      {order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered'
                        ? 'پرداخت شده'
                        : 'در انتظار پرداخت'}
                    </dd>
                  </div>
                  {order.payment_id && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">شماره پیگیری</dt>
                      <dd className="font-mono text-sm text-gray-900">{order.payment_id}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* User Info */}
              {order.user_name && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">اطلاعات خریدار</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{order.user_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{order.user_email}</span>
                    </div>
                  </dl>
                </div>
              )}

              {/* Actions */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                {order.status === 'pending' && (
                  <Link
                    to={`/payment/${order.payment_id}`}
                    className="w-full block text-center py-3 px-4 text-base font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    پرداخت سفارش
                  </Link>
                )}
                <Link
                  to="/orders"
                  className="w-full block mt-3 text-center py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  بازگشت به لیست سفارش‌ها
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}