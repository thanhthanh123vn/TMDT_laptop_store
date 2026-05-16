import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Thêm useLocation để nhận biết route hiện tại
import { ShoppingCart, Heart, GitCompare, Search, Menu, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Badge } from './ui/badge';
import { cn } from './ui/utils'; // Giả sử bạn có hàm cn để nối class chuyên nghiệp

// IMPORT LOGO: Sửa lại phần mở rộng (.png, .svg, .jpg) cho khớp với file thực tế của bạn
import logo from '../assets/logoV2.png'; 

export const Header: React.FC = () => {
  const { cart, wishlist, compare } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation(); // Hook lấy thông tin route hiện tại

  // Bắt sự kiện cuộn chuột để thu nhỏ Header và thêm hiệu ứng kính mờ
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Function helper để tạo class cho Link điều hướng
  // Nó sẽ kiểm tra nếu `path` của Link trùng với `location.pathname` hiện tại để bật màu sáng
  const navLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return cn(
      "px-5 py-2 rounded-full font-medium transition-all duration-300",
      isActive
        ? "text-blue-600 bg-white shadow-sm" // Style khi Link đang active (đang ở trang này)
        : "text-slate-600 hover:text-blue-600 hover:bg-white/50" // Style mặc định và khi hover
    );
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/85 backdrop-blur-md shadow-md py-2' 
          : 'bg-white shadow-sm py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* 1. Logo Section - CHỈ GIỮ LẠI LOGO, BỎ CHỮ */}
          <Link to="/" className="flex items-center group">
            <img 
              src={logo} 
              alt="Laptop Store Logo" 
              className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
            />
          </Link>

          {/* 2. Navigation - Thẻ pill có hiệu ứng sáng màu khi Link active */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-full border border-slate-200/50">
            <Link to="/" className={navLinkClass('/')}>
              Trang chủ
            </Link>
            <Link to="/compare" className={navLinkClass('/compare')}>
              So sánh
            </Link>
            <Link to="/wishlist" className={navLinkClass('/wishlist')}>
              Yêu thích
            </Link>
          </nav>

          {/* 3. Actions - Icon có hiệu ứng hover đổi màu và nảy */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Search */}
            <button className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300 group">
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>

            {/* Compare */}
            <Link to="/compare" className="relative p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-300 group">
              <GitCompare className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {compare.length > 0 && (
                <Badge className="absolute top-0.5 right-0.5 w-[18px] h-[18px] flex items-center justify-center p-0 bg-indigo-500 text-white text-[10px] font-bold border-2 border-white rounded-full transition-transform group-hover:-translate-y-1">
                  {compare.length}
                </Badge>
              )}
            </Link>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2.5 text-slate-500 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-all duration-300 group">
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {wishlist.length > 0 && (
                <Badge className="absolute top-0.5 right-0.5 w-[18px] h-[18px] flex items-center justify-center p-0 bg-pink-500 text-white text-[10px] font-bold border-2 border-white rounded-full transition-transform group-hover:-translate-y-1">
                  {wishlist.length}
                </Badge>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all duration-300 group">
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <Badge className="absolute top-0.5 right-0.5 w-[18px] h-[18px] flex items-center justify-center p-0 bg-emerald-500 text-white text-[10px] font-bold border-2 border-white rounded-full transition-transform group-hover:-translate-y-1">
                  {cartCount}
                </Badge>
              )}
            </Link>

            {/* User Account */}
            <Link to="/account" className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300 group">
              <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>

            {/* Nút Menu cho màn hình điện thoại */}
            <button className="md:hidden p-2.5 ml-2 text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-full transition-all duration-300">
              <Menu className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};