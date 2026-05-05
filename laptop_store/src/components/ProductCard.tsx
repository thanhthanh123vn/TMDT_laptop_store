import React from 'react';
import { Link } from 'react-router';
import { Heart, GitCompare, ShoppingCart } from 'lucide-react';
import type { Laptop } from '../types';
import { Rating } from './Rating';
import { useStore } from '../context/StoreContext';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';

interface ProductCardProps {
  laptop: Laptop;
}

export const ProductCard: React.FC<ProductCardProps> = ({ laptop }) => {
  const { wishlist, compare, toggleWishlist, toggleCompare, addToCart } = useStore();

  const isInWishlist = wishlist.includes(laptop.id);
  const isInCompare = compare.includes(laptop.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(laptop);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(laptop.id);
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleCompare(laptop.id);
  };

  return (
    <Link to={`/product/${laptop.id}`}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-50 aspect-[4/3]">
          <img
            src={laptop.image}
            alt={laptop.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {laptop.isBestSeller && (
              <Badge className="bg-blue-600 text-white">Best Seller</Badge>
            )}
            {laptop.isSale && (
              <Badge className="bg-red-600 text-white">Sale</Badge>
            )}
            {laptop.isHot && (
              <Badge className="bg-orange-600 text-white">Hot</Badge>
            )}
            {laptop.discount && (
              <Badge className="bg-green-600 text-white">-{laptop.discount}%</Badge>
            )}
          </div>

          {/* Wishlist Heart */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${
                isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Brand & Name */}
          <div className="mb-2">
            <p className="text-xs text-gray-500 uppercase">{laptop.brand}</p>
            <h3 className="font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">
              {laptop.name}
            </h3>
          </div>

          {/* Price */}
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl text-blue-600">${laptop.price}</span>
              {laptop.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ${laptop.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Specs */}
          <div className="mb-3 space-y-1">
            <p className="text-xs text-gray-600">
              <span className="font-medium">CPU:</span> {laptop.cpu}
            </p>
            <p className="text-xs text-gray-600">
              <span className="font-medium">RAM:</span> {laptop.ram} | <span className="font-medium">Storage:</span> {laptop.storage} {laptop.storageType}
            </p>
            <p className="text-xs text-gray-600">
              <span className="font-medium">GPU:</span> {laptop.gpu}
            </p>
          </div>

          {/* Condition Badge */}
          <div className="mb-3">
            <Badge variant="outline" className="text-xs">
              Condition: {laptop.condition}
            </Badge>
          </div>

          {/* Rating */}
          <div className="mb-3">
            <Rating rating={laptop.rating} reviewCount={laptop.reviewCount} size="sm" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Add to Cart
            </Button>
            
            <button
              onClick={handleToggleCompare}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Checkbox checked={isInCompare} />
              <span className="sr-only">Compare</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};
