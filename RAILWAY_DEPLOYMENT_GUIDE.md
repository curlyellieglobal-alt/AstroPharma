# دليل نشر مشروع CurlyEllie على Railway

يهدف هذا الدليل إلى توفير خطوات مفصلة وشاملة لنشر مشروع CurlyEllie على منصة Railway، مع التركيز على حل مشكلة `502 Bad Gateway` وربط المشروع بقاعدة البيانات بشكل صحيح.

## 1. نظرة عامة على المشروع

مشروع CurlyEllie هو تطبيق ويب يعتمد على Node.js (Express) و React (Vite) مع TypeScript. يستخدم المشروع Drizzle ORM للتعامل مع قاعدة بيانات MySQL. يعتمد التطبيق على متغيرات البيئة لتكوين الاتصال بقاعدة البيانات، ومفاتيح المصادقة، وإعدادات التخزين السحابي.

## 2. تحليل مشكلة 502 Bad Gateway

عادةً ما يشير خطأ `502 Bad Gateway` في بيئات النشر مثل Railway إلى أن الخادم الوكيل (Proxy Server) لم يتمكن من تلقي استجابة صالحة من تطبيقك. الأسباب الشائعة لذلك تشمل:

*   **عدم ربط التطبيق بالمنفذ الصحيح**: يجب أن يستمع التطبيق إلى المنفذ المحدد بواسطة متغير البيئة `PORT` الذي توفره Railway.
*   **فشل بدء تشغيل التطبيق**: قد يفشل التطبيق في البدء بسبب أخطاء في الكود، أو نقص في متغيرات البيئة الأساسية، أو مشاكل في عملية البناء.
*   **مشاكل في الاتصال بقاعدة البيانات**: إذا لم يتمكن التطبيق من الاتصال بقاعدة البيانات عند بدء التشغيل، فقد يتعطل.
*   **أخطاء في ملفات التكوين**: مثل `package.json` أو `Procfile` أو `railway.json` التي توجه Railway لكيفية بناء وتشغيل التطبيق.

## 3. التصحيحات التي تم إجراؤها

تم إجراء التعديلات التالية على ملفات المشروع لضمان التوافق مع بيئة Railway وحل المشكلات المحتملة:

### أ. `server/_core/index.ts`

تم تعديل طريقة تحديد المنفذ الذي يستمع إليه الخادم. بدلاً من البحث عن منفذ متاح، سيستخدم الخادم الآن المنفذ المحدد بواسطة متغير البيئة `PORT` مباشرةً، ويربطه بجميع الواجهات الشبكية (`0.0.0.0`) لضمان إمكانية الوصول إليه من قبل Railway.

**التعديل السابق:**
```typescript
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
```

**التعديل الجديد:**
```typescript
  const port = parseInt(process.env.PORT || "3000");

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
```

### ب. `server/db.ts`

تم تحسين منطق الاتصال بقاعدة البيانات ليشمل تحققًا أفضل من وجود `DATABASE_URL` وتسجيل الأخطاء بشكل أوضح، مما يساعد في تشخيص مشاكل الاتصال بقاعدة البيانات.

**التعديل السابق:**
```typescript
export async function getDb(): Promise<ReturnType<typeof drizzle<typeof schema>> | null> {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL, { schema, mode: 'default' });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
```

**التعديل الجديد:**
```typescript
export async function getDb(): Promise<ReturnType<typeof drizzle<typeof schema>> | null> {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.warn("[Database] DATABASE_URL is not defined");
      return null;
    }
    try {
      _db = drizzle(connectionString, { schema, mode: 'default' });
      console.log("[Database] Connected successfully");
    } catch (error) {
      console.error("[Database] Connection error:", error);
      _db = null;
    }
  }
  return _db;
}
```

### ج. `package.json`

تم تحديث أمر البناء (`build`) لـ `esbuild` ليشمل `loader:.ts=ts` لضمان معالجة ملفات TypeScript بشكل صحيح أثناء عملية البناء، وتم تصحيح أمر `db:push` لاستخدام `drizzle-kit push` بدلاً من `generate && migrate`، وهو الأمر الصحيح لدفع التغييرات إلى قاعدة البيانات.

**التعديل السابق:**
```json
    "build": "vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "db:push": "drizzle-kit generate && drizzle-kit migrate"
```

**التعديل الجديد:**
```json
    "build": "vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --loader:.ts=ts",
    "db:push": "drizzle-kit push"
```

### د. `Procfile` (ملف جديد)

تم إنشاء ملف `Procfile` في الجذر لتوجيه Railway حول كيفية بدء تشغيل التطبيق في بيئة الإنتاج. هذا يضمن أن Railway تستخدم الأمر الصحيح `npm run start`.

```
web: npm run start
```

### هـ. `railway.json` (ملف جديد)

تم إنشاء ملف `railway.json` لتوفير تكوين صريح لـ Railway، بما في ذلك أوامر البناء والتشغيل، ونوع الباني (`NIXPACKS`)، وإعدادات فحص الصحة (`healthcheck`).

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "serviceName": "curlyellie"
  }
}
```

### و. `.env.example` (ملف جديد)

تم إنشاء ملف `.env.example` لتوضيح جميع متغيرات البيئة المطلوبة لتشغيل المشروع، مما يسهل على المستخدم إعداد بيئة Railway بشكل صحيح.

```dotenv
# Database Configuration
DATABASE_URL=mysql://user:password@host:port/database

# Authentication Configuration
JWT_SECRET=your_jwt_secret_here
VITE_APP_ID=your_app_id_here
OAUTH_SERVER_URL=https://auth.manus.im
OWNER_OPEN_ID=your_open_id_here

# Storage Configuration (Optional if using built-in storage)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_api_key_here

# Environment
NODE_ENV=production
PORT=3000
```

## 4. خطوات النشر على Railway

اتبع هذه الخطوات لنشر مشروعك على Railway وربطه بقاعدة البيانات.

### أ. المتطلبات الأساسية

*   حساب GitHub.
*   حساب Railway.
*   تثبيت Node.js و pnpm محليًا (للتطوير والاختبار المحلي).
*   تثبيت Railway CLI (اختياري، ولكن موصى به).

### ب. إعداد المشروع على GitHub

1.  **إنشاء مستودع جديد**: قم بإنشاء مستودع خاص (Private Repository) جديد على GitHub.
2.  **رفع الكود**: قم برفع جميع ملفات مشروعك (بما في ذلك التعديلات التي تم إجراؤها) إلى هذا المستودع.

    ```bash
    cd /path/to/your/project
    git init
    git add .
    git commit -m "Initial commit for Railway deployment"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin main
    ```

### ج. إعداد قاعدة البيانات على Railway

1.  **إنشاء مشروع جديد على Railway**: اذهب إلى لوحة تحكم Railway وانقر على `New Project`.
2.  **إضافة قاعدة بيانات MySQL**: اختر `Provision MySQL` لإضافة خدمة قاعدة بيانات MySQL إلى مشروعك.
3.  **الحصول على `DATABASE_URL`**: بعد توفير قاعدة البيانات، انتقل إلى إعداداتها (Settings) وانسخ `Connection String` (عادةً ما تبدأ بـ `mysql://`). هذا هو `DATABASE_URL` الخاص بك.

### د. نشر التطبيق على Railway

1.  **ربط مستودع GitHub**: في مشروع Railway الخاص بك، انقر على `New Project` ثم `Deploy from GitHub Repo`. اختر المستودع الذي قمت برفعه في الخطوة السابقة.
2.  **تكوين متغيرات البيئة**: بعد ربط المستودع، انتقل إلى إعدادات الخدمة (Service Settings) الخاصة بتطبيقك (وليس قاعدة البيانات) في Railway، ثم إلى قسم `Variables`.
    *   أضف جميع متغيرات البيئة المذكورة في ملف `.env.example`.
    *   تأكد من تعيين `DATABASE_URL` بالقيمة التي حصلت عليها من قاعدة بيانات MySQL.
    *   قم بتعيين `NODE_ENV` إلى `production`.
    *   قم بتعيين `PORT` إلى `3000` (أو أي منفذ آخر تفضله، ولكن تأكد من تطابقه مع الكود).
    *   قم بتعيين `JWT_SECRET` و `VITE_APP_ID` و `OAUTH_SERVER_URL` و `OWNER_OPEN_ID` بالقيم المناسبة لمشروعك. إذا كنت تستخدم خدمات Manus، فستحصل على هذه القيم من لوحة تحكم Manus.
    *   إذا كنت تستخدم تخزين Manus المدمج، قم بتعيين `BUILT_IN_FORGE_API_URL` و `BUILT_IN_FORGE_API_KEY`.

    **مثال على متغيرات البيئة:**
    | الاسم                   | القيمة                                        |
    | :---------------------- | :------------------------------------------- |
    | `DATABASE_URL`          | `mysql://user:password@host:port/database`   |
    | `JWT_SECRET`            | `super_secret_key_for_jwt`                   |
    | `VITE_APP_ID`           | `your_app_id_from_manus`                     |
    | `OAUTH_SERVER_URL`      | `https://auth.manus.im`                      |
    | `OWNER_OPEN_ID`         | `your_owner_open_id`                         |
    | `BUILT_IN_FORGE_API_URL`| `https://api.manus.im`                       |
    | `BUILT_IN_FORGE_API_KEY`| `your_manus_api_key`                         |
    | `NODE_ENV`              | `production`                                 |
    | `PORT`                  | `3000`                                       |

3.  **بدء النشر**: بعد إضافة المتغيرات، ستبدأ Railway تلقائيًا في عملية البناء والنشر. يمكنك مراقبة السجلات في قسم `Deployments`.

### هـ. تشغيل ترحيلات قاعدة البيانات (Database Migrations)

بعد نشر التطبيق بنجاح، تحتاج إلى تشغيل ترحيلات Drizzle لإنشاء الجداول في قاعدة البيانات الخاصة بك.

1.  **فتح Shell في Railway**: انتقل إلى خدمة تطبيقك في Railway، ثم إلى قسم `Deployments`، واختر آخر نشر ناجح. انقر على `Connect` ثم `New Terminal`.
2.  **تشغيل الترحيلات**: في الطرفية، قم بتشغيل الأمر التالي:

    ```bash
    npm run db:push
    ```

    سيقوم هذا الأمر بتشغيل Drizzle ORM لدفع مخطط قاعدة البيانات الخاص بك إلى قاعدة بيانات MySQL التي قمت بتوفيرها.

## 5. استكشاف الأخطاء وإصلاحها

*   **`502 Bad Gateway`**: تحقق من سجلات النشر (Deployment Logs) في Railway. ابحث عن أي أخطاء أثناء عملية البناء أو بدء تشغيل الخادم. تأكد من أن جميع متغيرات البيئة المطلوبة مضبوطة بشكل صحيح وأن `DATABASE_URL` صحيح.
*   **فشل الاتصال بقاعدة البيانات**: تأكد من أن `DATABASE_URL` صحيح تمامًا، بما في ذلك اسم المستخدم وكلمة المرور والمضيف والمنفذ واسم قاعدة البيانات. تحقق من أن قاعدة بيانات MySQL تعمل بشكل صحيح على Railway.
*   **أخطاء في البناء**: إذا فشل البناء، فراجع سجلات البناء (Build Logs) في Railway. قد تكون هناك حزم مفقودة أو أخطاء في الكود تحتاج إلى إصلاح.
*   **عدم عمل `npm run db:push`**: تأكد من أنك قمت بتشغيل الأمر في الطرفية الصحيحة لخدمة تطبيقك، وليس في خدمة قاعدة البيانات. تأكد أيضًا من أن `drizzle-kit` مثبت كاعتماد في `package.json`.

باتباع هذه الخطوات، يجب أن تكون قادرًا على نشر مشروع CurlyEllie بنجاح على Railway وتشغيله بدون أخطاء.
