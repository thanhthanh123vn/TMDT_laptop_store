import React, { useState } from 'react';
import { sellerApi } from '../../api/sellerApi';
import { toast } from 'sonner';

export const SellerReviewsPage = () => {

    const [reviews, setReviews] = useState<any[]>([]);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');

    const handleReplySubmit = async (reviewId: number) => {
        if (!replyContent.trim()) return toast.error("Vui lòng nhập nội dung");
        try {
            await sellerApi.replyToReview(reviewId, { replyContent });
            toast.success("Đã gửi phản hồi");


            setReviews(reviews.map(r =>
                r.id === reviewId ? { ...r, sellerReply: replyContent, repliedAt: new Date().toISOString() } : r
            ));

            setReplyingTo(null);
            setReplyContent('');
        } catch (error) {
            toast.error("Lỗi khi gửi phản hồi");
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Đánh giá của khách hàng</h2>
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id} className="border p-4 rounded shadow-sm">
                        <div className="flex justify-between">
                            <span className="font-semibold">{review.user?.fullName}</span>
                            <span className="text-yellow-500">{"⭐".repeat(review.rating)}</span>
                        </div>
                        <p className="mt-2 text-gray-700">{review.comment}</p>

                        {/* Nếu đã trả lời rồi thì hiển thị nội dung */}
                        {review.sellerReply ? (
                            <div className="mt-3 bg-gray-100 p-3 border-l-4 border-blue-500 rounded">
                                <p className="font-semibold text-sm text-blue-600">Phản hồi của bạn:</p>
                                <p className="text-sm text-gray-800">{review.sellerReply}</p>
                            </div>
                        ) : (
                            // Nếu chưa trả lời, hiển thị nút Trả lời
                            <div className="mt-3">
                                {replyingTo === review.id ? (
                                    <div className="flex flex-col gap-2">
                    <textarea
                        className="border rounded p-2 text-sm w-full"
                        rows={2}
                        placeholder="Nhập phản hồi..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                    />
                                        <div className="flex gap-2">
                                            <button onClick={() => handleReplySubmit(review.id)} className="bg-blue-600 text-white px-3 py-1 text-sm rounded">Gửi</button>
                                            <button onClick={() => setReplyingTo(null)} className="bg-gray-300 px-3 py-1 text-sm rounded">Hủy</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => setReplyingTo(review.id)} className="text-blue-600 text-sm font-semibold hover:underline">
                                        Trả lời khách hàng
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
