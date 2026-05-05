import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ComparePage } from './pages/ComparePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
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
      { path: 'compare', Component: ComparePage },
      { path: 'product/:id', Component: ProductDetailPage },
      { path: 'cart', Component: CartPage },
      { path: 'checkout', Component: CheckoutPage },
      { path: 'orders', Component: ProfilePage },
      { path: 'login', Component: LoginPage },
      { path: 'register', Component: RegisterPage },
      { path: 'forgot-password', Component: ForgotPasswordPage },
      { path: 'profile', Component: ProfilePage },
      { path: 'profile', Component: ProfilePage },

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
