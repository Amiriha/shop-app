import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Plus, Minus, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

export default function CartPage() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { items, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');

  const total = getTotal();
  const itemCount = getItemCount();

  const handleCheckout = async () => {
    if (!token) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/orders', { shipping_address: shippingAddress });
      navigate(`/payment/${res.data.id}`);
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">سبد خرید شما خالی است</h2>
            <p className="mt-2 text-gray-600">برای خرید، ابتدا وارد حساب کاربری خود شوید.</p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="px-6 py-3 text-base font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                ورود به حساب
              </Link>
              <Link
                to="/products"
                className="px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ادامه خرید
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">سبد خرید شما خالی است</h2>
            <p className="mt-2 text-gray-600">هنوز محصولی به سبد خرید اضافه نکرده‌اید.</p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              ادامه خرید
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">سبد خرید ({itemCount})</h1>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                <div className="relative h-24 w-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product_id}`} className="font-medium text-gray-900 hover:text-primary-600">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-gray-500">{formatPrice(item.price)}</p>
                  
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="کاهش تعداد"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-3 py-2 text-sm font-medium text-gray-900 min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="افزایش تعداد"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      موجود: {item.stock}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    aria-label="حذف از سبد خرید"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">خلاصه سفارش</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">مجموع محصولات ({itemCount})</span>
                  <span className="font-medium text-gray-900">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">هزینه ارسال</span>
                  <span className="font-medium text-gray-900">
                    {total >= 2000000 ? 'رایگان' : formatPrice(50000)}
                  </span>
                </div>
                {total > 0 && total < 2000000 && (
                  <p className="text-xs text-primary-600 bg-primary-50 px-3 py-2 rounded-lg">
                    برای رسیدن به ارسال رایگان {formatPrice(2000000 - total)} کم دارید
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">مبلغ قابل پرداخت</span>
                  <span className="text-primary-600">
                    {formatPrice(total >= 2000000 ? total : total + 50000)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 mb-2">آدرس تحویل</span>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    rows={3}
                    placeholder="آدرس کامل تحویل را وارد کنید..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </label>

                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting || !shippingAddress.trim()}
                  className="w-full py-3.5 px-6 text-base font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'در حال پردازش...' : 'تسویه حساب و پرداخت'}
                </button>

                <button
                  onClick={() => { if (window.confirm('آیا از خالی کردن سبد خرید مطمئن هستید؟')) clearCart(); }}
                  className="w-full py-2.5 px-6 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  خالی کردن سبد خرید
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}