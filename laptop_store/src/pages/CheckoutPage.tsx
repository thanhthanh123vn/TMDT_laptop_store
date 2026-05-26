import React, {useEffect, useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import {addressApi} from "@/api/addressApi.ts";
import {orderApi} from "@/api/orderApi.ts";
import {useLocation} from "react-router";


import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import {
  CardElement

} from "@stripe/react-stripe-js";
function formatVND(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function CheckoutPage() {
  const navigate = useNavigate();

  const stripe = useStripe();
  const elements = useElements();
  const { cart ,clearCart} = useStore();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [shippingMethod, setShippingMethod] = useState<string>('fast');
  const [paymentMethod, setPaymentMethod] = useState<string>('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<{code: number, name: string} | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<{code: number, name: string} | null>(null);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedWard, setSelectedWard] = useState<{code: number, name: string} | null>(null);
  // const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();
  // const userId = user?.id;
  const isBuyNow = location.state?.isBuyNow;
  const buyNowItem = location.state?.item;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({ type: 'Nhà riêng', name: '', phone: '', address: '', city: '' });
  const checkoutItems = isBuyNow && buyNowItem ? [buyNowItem] : cart;

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.laptop.price * (item.quantity || 1), 0);
  const shippingFee = shippingMethod === 'fast' ? 40000 : 0;
  const discountAmount = 0;
  const total = subtotal + shippingFee - discountAmount;
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  useEffect(() => {
    if (isModalOpen) {
      fetch('https://provinces.open-api.vn/api/p/')
          .then(res => res.json())
          .then(data => setProvinces(data))
          .catch(err => console.error("Lỗi tải tỉnh thành:", err));
    }
  }, [isModalOpen]);

  // Gọi API lấy danh sách Quận/Huyện khi Tỉnh/Thành thay đổi
  useEffect(() => {
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`)
          .then(res => res.json())
          .then(data => setDistricts(data.districts))
          .catch(err => console.error("Lỗi tải quận huyện:", err));
    } else {
      setDistricts([]);
    }
    // Reset lại quận huyện nếu đổi tỉnh thành khác
    setSelectedDistrict(null);
  }, [selectedProvince]);
// Gọi API lấy danh sách Phường/Xã khi Quận/Huyện thay đổi
  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`)
          .then(res => res.json())
          .then(data => setWards(data.wards))
          .catch(err => console.error("Lỗi tải phường xã:", err));
    } else {
      setWards([]);
    }
    // Reset lại phường xã nếu đổi quận huyện khác
    setSelectedWard(null);
  }, [selectedDistrict]);
  const handleCheckout = async () => {


    if (!checkoutItems || checkoutItems.length === 0) {
      alert("Không có sản phẩm nào để thanh toán!");
      return;
    }

    if (!addressId) {
      alert("Vui lòng chọn địa chỉ giao hàng!");
      return;
    }


    if (paymentMethod === "credit_card") {

      if (!stripe || !elements) {
        alert("Stripe chưa khởi tạo!");
        return;
      }
    }

    setIsProcessing(true);


    const orderPayload = {
      addressId: addressId,
      shippingMethod: shippingMethod,
      paymentMethod: paymentMethod,
      totalAmount: total,

      items: checkoutItems.map((item) => ({
        productId: item.laptop.id,
        quantity: item.quantity || 1,
        price: item.laptop.price,
      })),
    };

    try {


      if (paymentMethod === "vnpay") {

        try {

          const finalAmount = Math.floor(total > 0 ? total : 0);

          const orderInfo = "ThanhToanDonHangLaptopre";

          const response = await orderApi.createVNPayPayment(
              finalAmount,
              orderInfo
          );

          const data = response.data;

          if (!data.paymentUrl) {
            throw new Error("Không tạo được link thanh toán VNPay");
          }

          // lưu order tạm
          localStorage.setItem(
              "pendingOrder",
              JSON.stringify(orderPayload)
          );


          window.location.href = data.paymentUrl;

          return;

        } catch (error) {

          console.error("Lỗi VNPay:", error);

          alert(
              "Không thể kết nối tới VNPay. Vui lòng thử lại!"
          );

          setIsProcessing(false);

          return;
        }
      }


      else if (paymentMethod === "cod") {

        await orderApi.createOrder(orderPayload);


        if (!isBuyNow) {
          clearCart();
        }

        setIsProcessing(false);

        navigate("/checkout/success");
      }


      else if (paymentMethod === "credit_card") {

        try {

          if (!stripe || !elements) {

            alert("Stripe chưa sẵn sàng!");

            setIsProcessing(false);

            return;
          }

          const cardNumberElement =
              elements.getElement(CardNumberElement);

          if (!cardNumberElement) {

            alert("Không tìm thấy form thẻ!");

            setIsProcessing(false);

            return;
          }

          const {
            error,
            paymentMethod: stripePaymentMethod
          } = await stripe.createPaymentMethod({

            type: "card",

            card: cardNumberElement,

            billing_details: {
              name: cardInfo.cardName,
            },
          });


          if (error) {

            console.error(error);

            alert(error.message);

            setIsProcessing(false);

            return;
          }

          if (!stripePaymentMethod) {

            alert("Không tạo được Payment Method!");

            setIsProcessing(false);

            return;
          }


          await orderApi.payWithCreditCard({

            token: stripePaymentMethod.id,

            amount: total * 100,

            currency: "vnd",
          });


          await orderApi.createOrder(orderPayload);

          // clear cart
          if (!isBuyNow) {
            clearCart();
          }

          setIsProcessing(false);

          navigate("/checkout/success");

        } catch (error: any) {

          console.error("Lỗi thanh toán:", error);

          alert(
              error?.response?.data?.message ||
              error.message ||
              "Thanh toán thất bại!"
          );

          setIsProcessing(false);
        }
      }


      else {

        alert("Phương thức thanh toán không hợp lệ!");

        setIsProcessing(false);
      }

    } catch (error) {

      console.error("Lỗi xử lý checkout:", error);

      alert(
          "Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại!"
      );

      setIsProcessing(false);
    }
  };
  const validateCreditCard = () => {
    const { cardNumber, cardName, expiryDate, cvv } = cardInfo;


    const cleanCardNumber = cardNumber.replace(/\s+/g, '');
    if (!/^\d{16}$/.test(cleanCardNumber)) {
      return "Số thẻ không hợp lệ (phải đủ 16 số).";
    }

    if (!cardName.trim()) {
      return "Vui lòng nhập tên in trên thẻ.";
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      return "Ngày hết hạn không hợp lệ (Định dạng MM/YY).";
    }

    if (!/^\d{3}$/.test(cvv)) {
      return "Mã CVV không hợp lệ (phải gồm 3 số).";
    }

    return null; // Thẻ hợp lệ
  };
  const handleSaveAddress = async (e: React.FormEvent) => {

    e.preventDefault();

    if (
        !newAddress.address ||
        !newAddress.name ||
        !newAddress.phone ||
        !selectedProvince ||
        !selectedDistrict ||
        !selectedWard
    ) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const payload = {


      fullName: newAddress.name,


      phone: newAddress.phone,


      province: selectedProvince.name,


      district: selectedDistrict.name,


      ward: selectedWard.name,


      streetAddress: newAddress.address,


      addressType:
          newAddress.type === "Nhà riêng"
              ? "HOME"
              : "OFFICE",


      isDefault: addresses.length === 0,
    };

    try {

      const res = await addressApi.addAddress(payload);

      const savedAddr = res.data || res;

      // update ui
      setAddresses([...addresses, savedAddr]);

      setAddressId(savedAddr.id);

      setIsModalOpen(false);


      setNewAddress({
        type: 'Nhà riêng',
        name: '',
        phone: '',
        address: '',
        city: ''
      });

      setSelectedProvince(null);
      setSelectedDistrict(null);
      setSelectedWard(null);

    } catch (error) {

      console.error("Lỗi lưu địa chỉ:", error);

      alert("Đã xảy ra lỗi khi lưu địa chỉ!");
    }
  };

  return (
      <main className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-8 md:py-stack-lg min-h-screen bg-background text-on-surface">

        {/* Breadcrumb & Title */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-secondary mb-3 font-label-md text-sm">
            <Link to="/cart" className="hover:text-primary transition-colors">Giỏ hàng</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary font-bold">Thanh toán</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">Thanh toán an toàn</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT SIDE: FORMS ================= */}
          <section className="lg:col-span-8 space-y-6">

            {/* 1. THÔNG TIN GIAO HÀNG */}
            <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/60">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                  </div>
                  <h2 className="text-xl font-bold text-on-surface">Địa chỉ nhận hàng</h2>
                </div>
                <button onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-1 text-primary font-medium text-sm hover:underline bg-primary/5 px-3 py-1.5 rounded-full transition-colors">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Thêm địa chỉ
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => setAddressId(item.id)}
                        className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 overflow-hidden group ${
                            addressId === item.id
                                ? 'border-primary bg-primary/5 shadow-md'
                                : 'border-outline-variant/50 hover:border-primary/50 hover:shadow-sm bg-white'
                        }`}
                    >
                      {item.isDefault && (
                          <span className="absolute top-0 right-0 bg-secondary text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">
                            Mặc định
                          </span>
                      )}

                      <div className="flex items-start gap-3">
                        <span className={`material-symbols-outlined mt-0.5 transition-colors ${addressId === item.id ? 'text-primary' : 'text-outline group-hover:text-primary/70'}`} style={{ fontVariationSettings: addressId === item.id ? "'FILL' 1" : "'FILL' 0" }}>
                          {addressId === item.id ? 'radio_button_checked' : 'radio_button_unchecked'}
                        </span>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-on-surface">{item.name}</span>
                            <span className="text-outline-variant">|</span>
                            <span className="text-secondary font-medium">{item.phone}</span>
                          </div>
                          <span className="inline-block px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-xs rounded font-medium border border-outline-variant/30">{item.type}</span>
                          <p className="text-sm text-on-surface-variant leading-relaxed pt-1">{item.address}</p>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>

            {/* 2. PHƯƠNG THỨC VẬN CHUYỂN */}
            <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/60">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/30">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
                </div>
                <h2 className="text-xl font-bold text-on-surface">Đơn vị vận chuyển</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                    onClick={() => setShippingMethod('fast')}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${shippingMethod === 'fast' ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-outline-variant/50 hover:border-blue-300 bg-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${shippingMethod === 'fast' ? 'bg-blue-100 text-blue-600' : 'bg-surface-container-high text-secondary'}`}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                    </div>
                    <div>
                      <p className={`font-bold ${shippingMethod === 'fast' ? 'text-blue-700' : 'text-on-surface'}`}>Giao hàng Hỏa Tốc</p>
                      <p className="text-xs text-secondary mt-0.5">Nhận hàng trong 2-4 giờ</p>
                    </div>
                  </div>
                  <p className={`font-bold ${shippingMethod === 'fast' ? 'text-blue-700' : 'text-on-surface'}`}>40.000đ</p>
                </div>

                <div
                    onClick={() => setShippingMethod('standard')}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${shippingMethod === 'standard' ? 'border-green-500 bg-green-50/50 shadow-sm' : 'border-outline-variant/50 hover:border-green-300 bg-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${shippingMethod === 'standard' ? 'bg-green-100 text-green-600' : 'bg-surface-container-high text-secondary'}`}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
                    </div>
                    <div>
                      <p className={`font-bold ${shippingMethod === 'standard' ? 'text-green-700' : 'text-on-surface'}`}>Giao Tiêu Chuẩn</p>
                      <p className="text-xs text-secondary mt-0.5">Nhận hàng từ 2-3 ngày</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${shippingMethod === 'standard' ? 'text-green-700' : 'text-on-surface'}`}>Miễn phí</p>
                    <p className="text-[10px] text-green-600 line-through">25.000đ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. PHƯƠNG THỨC THANH TOÁN */}
            <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/60">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/30">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                </div>
                <h2 className="text-xl font-bold text-on-surface">Phương thức thanh toán</h2>
              </div>

              <div className="space-y-3">
                {/* COD */}
                <label className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-surface-container-low transition-all duration-200 rounded-xl border-2 ${paymentMethod === 'cod' ? 'border-green-500 bg-green-50/30 shadow-sm' : 'border-outline-variant/50'}`}>
                  <input checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300" name="payment" type="radio"/>
                  <div className="w-10 h-10 rounded bg-green-100 flex items-center justify-center text-green-600">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-on-surface block">Thanh toán khi nhận hàng (COD)</span>
                    <span className="text-sm text-secondary">Kiểm tra hàng trước khi thanh toán tiền mặt</span>
                  </div>
                </label>

                {/* VNPay */}
                <label className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-surface-container-low transition-all duration-200 rounded-xl border-2 ${paymentMethod === 'vnpay' ? 'border-blue-500 bg-blue-50/30 shadow-sm' : 'border-outline-variant/50'}`}>
                  <input checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300" name="payment" type="radio"/>
                  <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center text-blue-700 font-black italic text-xs tracking-tighter">
                    VNPAY
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-on-surface block">Thanh toán qua VNPAY</span>
                    <span className="text-sm text-secondary">Quét mã QR bằng ứng dụng ngân hàng</span>
                  </div>
                </label>


                {/* Credit Card */}
                <div className={`rounded-xl border-2 transition-all duration-200 overflow-hidden ${paymentMethod === 'credit_card' ? 'border-primary bg-primary/5 shadow-sm' : 'border-outline-variant/50'}`}>
                  <label className="flex items-center gap-4 p-4 cursor-pointer hover:bg-surface-container-low">
                    <input checked={paymentMethod === 'credit_card'} onChange={() => setPaymentMethod('credit_card')} className="w-5 h-5 text-primary focus:ring-primary border-gray-300" name="payment" type="radio"/>
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">credit_card</span>
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-on-surface block">Thẻ tín dụng / Ghi nợ quốc tế</span>
                      <span className="text-sm text-secondary">Hỗ trợ Visa, Mastercard, JCB</span>
                    </div>
                  </label>

                  {paymentMethod === 'credit_card' && (
                      <div className="p-4 border-t border-primary/20 bg-white m-2 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-4">

                          {/* Tên in trên thẻ */}
                          <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-on-surface">Tên in trên thẻ</label>
                            <input
                                value={cardInfo.cardName}
                                onChange={(e) => setCardInfo({...cardInfo, cardName: e.target.value.toUpperCase()})}
                                className="w-full border border-outline-variant rounded-lg py-2.5 px-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase"
                                placeholder="NGUYEN VAN A"
                                type="text"
                            />
                          </div>

                          {/* Số thẻ */}
                          <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-on-surface">Số thẻ</label>
                            <div className="w-full border border-outline-variant rounded-lg p-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all bg-white">
                              <CardNumberElement
                                  options={{
                                    showIcon: true,
                                    style: {
                                      base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } },
                                      invalid: { color: '#9e2146' },
                                    },
                                  }}
                              />
                            </div>
                          </div>

                          {/* Ngày hết hạn và CVV nằm chung 1 dòng dưới */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-sm font-semibold text-on-surface">Ngày hết hạn</label>
                              <div className="w-full border border-outline-variant rounded-lg p-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all bg-white">
                                <CardExpiryElement
                                    options={{
                                      style: {
                                        base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } },
                                        invalid: { color: '#9e2146' },
                                      },
                                    }}
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-sm font-semibold text-on-surface">Mã CVV</label>
                              <div className="w-full border border-outline-variant rounded-lg p-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all bg-white">
                                <CardCvcElement
                                    options={{
                                      style: {
                                        base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } },
                                        invalid: { color: '#9e2146' },
                                      },
                                    }}
                                />
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">lock</span>
                            Bảo mật thông tin thẻ bằng Stripe.
                          </p>
                        </div>
                      </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ================= RIGHT SIDE: ORDER SUMMARY ================= */}
          <aside className="lg:col-span-4 sticky top-24">
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-lg overflow-hidden flex flex-col">

              {/* Header Summary */}
              <div className="p-6 border-b border-outline-variant/30 bg-surface-container-low/50 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">receipt_long</span>
                  Chi tiết đơn hàng
                </h2>
              </div>

              {/* Product List Rendered from Context */}
              <div className="p-6 space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar">
                {checkoutItems && checkoutItems.length > 0 ? (
                    checkoutItems.map((item) => (
                        <div key={item.laptop.id} className="flex gap-4 group">
                          <div className="w-20 h-20 bg-surface-container-low border border-outline-variant/50 rounded-xl p-2 flex-shrink-0 group-hover:border-primary/50 transition-colors">
                            <img alt={item.laptop.name} className="w-full h-full object-contain mix-blend-multiply" src={item.laptop.image} />
                          </div>
                          <div className="flex-grow flex flex-col justify-between">
                            <p className="font-semibold text-on-surface line-clamp-2 text-sm">{item.laptop.name}</p>
                            <div className="flex justify-between items-center mt-2">
                          <span className="text-xs font-medium text-secondary bg-surface-container-high px-2 py-1 rounded">
                            SL: {item.quantity || 1}
                          </span>
                              <p className="font-bold text-primary">{formatVND(item.laptop.price * (item.quantity || 1))}</p>
                            </div>
                          </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-6 text-secondary text-sm">
                      <span className="material-symbols-outlined text-[40px] opacity-50 mb-2">shopping_bag</span>
                      <p>Chưa có sản phẩm nào để thanh toán.</p>
                    </div>
                )}
              </div>

              {/* Voucher Input */}
              <div className="p-6 bg-surface-container-low/30 border-t border-b border-outline-variant/30">
                <p className="text-sm font-semibold mb-2 text-on-surface">Mã khuyến mãi / Voucher</p>
                <div className="flex gap-2">
                  <input className="flex-grow px-4 py-2.5 border border-outline-variant rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm bg-white" placeholder="Nhập mã tại đây..." type="text" />
                  <button className="px-5 py-2.5 bg-primary/10 text-primary font-bold text-sm rounded-xl hover:bg-primary hover:text-white transition-colors">Áp dụng</button>
                </div>
              </div>

              {/* Price Calculation DYNAMIC */}
              <div className="p-6 space-y-3 border-b border-outline-variant/30">
                <div className="flex justify-between text-sm font-medium text-secondary">
                  <span>Tạm tính ({checkoutItems.length} sản phẩm)</span>
                  <span className="text-on-surface">{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-secondary">
                  <span>Phí vận chuyển</span>
                  <span className="text-on-surface">{shippingFee === 0 ? 'Miễn phí' : formatVND(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-secondary">
                  <span>Giảm giá từ Voucher</span>
                  <span className="text-green-600">- {formatVND(discountAmount)}</span>
                </div>
              </div>

              {/* Total & Submit DYNAMIC */}
              <div className="p-6 bg-primary/5">
                <div className="flex justify-between  mb-6">
                  <span className="text-lg font-bold text-on-surface">Thành Tiền</span>
                  <div className="text-right">
                    <p className="text-3xl font-black text-red-600 tracking-tight leading-none">
                      {formatVND(total > 0 ? total : 0)}
                    </p>
                    <p className="text-xs text-secondary mt-1 font-medium">(Đã bao gồm VAT)</p>
                  </div>
                </div>

                <button
                    onClick={handleCheckout}
                    disabled={isProcessing || checkoutItems.length === 0}
                    className="relative w-full py-4 bg-primary text-white text-[16px] font-bold rounded-xl hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        Đang xử lý thanh toán...
                      </>
                  ) : (
                      <>
                        Hoàn tất đặt hàng
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </>
                  )}
                </button>

                {/* Trust Badges */}
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-white border border-outline-variant/50 text-center">
                    <span className="material-symbols-outlined text-green-600 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                    <span className="text-[10px] font-semibold text-secondary uppercase">Thanh toán bảo mật</span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-white border border-outline-variant/50 text-center">
                    <span className="material-symbols-outlined text-blue-600 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                    <span className="text-[10px] font-semibold text-secondary uppercase">Cam kết chính hãng</span>
                  </div>
                </div>
              </div>

            </div>
          </aside>
        </div>

        {/* ================= MODAL THÊM ĐỊA CHỈ MỚI ================= */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
              <div
                  className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl border border-outline-variant overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div
                    className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/50">
                  <h3 className="text-lg font-bold text-primary">Thêm địa chỉ giao hàng</h3>
                  <button onClick={() => setIsModalOpen(false)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-outline-variant/30 text-secondary hover:text-error transition-colors">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                <form onSubmit={handleSaveAddress} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-on-surface">Họ và tên</label>
                      <input required
                             className="w-full px-4 py-2.5 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white transition-all"
                             placeholder="Nhập họ tên" type="text" value={newAddress.name}
                             onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}/>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-on-surface">Số điện thoại</label>
                      <input required
                             className="w-full px-4 py-2.5 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white transition-all"
                             placeholder="Nhập SĐT" type="tel" value={newAddress.phone}
                             onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}/>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Dropdown Tỉnh/Thành phố */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-on-surface">Tỉnh/Thành phố</label>
                      <select
                          required
                          className="w-full px-4 py-2.5 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white transition-all appearance-none cursor-pointer"
                          value={selectedProvince?.code || ''}
                          onChange={(e) => {
                            const prov = provinces.find(p => p.code == e.target.value);
                            setSelectedProvince(prov);
                            // Gán tạm tên tỉnh vào city
                            setNewAddress({...newAddress, city: prov ? prov.name : ''});
                          }}
                      >
                        <option value="" disabled>Chọn Tỉnh/Thành</option>
                        {provinces.map(p => (
                            <option key={p.code} value={p.code}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Dropdown Quận/Huyện */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-on-surface">Quận/Huyện</label>
                      <select
                          required
                          className="w-full px-4 py-2.5 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all appearance-none cursor-pointer disabled:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-70 bg-white"
                          disabled={!selectedProvince}
                          value={selectedDistrict?.code || ''}
                          onChange={(e) => {
                            const dist = districts.find(d => d.code == e.target.value);
                            setSelectedDistrict(dist);

                            if (selectedProvince && dist) {
                              setNewAddress({...newAddress, city: `${dist.name}, ${selectedProvince.name}`});
                            }
                          }}
                      >
                        <option value="" disabled>Chọn Quận/Huyện</option>
                        {districts.map(d => (
                            <option key={d.code} value={d.code}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-on-surface">Phường/Xã</label>
                    <select
                        required
                        className="w-full px-4 py-2.5 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all appearance-none cursor-pointer disabled:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-70 bg-white"
                        disabled={!selectedDistrict}
                        value={selectedWard?.code || ''}
                        onChange={(e) => {
                          const ward = wards.find(w => w.code == e.target.value);
                          setSelectedWard(ward);
                          if (selectedProvince && selectedDistrict && ward) {
                            setNewAddress({
                              ...newAddress,
                              city: `${ward.name}, ${selectedDistrict.name}, ${selectedProvince.name}`
                            });
                          }
                        }}
                    >
                      <option value="" disabled>Chọn Phường/Xã</option>
                      {wards.map(w => (
                          <option key={w.code} value={w.code}>{w.name}</option>
                      ))}
                    </select>
                  </div>



              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface">Địa chỉ cụ thể (Số nhà, Tên đường...)</label>
                <input required
                       className="w-full px-4 py-2.5 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white transition-all"
                       placeholder="VD: 123 Đường Lê Lợi" type="text" value={newAddress.address}
                       onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}/>
              </div>
              <div className="space-y-1.5 pb-2">
                <label className="text-sm font-semibold text-on-surface block mb-2">Loại địa chỉ</label>
                <div className="flex gap-3">
                  {['Nhà riêng', 'Văn phòng'].map((type) => (
                      <label key={type}
                             className={`flex-1 py-2 text-center rounded-lg border cursor-pointer font-medium text-sm transition-all ${newAddress.type === type ? 'bg-primary border-primary text-white' : 'border-outline-variant text-secondary hover:bg-surface-container-low'}`}>
                        <input type="radio" name="addressType" className="hidden" checked={newAddress.type === type}
                               onChange={() => setNewAddress({...newAddress, type})}/>
                        {type}
                      </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-outline-variant/50">
                <button type="button" onClick={() => setIsModalOpen(false)}
                        className="px-6 py-2.5 rounded-xl font-bold text-secondary bg-surface-container-high hover:bg-outline-variant/40 transition-colors">Hủy
                  bỏ
                </button>
                <button type="submit"
                        className="px-6 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">Lưu
                  địa chỉ
                </button>
              </div>
            </form>
          </div>
          </div>
          )}
</main>
)
;
}