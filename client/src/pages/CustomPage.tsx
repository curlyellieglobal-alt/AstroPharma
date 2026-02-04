import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

export function CustomPage() {
  const [, params] = useRoute("/page/:slug");
  const { language } = useLanguage();
  const slug = params?.slug || "";

  const { data: page, isLoading } = trpc.pages.getBySlug.useQuery({ slug });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!page || !page.isPublished) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-600">
          {language === "ar"
            ? "الصفحة المطلوبة غير موجودة"
            : "The requested page does not exist"}
        </p>
      </div>
    );
  }

  const title = language === "ar" && page.titleAr ? page.titleAr : page.title;
  const content = language === "ar" && page.contentAr ? page.contentAr : page.content;

  return (
    <div className="container mx-auto px-4 py-16" dir={language === "ar" ? "rtl" : "ltr"}>
      <article className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold mb-8">{title}</h1>
        <div
          className="space-y-4"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </article>
    </div>
  );
}
