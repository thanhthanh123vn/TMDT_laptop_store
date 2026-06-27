import React, { useState, useEffect } from 'react';
import { sellerApi } from '../../api/sellerApi';
import { toast } from 'sonner';
import { Star, MessageSquare, RefreshCw, StarOff } from 'lucide-react';

export const SellerReviewsPage = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await sellerApi.getReviews();
            setReviews(res.data || res);
        } catch (error) {
            toast.error("Lỗi khi tải danh sách đánh giá");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchReviews();
    }, []);

    const handleReplySubmit = async (reviewId: number) => {
        if (!replyContent.trim()) return toast.error("Vui lòng nhập nội dung");
        try {
            await sellerApi.replyToReview(reviewId, { replyContent });
            toast.success("Đã gửi phản hồi thành công");

            setReviews(reviews.map(r =>
                r.id === reviewId ? { ...r, sellerReply: replyContent, repliedAt: new Date().toISOString() } : r
            ));

            setReplyingTo(null);
            setReplyContent('');
        } catch (error) {
            toast.error("Lỗi khi gửi phản hồi");
        }
    };

    // Calculate basic stats
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
        : "0.0";

    const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => r.rating === star).length;
        const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
        return { star, count, pct };
    });

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
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Đánh giá của khách hàng</h2>
                    <p className="text-sm text-slate-500">Xem phản hồi từ khách hàng và trả lời ý kiến đóng góp.</p>
                </div>
                <button
                    onClick={() => void fetchReviews()}
                    disabled={loading}
                    className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Làm mới
                </button>
            </div>

            {/* Stats Summary Cards */}
            {!loading && totalReviews > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center text-center">
                        <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Đánh giá trung bình</span>
                        <span className="text-5xl font-black text-emerald-600 mt-2">{avgRating}</span>
                        <div className="mt-2">{renderStars(Math.round(parseFloat(avgRating)))}</div>
                        <span className="text-xs text-slate-400 mt-1">Dựa trên {totalReviews} đánh giá</span>
                    </div>

                    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm col-span-2 flex flex-col justify-center">
                        <span className="text-sm font-semibold text-slate-500 mb-3 block">Chi tiết tỷ lệ đánh giá</span>
                        <div className="space-y-2">
                            {ratingDistribution.map(({ star, count, pct }) => (
                                <div key={star} className="flex items-center gap-3 text-xs text-slate-500">
                                    <span className="w-10 font-bold">{star} sao</span>
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="w-12 text-right font-medium">{count} ({pct.toFixed(0)}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="p-12 bg-white border border-slate-200/60 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center gap-2 text-slate-400">
                        <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
                        <p className="text-sm">Đang tải danh sách đánh giá...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="p-12 bg-white border border-slate-200/60 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center gap-3 text-slate-400">
                        <StarOff className="w-10 h-10 text-slate-300" />
                        <p className="text-sm font-medium">Cửa hàng của bạn chưa nhận được đánh giá nào.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{review.user?.fullName || "Khách hàng"}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            {renderStars(review.rating)}
                                            <span className="text-xs text-slate-400">
                                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : ''}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-slate-400 block">Sản phẩm:</span>
                                        <span className="text-xs font-semibold text-slate-700 max-w-[200px] truncate block" title={review.product?.name}>
                                            {review.product?.name || "Sản phẩm không rõ"}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                    "{review.comment}"
                                </p>

                                {/* Seller Reply Section */}
                                {review.sellerReply ? (
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 relative pl-6 text-xs text-slate-600">
                                        <div className="absolute left-2.5 top-4 bottom-4 w-1 bg-emerald-500 rounded-full" />
                                        <div className="flex items-center gap-1.5 font-bold text-emerald-700 mb-1">
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            Phản hồi của bạn:
                                        </div>
                                        <p className="italic text-slate-700 font-medium">"{review.sellerReply}"</p>
                                        {review.repliedAt && (
                                            <p className="text-[10px] text-slate-400 mt-2">
                                                Đã gửi lúc: {new Date(review.repliedAt).toLocaleString('vi-VN')}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="border-t border-slate-50 pt-3">
                                        {replyingTo === review.id ? (
                                            <div className="flex flex-col gap-3 animate-in fade-in duration-200">
                                                <textarea
                                                    className="border border-slate-200 rounded-xl p-3 text-sm w-full bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                                                    rows={3}
                                                    placeholder="Nhập phản hồi lịch sự gửi đến khách hàng..."
                                                    value={replyContent}
                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => setReplyingTo(null)}
                                                        className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-600 transition-all cursor-pointer shadow-sm"
                                                    >
                                                        Hủy
                                                    </button>
                                                    <button
                                                        onClick={() => void handleReplySubmit(review.id)}
                                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-sm shadow-emerald-100"
                                                    >
                                                        Gửi phản hồi
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setReplyingTo(review.id);
                                                    setReplyContent('');
                                                }}
                                                className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-xs font-bold transition-all cursor-pointer"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                Trả lời khách hàng
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
