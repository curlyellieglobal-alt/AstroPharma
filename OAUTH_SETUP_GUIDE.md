# CurlyEllie - OAuth Setup Guide

## المشكلة
عند محاولة تسجيل الدخول، تظهر رسالة خطأ:
```
Permission denied
Redirect URI is not set
```

## السبب
OAuth Redirect URI لم يتم تعيينه بشكل صحيح في Manus Dashboard.

---

## الحل - خطوة بخطوة

### الخطوة 1: افتح Manus Management UI
- ابحث عن أيقونة الإعدادات في أعلى يمين الواجهة
- أو اضغط على زر "Settings" إن كان موجوداً

### الخطوة 2: اذهب إلى Settings
في الـ sidebar الأيسر، اختر **Settings**

### الخطوة 3: اختر Secrets
من قائمة Settings الفرعية، اختر **Secrets**

### الخطوة 4: أضف أو عدّل VITE_OAUTH_PORTAL_URL
ابحث عن المتغير: `VITE_OAUTH_PORTAL_URL`

**إذا كان موجوداً:**
- عدّل قيمته إلى: `https://curlyshop-fy8vmhzm.manus.space/api/oauth/callback`

**إذا لم يكن موجوداً:**
- اضغط "Add New Secret"
- اسم المتغير: `VITE_OAUTH_PORTAL_URL`
- القيمة: `https://curlyshop-fy8vmhzm.manus.space/api/oauth/callback`

### الخطوة 5: احفظ التغييرات
اضغط **Save** أو **Update**

### الخطوة 6: أعد تحميل الموقع
- أغلق الموقع تماماً
- افتحه مرة أخرى
- جرّب تسجيل الدخول

---

## معلومات إضافية

### Redirect URI الصحيح
```
https://curlyshop-fy8vmhzm.manus.space/api/oauth/callback
```

### ما هو Redirect URI؟
- هو الرابط الذي سيعود إليه المستخدم بعد تسجيل الدخول بنجاح
- يجب أن يطابق تماماً ما هو مسجل في Manus Dashboard

### إذا استمرت المشكلة
1. تأكد من نسخ الرابط بالضبط (بدون مسافات إضافية)
2. تأكد من حفظ التغييرات
3. امسح ذاكرة التخزين المؤقت (Cache) للمتصفح
4. جرّب متصفح آخر

---

## الخطوات المرئية

### 1. Management UI
```
[Manus Dashboard]
    ↓
[Settings Icon]
```

### 2. Settings Page
```
Settings
├── General
├── Domains
├── Notifications
├── Secrets ← اختر هنا
└── GitHub
```

### 3. Secrets Page
```
Secrets
├── BUILT_IN_FORGE_API_KEY
├── JWT_SECRET
├── VITE_OAUTH_PORTAL_URL ← عدّل هنا
└── ... (متغيرات أخرى)
```

### 4. Edit Secret
```
Key: VITE_OAUTH_PORTAL_URL
Value: https://curlyshop-fy8vmhzm.manus.space/api/oauth/callback
[Save Button]
```

---

## التحقق من النجاح

بعد إكمال الخطوات:
1. افتح الموقع: `https://curlyshop-fy8vmhzm.manus.space`
2. اضغط على زر "Login" أو "Sign In"
3. يجب أن تظهر صفحة تسجيل الدخول بدلاً من خطأ "Permission denied"
4. أكمل عملية التسجيل

---

## معلومات الموقع

| المعلومة | القيمة |
|---------|--------|
| **اسم الموقع** | CurlyEllie - Premium Hair Care |
| **الرابط** | https://curlyshop-fy8vmhzm.manus.space |
| **OAuth Callback** | https://curlyshop-fy8vmhzm.manus.space/api/oauth/callback |
| **المتغير المطلوب** | VITE_OAUTH_PORTAL_URL |

---

## الدعم

إذا واجهت أي مشاكل:
1. تأكد من نسخ الرابط بالضبط
2. تأكد من حفظ التغييرات
3. جرّب تحديث الصفحة (Ctrl+F5 أو Cmd+Shift+R)
4. امسح ذاكرة التخزين المؤقت للمتصفح

---

**تم إنشاء هذا الدليل بتاريخ:** 29 يناير 2026
**الإصدار:** 1.0
