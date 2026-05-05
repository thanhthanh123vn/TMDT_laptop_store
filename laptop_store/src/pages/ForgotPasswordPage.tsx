
import React from 'react';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <a href="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-6">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Quay lại đăng nhập
                </a>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">Quên mật khẩu?</h2>
                <p className="text-gray-600 text-sm mb-6">
                    Vui lòng nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
                </p>

                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="nhapemail@gmail.com"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Gửi yêu cầu
                    </button>
                </form>
            </div>
        </div>
    );
}