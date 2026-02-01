import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertCircle, CheckCircle, Search, TrendingUp, Link2, AlertTriangle, X } from "lucide-react";

export default function SEOManagement() {
  const [activeTab, setActiveTab] = useState("settings");
  const [siteTitle, setSiteTitle] = useState("CurlyEllie - Premium Hair Care");
  const [siteDescription, setSiteDescription] = useState("Premium hair care solutions for curly hair");
  const [siteKeywords, setSiteKeywords] = useState("curly hair care, hair lotion, hair treatment");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");
  const [googleSearchConsoleId, setGoogleSearchConsoleId] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("@CurlyEllie");
  const [editingPage, setEditingPage] = useState<{ url: string; title: string } | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editKeywords, setEditKeywords] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">SEO Management Dashboard</h1>
          <p className="text-gray-600">Manage all SEO settings and monitor your website's search performance</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="backlinks">Backlinks</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
          </TabsList>

          {/* SEO Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
                <CardDescription>Configure your website's basic SEO information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Site Title</label>
                  <Input
                    value={siteTitle}
                    onChange={(e) => setSiteTitle(e.target.value)}
                    maxLength={60}
                    placeholder="Your site title (max 60 characters)"
                  />
                  <p className="text-xs text-gray-500 mt-1">{siteTitle.length}/60 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Meta Description</label>
                  <textarea
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    maxLength={160}
                    placeholder="Your site description (max 160 characters)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">{siteDescription.length}/160 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Meta Keywords</label>
                  <textarea
                    value={siteKeywords}
                    onChange={(e) => setSiteKeywords(e.target.value)}
                    placeholder="Comma-separated keywords"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                </div>

                <Button className="w-full">Save Site Information</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analytics & Verification</CardTitle>
                <CardDescription>Connect your analytics and search console accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Google Analytics ID</label>
                  <Input
                    value={googleAnalyticsId}
                    onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Google Search Console Verification</label>
                  <Input
                    value={googleSearchConsoleId}
                    onChange={(e) => setGoogleSearchConsoleId(e.target.value)}
                    placeholder="Verification code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Twitter Handle</label>
                  <Input
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                    placeholder="@YourHandle"
                  />
                </div>

                <Button className="w-full">Save Analytics Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Page SEO Settings</CardTitle>
                <CardDescription>Manage SEO for individual pages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input placeholder="Search pages..." className="flex-1" />
                    <Button variant="outline"><Search className="h-4 w-4" /></Button>
                  </div>

                  <div className="space-y-3">
                    {[
                      { url: "/", title: "Home", status: "optimized" },
                      { url: "/products", title: "Products", status: "optimized" },
                      { url: "/about", title: "About", status: "needs-work" },
                      { url: "/blog", title: "Blog", status: "optimized" },
                    ].map((page) => (
                      <div key={page.url} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{page.title}</p>
                          <p className="text-sm text-gray-500">{page.url}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {page.status === "optimized" ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingPage(page);
                              setEditTitle(page.title);
                              setEditDescription(`Description for ${page.title}`);
                              setEditKeywords(`keywords for ${page.title}`);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Indexed Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">1,247</p>
                  <p className="text-xs text-green-600 mt-1">↑ 12 this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Organic Traffic</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">3,892</p>
                  <p className="text-xs text-green-600 mt-1">↑ 8.2% this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Position</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">12.4</p>
                  <p className="text-xs text-green-600 mt-1">↑ Improved</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">4.2%</p>
                  <p className="text-xs text-gray-600 mt-1">Industry avg: 3.8%</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Keywords</CardTitle>
                <CardDescription>Your best performing keywords</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { keyword: "curly hair care", position: 3, traffic: 1240 },
                    { keyword: "hair lotion", position: 7, traffic: 892 },
                    { keyword: "premium hair products", position: 12, traffic: 456 },
                    { keyword: "healthy curls", position: 5, traffic: 304 },
                  ].map((item) => (
                    <div key={item.keyword} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.keyword}</p>
                        <p className="text-sm text-gray-500">Position: #{item.position}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.traffic}</p>
                        <p className="text-sm text-gray-500">monthly clicks</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backlinks Tab */}
          <TabsContent value="backlinks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Backlinks</CardTitle>
                <CardDescription>Monitor your website's backlinks and referring domains</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { domain: "beautymagazine.com", authority: 65, links: 3 },
                    { domain: "haircare-blog.com", authority: 42, links: 2 },
                    { domain: "wellness-hub.com", authority: 58, links: 1 },
                  ].map((item) => (
                    <div key={item.domain} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{item.domain}</p>
                          <p className="text-sm text-gray-500">{item.links} link(s)</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">DA: {item.authority}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Mobile Friendly
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Your website is fully optimized for mobile devices</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    SSL Certificate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">HTTPS is enabled and valid</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Sitemap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">sitemap.xml is present and valid</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Robots.txt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">robots.txt is configured correctly</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Issues Found</CardTitle>
                <CardDescription>Items that need attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-900">Missing meta description on 2 pages</p>
                      <p className="text-sm text-yellow-700">Add descriptions to improve CTR in search results</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-900">Page speed could be improved</p>
                      <p className="text-sm text-blue-700">Consider optimizing images and enabling caching</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Page SEO Modal */}
        <Dialog open={!!editingPage} onOpenChange={(open) => !open && setEditingPage(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Page SEO - {editingPage?.title}</DialogTitle>
              <DialogDescription>
                Update SEO settings for {editingPage?.url}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-2">Page Title</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={60}
                  placeholder="Page title (max 60 characters)"
                />
                <p className="text-xs text-gray-500 mt-1">{editTitle.length}/60 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Meta Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  maxLength={160}
                  placeholder="Meta description (max 160 characters)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">{editDescription.length}/160 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Keywords</label>
                <textarea
                  value={editKeywords}
                  onChange={(e) => setEditKeywords(e.target.value)}
                  placeholder="Comma-separated keywords"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPage(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Save logic here
                  setEditingPage(null);
                }}
                className="bg-pink-600 hover:bg-pink-700"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
