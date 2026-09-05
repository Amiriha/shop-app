import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, Truck, CheckCircle, XCircle, Clock, Package, Eye, MoreVertical } from 'lucide-react';
import api from '../lib/api';
import { Order } from '../../types';
import { formatPrice, formatDate, getOrderStatusLabel, getOrderStatusColor } from '../../lib/utils';
import { useAuthStore } from '../store/authStore';

export default function AdminOrdersPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data: ordersResponse, isLoading } = useQuery({
    queryKey: ['adminOrders', { page, search: searchQuery, status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      // Note: The backend doesn't support search/status params yet, but we'll keep the UI ready
      const res = await api.get('/admin/orders');
      return res.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Order['status'] }) => 
      api.put(`/admin/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    },
  });

  const statusOptions: { value: Order['status']; label: string }[] = [
    { value: 'pending', label: 'در انتظار پرداخت' },
    { value: 'paid', label: 'پرداخت شده' },
    { value: 'shipped', label: 'ارسال شده' },
    { value: 'delivered', label: 'تحویل داده شده' },
    { value: 'cancelled', label: 'لغو شده' },
  ];

  const filteredOrders = ordersResponse?.filter((order: Order) => {
    if (statusFilter && order.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.id.toString().includes(query) ||
        order.user_name?.toLowerCase().includes(query) ||
        order.user_email?.toLowerCase().includes(query) ||
        order.items?.some(item => item.name.toLowerCase().includes(query))
      );
    }
    return true;
  }) || [];

  const totalPages = 1; // Since we're filtering client-side for now

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
          <h1 className="text-3xl font-bold text-gray-900">مدیریت سفارش‌ها</h1>
          <p className="mt-2 text-gray-600">مشاهده و تغییر وضعیت سفارش‌های مشتریان</p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو بر اساس شماره سفارش، نام، ایمیل..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter || ''}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white min-w-[200px]"
            >
              <option value="">همه وضعیت‌ها</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse py-4 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="h-4 bg-gray-100 rounded w-20" />
                    <div className="h-4 bg-gray-100 rounded w-32" />
                    <div className="h-4 bg-gray-100 rounded w-24" />
                    <div className="h-4 bg-gray-100 rounded w-24" />
                    <div className="h-6 bg-gray-100 rounded w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">شماره سفارش</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">مشتری</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">محصولات</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">مبلغ</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاریخ</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وضعیت</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map((order: Order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="font-mono font-medium text-gray-900">#{order.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{order.user_name}</p>
                            <p className="text-sm text-gray-500">{order.user_email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {order.items?.slice(0, 3).map((item) => (
                              <span key={item.id} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                {item.name} × {item.quantity}
                              </span>
                            ))}
                            {(order.items?.length || 0) > 3 && (
                              <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded">
                                +{(order.items?.length || 0) - 3} مورد دیگر
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{formatPrice(order.total_amount)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                            {getOrderStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={order.status}
                              onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value as Order['status'] })}
                              disabled={updateStatusMutation.isPending}
                              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                            >
                              {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                            <button
                              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              aria-label="مشاهده جزئیات"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredOrders.length === 0 && !isLoading && (
                <div className="p-12 text-center">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">سفارشی با این معیارها یافت نشد</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}