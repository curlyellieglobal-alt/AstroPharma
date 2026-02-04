import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminFooter() {
  const { data: footerData, isLoading, refetch } = trpc.footer.get.useQuery();
  const updateMutation = trpc.footer.update.useMutation();

  const [formData, setFormData] = useState({
    companyName: "",
    companyDescription: "",
    copyrightText: "",
    address: "",
    phone: "",
    email: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    linkedinUrl: "",
    privacyPolicyUrl: "",
    termsOfServiceUrl: "",
    refundPolicyUrl: "",
  });

  useEffect(() => {
    if (footerData) {
      setFormData({
        companyName: footerData.companyName || "",
        companyDescription: footerData.companyDescription || "",
        copyrightText: footerData.copyrightText || "",
        address: footerData.address || "",
        phone: footerData.phone || "",
        email: footerData.email || "",
        facebookUrl: footerData.facebookUrl || "",
        instagramUrl: footerData.instagramUrl || "",
        twitterUrl: footerData.twitterUrl || "",
        linkedinUrl: footerData.linkedinUrl || "",
        privacyPolicyUrl: footerData.privacyPolicyUrl || "",
        termsOfServiceUrl: footerData.termsOfServiceUrl || "",
        refundPolicyUrl: footerData.refundPolicyUrl || "",
      });
    }
  }, [footerData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateMutation.mutateAsync(formData);
      toast.success("Footer settings updated successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to update footer settings");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Footer Management</h1>
        <p className="text-muted-foreground">
          Manage all footer content and links from one place
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Basic company details displayed in the footer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                placeholder="Your Company Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyDescription">Company Description</Label>
              <Textarea
                id="companyDescription"
                value={formData.companyDescription}
                onChange={(e) =>
                  setFormData({ ...formData, companyDescription: e.target.value })
                }
                placeholder="Brief description about your company"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="copyrightText">Copyright Text</Label>
              <Input
                id="copyrightText"
                value={formData.copyrightText}
                onChange={(e) =>
                  setFormData({ ...formData, copyrightText: e.target.value })
                }
                placeholder="© 2024 Your Company. All rights reserved."
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Details */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
            <CardDescription>
              Contact information displayed in the footer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="123 Main Street, City, Country"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="contact@example.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
            <CardDescription>
              Add your social media profile URLs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebookUrl">Facebook URL</Label>
                <Input
                  id="facebookUrl"
                  value={formData.facebookUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, facebookUrl: e.target.value })
                  }
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagramUrl">Instagram URL</Label>
                <Input
                  id="instagramUrl"
                  value={formData.instagramUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, instagramUrl: e.target.value })
                  }
                  placeholder="https://instagram.com/yourprofile"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitterUrl">Twitter/X URL</Label>
                <Input
                  id="twitterUrl"
                  value={formData.twitterUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, twitterUrl: e.target.value })
                  }
                  placeholder="https://twitter.com/yourprofile"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedinUrl: e.target.value })
                  }
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policy Links */}
        <Card>
          <CardHeader>
            <CardTitle>Policy Links</CardTitle>
            <CardDescription>
              Add links to your legal and policy pages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="privacyPolicyUrl">Privacy Policy URL</Label>
              <Input
                id="privacyPolicyUrl"
                value={formData.privacyPolicyUrl}
                onChange={(e) =>
                  setFormData({ ...formData, privacyPolicyUrl: e.target.value })
                }
                placeholder="/privacy-policy"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="termsOfServiceUrl">Terms of Service URL</Label>
              <Input
                id="termsOfServiceUrl"
                value={formData.termsOfServiceUrl}
                onChange={(e) =>
                  setFormData({ ...formData, termsOfServiceUrl: e.target.value })
                }
                placeholder="/terms-of-service"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="refundPolicyUrl">Refund Policy URL</Label>
              <Input
                id="refundPolicyUrl"
                value={formData.refundPolicyUrl}
                onChange={(e) =>
                  setFormData({ ...formData, refundPolicyUrl: e.target.value })
                }
                placeholder="/refund-policy"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Footer Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
