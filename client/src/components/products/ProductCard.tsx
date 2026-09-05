import { Link } from 'react-router-dom';
import { formatPrice } from '../../lib/utils';
import { ShoppingCart, Heart } from 'lucide-react';
import { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      product_id: product.id,
      quantity: 1,
      name: product.name,
      price: product.price,
      image_url: product.image_url || '',
      stock: product.stock,
    });
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleAddToCart}
            className="p-2 rounded-full bg-white/90 backdrop-blur text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors shadow-sm"
            aria-label="افزودن به سبد خرید"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full bg-white/90 backdrop-blur text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors shadow-sm" aria-label="افزودن به علاقه‌مندی‌ها">
            <Heart className="h-5 w-5" />
          </button>
        </div>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg">موجود نیست</span>
          </div>
        )}
      </div>
      <div className="flex-1 p-4 flex flex-col">
        {product.category && (
          <span className="mb-2 inline-block px-2 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded-full">
            {product.category}
          </span>
        )}
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors mb-2">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-lg font-bold text-primary-600">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            افزودن به سبد
          </button>
        </div>
      </div>
    </Link>
  );
}