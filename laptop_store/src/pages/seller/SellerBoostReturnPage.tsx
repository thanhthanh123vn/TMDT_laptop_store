import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export const SellerBoostReturnPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'fail'>('loading');
    const processed = useRef(false); // chống gọi 2 lần do StrictMode

    useEffect(() => {
        if (processed.current) return;
        processed.current = true;

        let timer: ReturnType<typeof setTimeout>;

        const processReturn = async () => {
            try {
                const params = Object.fromEntries(searchParams.entries());
                await axiosClient.get('/api/boost/vnpay-return', { params });
                const code = searchParams.get('vnp_ResponseCode');
                if (code === '00') {
                    setStatus('success');
                    timer = setTimeout(() => navigate('/seller/boost'), 3500);
                } else {
                    setStatus('fail');
                    timer = setTimeout(() => navigate('/seller/boost'), 3500);
                }
            } catch {
                setStatus('fail');
                timer = setTimeout(() => navigate('/seller/boost'), 3500);
            }
        };

        processReturn();

        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            {status === 'loading' && (
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                    <p className="text-slate-600">Đang xác thực thanh toán...</p>
                </div>
            )}
            {status === 'success' && (
                <div className="flex flex-col items-center gap-3 text-emerald-600">
                    <CheckCircle className="w-16 h-16" />
                    <h1 className="text-xl font-bold">Thanh toán thành công!</h1>
                    <p className="text-slate-600">Gói đẩy tin đang chờ admin duyệt. Đang chuyển về trang quản lý...</p>
                </div>
            )}
            {status === 'fail' && (
                <div className="flex flex-col items-center gap-3 text-red-600">
                    <XCircle className="w-16 h-16" />
                    <h1 className="text-xl font-bold">Thanh toán thất bại!</h1>
                    <p className="text-slate-600">Đang chuyển về trang gói đẩy tin...</p>
                </div>
            )}
        </div>
    );
};

export default SellerBoostReturnPage;
