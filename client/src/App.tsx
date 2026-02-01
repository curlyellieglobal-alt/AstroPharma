import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";

import { Route, Switch, useLocation } from "wouter";

import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { CartProvider } from "./contexts/CartContext";
import { NotificationProvider } from "./contexts/NotificationContext";

import { NotificationContainer } from "./components/NotificationContainer";
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute";
import { ChatWidget } from "./components/ChatWidget";
import { Breadcrumb } from "./components/Breadcrumb";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";
import PaymentSuccess from "./pages/PaymentSuccess";
import Wishlist from "./pages/Wishlist";
import GuestLogin from "./pages/GuestLogin";
import FAQ from "./pages/FAQ";
import NotificationSettings from "./pages/NotificationSettings";
import NotFound from "./pages/NotFound";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/Dashboard";
import ReferralProgram from "./pages/admin/ReferralProgram";
import EmailCampaigns from "./pages/admin/EmailCampaigns";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";
import SEOAudit from "./pages/admin/SEOAudit";
import SEOManagement from "./pages/SEOManagement";

import { CustomPage } from "./pages/CustomPage";

import "./i18n";

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:slug" component={ProductDetail} />
      <Route path="/about" component={About} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-confirmation" component={OrderConfirmation} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/track-order" component={OrderTracking} />
      <Route path="/notification-settings" component={NotificationSettings} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/guest-login" component={GuestLogin} />
      <Route path="/faq" component={FAQ} />

      <Route path="/page/:slug" component={CustomPage} />

      {/* Admin */}
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin/seo" component={SEOManagement} />

      <Route path="/admin/:rest*">
        <ProtectedAdminRoute>
          <AdminDashboard />
        </ProtectedAdminRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <CurrencyProvider>
            <CartProvider>
              <NotificationProvider>
                <TooltipProvider>
                  <Toaster />
                  <NotificationContainer />
                  {!isAdmin && <Breadcrumb />}
                  <Router />
                  {!isAdmin && <Footer />}
                  <ChatWidget />
                </TooltipProvider>
              </NotificationProvider>
            </CartProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
