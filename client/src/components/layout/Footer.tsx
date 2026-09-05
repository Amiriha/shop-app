import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Github } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'درباره ما', href: '#' },
      { label: 'فرصت‌های شغلی', href: '#' },
      { label: 'وبلاگ', href: '#' },
      { label: 'تماس با ما', href: '#' },
    ],
    support: [
      { label: 'راهنمای خرید', href: '#' },
      { label: 'شرایط و قوانین', href: '#' },
      { label: 'حریم خصوصی', href: '#' },
      { label: 'مرجوعی و استرداد', href: '#' },
    ],
    contact: [
      { label: 'تهران، ایران', href: '#' },
      { label: 'info@shopapp.ir', href: 'mailto:info@shopapp.ir' },
      { label: '۰۲۱-۱۲۳۴۵۶۷۸', href: 'tel:+982112345678' },
    ],
  };

  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">ShopApp</h3>
            <p className="mt-4 text-base text-gray-600">
              فروشگاه آنلاین مدرن با تجربه خرید آسان و امن. ما بهترین محصولات را با بهترین قیمت برای شما فراهم می‌کنیم.
            </p>
            <div className="mt-6 flex gap-4">
              <a href="#" className="text-gray-400 hover:text-gray-500" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">شرکت</h4>
                <ul className="mt-4 space-y-3">
                  {footerLinks.company.map((link) => (
                    <li key={link.label}>
                      <Link to={link.href} className="text-base text-gray-600 hover:text-gray-900">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h4 className="text-sm font-semibold text-gray-900">پشتیبانی</h4>
                <ul className="mt-4 space-y-3">
                  {footerLinks.support.map((link) => (
                    <li key={link.label}>
                      <Link to={link.href} className="text-base text-gray-600 hover:text-gray-900">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">تماس با ما</h4>
              <ul className="mt-4 space-y-3">
                {footerLinks.contact.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-base text-gray-600 hover:text-gray-900">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8">
          <p className="text-base text-gray-500 text-center">
            &copy; {currentYear} ShopApp. تمام حقوق محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  );
}