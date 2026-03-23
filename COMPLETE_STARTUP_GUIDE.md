# 🚀 دليل التشغيل الكامل والتحقق من الاتصلات

## 📋 المتطلبات

- ✅ Docker و Docker Compose
- ✅ Node.js (للتطوير المحلي)
- ✅ Git
- ✅ 5GB مساحة خالية على القرص

---

## 🚀 الخطوة 1: البدء السريع

### تشغيل كل شيء دفعة واحدة:

```bash
# في ديريكتوري المشروع
cd hakeem-gallery-main

# بناء وتشغيل
docker-compose up --build

# أو في الخلفية
docker-compose up -d --build
```

### الانتظار:
```
⏳ 30 ثانية تقريباً لبدء كل الخدمات
```

### الأوامر المفيدة:
```bash
# عرض السجلات
docker-compose logs

# عرض السجلات للخدمة معينة
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database

# الإيقاف
docker-compose down

# منح تصريحات الملف
chmod +x test-connections.sh
```

---

## ✅ الخطوة 2: التحقق من الاتصل

### أ) الاختبار السريع:
```bash
# قم بتشغيل نص الاختبار
./test-connections.sh
```

### ب) الاختبار اليدوي:

#### 1️⃣ اختبر الفرونت إند:
```bash
curl http://localhost:3030
```

**النتيجة المتوقعة:** HTML لصفحة الويب

#### 2️⃣ اختبر الباك إند:
```bash
curl http://localhost:5000/health
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-03-23T00:00:00Z",
  "environment": "development"
}
```

#### 3️⃣ اختبر API:
```bash
curl http://localhost:5000/api/products
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "count": 0,
  "total": 0,
  "page": 1,
  "pages": 0,
  "data": []
}
```

#### 4️⃣ اختبر قاعدة البيانات:
```bash
# اتصل بـ MongoDB
docker-compose exec database mongosh

# ثم داخل قشرة Mongo:
use hakeem_db
db.products.find()
exit()
```

---

## 🔍 الخطوة 3: استكشاف المشاكل

### المشكلة: الفرونت إند لا يتصل بالباك إند

**العلامات:**
- رمح تحميل لا نهائي
- أخطاء في console (F12)
- رسالة "Failed to fetch"

**التشخيص:**
```bash
# 1. تحقق من السيرفر
curl http://localhost:5000/health

# 2. سجلات الفرونت
docker-compose logs frontend | grep -i error

# 3. سجلات الباك
docker-compose logs backend | grep -i error

# 4. اختبر الاتصال من داخل Containers
docker-compose exec frontend curl http://backend:5000/health
```

**الحل:**
```bash
# أعد بناء وتشغيل
docker-compose down
docker-compose up --build

# أو قم بحذف وإعادة
docker system prune -a
docker-compose up --build
```

---

### المشكلة: لا يمكن الاتصال بـ MongoDB

**العلامات:**
- عدم حفظ البيانات
- الأخطاء: "Cannot connect to MongoDB"
- الباك إند لا يبدأ

**التشخيص:**
```bash
# 1. تحقق من أن MongoDB يعمل
docker-compose logs database

# 2. اختبر الاتصال
docker-compose exec backend curl -I http://database:27017

# 3. تحقق من MONGO_URI
docker-compose exec backend env | grep MONGO
```

**الحل:**
```bash
# 1. أعد تشغيل قاعدة البيانات
docker-compose restart database

# 2. انتظر بضع ثوانٍ
sleep 10

# 3. أعد تشغيل الباك
docker-compose restart backend

# 4. إذا استمرت المشكلة
docker volume rm hakeem-gallery-main_mongo_data
docker-compose up --build
```

---

### المشكلة: CORS Error

**رسالة الخطأ:**
```
Access to XMLHttpRequest at 'http://localhost:5000/api/...' 
from origin 'http://localhost:3030' has been blocked by CORS policy
```

**التشخيص:**
```bash
# تحقق من ملف CORS
more backend/middleware/cors.js

# اختبر منفذاً معيناً
curl -H "Origin: http://localhost:3030" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS http://localhost:5000/api/products -v
```

**الحل:**
```bash
# تأكد أن docker-compose.yml يحتوي على:
# FRONTEND_URL=http://localhost:3030

# أعد بناء
docker-compose up --build
```

---

## 📊 معلومات البيئة

### البيئة التطوير:
```
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://backend:5000/api
MONGO_URI=mongodb://database:27017/hakeem_db
```

### البيئة الإنتاج:
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
MONGO_URI=mongodb://username:password@cluster.mongodb.net/hakeem_db
```

---

## 🔐 المنافذ المفتوحة

| الخدمة | المنفذ الداخلي | المنفذ الخارجي | التفاصيل |
|-------|------------------|-----------------|---------|
| Frontend | 3000 | 3030 | Next.js App |
| Backend | 5000 | 5000 | Express API |
| MongoDB | 27017 | 27017 | Database |

---

## 📝 أوامر Docker المفيدة

### إدارة الـ Containers:
```bash
# عرض الـ Containers التي تعمل
docker-compose ps

# إيقاف كل الخدمات
docker-compose stop

# حذف الـ Containers (الداتا الهامة محفوظة)
docker-compose down

# حذف كل شيء بما فيه الـ Volumes
docker-compose down -v

# إعادة بناء صورة معينة
docker-compose build backend
docker-compose build frontend
```

### السجلات والتصحيح:
```bash
# عرض جميع السجلات
docker-compose logs

# عرض آخر 50 سطر
docker-compose logs --tail=50

# متابعة السجلات في الوقت الفعلي
docker-compose logs -f backend

# البحث عن أخطاء
docker-compose logs | grep -i error

# حفظ السجلات إلى ملف
docker-compose logs > logs.txt
```

### تصحيح الأخطاء:
```bash
# تنفيذ أمر داخل container
docker-compose exec backend sh

# الخروج
exit

# حذف البيانات المحفوظة
docker volume ls
docker volume rm hakeem-gallery-main_mongo_data
```

---

## 🎯 قائمة التحقق من التشغيل

قبل الذهاب للإنتاج:

- ✅ جميع Containers تعمل (`docker-compose ps`)
- ✅ Health checks تمر
- ✅ الفرونت إند يحمل بدون أخطاء
- ✅ API يرد على الطلبات
- ✅ قاعدة البيانات محفوظة
- ✅ لا توجد أخطاء في السجلات
- ✅ إضافة منتج يعمل
- ✅ حذف منتج يعمل
- ✅ بحث يعمل
- ✅ تحميل صور يعمل

---

## 🚨 الأخطاء الشائعة

### "Address already in use"
```bash
# حرر المنفذ
lsof -ti:5000 | xargs kill -9
lsof -ti:3030 | xargs kill -9
lsof -ti:27017 | xargs kill -9
```

### "Cannot find module"
```bash
# أعد تثبيت المكتبات
docker-compose down
docker system prune -a
docker-compose up --build
```

### "Out of memory"
```bash
# اترك قيمة تخزين كبيرة
docker-compose down -v
docker system prune -a
docker-compose up --build
```

---

## 📞 الدعم والمساعدة

إذا واجهت مشاكل:

1. **اقرأ السجلات:**
   ```bash
   docker-compose logs -f
   ```

2. **ابحث عن الرسالة:**
   - استخدم `grep` للبحث عن الأخطاء

3. **افتح وحدة تحكم المتصفح:**
   - اضغط F12
   - ابحث عن أخطاء بيضاء

4. **تحقق من الملفات:**
   - `ARCHITECTURE_VERIFICATION.md` - معلومات البنية
   - `DATA_UPDATE_FIXES.md` - مشاكل البيانات
   - `COMPREHENSIVE_DATA_FIXES.md` - شرح مفصل

---

**آخر تحديث:** 23 مارس 2026  
**الإصدار:** v1.3.0  
**الحالة:** ✅ جاهز للاستخدام
