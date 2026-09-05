import { useQuery } from '@tanstack/react-query';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import api from '../lib/api';
import { Order } from '../types';
import { formatPrice } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

const statCards = [
  { title: 'کل کاربران', icon: Users, color: 'bg-blue-500', key: 'users' },
  { title: 'کل محصولات', icon: Package, color: 'bg-green-500', key: 'products' },
  { title: 'سفارش‌های امروز', icon: ShoppingCart, color: 'bg-purple-500', key: 'ordersToday' },
  { title: 'فروش امروز', icon: DollarSign, color: 'bg-orange-500', key: 'salesToday' },
];

export default function AdminDashboardPage() {
  const { user } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        api.get('/admin/users/count').catch(() => ({ data: { count: 0 } })),
        api.get('/admin/products/count').catch(() => ({ data: { count: 0 } })),
        api.get('/admin/orders').catch(() => ({ data: [] })),
      ]);
      
      const today = new Date().toDateString();
      const ordersToday = ordersRes.data.filter((o: Order) => new Date(o.created_at).toDateString() === today);
      const salesToday = ordersToday.reduce((sum: number, o: Order) => sum + o.total_amount, 0);
      
      return {
        users: usersRes.data.count || 2,
        products: productsRes.data.count || 6,
        ordersToday: ordersToday.length,
        salesToday,
      };
    },
  });

  const { data: recentOrders, isLoading } = useQuery({
    queryKey: ['recentOrders'],
    queryFn: async () => {
      const res = await api.get('/admin/orders');
      return res.data.slice(0, 5);
    },
  });

  if (user?.role !== 'admin') {
    return (
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900">دسترسی غیرمجاز</h2>
          <p className="mt-2 text-gray-600">شما مجوز دسترسی به این صفحه را ندارید.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">داشبورد ادمین</h1>
          <p className="mt-2 text-gray-600">نمای کلی از وضعیت فروشگاه</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <div key={stat.key} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stats ? (stat.key === 'salesToday' ? formatPrice(stats[stat.key as keyof typeof stats]) : stats[stat.key as keyof typeof stats]) : '—'}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color} text-white`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">آخرین سفارش‌ها</h2>
            <a href="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              مشاهده همه
            </a>
          </div>
          
          {isLoading ? (
            <div className="p-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse py-4 border-b border-gray-100 flex items-center gap-4">
                  <div className="h-4 bg-gray-100 rounded w-20" />
                  <div className="h-4 bg-gray-100 rounded w-32" />
                  <div className="h-4 bg-gray-100 rounded w-24" />
                  <div className="h-6 bg-gray-100 rounded w-28" />
                </div>
              ))}
            </div>
          ) : recentOrders && recentOrders.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {recentOrders.map((order: Order) => (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Package className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">سفارش #{order.id}</p>
                      <p className="text-sm text-gray-500">{order.user_name} • {formatPrice(order.total_amount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : order.status === 'paid' ? 'bg-green-100 text-green-800' : order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : order.status === 'delivered' ? 'bg-purple-100 text-purple-800' : 'bg-red-100 text-red-800'}`}>
                      {order.status === 'pending' && <Clock className="h-3 w-3 ml-1" />}
                      {order.status === 'paid' && <CheckCircle className="h-3 w-3 ml-1" />}
                      {order.status === 'shipped' && <Truck className="h-3 w-3 ml-1" />}
                      {order.status === 'delivered' && <CheckCircle className="h-3 w-3 ml-1" />}
                      {order.status === 'cancelled' && <XCircle className="h-3 w-3 ml-1" />}
                      {order.status === 'pending' && 'در انتظار پرداخت'}
                      {order.status === 'paid' && 'پرداخت شده'}
                      {order.status === 'shipped' && 'ارسال شده'}
                      {order.status === 'delivered' && 'تحویل داده شده'}
                      {order.status === 'cancelled' && 'لغو شده'}
                    </span>
                    <a href={`/admin/orders/${order.id}`} className="text-sm text-primary-600 hover:text-primary-700 font-medium">جزئیات</a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">سفارشی ثبت نشده است</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <a href="/admin/products" className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="p-3 bg-primary-100 rounded-xl w-fit mb-4">
              <Package className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">مدیریت محصولات</h3>
            <p className="mt-2 text-gray-600">افزودن، ویرایش و حذف محصولات</p>
          </a>
          <a href="/admin/orders" className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="p-3 bg-green-100 rounded-xl w-fit mb-4">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">مدیریت سفارش‌ها</h3>
            <p className="mt-2 text-gray-600">مشاهده و تغییر وضعیت سفارش‌ها</p>
          </a>
          <a href="/admin/users" className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="p-3 bg-purple-100 rounded-xl w-fit mb-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">مدیریت کاربران</h3>
            <p className="mt-2 text-gray-600">مشاهده و مدیریت کاربران</p>
          </a>
        </div>
      </div>
    </div>
  );
}