import { createBrowserRouter } from 'react-router-dom'; // Lưu ý: thường là 'react-router-dom' thay vì 'react-router'
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AllProductsPage } from './pages/AllProductsPage';
import ProductCompare from './pages/ProductCompare';
import { ProductDetailPage } from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SellerRegisterPage from './pages/SellerRegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage.tsx';
import AddressPage from './pages/Address';
import OrdersPage from './pages/OrdersPage';
import WishListPage from './pages/WishListPage';
import NotificationsPage from './pages/NotificationsPage';
import {AdminLayout} from "./pages/admin/AdminLayout.tsx";
import {AdminProductFormPage} from "./pages/admin/AdminProductFormPage.tsx";
import AdminProductsPage from "./pages/admin/AdminProductsPage.tsx";
import AdminUsersPage from "./pages/admin/UserManagementPage.tsx";
import {AdminDashboardPage} from "./pages/admin/AdminDashboardPage.tsx";
import {AdminOrdersPage} from "./pages/admin/AdminOrdersPage.tsx";
import NotificationManagementPage from "./pages/admin/NotificationManagementPage.tsx";
import {AdminProfilePage} from "./pages/admin/AdminProfilePage.tsx";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage.tsx";
import AdminRevenuePage from "./pages/admin/AdminRevenuePage.tsx";
import AdminBoostPage from "./pages/admin/AdminBoostPage.tsx";
import {SellerLayout} from "./pages/seller/SellerLayout.tsx";
import {SellerDashboardPage} from "./pages/seller/SellerDashboardPage.tsx";
import {SellerProductsPage} from "./pages/seller/SellerProductsPage.tsx";
import {SellerOrdersPage} from "./pages/seller/SellerOrdersPage.tsx";
import {SellerReviewsPage} from "./pages/seller/SellerReviewsPage.tsx";
import {SellerBoostPage} from "./pages/seller/SellerBoostPage.tsx";


import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {CheckoutReturnPage} from "@/pages/CheckoutReturnPage.tsx";

const stripePromise = loadStripe("pk_test_51Tbd6UFPI5dc6V9ZfFGX5ttKLsacjscuB7vm0arJnWbSdb3OvuEzAGO7merHxX0dFTsUAAyWKF0JO3XgAohFW9Kk00GYBD9HL5");

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'products', Component: AllProductsPage },
      { path: 'compare', Component: ProductCompare },
      { path: 'product/:id', Component: ProductDetailPage },
      { path: 'cart', Component: CartPage },
      {
        path: 'checkout',
        element: (
            // 3. Sử dụng stripePromise đã khởi tạo
            <Elements stripe={stripePromise}>
                <CheckoutPage />
                </Elements>
        )
      },
      { path: 'checkout/vnpay-return', Component: CheckoutReturnPage },
      { path: 'checkout/success', Component: CheckoutSuccessPage },
      { path: 'orders', Component: ProfilePage },
      { path: 'login', Component: LoginPage },
      { path: 'register', Component: RegisterPage },
      { path: 'register/seller', Component: SellerRegisterPage },
      { path: 'forgot-password', Component: ForgotPasswordPage },
      { path: 'profile', Component: ProfilePage },
      { path: 'wishlist', Component: WishListPage },
      { path: 'notifications', Component: NotificationsPage },
      {
        path: 'account',
        children: [
          { index: true, Component: ProfilePage },
          { path: 'profile', Component: ProfilePage },
          { path: 'address', Component: AddressPage },
          { path: 'orders', Component: OrdersPage },
          { path: 'wishlist', Component: WishListPage },
          { path: 'notifications', Component: NotificationsPage },
          { path: 'password', Component: ChangePasswordPage },
        ]
      }
    ],
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboardPage },
      { path: 'products', Component: AdminProductsPage },
      { path: 'products/add', Component: AdminProductFormPage },
      { path: 'products/edit/:id', Component: AdminProductFormPage },
      { path: 'orders', Component: AdminOrdersPage },
      { path: 'users', Component: AdminUsersPage },
      { path: 'categories', Component: AdminCategoriesPage },
      { path: 'revenue', Component: AdminRevenuePage },
      { path: 'notifications', Component: NotificationManagementPage },
      { path: 'profile', Component: AdminProfilePage },
      { path: 'boost', Component: AdminBoostPage },
    ],
  },
  {
    path: '/seller',
    Component: SellerLayout,
    children: [
      { index: true, Component: SellerDashboardPage },
      { path: 'products', Component: SellerProductsPage },
      { path: 'orders', Component: SellerOrdersPage },
      { path: 'reviews', Component: SellerReviewsPage },
      { path: 'boost', Component: SellerBoostPage },
    ],
  }
]);