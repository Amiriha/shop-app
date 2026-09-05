import { Link, useLocation, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { ShoppingCart, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const location = useLocation();
  const { user, token, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = getItemCount();

  const navLinks = [
    { path: '/', label: 'خانه' },
    { path: '/products', label: 'محصولات' },
  ];

  const authLinks = token
    ? [
        { path: '/cart', label: 'سبد خرید', icon: ShoppingCart, badge: cartCount },
        { path: '/orders', label: 'سفارش‌های من' },
        user?.role === 'admin' && { path: '/admin', label: 'پنل ادمین', icon: LayoutDashboard },
        { path: '/profile', label: 'پروفایل', icon: User },
      ].filter(Boolean)
    : [
        { path: '/login', label: 'ورود' },
        { path: '/register', label: 'ثبت‌نام' },
      ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Global">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold text-primary-600" aria-label="Shop Home">
              ShopApp
            </Link>
            <div className="hidden md:flex md:gap-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-primary-600 ${
                      isActive ? 'text-primary-600' : 'text-gray-700'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:gap-4">
            {authLinks.map((link, i) => (
              <NavLink
                key={link.path + i}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {link.icon && <link.icon className="h-4 w-4" />}
                {link.label}
                {link.badge && link.badge > 0 && (
                  <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            ))}
            {token && (
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                خروج
              </button>
            )}
          </div>

          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t">
            <div className="space-y-2 pb-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg text-base font-medium ${
                      isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
            <div className="space-y-2 pt-4 border-t">
              {authLinks.map((link, i) => (
                <NavLink
                  key={link.path + i}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  {link.icon && <link.icon className="h-5 w-5" />}
                  {link.label}
                  {link.badge && link.badge > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              ))}
              {token && (
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-base font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <LogOut className="h-5 w-5" />
                  خروج
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}