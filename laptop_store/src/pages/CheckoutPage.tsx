import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Truck, CreditCard, Banknote, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { orderApi } from '../api/orderApi';

type PaymentMethod = 'cod' | 'banking';

interface FormData {
  fullName: string;
  phone: string;
  address: string;
  note: string;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  address?: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useStore();
  const total = getCartTotal();

  const [form, setForm] = useState<FormData>({ fullName: '', phone: '', address: '', note: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [showSuccess, setShowSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên.';
    } else if (/[^a-zA-ZÀ-ỹ\s]/.test(form.fullName)) {
      newErrors.fullName = 'Họ và tên không được chứa số hoặc ký tự đặc biệt.';
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại.';
    } else if (!/^\d{10}$/.test(form.phone.trim())) {
      newErrors.phone = 'Số điện thoại phải đúng 10 chữ số, không chứa chữ cái.';
    }

    if (!form.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ giao hàng.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    try {
      const orderData = {
        totalAmount: total,
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
        paymentMethod: paymentMethod.toUpperCase(),
        items: cart.map(item => ({
          productId: item.laptop.id,
          quantity: item.quantity,
          price: item.laptop.price
        }))
      };
      
      await orderApi.createOrder(orderData);
      setShowSuccess(true);
    } catch (err) {
      console.error("Failed to create order:", err);
      alert("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.");
    }
  };

  const handleSuccessClose = () => {
    clearCart();
    navigate('/orders');
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (cart.length === 0 && !showSuccess) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thanh Toán</h1>
          <p className="text-gray-500 mt-1">Hoàn tất đơn hàng của bạn với quy trình bảo mật cao.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Form */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Shipping Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Truck className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Thông tin giao hàng</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Họ và tên
                  </label>
                  <Input
                    placeholder="Nguyễn Văn A"
                    value={form.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className={errors.fullName ? 'border-red-400 focus-visible:ring-red-400' : ''}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Số điện thoại
                  </label>
                  <Input
                    placeholder="0901 234 567"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={errors.phone ? 'border-red-400 focus-visible:ring-red-400' : ''}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Địa chỉ
                </label>
                <Input
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className={errors.address ? 'border-red-400 focus-visible:ring-red-400' : ''}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Ghi chú đơn hàng (tùy chọn)
                </label>
                <textarea
                  rows={3}
                  placeholder="Yêu cầu đặc biệt về giao hàng..."
                  value={form.note}
                  onChange={(e) => handleChange('note', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Phương thức thanh toán</h2>
              </div>

              <div className="flex flex-col gap-3">
                {/* COD */}
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-blue-600 w-4 h-4"
                  />
                  <Banknote className="w-5 h-5 text-gray-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-xs text-gray-500">Thanh toán bằng tiền mặt khi shipper giao hàng</p>
                  </div>
                </label>

                {/* Banking */}
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    paymentMethod === 'banking' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="banking"
                    checked={paymentMethod === 'banking'}
                    onChange={() => setPaymentMethod('banking')}
                    className="accent-blue-600 w-4 h-4"
                  />
                  <CreditCard className="w-5 h-5 text-gray-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Chuyển khoản ngân hàng (Banking)</p>
                    <p className="text-xs text-gray-500">Xác nhận đơn hàng nhanh chóng qua cổng thanh toán</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:w-96 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Đơn hàng của bạn</h2>

              {/* Items */}
              <div className="flex flex-col gap-3 mb-4">
                {cart.map(({ laptop, quantity }) => (
                  <div key={laptop.id} className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <ImageWithFallback
                        src={laptop.image}
                        alt={laptop.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{laptop.name}</p>
                      <p className="text-xs text-gray-400">
                        {laptop.cpu} · {laptop.ram} · {laptop.condition}
                      </p>
                      {quantity > 1 && (
                        <p className="text-xs text-gray-400">x{quantity}</p>
                      )}
                    </div>
                    <p className="text-sm font-bold text-blue-600 shrink-0">
                      ${(laptop.price * quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Tạm tính</span>
                  <span>${total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span>Phí vận chuyển</span>
                  <span className="text-blue-600 font-medium">Miễn phí</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-gray-900">Tổng cộng</span>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">${total.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Bao gồm thuế VAT</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-semibold rounded-xl mt-4"
              >
                Đặt hàng ngay →
              </Button>

              <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-gray-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Bảo mật thanh toán 256-bit SSL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h3>
            <p className="text-gray-500 text-sm mb-6">
              Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý và sẽ được giao trong 2-3 ngày làm việc.
            </p>
            <Button
              onClick={handleSuccessClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
            >
              Xem lịch sử đơn hàng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
