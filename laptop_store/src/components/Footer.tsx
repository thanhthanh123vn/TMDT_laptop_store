import React from 'react';
import { Link } from 'react-router';
import { MapPin, Phone, Mail, ShieldCheck, Truck, Headphones, RotateCcw } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0f172a] text-slate-400 font-sans mt-auto">

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-5">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                LaptopStore
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500">
              Hệ thống bán lẻ laptop cũ uy tín, chất lượng kiểm định nghiêm ngặt với mức giá tốt nhất thị trường.
            </p>
            <div className="flex items-center gap-3">
              {/* Facebook */}
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 transition-colors">
                <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              {/* YouTube */}
              <a href="#" aria-label="YouTube" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 transition-colors">
                <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s-.002 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s.002-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Chính sách */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Chính sách</h3>
            <ul className="space-y-3 text-sm">
              {[
                { to: '/chinh-sach-bao-hanh', label: 'Chính sách bảo hành' },
                { to: '/chinh-sach-doi-tra', label: 'Chính sách đổi trả' },
                { to: '/chinh-sach-giao-hang', label: 'Chính sách giao hàng' },
                { to: '/chinh-sach-bao-mat', label: 'Bảo mật thông tin' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-blue-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-blue-400 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Danh mục */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Danh mục</h3>
            <ul className="space-y-3 text-sm">
              {[
                { to: '/products?category=Office', label: 'Laptop Văn Phòng' },
                { to: '/products?category=Gaming', label: 'Laptop Gaming' },
                { to: '/products?category=Design', label: 'Laptop Đồ Họa' },
                { to: '/products?category=Student', label: 'Laptop Sinh Viên' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-blue-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-blue-400 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Liên hệ</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed text-slate-500">123 Đường Công Nghệ, Phường Tân Phong, Quận 7, TP. HCM</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <a href="tel:0123456789" className="hover:text-blue-400 transition-colors">0123.456.789</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <a href="mailto:support@laptopstore.vn" className="hover:text-blue-400 transition-colors">support@laptopstore.vn</a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} LaptopStore. Tất cả các quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-2">
            {['VISA', 'MASTER', 'MOMO', 'VNPAY'].map((method) => (
              <span key={method} className="text-[10px] font-bold border border-slate-700 text-slate-500 px-2 py-1 rounded hover:border-slate-500 hover:text-slate-400 transition-colors cursor-default">
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
};
