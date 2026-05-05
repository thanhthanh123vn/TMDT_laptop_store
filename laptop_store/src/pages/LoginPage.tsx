import React from 'react';
import { Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router'; // 1. Import useNavigate

export default function LoginPage() {
    const navigate = useNavigate(); // 2. Khởi tạo hàm điều hướng

    // 3. Xử lý sự kiện khi submit form
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn trình duyệt tự động reload lại trang

        // Chuyển hướng người dùng về trang chủ (đường dẫn '/')
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Đăng nhập</h2>

                {/* 4. Gắn hàm handleLogin vào sự kiện onSubmit của form */}
                <form className="space-y-4" onSubmit={handleLogin}>
                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="nhapemail@gmail.com"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 mr-2" />
                            Ghi nhớ đăng nhập
                        </label>
                        <a href="/forgot-password" className="text-blue-600 hover:underline">Quên mật khẩu?</a>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Đăng nhập
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Chưa có tài khoản?{' '}
                    <a href="/register" className="text-blue-600 font-medium hover:underline">
                        Đăng ký ngay
                    </a>
                </p>
            </div>
        </div>
    );
}