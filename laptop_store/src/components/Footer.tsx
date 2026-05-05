import React from 'react';
import { Link } from 'react-router';
import { 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Truck, 
  Headphones, // Đã đổi HeadphonesIcon thành Headphones cho an toàn với mọi phiên bản
  RotateCcw 
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 font-sans mt-auto">
      
      {/* 1. TRUST BADGES */}
      <div className="bg-slate-800/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center justify-center p-4">
              <ShieldCheck className="w-10 h-10 text-blue-500 mb-3" />
              <h4 className="text-white font-bold mb-1">Bảo hành 12 tháng</h4>
              <p className="text-sm text-slate-400">Lỗi 1 đổi 1 trong 30 ngày đầu</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4">
              <Truck className="w-10 h-10 text-indigo-500 mb-3" />
              <h4 className="text-white font-bold mb-1">Giao hàng miễn phí</h4>
              <p className="text-sm text-slate-400">Cho đơn hàng trên 5.000.000đ</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4">
              <RotateCcw className="w-10 h-10 text-teal-500 mb-3" />
              <h4 className="text-white font-bold mb-1">Đổi trả dễ dàng</h4>
              <p className="text-sm text-slate-400">Hỗ trợ thu cũ đổi mới giá cao</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4">
              <Headphones className="w-10 h-10 text-pink-500 mb-3" />
              <h4 className="text-white font-bold mb-1">Hỗ trợ 24/7</h4>
              <p className="text-sm text-slate-400">Tư vấn kỹ thuật trọn đời máy</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                LaptopStore
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Hệ thống bán lẻ laptop cũ, máy tính xách tay đã qua sử dụng uy tín, chất lượng với mức giá tốt nhất thị trường.
            </p>
            
            {/* Social Icons bằng SVG chuẩn */}
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s-.002 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s.002-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" /></svg>
              </a>
            </div>
          </div>

          {/* Cột 2: Chính sách */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Chính sách</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link to="/chinh-sach-bao-hanh" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span> Chính sách bảo hành
                </Link>
              </li>
              <li>
                <Link to="/chinh-sach-doi-tra" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span> Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link to="/chinh-sach-giao-hang" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span> Chính sách giao hàng
                </Link>
              </li>
              <li>
                <Link to="/chinh-sach-bao-mat" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span> Bảo mật thông tin
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Liên kết nhanh */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Danh mục</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link to="/category/office" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span> Laptop Văn Phòng
                </Link>
              </li>
              <li>
                <Link to="/category/gaming" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span> Laptop Gaming
                </Link>
              </li>
              <li>
                <Link to="/category/design" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span> Laptop Đồ Họa
                </Link>
              </li>
              <li>
                <Link to="/category/student" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span> Laptop Sinh Viên
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Thông tin liên hệ */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Liên hệ</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">123 Đường Công Nghệ, Phường Tân Phong, Quận 7, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                <a href="tel:0123456789" className="hover:text-blue-400 transition-colors">0123.456.789 (Zalo/Hotline)</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                <a href="mailto:support@laptopstore.vn" className="hover:text-blue-400 transition-colors">support@laptopstore.vn</a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* 3. COPYRIGHT BARS */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 text-center md:text-left">
            © {new Date().getFullYear()} LaptopStore. Tất cả các quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-3 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer">
            <span className="text-xs font-bold border border-slate-600 px-2 py-1 rounded">VISA</span>
            <span className="text-xs font-bold border border-slate-600 px-2 py-1 rounded">MASTER</span>
            <span className="text-xs font-bold border border-slate-600 px-2 py-1 rounded">MOMO</span>
            <span className="text-xs font-bold border border-slate-600 px-2 py-1 rounded">VNPAY</span>
          </div>
        </div>
      </div>

    </footer>
  );
};