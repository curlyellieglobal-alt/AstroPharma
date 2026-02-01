import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import NotificationSettings from "@/pages/NotificationSettings";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
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
import AdminDashboard from "./pages/admin/Dashboard";
import { CustomPage } from "./pages/CustomPage";
import { ChatWidget } from "./components/ChatWidget";
import Footer from "./components/Footer";
import { useLocation } from "wouter";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { CartProvider } from "./contexts/CartContext";
import Wishlist from "./pages/Wishlist";
import GuestLogin from "./pages/GuestLogin";
import FAQ from "./pages/FAQ";
import PaymentMethodsSettings from "./pages/PaymentMethodsSettings";
import AdminLogin from "./pages/AdminLogin";
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute";
import SEOManagement from "./pages/SEOManagement";
import { Breadcrumb } from "./components/Breadcrumb";
import { NotificationProvider } from "./contexts/NotificationContext";
import { NotificationContainer } from "./components/NotificationContainer";
import ReferralProgram from "./pages/admin/ReferralProgram";
import EmailCampaigns from "./pages/admin/EmailCampaigns";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";
import SEOAudit from "./pages/admin/SEOAudit";
import "@/i18n";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
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
      
      {/* Custom Pages */}
      <Route path="/page/:slug" component={CustomPage} />
      
      {/* Admin Routes */}
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin/seo" component={SEOManagement} />
      <Route path="/admin/referral-program">
        <ProtectedAdminRoute>
          <ReferralProgram />
        </ProtectedAdminRoute>
      </Route>
      <Route path="/admin/email-campaigns">
        <ProtectedAdminRoute>
          <EmailCampaigns />
        </ProtectedAdminRoute>
      </Route>
      <Route path="/admin/analytics">
        <ProtectedAdminRoute>
          <Analytics />
        </ProtectedAdminRoute>
      </Route>
      <Route path="/admin/settings">
        <ProtectedAdminRoute>
          <Settings />
        </ProtectedAdminRoute>
      </Route>
      <Route path="/admin/seo-audit">
        <ProtectedAdminRoute>
          <SEOAudit />
        </ProtectedAdminRoute>
      </Route>
      <Route path="/admin">
        <ProtectedAdminRoute>
          <AdminDashboard />
        </ProtectedAdminRoute>
      </Route>
      <Route path="/admin/*">
        <ProtectedAdminRoute>
          <AdminDashboard />
        </ProtectedAdminRoute>
      </Route>
      
      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");

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
                  {!isAdminRoute && <Breadcrumb />}
                  <Router />
                  {!isAdminRoute && <Footer />}
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
