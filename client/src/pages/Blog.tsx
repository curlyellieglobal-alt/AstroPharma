import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Loader2, ShoppingCart } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function Blog() {
  const { data: posts, isLoading } = trpc.blog.listPublished.useQuery();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <Link href="/">
              <a className="flex items-center">
                <Logo className="w-auto h-48 md:h-60 object-contain drop-shadow-lg" />
              </a>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/products"><a className="hover:text-primary transition-colors">Products</a></Link>
              <Link href="/about"><a className="hover:text-primary transition-colors">About</a></Link>
              <Link href="/blog"><a className="text-primary font-medium">Blog</a></Link>
              <Link href="/contact"><a className="hover:text-primary transition-colors">Contact</a></Link>
            </nav>
            <Link href="/cart">
              <Button variant="outline" size="sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Blog & Medical Articles</h1>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts?.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <a className="group bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {post.featuredImage && (
                    <div className="aspect-video bg-gray-100">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-2 line-clamp-2">{post.title}</h2>
                    {post.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{post.authorName}</span>
                      <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
