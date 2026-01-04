import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import CookieConsent from './components/CookieConsent';
import ScrollToTop from './components/ScrollToTop';

import { StoreProvider } from './context/StoreContext';
import { ThemeProvider } from './context/ThemeContext';
import { HelmetProvider } from 'react-helmet-async';

// Lazy loading des écrans utilisateur
const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const ProductScreen = lazy(() => import('./screens/ProductScreen'));
const ProductsListScreen = lazy(() => import('./screens/ProductsListScreen'));
const SearchScreen = lazy(() => import('./screens/SearchScreen'));
const BrandScreen = lazy(() => import('./screens/BrandScreen'));
const CartScreen = lazy(() => import('./screens/CartScreen'));
const LoginScreen = lazy(() => import('./screens/LoginScreen'));
const RegisterScreen = lazy(() => import('./screens/RegisterScreen'));
const ShippingScreen = lazy(() => import('./screens/ShippingScreen'));
const PaymentScreen = lazy(() => import('./screens/PaymentScreen'));
const PlaceOrderScreen = lazy(() => import('./screens/PlaceOrderScreen'));
const CheckoutScreen = lazy(() => import('./screens/CheckoutScreen'));
const OrderScreen = lazy(() => import('./screens/OrderScreen'));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));
const WishlistScreen = lazy(() => import('./screens/WishlistScreen'));
const LegalScreen = lazy(() => import('./screens/LegalScreen'));
const LogoutScreen = lazy(() => import('./screens/LogoutScreen'));

// Lazy loading des écrans admin
const ProductListScreen = lazy(() => import('./screens/admin/ProductListScreen'));
const ProductEditScreen = lazy(() => import('./screens/admin/ProductEditScreen'));
const BrandListScreen = lazy(() => import('./screens/admin/BrandListScreen'));
const BrandEditScreen = lazy(() => import('./screens/admin/BrandEditScreen'));
const DashboardScreen = lazy(() => import('./screens/admin/DashboardScreen'));
const OrdersListScreen = lazy(() => import('./screens/admin/OrdersListScreen'));
const UsersListScreen = lazy(() => import('./screens/admin/UsersListScreen'));
const ReviewsModerationScreen = lazy(() => import('./screens/admin/ReviewsModerationScreen'));

// AdminRoute et CookieConsent restent importés normalement car ce sont des composants légers
import AdminRoute from './components/AdminRoute';

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      <ScrollToTop />
      {!isAdminRoute && <Header key="header" />}
      <main key={location.pathname}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes location={location}>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/products" element={<ProductsListScreen />} />
            <Route path="/search" element={<SearchScreen />} />
            <Route path="/brand/:brandName" element={<BrandScreen />} />
            <Route path="/product/:id" element={<ProductScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/shipping" element={<ShippingScreen />} />
            <Route path="/payment" element={<PaymentScreen />} />
            <Route path="/placeorder" element={<PlaceOrderScreen />} />
            <Route path="/checkout" element={<CheckoutScreen />} />
            <Route path="/order/:id" element={<OrderScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/wishlist" element={<WishlistScreen />} />
            <Route path="/legal" element={<LegalScreen />} />
            <Route path="/logout" element={<LogoutScreen />} />

            {/* Admin Routes - Wrapped in Suspense for lazy loading */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <DashboardScreen />
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ProductListScreen />
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/product/:id"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ProductEditScreen />
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/brands"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <BrandListScreen />
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/brands/:brandName"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <BrandEditScreen />
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <OrdersListScreen />
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <UsersListScreen />
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ReviewsModerationScreen />
                  </Suspense>
                </AdminRoute>
              }
            />
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && <Footer />}
      <CookieConsent />
    </div>
  );
};

function App() {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  return (
    <ThemeProvider>
      <StoreProvider>
        <HelmetProvider>
          <GoogleReCaptchaProvider
            reCaptchaKey={siteKey || ''}
            scriptProps={{
              async: false,
              defer: false,
              appendTo: 'head',
              nonce: undefined,
            }}
          >
            <Router>
              <AppContent />
            </Router>
          </GoogleReCaptchaProvider>
        </HelmetProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}

export default App;
