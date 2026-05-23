import React from 'react';
import { Link, useNavigate } from 'react-router';
import { Trash2, Minus, Plus, ShoppingCart, Truck, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity, getCartTotal, cartLoading } = useStore();
  const navigate = useNavigate();

  const total = getCartTotal();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const formatPrice = (price: number) =>
    price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <ShoppingCart className="w-20 h-20 text-gray-300" />
        <h2 className="text-2xl font-semibold text-gray-600">Giỏ hàng của bạn đang trống</h2>
        <p className="text-gray-400">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm.</p>
        <Link to="/">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-2">
            Tiếp tục mua sắm
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
          <p className="text-gray-500 mt-1">
            Bạn đang có {itemCount} sản phẩm trong giỏ hàng
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1 flex flex-col gap-4">
            {cart.map(({ laptop, quantity }) => (
              <div
                key={laptop.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row gap-4"
              >
                {/* Product Image */}
                <Link to={`/product/${laptop.id}`} className="shrink-0">
                  <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100">
                    <ImageWithFallback
                      src={laptop.image}
                      alt={laptop.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                {/* Product Info */}
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mb-1">
                        {laptop.condition}
                      </span>
                      <Link to={`/product/${laptop.id}`}>
                        <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                          {laptop.name}
                        </h3>
                      </Link>
                    </div>
                    <button
                      onClick={() => removeFromCart(laptop.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 shrink-0"
                      aria-label="Xóa sản phẩm"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Specs */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span><span className="font-medium text-gray-600">CPU</span> {laptop.cpu}</span>
                    <span><span className="font-medium text-gray-600">RAM</span> {laptop.ram}</span>
                    <span><span className="font-medium text-gray-600">GPU</span> {laptop.gpu}</span>
                  </div>

                  {/* Quantity + Price */}
                  <div className="flex items-center justify-between mt-auto pt-2">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateCartQuantity(laptop.id, quantity - 1)}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Giảm số lượng"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-1.5 font-semibold text-gray-900 min-w-[2rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(laptop.id, quantity + 1)}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Tăng số lượng"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Tổng cộng</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatPrice(laptop.price * quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>

              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Tạm tính</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>Phí vận chuyển</span>
                <span className="text-blue-600 font-medium">Miễn phí</span>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-gray-900">Tổng cộng</span>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{formatPrice(total)}</p>
                    <p className="text-xs text-gray-400">Đã bao gồm VAT</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate('/checkout')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-semibold rounded-xl"
              >
                Tiến hành thanh toán
              </Button>

              {/* Trust badges */}
              <div className="flex justify-center gap-4 mt-4 text-gray-300">
                <CreditCard className="w-6 h-6" />
                <ShieldCheck className="w-6 h-6" />
                <Truck className="w-6 h-6" />
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 flex gap-3">
              <Truck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-700">Giao hàng nhanh</p>
                <p className="text-xs text-blue-500 mt-0.5">
                  Đơn hàng của bạn sẽ được đóng gói cẩn thận và giao trong 2-3 ngày làm việc.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
