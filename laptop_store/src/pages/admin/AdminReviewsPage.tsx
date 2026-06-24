import React, { useState, useEffect, useCallback } from 'react';
import { reviewAdminService, AdminReview } from '../../api/adminService';
import { Star, Search, Trash2, ShieldAlert, RefreshCw, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export const AdminReviewsPage: React.FC = () => {
    const [reviews, setReviews] = useState<AdminReview[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [size] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [keyword, setKeyword] = useState<string>('');
    const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const loadReviews = useCallback(async () => {
        setLoading(true);
        try {
            const data = await reviewAdminService.list({
                page,
                size,
                keyword,
                rating: ratingFilter,
            });
            setReviews(data.items);
            setTotalPages(data.totalPages);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách đánh giá');
        } finally {
            setLoading(false);
        }
    }, [page, size, keyword, ratingFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            void loadReviews();
        }, 300);
        return () => clearTimeout(timer);
    }, [loadReviews]);

    const handleDeleteReview = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.')) {
            return;
        }
        setDeletingId(id);
        try {
            await reviewAdminService.remove(id);
            toast.success('Đã xóa đánh giá thành công');
            void loadReviews();
        } catch (error) {
            toast.error('Xóa đánh giá thất bại');
        } finally {
            setDeletingId(null);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                        key={s}
                        className={`w-4 h-4 ${
                            s <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
                        }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý đánh giá</h1>
                    <p className="text-sm text-slate-500">Xem và quản lý các đánh giá sản phẩm từ người mua hàng.</p>
                </div>
                <button
                    onClick={() => void loadReviews()}
                    disabled={loading}
                    className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Làm mới
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Tìm theo sản phẩm, nội dung, user..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        value={keyword}
                        onChange={(e) => {
                            setKeyword(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <span className="text-xs text-slate-500 font-medium">Lọc số sao:</span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => { setRatingFilter(undefined); setPage(1); }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                ratingFilter === undefined
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Tất cả
                        </button>
                        {[5, 4, 3, 2, 1].map((star) => (
                            <button
                                key={star}
                                onClick={() => { setRatingFilter(star); setPage(1); }}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                    ratingFilter === star
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {star} <Star className="w-3.5 h-3.5 fill-current" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
                {loading && reviews.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                        <p className="text-sm">Đang tải danh sách đánh giá...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                        <ShieldAlert className="w-10 h-10 text-slate-300" />
                        <p className="text-sm">Không tìm thấy đánh giá nào phù hợp.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {reviews.map((review) => (
                            <div key={review.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row gap-6 justify-between items-start">
                                <div className="flex-1 space-y-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        {renderStars(review.rating)}
                                        <span className="text-xs text-slate-400">
                                            {review.createdAt ? new Date(review.createdAt).toLocaleString('vi-VN') : ''}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-700 font-medium leading-relaxed">
                                            "{review.comment}"
                                        </p>
                                    </div>

                                    {/* User and Laptop details */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs border-t border-slate-100 pt-3 mt-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-400">Người đánh giá:</span>
                                            <span className="font-semibold text-slate-700">{review.user.fullName}</span>
                                            <span className="text-slate-400">({review.user.email})</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-400">Sản phẩm:</span>
                                            <a
                                                href={`/product/${review.product.id}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="font-semibold text-blue-600 hover:underline truncate max-w-[200px] sm:max-w-xs"
                                            >
                                                {review.product.name}
                                            </a>
                                        </div>
                                    </div>

                                    {/* Seller reply if exists */}
                                    {review.sellerReply && (
                                        <div className="mt-3 bg-blue-50/50 border border-blue-100/50 rounded-xl p-3.5 text-xs text-slate-600 space-y-1 relative pl-5">
                                            <div className="absolute left-2.5 top-3.5 bottom-3.5 w-1 bg-blue-500 rounded-full" />
                                            <div className="flex items-center gap-1.5 font-semibold text-blue-700 mb-1">
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                Phản hồi từ người bán:
                                            </div>
                                            <p className="italic text-slate-700 font-medium">"{review.sellerReply}"</p>
                                            {review.repliedAt && (
                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    Đã phản hồi lúc: {new Date(review.repliedAt).toLocaleString('vi-VN')}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="self-end md:self-start">
                                    <button
                                        onClick={() => handleDeleteReview(review.id)}
                                        disabled={deletingId === review.id}
                                        className="flex items-center gap-1.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 px-3 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Xóa đánh giá
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-semibold bg-white hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        Trước
                    </button>
                    <span className="flex items-center px-4 text-sm text-slate-500 font-medium">
                        Trang {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-semibold bg-white hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    );
};
