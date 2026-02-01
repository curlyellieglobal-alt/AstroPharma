import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Loader2, ShoppingCart, ArrowRight, Play } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Logo } from "@/components/Logo";
import { getLoginUrl } from "@/const";
import CustomerNotificationCenter from "@/components/CustomerNotificationCenter";
import { CurrencySelector } from "@/components/CurrencySelector";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/contexts/CurrencyContext";
import { convertToYouTubeEmbed, isVideoFile } from "@/lib/videoUtils";

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { formatPrice } = useCurrency();
  
  const { data: sections, isLoading } = trpc.pageSections.list.useQuery({ pageName: "home" });
  // Logo now handled by shared Logo component
  const { data: featuredProducts } = trpc.products.featured.useQuery();

  // Add structured data (Schema.org) for SEO
  useEffect(() => {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "CurlyEllie",
      "url": "https://curlyshop-fy8vmhzm.manus.space",
      "description": "Premium hair care solutions for curly hair",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Helper to parse JSON content safely
  const parseContent = (content: any) => {
    if (typeof content === 'string') {
      try {
        return JSON.parse(content);
      } catch (e) {
        return { text: content };
      }
    }
    return content || {};
  };

  const getSection = (key: string) => sections?.find(s => s.sectionKey === key);
  const heroSection = getSection("hero");
  const productDetailsSection = getSection("product_details");
  const carouselSection = getSection("carousel");
  const videoSection = getSection("video");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <Link href="/">
              <a className="flex items-center">
                <Logo className="w-auto h-16 md:h-20 object-contain" />
              </a>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/products"><a className="hover:text-primary transition-colors font-medium">{t("products")}</a></Link>
              <Link href="/about"><a className="hover:text-primary transition-colors font-medium">{t("about")}</a></Link>
              <Link href="/blog"><a className="hover:text-primary transition-colors font-medium">{t("blog")}</a></Link>
              <Link href="/contact"><a className="hover:text-primary transition-colors font-medium">{t("contact")}</a></Link>
              <Link href="/admin-login"><a className="text-primary hover:text-primary/80 transition-colors font-medium">Admin Login</a></Link>
              <LanguageSelector />
              <CurrencySelector />
            </nav>
            <div className="flex items-center gap-2">
              {user && user.role !== "admin" && <CustomerNotificationCenter />}
              {!user && (
                <Link href="/guest-login">
                  <Button variant="outline" size="sm" className="text-sm font-medium">
                    Login / Guest
                  </Button>
                </Link>
              )}
              <Link href="/cart">
                <Button variant="outline" size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        {heroSection?.isVisible && (
          <section className="relative bg-gradient-to-br from-rose-50 via-white to-amber-50 section-padding">
            <div className="container-wide">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                <div className="content-spacing max-w-2xl">
                  <h1 className="text-4xl md:text-5xl uppercase">
                    <span className="text-black font-light">Curly</span>
                    <span className="text-amber-900 font-bold ml-2">Ellie</span>
                  </h1>
                  <p className="text-lg text-gray-600 leading-relaxed mt-4">
                    {heroSection.content || "Professional hair care solution..."}
                  </p>
                  <div className="flex gap-4 mt-8">
                    <Link href="/products">
                      <Button size="lg" className="bg-rose-600 hover:bg-rose-700">
                        Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </div>
                </div>
                {heroSection.data && (heroSection.data as any).imageUrl && (
                  <div className="relative">
                    <img
                      src={(heroSection.data as any).imageUrl}
                      alt="Hero"
                      className="w-full h-auto rounded-lg shadow-2xl"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Product Details Section */}
        {productDetailsSection?.isVisible && (
          <section className="py-1 md:py-2 bg-gradient-to-br from-amber-50 to-rose-50">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {productDetailsSection.title || "Why Choose Us"}
                </h2>
                <p className="text-gray-600 text-lg">
                  {productDetailsSection.content || "Discover the benefits of our premium hair care products"}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { color: "bg-gradient-to-br from-pink-400 to-pink-500", title: "Non-Sticky Formula", desc: "Lightweight and non-greasy texture" },
                  { color: "bg-gradient-to-br from-rose-500 to-red-600", title: "Medical Grade", desc: "Clinically tested and approved" },
                  { color: "bg-gradient-to-br from-red-600 to-rose-700", title: "Natural Ingredients", desc: "Safe for all hair types" }
                ].map((item, i) => (
                  <div key={i} className={`${item.color} rounded-lg p-8 text-center shadow-md hover:shadow-lg transition-shadow text-white`}>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-white/90">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Carousel Section */}
        {carouselSection?.isVisible && carouselSection.data && (carouselSection.data as any).images?.length > 0 && (
          <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
                {carouselSection.title || "Product Carousel"}
              </h2>
              <ProductCarousel images={(carouselSection.data as any).images} />
            </div>
          </section>
        )}

        {/* Video Section - YouTube or External Video */}
        {videoSection?.isVisible && (
          <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {videoSection.title || "See It In Action"}
                  </h2>
                  {videoSection.content && videoSection.content !== "https://www.youtube.com/embed/VIDEO_ID" ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg bg-black">
                      {isVideoFile(videoSection.content) ? (
                        <video
                          src={videoSection.content}
                          title="Product Video"
                          className="w-full h-full"
                          controls
                          controlsList="nodownload"
                        />
                      ) : (
                        <iframe
                          src={convertToYouTubeEmbed(videoSection.content)}
                          title="Product Video"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      )}
                    </div>
                  ) : (
                    <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
                      <div className="text-center p-8">
                        <Play className="h-48 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">Add a video URL in the dashboard to display here</p>
                        <p className="text-sm text-gray-500 mt-2">Supports YouTube URLs or direct video files (MP4, WebM)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Featured Products */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
                Featured Products
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {featuredProducts.slice(0, 3).map((product) => (
                  <Link key={product.id} href={`/products/${product.slug}`}>
                    <a className="group block">
                      <div className="border rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
                        <div className="h-64 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                          {product.images && product.images.length > 0 && (
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                        </div>
                        <div className="p-6">
                          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.shortDescription}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-rose-600">{formatPrice(parseFloat(product.price), product.currency || "EGP")}</span>
                            <Button size="sm" className="bg-rose-600 hover:bg-rose-700">
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer removed - now using dynamic Footer component from App.tsx */}
    </div>
  );
}

function ProductCarousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    if (!isAutoRotating || images.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, [isAutoRotating, images.length]);

  // Cleanup pause timer on unmount
  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
    };
  }, []);

  const pauseAutoRotate = () => {
    setIsAutoRotating(false);

    // Clear any existing pause timer
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }

    // Resume auto-rotation after 5 seconds of inactivity
    pauseTimerRef.current = setTimeout(() => {
      setIsAutoRotating(true);
    }, 5000);
  };

  const nextSlide = () => {
    pauseAutoRotate();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    pauseAutoRotate();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative">
      <div className="aspect-square rounded-lg overflow-hidden shadow-lg bg-white cursor-pointer" onClick={pauseAutoRotate}>
        <img 
          src={images[currentIndex]} 
          alt={`Slide ${currentIndex + 1}`}
          className="w-full h-full object-contain"
        />
        {images.length > 1 && isAutoRotating && (
          <div className="absolute top-4 right-4 bg-green-500/80 text-white px-3 py-1 rounded-full text-xs font-medium">
            Auto-rotating
          </div>
        )}
      </div>
      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
            aria-label="Previous slide"
          >
            ←
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
            aria-label="Next slide"
          >
            →
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  pauseAutoRotate();
                  setCurrentIndex(i);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex ? "bg-rose-600 w-8" : "bg-gray-300"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
