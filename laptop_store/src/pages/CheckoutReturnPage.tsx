import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import axiosClient from '../api/axiosClient';

export const CheckoutReturnPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'fail'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const processPayment = async () => {
            try {
                const params = Object.fromEntries(searchParams.entries());
                const response = await axiosClient.get('/api/payment/vnpay/return', { params });
                const data = response.data;

                if (data.success) {
                    setStatus('success');
                    setMessage(data.message || 'Thanh toán thành công!');
                    setTimeout(() => navigate('/orders'), 3000);
                } else {
                    setStatus('fail');
                    setMessage(data.message || 'Thanh toán thất bại.');
                    setTimeout(() => navigate('/cart'), 3000);
                }
            } catch (error: unknown) {
                const err = error as { response?: { data?: { message?: string } } };
                setStatus('fail');
                setMessage(err.response?.data?.message || 'Không thể xác thực giao dịch VNPay.');
                setTimeout(() => navigate('/cart'), 3000);
            }
        };

        void processPayment();
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
                    <p className="text-gray-600">{message}</p>
                </div>
            )}

            {status === 'fail' && (
                <div className="flex flex-col items-center gap-3 text-red-600">
                    <XCircle className="w-16 h-16" />
                    <h1 className="text-xl font-bold">Thanh toán thất bại!</h1>
                    <p className="text-gray-600">{message}</p>
                </div>
            )}
        </div>
    );
};
