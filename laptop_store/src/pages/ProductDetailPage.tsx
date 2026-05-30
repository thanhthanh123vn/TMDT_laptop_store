import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  ShoppingCart, Heart, Star, ChevronRight, ChevronLeft,
  Shield, Truck, RotateCcw, Check, Loader2,
  MessageCircle, Store, BadgeCheck,
} from 'lucide-react';
import { getLaptopById as getMockLaptopById, getReviewsByLaptopId } from '../data/laptops';
import { useStore } from '../context/StoreContext';
import { productApi } from '../api/productApi';
import { Button } from '../components/ui/button';
import type { Review, Laptop } from '../types';
import {Avatar, AvatarFallback, AvatarImage} from "@radix-ui/react-avatar";
import {ChatWithShop} from "@/pages/ChatWithShop.tsx";

const formatVND = (price: number) =>
  price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const Stars: React.FC<{ rating: number; size?: string; interactive?: boolean; onRate?: (n: number) => void }> = ({
  rating, size = 'w-3.5 h-3.5', interactive, onRate,
}) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        onClick={() => interactive && onRate?.(s)}
        className={`${size} transition-colors ${interactive ? 'cursor-pointer' : ''} ${
          s <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
        }`}
      />
    ))}
  </div>
);

// Fake seller info — replace with real data later
const FAKE_SELLER = {
  name: 'LaptopStore Official',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=LS&backgroundColor=3b82f6&textColor=ffffff',
  rating: 4.9,
  sold: 1240,
  responseRate: '98%',
  responseTime: 'trong vài phút',
  verified: true,
};

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [addedReviews, setAddedReviews] = useState<Review[]>([]);
  const [laptop, setLaptop] = useState<Laptop | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [userRating, setUserRating] = useState<number>(5);
  const [userComment, setUserComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [canReview, setCanReview] = useState(false);
  useEffect(() => {
    const checkEligibility = async () => {
      if (id) {
        try {
          const res = await productApi.checkCanReview(id);

          setCanReview(res.data.canReview);
        } catch (error) {
          console.error("Lỗi kiểm tra quyền đánh giá:", error);
          setCanReview(false);
        }
      }
    };
    checkEligibility();
  }, [id]);

  const fetchReviews = async () => {
    if (!id) return;
    try {
      const res = await productApi.getProductReviews(id);
      setReviews(res.data || res);
    } catch (error) {
      console.error("Lỗi khi tải đánh giá sản phẩm:", error);
    }
  };

  // Tải danh sách đánh giá ngay khi mở trang chi tiết sản phẩm
  useEffect(() => {
    fetchReviews();
  }, [id]);
  useEffect(() => {
    const checkEligibility = async () => {
      if (id) {
        try {
          const res = await productApi.checkCanReview(id);
          // Giả sử API trả về { canReview: true/false }
          setCanReview(res.data.canReview);
        } catch (error) {
          console.error("Lỗi kiểm tra quyền đánh giá:", error);
          setCanReview(false);
        }
      }
    };
    checkEligibility();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!userComment.trim()) {
      alert("Vui lòng nhập nội dung đánh giá của bạn.");
      return;
    }

    setIsSubmitting(true);
    try {
      await productApi.submitReview(id, {
        rating: userRating,
        comment: userComment
      });

      alert("Cảm ơn bạn đã đánh giá sản phẩm thành công!");
      setUserComment('');
      setUserRating(5);


      await fetchReviews();
    } catch (error: any) {
      console.error("Lỗi khi gửi đánh giá:", error);
      alert(error?.response?.data || "Gửi đánh giá thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await productApi.getProductById(id || '');
        if (res.data) {
          const p = res.data;
          setLaptop({ ...p, id: p.id.toString(), image: p.imageUrl || '/placeholder.svg', price: Number(p.price), category: p.category ? p.category.split(',') : [] });
          console.log(res.data);
        } else {
          setLaptop(getMockLaptopById(id || '') || null);
        }
      } catch {
        setLaptop(getMockLaptopById(id || '') || null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  if (!laptop) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2 text-gray-500">
      <p>Không tìm thấy sản phẩm.</p>
      <Link to="/products" className="text-blue-600 hover:underline text-sm">← Quay lại</Link>
    </div>
  );

  const isInWishlist = wishlist.includes(laptop.id);
  const images = laptop.images?.length ? laptop.images : [laptop.image];
  const allReviews = [...addedReviews, ...getReviewsByLaptopId(laptop.id)];

  const prevImage = () => setSelectedImage(i => (i - 1 + images.length) % images.length);
  const nextImage = () => setSelectedImage(i => (i + 1) % images.length);

  const handleAddToCart = () => {
    addToCart(laptop, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handlePostReview = async () => {
    if (!reviewContent.trim()) return;
    try {

      await productApi.submitReview(laptop.id, {
        rating: reviewRating,
        comment: reviewContent
      });


      await fetchReviews();

      // Reset form
      setReviewContent('');
      setReviewRating(5);
      setShowReviewForm(false);
    } catch (error) {
      alert("Có lỗi xảy ra khi gửi đánh giá!");
    }
  };

  const tabs = [
    { key: 'description' as const, label: 'Mô tả' },
    { key: 'specs' as const, label: 'Thông số' },
    { key: 'reviews' as const, label: `Đánh giá (${allReviews.length})` },
  ];

  const specRows = [
    ['CPU', laptop.cpu], ['RAM', laptop.ram],
    ['Ổ cứng', `${laptop.storage} ${laptop.storageType}`],
    ['Card đồ họa', laptop.gpu], ['Màn hình', laptop.screenSize],
    ['Trọng lượng', laptop.weight], ['Pin', laptop.batteryCondition],
    ['Tình trạng', laptop.condition],
  ];

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-gray-400 mb-4">
          <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/products" className="hover:text-blue-600">Sản phẩm</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600 truncate max-w-[180px]">{laptop.name}</span>
        </nav>

        {/* ── Top card: image + info ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6 lg:gap-10">

            {/* Image Gallery */}
            <div className="space-y-2">
              {/* Main image */}
              <div className="relative aspect-[4/3] bg-gray-50 rounded-lg border border-gray-100 overflow-hidden group">
                <img
                  src={images[selectedImage]}
                  alt={laptop.name}
                  className="absolute inset-0 w-full h-full object-contain p-3"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-700" />
                    </button>
                    {/* Dot indicators */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedImage(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${i === selectedImage ? 'bg-blue-500 w-3' : 'bg-gray-300'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`shrink-0 w-14 h-14 rounded-md border-2 overflow-hidden bg-white transition-all ${
                      selectedImage === idx ? 'border-blue-500' : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col gap-3.5">

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                {laptop.isBestSeller && <span className="text-[11px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Bán chạy</span>}
                {laptop.isHot && <span className="text-[11px] font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Hot</span>}
                {laptop.isSale && <span className="text-[11px] font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Sale</span>}
                <span className="text-[11px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{laptop.condition}</span>
              </div>

              {/* Title */}
              <h1 className="text-lg font-bold text-gray-900 leading-snug">{laptop.name}</h1>

              {/* Rating row */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Stars rating={laptop.rating} />
                <span className="font-semibold text-gray-700">{laptop.rating}</span>
                <span>({laptop.reviewCount} đánh giá)</span>
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />Còn hàng
                </span>
              </div>

              {/* Price */}
              <div className="bg-blue-50 rounded-lg px-4 py-3 border border-blue-100">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl font-bold text-blue-600">{formatVND(laptop.price)}</span>
                  {laptop.originalPrice && laptop.originalPrice > laptop.price && (
                    <span className="text-sm text-gray-400 line-through">{formatVND(laptop.originalPrice)}</span>
                  )}
                  {laptop.discount && laptop.discount > 0 && (
                    <span className="text-[11px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">-{laptop.discount}%</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">Đã bao gồm VAT · Bảo hành 12 tháng</p>
              </div>

              {/* Quick specs — compact 2-col */}
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  ['CPU', laptop.cpu], ['RAM', laptop.ram],
                  ['Ổ cứng', `${laptop.storage} ${laptop.storageType}`],
                  ['Màn hình', laptop.screenSize],
                ].map(([label, val]) => (
                  <div key={label} className="flex gap-1.5 bg-gray-50 rounded-md px-2.5 py-2 border border-gray-100">
                    <span className="font-semibold text-gray-400 shrink-0">{label}:</span>
                    <span className="text-gray-700 truncate" title={val}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Quantity + CTA */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Số lượng:</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-sm">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-2.5 py-1.5 hover:bg-gray-100 text-gray-600">−</button>
                  <span className="px-3 py-1.5 font-semibold text-gray-900 min-w-[2rem] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="px-2.5 py-1.5 hover:bg-gray-100 text-gray-600">+</button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddToCart}
                  className={`flex-1 text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    addedToCart ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200'
                  } text-white`}
                >
                  {addedToCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                  {addedToCart ? 'Đã thêm' : 'Thêm vào giỏ'}
                </Button>
                <Button
                  onClick={() => { addToCart(laptop, quantity); navigate('/cart'); }}
                  variant="outline"
                  className="flex-1 text-sm font-semibold rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  Mua ngay
                </Button>
                <button
                  onClick={() => toggleWishlist(laptop.id)}
                  className={`px-3 rounded-lg border transition-all ${isInWishlist ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200'}`}
                  aria-label="Yêu thích"
                >
                  <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-red-500' : ''}`} />
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex gap-4 pt-2 border-t border-gray-100">
                {[
                  { icon: Shield, text: 'BH 12 tháng' },
                  { icon: Truck, text: 'Toàn quốc' },
                  { icon: RotateCcw, text: 'Đổi trả 7 ngày' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1 text-[11px] text-gray-500">
                    <Icon className="w-3.5 h-3.5 text-blue-400" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Seller card ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
          <div className="flex items-center gap-3">
            <img
              src={FAKE_SELLER.avatar}
              alt={FAKE_SELLER.name}
              className="w-11 h-11 rounded-full border border-gray-200 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-gray-900 truncate">{FAKE_SELLER.name}</span>
                {FAKE_SELLER.verified && <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-0.5">
                <span className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{FAKE_SELLER.rating}
                </span>
                <span>{FAKE_SELLER.sold.toLocaleString()} đã bán</span>
                <span>Phản hồi {FAKE_SELLER.responseRate}</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                  onClick={() => setIsChatOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-medium border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors text-gray-600"
              >
                <MessageCircle className="w-3.5 h-3.5"/>
                Chat
              </button>

              <button
                  className="flex items-center gap-1.5 text-xs font-medium border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors text-blue-600">
                <Store className="w-3.5 h-3.5"/>
                Xem shop
              </button>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-sm font-semibold relative transition-colors ${
                  activeTab === tab.key ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Description */}
            {activeTab === 'description' && (
              <div className="max-w-2xl space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>{laptop.description || 'Chưa có mô tả cho sản phẩm này.'}</p>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Cam kết từ LaptopStore</p>
                  <ul className="space-y-1.5">
                    {['Máy tuyển chọn kỹ, ngoại hình 98–99%', 'Kiểm tra 20 bước bởi kỹ thuật viên', 'Hỗ trợ nâng cấp RAM, SSD giá gốc', 'Bảo hành 12 tháng, hỗ trợ phần mềm trọn đời'].map(t => (
                      <li key={t} className="flex items-start gap-1.5 text-xs">
                        <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />{t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Specs */}
            {activeTab === 'specs' && (
              <table className="w-full max-w-lg text-sm">
                <tbody className="divide-y divide-gray-100">
                  {specRows.map(([label, value]) => (
                    <tr key={label} className="hover:bg-gray-50">
                      <td className="py-2.5 pr-6 text-xs font-medium text-gray-400 w-36">{label}</td>
                      <td className="py-2.5 text-gray-800 text-xs">{value || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Reviews */}
            {activeTab === 'reviews' && (
                <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
                  {/* Summary */}
                  <div>
                    <div className="text-center bg-gray-50 rounded-lg p-4 border border-gray-100 mb-3">
                      <p className="text-4xl font-bold text-blue-600">{laptop.rating}</p>
                      <Stars rating={laptop.rating} size="w-4 h-4" />
                      <p className="text-xs text-gray-400 mt-1">{laptop.reviewCount} đánh giá</p>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      {[5, 4, 3, 2, 1].map((s) => {
                        const pct = s === 5 ? 85 : s === 4 ? 10 : s === 3 ? 5 : 0;
                        return (
                            <div key={s} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                              <span className="w-6 text-right">{s}★</span>
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="w-6">{pct}%</span>
                            </div>
                        );
                      })}
                    </div>


                    {canReview ? (
                        <>
                          <button
                              onClick={() => setShowReviewForm(!showReviewForm)}
                              className="w-full py-2 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                          >
                            {showReviewForm ? 'Hủy' : '✏️ Viết đánh giá'}
                          </button>
                          {showReviewForm && (
                              <div className="mt-3 p-3 border border-gray-200 rounded-lg space-y-2.5 animate-in fade-in slide-in-from-top-2">
                                <Stars rating={reviewRating} size="w-5 h-5" interactive onRate={setReviewRating} />
                                <textarea
                                    className="w-full border border-gray-200 rounded-md p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    rows={3}
                                    placeholder="Chia sẻ trải nghiệm..."
                                    value={reviewContent}
                                    onChange={e => setReviewContent(e.target.value)}
                                />
                                <Button onClick={handlePostReview} className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                                  Gửi
                                </Button>
                              </div>
                          )}
                        </>
                    ) : (
                        <div className="w-full py-2 px-2 text-center bg-gray-50 border border-gray-200 rounded-lg text-[10px] text-gray-500">
                          <span className="block material-symbols-outlined mb-1">lock</span>
                          Chỉ khách hàng đã mua sản phẩm mới được đánh giá.
                        </div>
                    )}
                  </div>

                  {/* List */}
                  <div>
                    {reviews.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {reviews.map(r => (
                              <div key={r.id} className="py-4 first:pt-0">
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                      <Avatar>
                                        <AvatarImage src={r.user?.avatarUrl} />

                                        <AvatarFallback>
                                          {r.user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                                        </AvatarFallback>
                                      </Avatar>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-gray-800">{r.user?.fullName}</p>
                                      <Stars rating={r.rating} size="w-3 h-3" />
                                    </div>
                                  </div>
                                  <span className="text-[11px] text-gray-400">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed">{r.comment}</p>
                              </div>
                          ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-lg">
                          <span className="material-symbols-outlined text-4xl mb-2">star_border</span>
                          <p className="text-xs">Chưa có đánh giá nào cho sản phẩm này.</p>
                        </div>
                    )}
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
      {/* <div className="p-4 bg-red-100 text-red-800">
          Debug: sellerId = {laptop?.sellerId} | isChatOpen = {isChatOpen ? "MỞ" : "ĐÓNG"}
      </div> */}
      {laptop && (
          <ChatWithShop
              productId={laptop.id}
              shopId={laptop.sellerId || 1} // Fallback về 1 nếu chưa map được dữ liệu
              shopName={laptop.sellerName || FAKE_SELLER.name}
              isOpen={isChatOpen}
              setIsOpen={setIsChatOpen}
          />
      )}
    </main>
  );
};
