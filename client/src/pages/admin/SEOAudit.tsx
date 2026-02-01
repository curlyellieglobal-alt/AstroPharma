import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertCircle, XCircle, Download, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AuditResult {
  page: string;
  language: string;
  h1Count: number;
  metaTitle: string;
  metaTitleLength: number;
  metaDescription: string;
  metaDescriptionLength: number;
  keywords: string[];
  imageAltMissing: number;
  totalImages: number;
  internalLinks: number;
  externalLinks: number;
  pageLoadTime: number;
  mobileOptimized: boolean;
  structuredData: boolean;
  openGraphTags: boolean;
  twitterCardTags: boolean;
  canonicalTag: boolean;
  issues: string[];
  recommendations: string[];
  score: number;
}

const pages = [
  { path: '/', label: 'Home Page', lang: 'en' },
  { path: '/products', label: 'Products', lang: 'en' },
  { path: '/blog', label: 'Blog', lang: 'en' },
  { path: '/about', label: 'About', lang: 'en' },
  { path: '/contact', label: 'Contact', lang: 'en' },
  { path: '/faq', label: 'FAQ', lang: 'en' },
];

export default function SEOAudit() {
  const [results, setResults] = useState<AuditResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ar'>('en');

  const runAudit = async () => {
    setIsLoading(true);
    try {
      const auditResults: AuditResult[] = [];

      for (const page of pages) {
        const response = await fetch(page.path);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Analyze page
        const h1Elements = doc.querySelectorAll('h1');
        const metaTitleTag = doc.querySelector('meta[name="title"]') || doc.querySelector('title');
        const metaDescriptionTag = doc.querySelector('meta[name="description"]');
        const images = doc.querySelectorAll('img');
        const links = doc.querySelectorAll('a');
        const structuredDataScript = doc.querySelector('script[type="application/ld+json"]');
        const ogTags = doc.querySelectorAll('meta[property^="og:"]');
        const twitterTags = doc.querySelectorAll('meta[name^="twitter:"]');
        const canonicalTag = doc.querySelector('link[rel="canonical"]');

        let imageAltMissing = 0;
        images.forEach((img) => {
          if (!img.getAttribute('alt')) {
            imageAltMissing++;
          }
        });

        const metaTitle = metaTitleTag?.getAttribute('content') || metaTitleTag?.textContent || '';
        const metaDescription = metaDescriptionTag?.getAttribute('content') || '';

        const issues: string[] = [];
        const recommendations: string[] = [];
        let score = 100;

        // Check H1
        if (h1Elements.length === 0) {
          issues.push('Missing H1 tag');
          recommendations.push('Add exactly one H1 tag to the page');
          score -= 10;
        } else if (h1Elements.length > 1) {
          issues.push(`Multiple H1 tags (${h1Elements.length} found)`);
          recommendations.push('Use only one H1 tag per page');
          score -= 5;
        }

        // Check Meta Title
        if (metaTitle.length === 0) {
          issues.push('Missing meta title');
          recommendations.push('Add a meta title (50-60 characters)');
          score -= 15;
        } else if (metaTitle.length < 30) {
          issues.push('Meta title too short');
          recommendations.push('Expand meta title to 50-60 characters');
          score -= 5;
        } else if (metaTitle.length > 60) {
          issues.push('Meta title too long');
          recommendations.push('Reduce meta title to 50-60 characters');
          score -= 3;
        }

        // Check Meta Description
        if (metaDescription.length === 0) {
          issues.push('Missing meta description');
          recommendations.push('Add a meta description (150-160 characters)');
          score -= 15;
        } else if (metaDescription.length < 120) {
          issues.push('Meta description too short');
          recommendations.push('Expand meta description to 150-160 characters');
          score -= 5;
        } else if (metaDescription.length > 160) {
          issues.push('Meta description too long');
          recommendations.push('Reduce meta description to 150-160 characters');
          score -= 3;
        }

        // Check Images
        if (imageAltMissing > 0) {
          issues.push(`${imageAltMissing} images missing alt text`);
          recommendations.push('Add descriptive alt text to all images for SEO and accessibility');
          score -= imageAltMissing * 2;
        }

        // Check Links
        let internalLinks = 0;
        let externalLinks = 0;
        links.forEach((link) => {
          const href = link.getAttribute('href') || '';
          if (href.startsWith('http')) {
            externalLinks++;
          } else if (href.startsWith('/')) {
            internalLinks++;
          }
        });

        // Check Structured Data
        if (!structuredDataScript) {
          issues.push('Missing structured data (Schema.org)');
          recommendations.push('Add Schema.org structured data for better search engine understanding');
          score -= 10;
        }

        // Check Open Graph
        if (ogTags.length === 0) {
          issues.push('Missing Open Graph tags');
          recommendations.push('Add Open Graph tags for social media sharing');
          score -= 5;
        }

        // Check Twitter Card
        if (twitterTags.length === 0) {
          issues.push('Missing Twitter Card tags');
          recommendations.push('Add Twitter Card tags for better Twitter sharing');
          score -= 3;
        }

        // Check Canonical
        if (!canonicalTag) {
          issues.push('Missing canonical tag');
          recommendations.push('Add canonical tag to prevent duplicate content issues');
          score -= 5;
        }

        const result: AuditResult = {
          page: page.label,
          language: page.lang,
          h1Count: h1Elements.length,
          metaTitle,
          metaTitleLength: metaTitle.length,
          metaDescription,
          metaDescriptionLength: metaDescription.length,
          keywords: [],
          imageAltMissing,
          totalImages: images.length,
          internalLinks,
          externalLinks,
          pageLoadTime: 0,
          mobileOptimized: true,
          structuredData: !!structuredDataScript,
          openGraphTags: ogTags.length > 0,
          twitterCardTags: twitterTags.length > 0,
          canonicalTag: !!canonicalTag,
          issues,
          recommendations,
          score: Math.max(0, score),
        };

        auditResults.push(result);
      }

      setResults(auditResults);
      toast.success(`SEO audit completed for ${auditResults.length} pages`);
    } catch (error) {
      toast.error('Failed to run SEO audit');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const exportReport = () => {
    const report = JSON.stringify(results, null, 2);
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-audit-${new Date().toISOString()}.json`;
    a.click();
    toast.success('Report exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SEO Audit</h1>
          <p className="text-muted-foreground">Comprehensive SEO analysis for your website</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runAudit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Audit...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Audit
              </>
            )}
          </Button>
          {results.length > 0 && (
            <Button variant="outline" onClick={exportReport}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          )}
        </div>
      </div>

      {results.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Click "Run Audit" to analyze your website's SEO</p>
            <Button onClick={runAudit} size="lg">
              Start SEO Audit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result) => (
                <Card key={result.page} className={getScoreBgColor(result.score)}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{result.page}</span>
                      <span className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                        {result.score}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {result.h1Count === 1 ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>H1 Tags: {result.h1Count}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.metaTitleLength > 0 && result.metaTitleLength <= 60 ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>Meta Title: {result.metaTitleLength} chars</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.metaDescriptionLength > 0 && result.metaDescriptionLength <= 160 ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>Meta Description: {result.metaDescriptionLength} chars</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.imageAltMissing === 0 ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>Image Alt Text: {result.imageAltMissing} missing</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {results.map((result) => (
              <Card key={result.page}>
                <CardHeader>
                  <CardTitle>{result.page}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Meta Title</p>
                      <p className="text-sm mt-1">{result.metaTitle || 'Not set'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.metaTitleLength} characters (recommended: 50-60)
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Meta Description</p>
                      <p className="text-sm mt-1">{result.metaDescription || 'Not set'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.metaDescriptionLength} characters (recommended: 150-160)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">H1 Tags</p>
                      <p className="text-2xl font-bold mt-1">{result.h1Count}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Images</p>
                      <p className="text-2xl font-bold mt-1">{result.totalImages}</p>
                      <p className="text-xs text-red-600">{result.imageAltMissing} missing alt</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Internal Links</p>
                      <p className="text-2xl font-bold mt-1">{result.internalLinks}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">External Links</p>
                      <p className="text-2xl font-bold mt-1">{result.externalLinks}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Technical SEO</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        {result.structuredData ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span>Structured Data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.openGraphTags ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span>Open Graph Tags</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.twitterCardTags ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span>Twitter Card Tags</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.canonicalTag ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span>Canonical Tag</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {results.map((result) => (
              <Card key={result.page}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{result.page}</span>
                    <span className={`text-lg font-bold ${getScoreColor(result.score)}`}>
                      Score: {result.score}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.issues.length > 0 && (
                    <div>
                      <p className="font-medium text-red-600 mb-2">Issues Found:</p>
                      <ul className="space-y-1">
                        {result.issues.map((issue, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.recommendations.length > 0 && (
                    <div>
                      <p className="font-medium text-blue-600 mb-2">Recommendations:</p>
                      <ul className="space-y-1">
                        {result.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.issues.length === 0 && (
                    <div className="text-sm text-green-600 flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>No issues found! This page has excellent SEO.</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
