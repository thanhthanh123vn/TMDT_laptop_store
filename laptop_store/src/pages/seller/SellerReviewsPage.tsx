import React, { useEffect, useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { sellerApi } from '../../api/sellerApi';

interface Review {
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
    product: { id: number; name: string; imageUrl: string };
    user: { fullName: string; email: string };
}

export const SellerReviewsPage: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        sellerApi.getReviews()
            .then(res => setReviews(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center py-12 text-slate-400">Đang tải...</div>;

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-emerald-600" /> Bình luận & Đánh giá
            </h2>
            {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
                    <Star className="w-10 h-10" />
                    <p>Chưa có đánh giá nào</p>
                </div>
            ) : (
                reviews.map(r => (
                    <Card key={r.id}>
                        <CardContent className="pt-4 space-y-2">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-medium text-slate-800">{r.user?.fullName || r.user?.email}</p>
                                    <p className="text-xs text-slate-400">{r.product?.name}</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-slate-600">{r.comment}</p>
                            <p className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</p>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
};
