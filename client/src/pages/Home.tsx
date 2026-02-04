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
import { SEO } from "@/components/SEO";

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { formatPrice } = useCurrency();
  
  const { data: sections, isLoading } = trpc.pageSections.list.useQuery({ pageName: "home" });
  const { data: featuredProducts } = trpc.products.featured.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO pagePath="/" />
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Logo className="h-10 w-auto" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <CurrencySelector />
            {user ? (
              <div className="flex items-center gap-4">
                <CustomerNotificationCenter />
                <Link href={isAdmin ? "/admin" : "/profile"}>
                  <Button variant="ghost">{user.name}</Button>
                </Link>
              </div>
            ) : (
              <a href={getLoginUrl()}>
                <Button>{t("common.login")}</Button>
              </a>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="container relative z-10">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                CURLY ELLIE HAIR LOTION
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                {t("home.hero_description", "Premium hair care solutions for curly hair. Nourish, define, and love your curls.")}
              </p>
              <div className="flex gap-4">
                <Link href="/products">
                  <Button size="lg" className="gap-2">
                    {t("home.shop_now")} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20 bg-muted/50">
          <div className="container">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold">{t("home.featured_products")}</h2>
              <Link href="/products">
                <Button variant="ghost" className="gap-2">
                  {t("home.view_all")} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts?.map((product) => (
                <div key={product.id} className="group relative bg-background rounded-xl border overflow-hidden transition-all hover:shadow-lg">
                  <Link href={`/products/${product.slug}`}>
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={product.images?.[0] || "/placeholder-product.png"}
                        alt={product.name}
                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-xl mb-2">{product.name}</h3>
                      <p className="text-primary font-bold">{formatPrice(product.price)}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
