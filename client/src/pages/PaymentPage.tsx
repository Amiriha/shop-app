import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function PaymentPage() {
  const { authority } = useParams<{ authority: string }>();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!authority || !token) {
        setStatus('failed');
        return;
      }

      try {
        const res = await api.get(`/payment/verify/${authority}`);
        if (res.data.success) {
          setStatus('success');
          setOrderId(res.data.order_id);
        } else {
          setStatus('failed');
        }
      } catch {
        setStatus('failed');
      }
    };

    verifyPayment();
  }, [authority, token]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-gray-900">در حال بررسی پرداخت</h2>
          <p className="mt-2 text-gray-600">لطفاً صبر کنید، در حال تایید تراکنش هستیم...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">پرداخت با موفقیت انجام شد</h2>
          <p className="mt-2 text-gray-600">سفارش شما ثبت گردید و در حال پردازش است.</p>
          {orderId && (
            <p className="mt-4 text-sm text-gray-500">شماره سفارش: <span className="font-mono font-medium text-gray-900">#{orderId}</span></p>
          )}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={`/orders/${orderId}`}
              className="px-6 py-3 text-base font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              مشاهده سفارش
            </Link>
            <Link
              to="/orders"
              className="px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              لیست سفارش‌ها
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">پرداخت ناموفق بود</h2>
        <p className="mt-2 text-gray-600">تراکنش تایید نشد یا لغو گردید. لطفاً دوباره تلاش کنید.</p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/cart"
            className="px-6 py-3 text-base font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            بازگشت به سبد خرید
          </Link>
          <Link
            to="/orders"
            className="px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            سفارش‌های من
          </Link>
        </div>
      </div>
    </div>
  );
}