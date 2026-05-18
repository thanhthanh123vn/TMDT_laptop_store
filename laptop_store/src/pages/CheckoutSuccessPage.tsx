import React from 'react';
import { Link } from 'react-router-dom';

export default function CheckoutSuccessPage() {
    return (
        <main className="flex-grow flex items-center justify-center px-margin-mobile py-stack-lg min-h-[85vh] bg-background relative overflow-hidden">

            {/* Success Decoration (Đồ họa trang trí góc màn hình - Giữ nguyên từ bản gốc) */}
            <div className="absolute top-0 right-0 p-stack-lg pointer-events-none opacity-20 hidden md:block">
                <svg fill="none" height="200" viewBox="0 0 200 200" width="200" xmlns="http://www.w3.org/2000/svg">
                    <path d="M40 0H200V160L40 200V0Z" fill="#1a365d"></path>
                </svg>
            </div>
            <div className="absolute bottom-0 left-0 p-stack-lg pointer-events-none opacity-20 hidden md:block">
                <svg fill="none" height="150" viewBox="0 0 150 150" width="150" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="75" cy="75" fill="#1a365d" r="75"></circle>
                </svg>
            </div>

            {/* Main Content Card */}
            <div className="max-w-[640px] w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-lg shadow-sm z-10">

                {/* Success Status Header */}
                <div className="flex flex-col items-center text-center mb-stack-lg">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-stack-md">
            <span className="material-symbols-outlined text-[48px] text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Thanh toán thành công</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant">Giao dịch của bạn đã được xử lý an toàn.</p>
                </div>

                {/* Transaction Summary Card */}
                <div className="bg-surface-container-low rounded-lg p-stack-md mb-stack-lg border border-outline-variant">
                    <div className="flex justify-between items-center mb-stack-sm">
                        <span className="font-label-md text-label-md text-on-surface-variant">Mã đơn hàng:</span>
                        <span className="font-label-md text-label-md text-on-surface font-bold">#LPR-12345</span>
                    </div>
                    <div className="flex justify-between items-center mb-stack-sm">
                        <span className="font-label-md text-label-md text-on-surface-variant">Phương thức:</span>
                        <span className="font-label-md text-label-md text-on-surface">Chuyển khoản Ngân hàng</span>
                    </div>
                    <div className="h-[1px] bg-outline-variant my-stack-sm"></div>
                    <div className="flex justify-between items-center">
                        <span className="font-body-md text-body-md font-semibold text-primary">Tổng cộng:</span>
                        <span className="text-2xl font-bold text-primary">15.540.000₫</span>
                    </div>
                </div>

                {/* Next Steps Bento Grid Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-stack-lg">
                    <div className="p-stack-md border border-outline-variant rounded-lg bg-surface-container-lowest">
                        <div className="flex items-center gap-stack-sm mb-2">
                            <span className="material-symbols-outlined text-primary">mail</span>
                            <h3 className="font-label-md text-label-md text-on-surface">Xác nhận email</h3>
                        </div>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                            Một email chi tiết về đơn hàng đã được gửi đến bạn trong vòng 5 phút tới.
                        </p>
                    </div>
                    <div className="p-stack-md border border-outline-variant rounded-lg bg-surface-container-lowest">
                        <div className="flex items-center gap-stack-sm mb-2">
                            <span className="material-symbols-outlined text-primary">local_shipping</span>
                            <h3 className="font-label-md text-label-md text-on-surface">Giao hàng</h3>
                        </div>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                            Đơn hàng sẽ được kiểm định lại 24 bước và giao trong 2-3 ngày làm việc.
                        </p>
                    </div>
                </div>

                {/* Inspection Badge / Trust Indicator */}
                <div className="flex items-center justify-center gap-2 mb-stack-lg px-stack-md py-2 bg-green-50 border border-green-200 rounded">
          <span className="material-symbols-outlined text-green-700 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            verified
          </span>
                    <span className="font-label-sm text-label-sm text-green-800 text-center">
            Sản phẩm đã đạt chứng nhận kiểm tra 24 bước LAPTOPRE
          </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-stack-sm">
                    <Link
                        to="/orders"
                        className="w-full h-12 bg-primary text-on-primary font-bold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                        Xem chi tiết đơn hàng
                    </Link>
                    <Link
                        to="/"
                        className="w-full h-12 border-2 border-primary text-primary font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors"
                    >
                        <span className="material-symbols-outlined">home</span>
                        Quay về trang chủ
                    </Link>
                </div>
            </div>

        </main>
    );
}