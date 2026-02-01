import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, Zap } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SEOAuditButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const auditMutation = trpc.seo.auditAll.useQuery(undefined, {
    enabled: false,
  });

  const autoFixMutation = trpc.seo.autoFix.useMutation();

  const handleRunAudit = async () => {
    setIsRunning(true);
    try {
      const result = await auditMutation.refetch();
      if (result.data?.data) {
        setAuditResult(result.data.data);
        toast.success("SEO audit completed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to run SEO audit");
    } finally {
      setIsRunning(false);
    }
  };

  const handleAutoFix = async () => {
    try {
      const result = await autoFixMutation.mutateAsync({} as any);
      if (result.success) {
        toast.success(result.data?.message || "Issues fixed successfully");
        // Re-run audit to see updated results
        handleRunAudit();
      } else {
        toast.error(result.error || "Failed to auto-fix issues");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to auto-fix issues");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-50";
    if (score >= 80) return "bg-blue-50";
    if (score >= 70) return "bg-yellow-50";
    if (score >= 60) return "bg-orange-50";
    return "bg-red-50";
  };

  return (
    <>
      <Button
        onClick={() => {
          setIsOpen(true);
          handleRunAudit();
        }}
        className="gap-2"
        size="lg"
      >
        <Zap className="h-5 w-5" />
        Run SEO Audit
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comprehensive SEO Audit</DialogTitle>
            <DialogDescription>
              Analyze your entire website for SEO issues and get recommendations
            </DialogDescription>
          </DialogHeader>

          {isRunning || auditMutation.isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-gray-600">Running comprehensive SEO audit...</p>
            </div>
          ) : auditResult ? (
            <div className="space-y-6">
              {/* Score Card */}
              <Card className={getScoreBgColor(auditResult.score)}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>SEO Score</span>
                    <span className={`text-4xl font-bold ${getScoreColor(auditResult.score)}`}>
                      {auditResult.score}
                    </span>
                  </CardTitle>
                  <CardDescription>{auditResult.explanation}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={auditResult.score} className="h-3" />
                </CardContent>
              </Card>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">{auditResult.totalPages}</p>
                      <p className="text-sm text-gray-600">Total Pages</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-600">{auditResult.totalIssues}</p>
                      <p className="text-sm text-gray-600">Total Issues</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-orange-600">{auditResult.criticalIssues}</p>
                      <p className="text-sm text-gray-600">Critical Issues</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Issues List */}
              {auditResult.issues.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Detected Issues</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {auditResult.issues.map((issue: any) => (
                      <div
                        key={issue.id}
                        className={`p-3 rounded-lg border-l-4 ${
                          issue.severity === "critical"
                            ? "bg-red-50 border-red-500"
                            : issue.severity === "high"
                            ? "bg-orange-50 border-orange-500"
                            : issue.severity === "medium"
                            ? "bg-yellow-50 border-yellow-500"
                            : "bg-blue-50 border-blue-500"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {issue.severity === "critical" ? (
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{issue.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{issue.description}</p>
                            <p className="text-xs text-gray-700 mt-1 font-semibold">
                              Suggestion: {issue.suggestion}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Page: {issue.page}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {auditResult.issues.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <p className="text-green-600 font-semibold">No SEO issues found!</p>
                  <p className="text-gray-600 text-sm">Your website is well-optimized for SEO</p>
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            {auditResult && auditResult.issues.length > 0 && (
              <Button
                onClick={handleAutoFix}
                disabled={autoFixMutation.isPending}
                className="gap-2"
              >
                {autoFixMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fixing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Auto-Fix Issues
                  </>
                )}
              </Button>
            )}
            {!auditResult && !isRunning && (
              <Button onClick={handleRunAudit} disabled={isRunning}>
                {isRunning ? "Running..." : "Run Audit"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
