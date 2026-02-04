import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link, useRoute } from "wouter";
import { Loader2, ShoppingCart } from "lucide-react";
import SocialShare from "@/components/SocialShare";
import { Logo } from "@/components/Logo";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";
  
  const { data: post, isLoading } = trpc.blog.getBySlug.useQuery({ slug });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

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
        <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          {post.featuredImage && (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full rounded-lg mb-8"
            />
          )}

          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="mb-6">
            <SocialShare
              url={window.location.href}
              title={post.title}
              description={post.excerpt || post.title}
            />
          </div>
          
          <div className="flex items-center gap-4 text-gray-600 mb-8 pb-8 border-b">
            <span>By {post.authorName}</span>
            <span>•</span>
            <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{post.viewCount} views</span>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8 pt-8 border-t">
            <Link href="/blog">
              <Button variant="outline">← Back to Blog</Button>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
