import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export const CheckoutReturnPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'fail'>('loading');

    useEffect(() => {
        const processPayment = async () => {
            // 1. Lấy mã phản hồi từ VNPay (vnp_ResponseCode = 00 là thành công)
            const responseCode = searchParams.get('vnp_ResponseCode');

            if (responseCode === '00') {
                setStatus('success');
                // Sau 3 giây tự động về trang đơn hàng
                setTimeout(() => navigate('/orders'), 3000);
            } else {
                setStatus('fail');
                setTimeout(() => navigate('/cart'), 3000);
            }
        };

        processPayment();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            {status === 'loading' && (
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p>Đang xác thực thanh toán, vui lòng chờ...</p>
                </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center gap-3 text-green-600">
                    <CheckCircle className="w-16 h-16" />
                    <h1 className="text-xl font-bold">Thanh toán thành công!</h1>
                    <p className="text-gray-600">Đang chuyển hướng về trang đơn hàng...</p>
                </div>
            )}

            {status === 'fail' && (
                <div className="flex flex-col items-center gap-3 text-red-600">
                    <XCircle className="w-16 h-16" />
                    <h1 className="text-xl font-bold">Thanh toán thất bại!</h1>
                    <p className="text-gray-600">Đang chuyển hướng về giỏ hàng...</p>
                </div>
            )}
        </div>
    );
};