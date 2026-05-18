import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AllProductsPage } from './pages/AllProductsPage';
import { ComparePage } from './pages/ComparePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
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
import {AdminProductsPage} from "./pages/admin/AdminProductsPage.tsx";
import {AdminDashboardPage} from "./pages/admin/AdminDashboardPage.tsx";
import {AdminOrdersPage} from "./pages/admin/AdminOrdersPage.tsx";

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'products', Component: AllProductsPage },
      { path: 'compare', Component: ComparePage },
      { path: 'product/:id', Component: ProductDetailPage },
      { path: 'cart', Component: CartPage },
      { path: 'checkout', Component: CheckoutPage },
      { path: 'checkout/success', Component: CheckoutSuccessPage },
      { path: 'orders', Component: ProfilePage },
      { path: 'login', Component: LoginPage },
      { path: 'register', Component: RegisterPage },
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
    ],
  }
]);
