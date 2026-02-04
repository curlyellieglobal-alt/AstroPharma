import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Save, Upload, Trash2, Plus, X } from "lucide-react";

export default function HomePageManager() {
  const utils = trpc.useUtils();
  const { data: sections, isLoading } = trpc.pageSections.list.useQuery({ pageName: "home" });

  const updateSectionMutation = trpc.pageSections.update.useMutation({
    onSuccess: () => {
      utils.pageSections.invalidate();
      toast.success("Section updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update section: ${error.message}`);
    },
  });

  const getSection = (key: string) => sections?.find(s => s.sectionKey === key);
  const heroSection = getSection("hero");
  const productDetailsSection = getSection("product_details");
  const carouselSection = getSection("carousel");
  const videoSection = getSection("video");

  const [heroData, setHeroData] = useState({
    title: "",
    content: "",
    imageUrl: "",
    isVisible: true,
  });

  const [uploadingHero, setUploadingHero] = useState(false);

  const [productDetailsData, setProductDetailsData] = useState({
    title: "",
    subtitle: "",
    content: "",
    isVisible: true,
  });

  const [carouselData, setCarouselData] = useState({
    title: "",
    images: [] as string[],
    isVisible: true,
  });

  const [videoData, setVideoData] = useState({
    title: "",
    content: "",
    isVisible: true,
  });

  const [uploadingCarousel, setUploadingCarousel] = useState(false);

  // Initialize form data when sections load
  useEffect(() => {
    if (heroSection) {
      const heroImage = (heroSection.data as any)?.imageUrl || "";
      setHeroData({
        title: heroSection.title || "",
        content: heroSection.content || "",
        imageUrl: heroImage,
        isVisible: heroSection.isVisible,
      });
    }
    if (productDetailsSection) {
      setProductDetailsData({
        title: productDetailsSection.title || "",
        subtitle: productDetailsSection.subtitle || "",
        content: productDetailsSection.content || "",
        isVisible: productDetailsSection.isVisible,
      });
    }
    if (carouselSection) {
      const carouselImages = (carouselSection.data as any)?.images || [];
      setCarouselData({
        title: carouselSection.title || "",
        images: carouselImages,
        isVisible: carouselSection.isVisible,
      });
    }
    if (videoSection) {
      setVideoData({
        title: videoSection.title || "",
        content: videoSection.content || "",
        isVisible: videoSection.isVisible,
      });
    }
  }, [heroSection, productDetailsSection, carouselSection, videoSection]);

  const handleSaveHero = () => {
    if (!heroSection) return;
    updateSectionMutation.mutate({
      id: heroSection.id,
      title: heroData.title,
      content: heroData.content,
      data: { imageUrl: heroData.imageUrl },
      isVisible: heroData.isVisible,
    });
  };

  const handleSaveProductDetails = () => {
    if (!productDetailsSection) return;
    updateSectionMutation.mutate({
      id: productDetailsSection.id,
      title: productDetailsData.title,
      subtitle: productDetailsData.subtitle,
      content: productDetailsData.content,
      isVisible: productDetailsData.isVisible,
    });
  };

  const handleSaveCarousel = () => {
    if (!carouselSection) return;
    
    // Save carousel section with images
    updateSectionMutation.mutate({
      id: carouselSection.id,
      title: carouselData.title,
      data: { images: carouselData.images },
      isVisible: carouselData.isVisible,
    });
  };

  const handleSaveVideo = () => {
    if (!videoSection) return;
    updateSectionMutation.mutate({
      id: videoSection.id,
      title: videoData.title,
      content: videoData.content,
      isVisible: videoData.isVisible,
    });
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingHero(true);
    try {
      const file = files[0];
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      const imageUrl = data.url;
      if (!imageUrl) {
        throw new Error("No URL returned from server");
      }

      setHeroData({
        ...heroData,
        imageUrl,
      });

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingHero(false);
      e.target.value = "";
    }
  };

  const handleRemoveHeroImage = async () => {
    if (!heroData.imageUrl) return;
    
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      await deleteMediaMutation.mutateAsync({ url: heroData.imageUrl });
      setHeroData({
        ...heroData,
        imageUrl: "",
      });
      toast.success("Image deleted successfully");
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete image");
    }
  };

  const handleCarouselImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingCarousel(true);
    try {
      const file = files[0];
      const formData = new FormData();
      formData.append("file", file);

      // Upload to server
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      const imageUrl = data.url;
      if (!imageUrl) {
        throw new Error("No URL returned from server");
      }

      // Add to carousel images
      setCarouselData({
        ...carouselData,
        images: [...carouselData.images, imageUrl],
      });

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingCarousel(false);
      // Reset input
      e.target.value = "";
    }
  };

  const deleteMediaMutation = trpc.media.deleteByUrl.useMutation();

  const handleRemoveCarouselImage = async (index: number) => {
    const imageUrl = carouselData.images[index];
    
    if (!confirm(`Are you sure you want to delete this image? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete from S3 storage
      await deleteMediaMutation.mutateAsync({ url: imageUrl });
      
      // Remove from state
      const newImages = carouselData.images.filter((_, i) => i !== index);
      setCarouselData({
        ...carouselData,
        images: newImages,
      });
      
      toast.success("Image deleted successfully");
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete image");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Home Page Manager</h1>
        <p className="text-muted-foreground">Manage all content sections on the home page</p>
      </div>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="details">Product Details</TabsTrigger>
          <TabsTrigger value="carousel">Carousel</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
        </TabsList>

        {/* Hero Section Tab */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Hero Section</CardTitle>
                  <CardDescription>Main banner at the top of the home page</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {heroData.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <Switch
                    checked={heroData.isVisible}
                    onCheckedChange={(checked) => setHeroData({ ...heroData, isVisible: checked })}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hero-title">Title</Label>
                <Input
                  id="hero-title"
                  value={heroData.title}
                  onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                  placeholder="Curly Ellie Hair Lotion"
                />
              </div>
              <div>
                <Label htmlFor="hero-content">Description</Label>
                <Textarea
                  id="hero-content"
                  value={heroData.content}
                  onChange={(e) => setHeroData({ ...heroData, content: e.target.value })}
                  placeholder="Professional hair care solution..."
                  rows={4}
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Hero Image</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("hero-upload")?.click()}
                    disabled={uploadingHero}
                  >
                    {uploadingHero ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Image
                      </>
                    )}
                  </Button>
                  <input
                    id="hero-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleHeroImageUpload}
                  />
                </div>
                {heroData.imageUrl && (
                  <div className="relative group aspect-video rounded border bg-white p-2">
                    <img src={heroData.imageUrl} alt="Hero" className="w-full h-full object-contain" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleRemoveHeroImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <Button onClick={handleSaveHero} disabled={updateSectionMutation.isPending}>
                {updateSectionMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Product Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Product Details Section</CardTitle>
                  <CardDescription>Detailed product information and benefits</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {productDetailsData.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <Switch
                    checked={productDetailsData.isVisible}
                    onCheckedChange={(checked) => setProductDetailsData({ ...productDetailsData, isVisible: checked })}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="details-title">Section Title</Label>
                <Input
                  id="details-title"
                  value={productDetailsData.title}
                  onChange={(e) => setProductDetailsData({ ...productDetailsData, title: e.target.value })}
                  placeholder="Product Details"
                />
              </div>
              <div>
                <Label htmlFor="details-subtitle">Subtitle</Label>
                <Input
                  id="details-subtitle"
                  value={productDetailsData.subtitle}
                  onChange={(e) => setProductDetailsData({ ...productDetailsData, subtitle: e.target.value })}
                  placeholder="Discover the benefits..."
                />
              </div>
              <div>
                <Label htmlFor="details-content">Content (HTML supported)</Label>
                <Textarea
                  id="details-content"
                  value={productDetailsData.content}
                  onChange={(e) => setProductDetailsData({ ...productDetailsData, content: e.target.value })}
                  placeholder="<p>Product description...</p>"
                  rows={8}
                />
                <p className="text-sm text-muted-foreground mt-1">You can use HTML tags for formatting</p>
              </div>
              <Button onClick={handleSaveProductDetails} disabled={updateSectionMutation.isPending}>
                {updateSectionMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Carousel Tab */}
        <TabsContent value="carousel">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Product Carousel</CardTitle>
                  <CardDescription>Image and video carousel for product showcase</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {carouselData.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <Switch
                    checked={carouselData.isVisible}
                    onCheckedChange={(checked) => setCarouselData({ ...carouselData, isVisible: checked })}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="carousel-title">Section Title</Label>
                <Input
                  id="carousel-title"
                  value={carouselData.title}
                  onChange={(e) => setCarouselData({ ...carouselData, title: e.target.value })}
                  placeholder="Product Gallery"
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Carousel Images</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("carousel-upload")?.click()}
                    disabled={uploadingCarousel}
                  >
                    {uploadingCarousel ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Image
                      </>
                    )}
                  </Button>
                  <input
                    id="carousel-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCarouselImageUpload}
                  />
                </div>

                {carouselData.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {carouselData.images.map((imageUrl, index) => (
                      <div key={index} className="relative group aspect-square rounded border bg-white p-2">
                        <img src={imageUrl} alt={`Carousel ${index + 1}`} className="w-full h-full object-contain" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveCarouselImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                    <Upload className="h-36 w-12 mx-auto mb-4 opacity-50" />
                    <p>No images added yet. Click "Add Image" to upload.</p>
                  </div>
                )}
              </div>

              <Button onClick={handleSaveCarousel} disabled={updateSectionMutation.isPending}>
                {updateSectionMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Tab */}
        <TabsContent value="video">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Video Section</CardTitle>
                  <CardDescription>Add YouTube or external video file (MP4, WebM)</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {videoData.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <Switch
                    checked={videoData.isVisible}
                    onCheckedChange={(checked) => setVideoData({ ...videoData, isVisible: checked })}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="video-title">Section Title</Label>
                <Input
                  id="video-title"
                  value={videoData.title}
                  onChange={(e) => setVideoData({ ...videoData, title: e.target.value })}
                  placeholder="See It In Action"
                />
              </div>
              <div>
                <Label htmlFor="video-url">Video URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="video-url"
                    value={videoData.content}
                    onChange={(e) => setVideoData({ ...videoData, content: e.target.value })}
                    placeholder="https://youtu.be/VIDEO_ID or https://example.com/video.mp4"
                  />
                  {videoData.content && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setVideoData({ ...videoData, content: "" })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>YouTube:</strong> https://youtu.be/VIDEO_ID or https://www.youtube.com/watch?v=VIDEO_ID<br />
                  <strong>External Video:</strong> Direct link to MP4, WebM, or other video format
                </p>
              </div>
              {videoData.content && (
                <div className="space-y-2">
                  <Label>Video Preview</Label>
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-black">
                    {(videoData.content.endsWith('.mp4') || videoData.content.endsWith('.webm') || videoData.content.endsWith('.ogg')) ? (
                      <video
                        src={videoData.content}
                        title="Video Preview"
                        className="w-full h-full"
                        controls
                      />
                    ) : (
                      <iframe
                        src={videoData.content.includes('youtube.com') || videoData.content.includes('youtu.be') ? 
                          `https://www.youtube.com/embed/${videoData.content.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1] || videoData.content}` : 
                          videoData.content}
                        title="Video Preview"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                </div>
              )}
              <Button onClick={handleSaveVideo} disabled={updateSectionMutation.isPending}>
                {updateSectionMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
