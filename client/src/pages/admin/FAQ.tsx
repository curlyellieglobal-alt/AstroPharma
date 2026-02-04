import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function FAQAdmin() {
  const utils = trpc.useUtils();
  
  const { data: menus, isLoading } = trpc.faq.listMenus.useQuery();
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
  const { data: items } = trpc.faq.listItems.useQuery(
    { menuId: selectedMenuId || undefined },
    { enabled: !!selectedMenuId }
  );

  // Menu mutations
  const createMenu = trpc.faq.createMenu.useMutation({
    onSuccess: () => {
      utils.faq.listMenus.invalidate();
      toast.success("Menu created successfully");
    },
  });

  const updateMenu = trpc.faq.updateMenu.useMutation({
    onSuccess: () => {
      utils.faq.listMenus.invalidate();
      toast.success("Menu updated successfully");
    },
  });

  const deleteMenu = trpc.faq.deleteMenu.useMutation({
    onSuccess: () => {
      utils.faq.listMenus.invalidate();
      setSelectedMenuId(null);
      toast.success("Menu deleted successfully");
    },
  });

  // Item mutations
  const createItem = trpc.faq.createItem.useMutation({
    onSuccess: () => {
      utils.faq.listItems.invalidate();
      toast.success("FAQ item created successfully");
    },
  });

  const updateItem = trpc.faq.updateItem.useMutation({
    onSuccess: () => {
      utils.faq.listItems.invalidate();
      toast.success("FAQ item updated successfully");
    },
  });

  const deleteItem = trpc.faq.deleteItem.useMutation({
    onSuccess: () => {
      utils.faq.listItems.invalidate();
      toast.success("FAQ item deleted successfully");
    },
  });

  const [menuForm, setMenuForm] = useState({
    title: "",
    titleAr: "",
    displayOrder: 0,
    isVisible: true,
  });

  const [itemForm, setItemForm] = useState({
    question: "",
    questionAr: "",
    answer: "",
    answerAr: "",
    linkUrl: "",
    linkText: "",
    linkTextAr: "",
    displayOrder: 0,
    isVisible: true,
  });

  const [editingMenu, setEditingMenu] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<number | null>(null);

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">FAQ Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage FAQ menus and items (displayed above footer)
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingMenu(null);
              setMenuForm({ title: "", titleAr: "", displayOrder: 0, isVisible: true });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Menu
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMenu ? "Edit Menu" : "Create New Menu"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title (English)</Label>
                <Input
                  value={menuForm.title}
                  onChange={(e) => setMenuForm({ ...menuForm, title: e.target.value })}
                  placeholder="e.g., Shipping & Delivery"
                />
              </div>
              <div>
                <Label>Title (Arabic)</Label>
                <Input
                  value={menuForm.titleAr}
                  onChange={(e) => setMenuForm({ ...menuForm, titleAr: e.target.value })}
                  placeholder="مثال: الشحن والتوصيل"
                  dir="rtl"
                />
              </div>
              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={menuForm.displayOrder}
                  onChange={(e) => setMenuForm({ ...menuForm, displayOrder: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={menuForm.isVisible}
                  onCheckedChange={(checked) => setMenuForm({ ...menuForm, isVisible: checked })}
                />
                <Label>Visible on frontend</Label>
              </div>
              <Button
                onClick={() => {
                  if (editingMenu) {
                    updateMenu.mutate({ id: editingMenu, ...menuForm });
                  } else {
                    createMenu.mutate(menuForm);
                  }
                }}
                disabled={!menuForm.title}
              >
                {editingMenu ? "Update" : "Create"} Menu
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menus List */}
        <Card>
          <CardHeader>
            <CardTitle>FAQ Menus ({menus?.length || 0}/3)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {menus?.map((menu) => (
              <div
                key={menu.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedMenuId === menu.id ? "bg-accent" : "hover:bg-accent/50"
                }`}
                onClick={() => setSelectedMenuId(menu.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{menu.title}</div>
                    {menu.titleAr && (
                      <div className="text-sm text-muted-foreground" dir="rtl">{menu.titleAr}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {menu.isVisible ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingMenu(menu.id);
                        setMenuForm({
                          title: menu.title,
                          titleAr: menu.titleAr || "",
                          displayOrder: menu.displayOrder,
                          isVisible: menu.isVisible,
                        });
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this menu and all its items?")) {
                          deleteMenu.mutate({ id: menu.id });
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Items List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedMenuId
                  ? `FAQ Items - ${menus?.find((m) => m.id === selectedMenuId)?.title}`
                  : "Select a menu"}
              </CardTitle>
              {selectedMenuId && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingItem(null);
                        setItemForm({
                          question: "",
                          questionAr: "",
                          answer: "",
                          answerAr: "",
                          linkUrl: "",
                          linkText: "",
                          linkTextAr: "",
                          displayOrder: 0,
                          isVisible: true,
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingItem ? "Edit FAQ Item" : "Create New FAQ Item"}</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="en">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="en">English</TabsTrigger>
                        <TabsTrigger value="ar">Arabic</TabsTrigger>
                      </TabsList>
                      <TabsContent value="en" className="space-y-4">
                        <div>
                          <Label>Question</Label>
                          <Input
                            value={itemForm.question}
                            onChange={(e) => setItemForm({ ...itemForm, question: e.target.value })}
                            placeholder="What is your shipping policy?"
                          />
                        </div>
                        <div>
                          <Label>Answer</Label>
                          <Textarea
                            value={itemForm.answer}
                            onChange={(e) => setItemForm({ ...itemForm, answer: e.target.value })}
                            placeholder="We ship worldwide..."
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label>Link URL (optional)</Label>
                          <Input
                            value={itemForm.linkUrl}
                            onChange={(e) => setItemForm({ ...itemForm, linkUrl: e.target.value })}
                            placeholder="/shipping-policy"
                          />
                        </div>
                        <div>
                          <Label>Link Text (optional)</Label>
                          <Input
                            value={itemForm.linkText}
                            onChange={(e) => setItemForm({ ...itemForm, linkText: e.target.value })}
                            placeholder="Learn more"
                          />
                        </div>
                      </TabsContent>
                      <TabsContent value="ar" className="space-y-4">
                        <div>
                          <Label>السؤال (Arabic)</Label>
                          <Input
                            value={itemForm.questionAr}
                            onChange={(e) => setItemForm({ ...itemForm, questionAr: e.target.value })}
                            placeholder="ما هي سياسة الشحن؟"
                            dir="rtl"
                          />
                        </div>
                        <div>
                          <Label>الإجابة (Arabic)</Label>
                          <Textarea
                            value={itemForm.answerAr}
                            onChange={(e) => setItemForm({ ...itemForm, answerAr: e.target.value })}
                            placeholder="نشحن إلى جميع أنحاء العالم..."
                            rows={4}
                            dir="rtl"
                          />
                        </div>
                        <div>
                          <Label>نص الرابط (Arabic)</Label>
                          <Input
                            value={itemForm.linkTextAr}
                            onChange={(e) => setItemForm({ ...itemForm, linkTextAr: e.target.value })}
                            placeholder="اعرف المزيد"
                            dir="rtl"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Display Order</Label>
                        <Input
                          type="number"
                          value={itemForm.displayOrder}
                          onChange={(e) => setItemForm({ ...itemForm, displayOrder: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={itemForm.isVisible}
                          onCheckedChange={(checked) => setItemForm({ ...itemForm, isVisible: checked })}
                        />
                        <Label>Visible on frontend</Label>
                      </div>
                      <Button
                        onClick={() => {
                          if (editingItem) {
                            updateItem.mutate({ id: editingItem, ...itemForm });
                          } else {
                            createItem.mutate({ menuId: selectedMenuId!, ...itemForm });
                          }
                        }}
                        disabled={!itemForm.question || !itemForm.answer}
                      >
                        {editingItem ? "Update" : "Create"} Item
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {!selectedMenuId && (
              <p className="text-center text-muted-foreground py-8">
                Select a menu from the left to view its FAQ items
              </p>
            )}
            {selectedMenuId && items?.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-medium">{item.question}</div>
                    {item.questionAr && (
                      <div className="text-sm text-muted-foreground mt-1" dir="rtl">{item.questionAr}</div>
                    )}
                    <div className="text-sm mt-2">{item.answer}</div>
                    {item.answerAr && (
                      <div className="text-sm text-muted-foreground mt-1" dir="rtl">{item.answerAr}</div>
                    )}
                    {item.linkUrl && (
                      <div className="text-sm text-primary mt-2">
                        🔗 {item.linkText || item.linkUrl}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        updateItem.mutate({
                          id: item.id,
                          isVisible: !item.isVisible,
                        });
                      }}
                      title={item.isVisible ? "Hide" : "Show"}
                    >
                      {item.isVisible ? (
                        <Eye className="h-3 w-3 text-green-600" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const currentIndex = items.findIndex((i) => i.id === item.id);
                        if (currentIndex > 0) {
                          const prevItem = items[currentIndex - 1];
                          updateItem.mutate({
                            id: item.id,
                            displayOrder: prevItem.displayOrder,
                          });
                          updateItem.mutate({
                            id: prevItem.id,
                            displayOrder: item.displayOrder,
                          });
                        }
                      }}
                      disabled={items.findIndex((i) => i.id === item.id) === 0}
                      title="Move up"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const currentIndex = items.findIndex((i) => i.id === item.id);
                        if (currentIndex < items.length - 1) {
                          const nextItem = items[currentIndex + 1];
                          updateItem.mutate({
                            id: item.id,
                            displayOrder: nextItem.displayOrder,
                          });
                          updateItem.mutate({
                            id: nextItem.id,
                            displayOrder: item.displayOrder,
                          });
                        }
                      }}
                      disabled={items.findIndex((i) => i.id === item.id) === items.length - 1}
                      title="Move down"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingItem(item.id);
                        setItemForm({
                          question: item.question,
                          questionAr: item.questionAr || "",
                          answer: item.answer,
                          answerAr: item.answerAr || "",
                          linkUrl: item.linkUrl || "",
                          linkText: item.linkText || "",
                          linkTextAr: item.linkTextAr || "",
                          displayOrder: item.displayOrder,
                          isVisible: item.isVisible,
                        });
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm("Delete this FAQ item?")) {
                          deleteItem.mutate({ id: item.id });
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
