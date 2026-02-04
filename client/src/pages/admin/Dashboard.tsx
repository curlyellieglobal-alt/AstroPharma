import { Route, Switch, useLocation, Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  Image, 
  Settings, 
  Search,
  Users,
  LogOut,
  Menu,
  X,
  MessageCircle,
  Footprints,
  Mail,
  ImageIcon,
  FolderOpen,
  CreditCard,
  Shield
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import AdminProducts from "./Products";
import AdminOrders from "./Orders";
import AdminBlog from "./Blog";
import AdminPageBuilder from "./PageBuilder";
import AdminSEO from "./SEO";
import AdminChat from "./Chat";
import { SavedReplies } from "./SavedReplies";
import { PagesManagement } from "./Pages";
import WhatsAppSettings from "./WhatsAppSettings";
import { WhatsAppSettingsManager } from "./WhatsAppSettingsManager";
import NotificationCenter from "@/components/NotificationCenter";
import HomePageManager from "./HomePageManager";
import AdminFooter from "./Footer";
import AdminNewsletter from "./Newsletter";
import AdminSiteLogo from "./SiteLogo";
import MediaLibrary from "./MediaLibrary";
import AdminCoupons from "./Coupons";
import AdminFAQ from "./FAQ";
import PaymentMethodsSettings from "../PaymentMethodsSettings";
import SecuritySettings from "./SecuritySettings";
import SEOAudit from "./SEOAudit";
import { SEOAuditButton } from "@/components/SEOAuditButton";

function DashboardHome() {
  const { data: products } = trpc.products.listAll.useQuery();
  const { data: orders } = trpc.orders.listAll.useQuery();
  const { data: blogPosts } = trpc.blog.listAll.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      <div className="flex justify-end mb-4">
        <SEOAuditButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Products</p>
              <h3 className="text-2xl font-bold mt-2">{products?.length || 0}</h3>
            </div>
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <h3 className="text-2xl font-bold mt-2">{orders?.length || 0}</h3>
            </div>
            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Blog Posts</p>
              <h3 className="text-2xl font-bold mt-2">{blogPosts?.length || 0}</h3>
            </div>
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <div className="space-y-4">
          {orders?.slice(0, 5).map((order) => (
            <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium">{order.orderNumber}</p>
                <p className="text-sm text-muted-foreground">{order.customerName}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">${order.total}</p>
                <p className="text-sm text-muted-foreground">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Dashboard is now accessible without authentication (demo mode)

  const handleLogout = () => {
    toast.info("Logout functionality disabled (OAuth not configured)");
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/home-page", icon: Image, label: "Home Page" },
    { path: "/admin/products", icon: Package, label: "Products" },
    { path: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { path: "/admin/payment-methods", icon: CreditCard, label: "Payment Methods" },
    { path: "/admin/chat", icon: MessageCircle, label: "Live Chat" },
    { path: "/admin/saved-replies", icon: MessageCircle, label: "Saved Replies" },
    { path: "/admin/whatsapp", icon: MessageCircle, label: "WhatsApp Settings" },
    { path: "/admin/blog", icon: FileText, label: "Blog" },
    { path: "/admin/pages", icon: FileText, label: "Pages" },
    { path: "/admin/page-builder", icon: Image, label: "Page Builder" },
    { path: "/admin/seo", icon: Search, label: "SEO" },
    { path: "/admin/seo-audit", icon: Search, label: "SEO Audit" },
    { path: "/admin/footer", icon: Footprints, label: "Footer" },
    { path: "/admin/newsletter", icon: Mail, label: "Newsletter" },
    { path: "/admin/site-logo", icon: ImageIcon, label: "Site Logo" },
    { path: "/admin/media-library", icon: FolderOpen, label: "Media Library" },
    { path: "/admin/coupons", icon: Package, label: "Coupons" },
    { path: "/admin/faq", icon: MessageCircle, label: "FAQ" },
    { path: "/admin/referral-program", icon: Users, label: "Referral Program" },
    { path: "/admin/email-campaigns", icon: Mail, label: "Email Campaigns" },
    { path: "/admin/analytics", icon: LayoutDashboard, label: "Analytics" },
    { path: "/admin/settings", icon: Settings, label: "Settings" },
    { path: "/admin/security", icon: Shield, label: "Security Settings" }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">Curly Ellie Admin</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static
        top-0 bottom-0 left-0
        w-64 bg-white border-r flex flex-col
        z-50
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold">Curly Ellie Admin</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.path || (item.path !== "/admin" && location.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={closeMobileMenu}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-muted-foreground">admin@example.com</p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 pt-14 lg:pt-0">
        {/* Header with Notification Center */}
        <div className="hidden lg:flex bg-white border-b px-8 py-4 items-center justify-between">
          <h2 className="text-xl font-semibold">Admin Panel</h2>
          <NotificationCenter />
        </div>
        
        <div className="p-4 lg:p-8">
          <Switch>
            <Route path="/admin" component={DashboardHome} />
            <Route path="/admin/home-page" component={HomePageManager} />
            <Route path="/admin/products" component={AdminProducts} />
            <Route path="/admin/orders" component={AdminOrders} />
            <Route path="/admin/chat" component={AdminChat} />
            <Route path="/admin/saved-replies" component={SavedReplies} />
            <Route path="/admin/whatsapp" component={WhatsAppSettingsManager} />
            <Route path="/admin/blog" component={AdminBlog} />
            <Route path="/admin/pages" component={PagesManagement} />
            <Route path="/admin/page-builder" component={AdminPageBuilder} />
            <Route path="/admin/seo" component={AdminSEO} />
            <Route path="/admin/seo-audit" component={SEOAudit} />
            <Route path="/admin/footer" component={AdminFooter} />
            <Route path="/admin/newsletter" component={AdminNewsletter} />
            <Route path="/admin/site-logo" component={AdminSiteLogo} />
            <Route path="/admin/media-library" component={MediaLibrary} />
            <Route path="/admin/coupons" component={AdminCoupons} />
            <Route path="/admin/faq" component={AdminFAQ} />
            <Route path="/admin/payment-methods" component={PaymentMethodsSettings} />
            <Route path="/admin/security" component={SecuritySettings} />
          </Switch>
        </div>
      </main>
    </div>
  );
}
