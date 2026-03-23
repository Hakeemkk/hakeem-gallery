# 📁 دليل نظام رفع الملفات المتعددة - Hakeem Gallery

## 🎯 نظرة عامة
تم تطوير نظام رفع ملفات متقدم يسمح برفع عدة ملفات من جهازك مباشرة في مرحلة التجهيز والتصميم.

---

## ✨ المميزات الرئيسية

### 1️⃣ رفع ملفات متعددة في نفس الوقت
- اختر عدة ملفات من جهازك بضغطة زر واحدة
- دعم جميع أنواع الملفات (صور، PDF، تصاميم، إلخ)
- رفع آني وسريع

### 2️⃣ إدارة الملفات
- عرض قائمة بجميع الملفات المرفوعة
- معلومات كاملة: اسم الملف، الحجم، تاريخ الرفع
- تحميل الملفات في أي وقت
- حذف الملفات غير المطلوبة

### 3️⃣ البيانات الإضافية
- مقاسات المنتج (20x30 سم)
- نوع الخامة (خشب، أكريليك، إلخ)
- ملاحظات التصنيع الخاصة

### 4️⃣ روابط بديلة
- إضافة روابط تصاميم من Google Drive، Mediafire، وغيرها
- يعمل إلى جانب الملفات المرفوعة

---

## 🚀 كيفية الاستخدام

### خطوة 1: الدخول إلى صفحة الورشة
1. اذهب إلى `http://localhost:3030`
2. انتقل إلى قسم "إدارة الورشة" (Manage Workshop)

### خطوة 2: اختيار الأمر
- اضغط على أحد الأوامر في مرحلة "التجهيز" (Preparation)
- انقر على الأمر لفتح التفاصيل الكاملة

### خطوة 3: رفع الملفات
```
📁 ملفات التصميم
├─ 📤 رفع الملفات من جهازك (متعدد)
│  ├─ حقل اختيار الملفات
│  └─ زر "اختر الملفات ➕"
└─ 🔗 أو أضف رابط خارجي
```

**لرفع الملفات:**
- انقر على "اختر الملفات ➕"
- اختر عدة ملفات (Ctrl+Click على Windows)
- انقر "فتح" (Open)
- سيتم تحميل الملفات تلقائياً

### خطوة 4: إضافة البيانات الإضافية
```
📐 البيانات الإضافية
├─ المقاسات: 20x30 سم
├─ نوع الخامة: خشب / أكريليك
└─ 📝 ملاحظات التصنيع
```

### خطوة 5: الحفظ
- انقر على زر "💾 حفظ البيانات"
- سيتم حفظ جميع البيانات والملفات في قاعدة البيانات

---

## 💾 البيانات المحفوظة

### في قاعدة البيانات (MongoDB)
```json
{
  "_id": "order123",
  "customerName": "أحمد محمد",
  "uploadedFiles": [
    {
      "name": "design_v1.pdf",
      "size": 2048576,
      "url": "http://localhost:5000/uploads/1774268211584-design.pdf",
      "uploadedAt": "2026-03-23T14:30:00Z"
    },
    {
      "name": "dimensions.jpg",
      "size": 1024576,
      "url": "http://localhost:5000/uploads/1774268211584-dimensions.jpg",
      "uploadedAt": "2026-03-23T14:30:05Z"
    }
  ],
  "dimensions": "20x30 سم",
  "material": "خشب البندق",
  "adminNote": "يرجى التركيز على الزوايا الحادة",
  "fileLink": "https://drive.google.com/file/d/..."
}
```

## 📊 البنية التقنية

### Frontend (Next.js)
**الملف:** `frontend/pages/manage/workshop.js`

**الدوال الرئيسية:**
```javascript
// رفع الملفات المتعددة
handleFileUpload(orderId, files)
  ├─ تحويل كل ملف إلى FormData
  ├─ إرسال إلى POST /api/upload
  ├─ جمع URLs الملفات المرفوعة
  ├─ تحديث state المحلي
  └─ حفظ في قاعدة البيانات

// حذف ملف من القائمة
deleteUploadedFile(orderId, fileIndex)
  ├─ إزالة من state
  └─ تحديث قاعدة البيانات

// حفظ كل البيانات
saveOrderData(orderId)
  ├─ جمع: adminNote, fileLink, uploadedFiles, dimensions, material
  ├─ PATCH /api/orders/:id
  └─ تحديث الواجهة
```

### Backend (Express)
**الملف:** `backend/routes/uploadRoutes.js`

**المسار:**
```
POST /api/upload
├─ Middleware: multer.single('file')
├─ حفظ الملف في backend/uploads/
├─ Response: { success, data: { url, filename, size, originalName } }
└─ المسار: http://localhost:5000/uploads/{filename}
```

### Database (MongoDB)
**الملف:** `backend/models/Order.js`

**الحقول الجديدة:**
```javascript
uploadedFiles: [{
  name: String,        // اسم الملف
  size: Number,        // الحجم بالبايت
  url: String,         // رابط التحميل
  uploadedAt: Date     // تاريخ الرفع
}],
dimensions: String,    // المقاسات
material: String,      // الخامة
fileLink: String       // روابط خارجية
```

---

## 🔄 مسار البيانات

```
المستخدم يختار الملفات (الجهاز)
         ↓
JavaScript: handleFileUpload()
         ↓
FormData لكل ملف
         ↓
POST http://localhost:5000/api/upload
         ↓
Backend: multer يحفظ الملف
         ↓
Uploads folder: backend/uploads/{timestamp}-{filename}
         ↓
Response: { url: "http://localhost:5000/uploads/..." }
         ↓
Frontend: تحديث state + عرض الملف
         ↓
المستخدم ينقر "حفظ"
         ↓
PATCH /api/orders/:id
         ↓
MongoDB: تحديث سجل الأمر
         ↓
✅ تم الحفظ بنجاح
```

---

## 🛡️ المتطلبات التقنية

### الملفات المعدلة:
1. ✅ `frontend/pages/manage/workshop.js`
   - إضافة `handleFileUpload()` و `deleteUploadedFile()`
   - واجهة رفع ملفات بصرية محسّنة
   - عرض قائمة الملفات مع الوظائف

2. ✅ `backend/models/Order.js`
   - إضافة `uploadedFiles` array
   - إضافة `dimensions` و `material` و `fileLink`

3. ✅ `backend/routes/uploadRoutes.js` (موجود بالفعل)
   - POST /api/upload مع معالجة multer

### المجلدات المطلوبة:
- `backend/uploads/` - موجود (لحفظ الملفات)

---

## ⚙️ الإعدادات

### متغيرات البيئة (docker-compose.yml)
```yaml
NEXT_PUBLIC_API_URL=http://localhost:5000/api
UPLOAD_URL=http://localhost:5000/uploads
```

### Upload Limits (multer)
**الحد الأقصى الحالي:** ~50 MB (قابل للتعديل)

لتعديل الحد:
```javascript
// backend/middleware/upload.js
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
});
```

---

## 🐛 استكشاف الأخطاء

### الخطأ: "ملف مش بينرفع"

**1. تحقق من الحاوية:**
```powershell
docker-compose logs backend | Select-String "Upload"
```

**2. تحقق من حجم الملف:**
- الملفات الكبيرة جداً قد تستغرق وقتاً أطول
- تأكد من الحد الأقصى (50 MB)

**3. تحقق من الاتصال:**
```powershell
curl http://localhost:5000/uploads/test
```

### الخطأ: "الملفات ما بتختفش بعد الحذف"

**السبب:** قد تكون بحاجة لإعادة تحميل الصفحة
**الحل:** انقر F5 لتحديث الصفحة

### الخطأ: "CORS Error"

**السبب:** قد يكون الـ backend غير مقبول
**الحل:** تأكد من `docker-compose.yml`:
```yaml
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 📈 مثال عملي

### السيناريو: تصميم وسام
```
1. الزبون: أحمد محمد | الهاتف: 010xxxxxxxx
   الأمر: وسام خشبي مخصص

2. المدير ينقر على الأمر (في مرحلة التجهيز)

3. يرفع:
   - وسام_تصميم_v1.pdf (2 MB)
   - وسام_صورة_مرجعية.jpg (3 MB)
   - وسام_قياسات.txt (50 KB)

4. يضيف:
   - المقاسات: 10x15 سم
   - الخامة: خشب البندق الأحمر
   - ملاحظات: "تأكد من الحواف ناعمة جداً"

5. ينقر "حفظ" ✅

6. الملفات تُحفظ في:
   - Database: MongoDB
   - Server: /backend/uploads/
```

---

## 📝 الحالات المدعومة

| المرحلة | الفعل المسموح | الفعل الممنوع |
|-------|------------|----------|
| 🔧 جاري التجهيز | رفع ✅ حذف ✅ | |
| 🎨 جاري التصميم | رفع ✅ حذف ✅ | |
| ⚙️ في التشغيل | تحميل ✅ | رفع ❌ حذف ❌ |
| 🚚 جاهز للتسليم | تحميل ✅ | رفع ❌ حذف ❌ |

---

## 🔐 الأمان

### حماية الملفات
- ✅ تحقق من نوع الملف (multer)
- ✅ تسمية عشوائية (timestamp + عشوائي)
- ✅ مجلد منفصل للملفات (/uploads)
- ✅ حد أقصى للحجم (50 MB)

### حماية البيانات
- ✅ تخزين آمن في MongoDB
- ✅ ربط آمن مع الأوامر
- ✅ تحقق من الأوامر (في الخطط المستقبلية)

---

## 📞 الدعم والمساعدة

### أسئلة شائعة

**س: هل يمكنني رفع ملفات بعد الانتقال من التصميم؟**
ج: لا، الرفع متاح فقط في مرحلة التجهيز والتصميم.

**س: كم عدد الملفات المسموحة؟**
ج: بلا حد - رفع عدد ملفات كما تريد!

**س: هل الملفات محفوظة دائماً؟**
ج: نعم، محفوظة في MongoDB والـ server.

**س: كيف أعيد تحميل ملف؟**
ج: من قائمة الملفات، انقر على ⬇️ تحميل

---

## 🎉 نهاية التوثيق

تم تطوير النظام بنجاح! استمتع برفع ملفاتك بسهولة. 🚀

**آخر تحديث:** 23 مارس 2026
**الإصدار:** 1.0.0
**الحالة:** ✅ جاهز للإنتاج
