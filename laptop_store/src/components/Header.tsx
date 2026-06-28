import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Search,
  Menu,
  User,
  LogOut,
  Package,
  Settings,
  X,
  ChevronDown,
  MessageCircle,
  MessageSquare
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Badge } from './ui/badge';
import { userApi } from "@/api/userApi.ts";
import axiosClient from "@/api/axiosClient.ts";
import {NotificationDropdown} from "@/components/NotificationDropdown.tsx";

interface ChatConversation {
  id: string;
  shopName: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  unreadCount: number;
}

export const Header: React.FC = () => {
  const { cart, compare } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [messageCount, setMessageCount] = useState(0);
  const [chatDropdownOpen, setChatDropdownOpen] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);

  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ==========================================
  // FETCH CONVERSATIONS DỰA TRÊN API MỚI
  // ==========================================
  useEffect(() => {
    const fetchConversations = async () => {
      if (!isLoggedIn) return;

      try {
        const userRes = await userApi.getMyProfile();
        const userId = userRes.data.id;

        // 1. Gọi API lấy danh sách Conversation thay vì roomIds
        const convRes = await axiosClient.get(`/api/chat/user/${userId}/conversations`);
        const rawConversations = convRes.data;

        let totalUnread = 0;

        // 2. Map dữ liệu và tính số tin nhắn chưa đọc
        const chatList = await Promise.all(
            rawConversations.map(async (conv: any) => {
              const historyRes = await axiosClient.get(`/api/chat/${conv.id}`);
              const messages = historyRes.data;

              // Đếm tin nhắn chưa đọc (người khác gửi và chưa đọc)
              const unreadCount = messages.filter(
                  (msg: any) => msg.senderId !== userId && msg.isRead === false
              ).length;

              totalUnread += unreadCount;

              return {
                id: conv.id,
                // Ưu tiên storeName, nếu không có thì lấy fullName
                shopName: conv.seller?.storeName || conv.seller?.fullName || 'Cửa hàng',
                lastMessage: conv.lastMessage || 'Chưa có tin nhắn',
                time: conv.lastMessageTime
                    ? new Date(conv.lastMessageTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                    : '',
                unread: unreadCount > 0,
                unreadCount: unreadCount
              };
            })
        );

        // Đưa các phòng có tin nhắn chưa đọc lên đầu
        chatList.sort((a, b) => b.unreadCount - a.unreadCount);

        setMessageCount(totalUnread);
        setConversations(chatList);

      } catch (error) {
        console.error('Lỗi khi lấy danh sách chat:', error);
      }
    };

    fetchConversations();
  }, [isLoggedIn]);

  useEffect(() => {
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem('token'));
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (chatRef.current && !chatRef.current.contains(e.target as Node)) {
        setChatDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    setUserDropdownOpen(false);
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleConversationClick = (conversationId: string) => {
    setChatDropdownOpen(false);
    navigate(`/chat?id=${conversationId}`);
  };

  const compareLink = compare.length > 0 ? `/compare?ids=${compare.join(',')}` : '/compare';

  const navLinks = [
    { to: '/', label: 'Trang chủ' },
    { to: '/products', label: 'Sản phẩm' },
    { to: compareLink, label: 'So sánh' },
    { to: '/wishlist', label: 'Yêu thích' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white border-b border-slate-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-6">

            <Link to="/" className="shrink-0 flex items-center gap-1.5 group">
            <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-indigo-400 transition-all">
              LaptopStore
            </span>
            </Link>

            <nav className="hidden md:flex items-center gap-0.5 flex-1">
              {navLinks.map((link) => (
                  <Link
                      key={link.to}
                      to={link.to}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                          isActive(link.to)
                              ? 'text-blue-600 bg-blue-50'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                  >
                    {link.label}
                  </Link>
              ))}
            </nav>

            <div className="hidden lg:flex flex-1 max-w-xs">
              <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm laptop..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-100 hover:bg-slate-200 focus:bg-white rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </form>
            </div>

            <div className="flex items-center gap-0.5 ml-auto md:ml-0">

              <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="lg:hidden p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  aria-label="Tìm kiếm"
              >
                <Search className="w-5 h-5" />
              </button>
              {isLoggedIn && <NotificationDropdown />}
              {/* ── CHAT DROPDOWN ── */}
              <div className="relative" ref={chatRef}>
                <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        navigate('/login');
                      } else {
                        setChatDropdownOpen(!chatDropdownOpen);
                        setUserDropdownOpen(false);
                      }
                    }}
                    className={`relative p-2 rounded-lg transition-all ${
                        chatDropdownOpen
                            ? 'text-pink-600 bg-pink-50'
                            : 'text-slate-500 hover:text-pink-600 hover:bg-pink-50'
                    }`}
                    aria-label="Chat"
                >
                  <MessageCircle className="w-5 h-5" />
                  {isLoggedIn && messageCount > 0 && (
                      <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center p-0 bg-pink-500 text-white text-[9px] font-bold border border-white rounded-full">
                        {messageCount > 99 ? '99+' : messageCount}
                      </Badge>
                  )}
                </button>

                {chatDropdownOpen && isLoggedIn && (
                    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                        <p className="font-semibold text-sm text-slate-800">Hộp thư tin nhắn</p>

                        {/* Đã đổi link sang /chat (Trang chat mới gộp) */}
                        <Link
                            to="/allConvChat"
                            onClick={() => setChatDropdownOpen(false)}
                            className="text-xs text-blue-600 hover:underline font-medium"
                        >
                          Xem tất cả
                        </Link>
                      </div>

                      <div className="max-h-80 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="py-8 px-4 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                              <MessageSquare className="w-8 h-8 text-slate-300" />
                              <p>Chưa có cuộc hội thoại nào</p>
                            </div>
                        ) : (
                            conversations.map((chat) => (
                                <button
                                    key={chat.id}
                                    onClick={() => handleConversationClick(chat.id)}
                                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${
                                        chat.unread ? 'bg-blue-50/40' : ''
                                    }`}
                                >
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                    {chat.shopName.charAt(0).toUpperCase()}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                      <h4 className={`text-sm truncate ${chat.unread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                        {chat.shopName}
                                      </h4>
                                      <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0 ml-2">
                                        {chat.time}
                                      </span>
                                    </div>
                                    <p className={`text-xs truncate pr-2 ${chat.unread ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                                      {chat.lastMessage}
                                    </p>
                                  </div>

                                  {chat.unread && (
                                      <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center self-center shrink-0 ml-1 text-[10px] font-bold text-white">
                                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                                      </div>
                                  )}
                                </button>
                            ))
                        )}
                      </div>
                    </div>
                )}
              </div>

              <Link
                  to="/cart"
                  className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  aria-label="Giỏ hàng"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                    <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center p-0 bg-blue-600 text-white text-[9px] font-bold border border-white rounded-full">
                      {cartCount}
                    </Badge>
                )}
              </Link>

              <div className="w-px h-5 bg-slate-200 mx-1 hidden sm:block" />

              {isLoggedIn ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => {
                          setUserDropdownOpen(!userDropdownOpen);
                          setChatDropdownOpen(false);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {userDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50">
                          <div className="px-4 py-2.5 border-b border-slate-100 mb-1">
                            <p className="text-xs text-slate-400 font-medium">Tài khoản của tôi</p>
                          </div>
                          {[
                            { to: '/account/profile', icon: User, label: 'Hồ sơ' },
                            { to: '/account/orders', icon: Package, label: 'Đơn hàng' },
                            { to: '/account/password', icon: Settings, label: 'Cài đặt' },
                          ].map(({ to, icon: Icon, label }) => (
                              <Link
                                  key={to}
                                  to={to}
                                  onClick={() => setUserDropdownOpen(false)}
                                  className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <Icon className="w-4 h-4 text-slate-400" />
                                {label}
                              </Link>
                          ))}
                          <div className="border-t border-slate-100 mt-1 pt-1">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors w-full"
                            >
                              <LogOut className="w-4 h-4" />
                              Đăng xuất
                            </button>
                          </div>
                        </div>
                    )}
                  </div>
              ) : (
                  <Link
                      to="/login"
                      className="hidden sm:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Đăng nhập
                  </Link>
              )}

              <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all ml-1"
                  aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {searchOpen && (
              <div className="lg:hidden pb-3">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm laptop..."
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-100 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="button" onClick={() => setSearchOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                </form>
              </div>
          )}
        </div>

        {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-0.5">
              {navLinks.map((link) => (
                  <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive(link.to) ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    {link.label}
                  </Link>
              ))}
              {!isLoggedIn && (
                  <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block mt-2 text-center bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold"
                  >
                    Đăng nhập
                  </Link>
              )}
            </div>
        )}
      </header>
  );
};