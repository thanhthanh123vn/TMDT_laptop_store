import React from 'react';
import {Link, useNavigate} from 'react-router';
import {Heart, GitCompare, ShoppingCart, CreditCard} from 'lucide-react';
import type { Laptop } from '../types';
import { Rating } from './Rating';
import { useStore } from '../context/StoreContext';
import { Badge } from './ui/badge';

interface ProductCardProps {
  laptop: Laptop;
}

function formatVND(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export const ProductCard: React.FC<ProductCardProps> = ({ laptop }) => {
  const { wishlist, compare, toggleWishlist, toggleCompare, addToCart } = useStore();

  const isInWishlist = wishlist.includes(laptop.id);
  const isInCompare = compare.includes(laptop.id);
  const navigate = useNavigate();
  // const handleAddToCart = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   addToCart(laptop);
  // };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/checkout', {
      state: {
        isBuyNow: true,
        item: {
          laptop: laptop,
          quantity: 1
        }
      }
    })
  };


  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(laptop.id);
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleCompare(laptop.id);
  };

  const discountPct = laptop.originalPrice
    ? Math.round((1 - laptop.price / laptop.originalPrice) * 100)
    : laptop.discount;

  return (
    <Link to={`/product/${laptop.id}`} className="block group">
      <div className="bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full">

        {/* ── Image ── */}
        <div className="relative overflow-hidden bg-slate-50 aspect-[4/3] shrink-0">
          <img
            src={laptop.image}
            alt={laptop.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
          />

          {/* Badges top-left */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {laptop.isBestSeller && (
              <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 h-auto">Nổi bật</Badge>
            )}
            {laptop.isHot && (
              <Badge className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 h-auto">Hot</Badge>
            )}
            {discountPct && discountPct > 0 && (
              <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 h-auto">-{discountPct}%</Badge>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow flex items-center justify-center hover:bg-white transition-colors"
            aria-label="Yêu thích"
          >
            <Heart className={`w-4 h-4 transition-colors ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="p-3.5 flex flex-col flex-1">

          {/* Brand */}
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{laptop.brand}</p>

          {/* Name */}
          <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug mb-2 min-h-[2.5rem]">
            {laptop.name}
          </h3>

          {/* Price */}
          <div className="mb-2.5">
            <span className="text-base font-bold text-blue-600">{formatVND(laptop.price)}</span>
            {laptop.originalPrice && (
              <span className="text-xs text-slate-400 line-through ml-2">{formatVND(laptop.originalPrice)}</span>
            )}
          </div>

          {/* Specs */}
          <div className="space-y-0.5 mb-2.5 text-xs text-slate-500">
            <p><span className="font-medium text-slate-600">CPU:</span> {laptop.cpu}</p>
            <p><span className="font-medium text-slate-600">RAM:</span> {laptop.ram} &nbsp;|&nbsp; <span className="font-medium text-slate-600">SSD:</span> {laptop.storage}</p>
            <p><span className="font-medium text-slate-600">GPU:</span> {laptop.gpu}</p>
          </div>

          {/* Condition + Rating */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {laptop.condition}
            </span>
            <Rating rating={laptop.rating} reviewCount={laptop.reviewCount} size="sm" />
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-2 mt-auto">
            <button
                onClick={handleBuyNow}
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
            >
              <CreditCard  className="w-3.5 h-3.5" />
              Mua Ngay
            </button>
            <button
              onClick={handleToggleCompare}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                isInCompare
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
              }`}
              aria-label="So sánh"
            >
              <GitCompare className="w-3.5 h-3.5" />
              So sánh
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};
