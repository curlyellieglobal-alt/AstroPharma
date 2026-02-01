import { ChevronRight, Home } from "lucide-react";
import { Link } from "wouter";
import { useLocation } from "wouter";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

export function Breadcrumb({ items = [] }: BreadcrumbProps) {
  const [location] = useLocation();

  // Auto-generate breadcrumbs from URL if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items.length > 0) return items;

    const segments = location.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Home", href: "/" },
    ];

    let path = "";
    segments.forEach((segment, index) => {
      path += `/${segment}`;
      const label = segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      if (index === segments.length - 1) {
        // Last segment - don't make it a link
        breadcrumbs.push({ label, href: "" });
      } else {
        breadcrumbs.push({ label, href: path });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumb on home page
  if (location === "/") return null;

  return (
    <nav
      className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-2">
        {breadcrumbs.map((item, index) => (
          <li key={item.href || index} className="flex items-center gap-2">
            {item.href ? (
              <>
                <Link href={item.href} className="text-primary hover:underline">
                  {item.label}
                </Link>
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </>
            ) : (
              <>
                <span className="text-gray-600">{item.label}</span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
