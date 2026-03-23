# 🚀 أوامر سريعة - Hakeem Gallery

## ⚡ البدء السريع

### 1. تشغيل التطبيق
```bash
docker-compose up --build
```

### 2. إيقاف التطبيق
```bash
docker-compose down
```

### 3. مسح جميع البيانات (إعادة تعيين تام)
```bash
docker-compose down -v
docker-compose up --build
```

---

## 🔍 الاختبار والمراقبة

### اختبار سريع
```bash
# الفرونت إند
curl http://localhost:3030

# الباك إند
curl http://localhost:5000/health

# API المنتجات
curl http://localhost:5000/api/products
```

### عرض السجلات
```bash
# جميع الخدمات
docker-compose logs -f

# الباك إند فقط
docker-compose logs -f backend

# قاعدة البيانات فقط
docker-compose logs -f database

# آخر 50 سطر
docker-compose logs --tail=50
```

### حالة الخدمات
```bash
# عرض جميع الحاويات
docker-compose ps

# معلومات أكثر تفصيلاً
docker ps
```

---

## 🛠️ الصيانة

### إعادة تشغيل خدمة واحدة
```bash
docker-compose restart backend
docker-compose restart frontend
docker-compose restart database
```

### حذف جميع البيانات المحفوظة
```bash
docker volume rm hakeem-gallery-main_mongo_data
```

### مسح الحاويات والصور
```bash
docker-compose down
docker system prune -a
```

---

## 📊 البيانات والنسخ الاحتياطية

### النسخ الاحتياطية من MongoDB
```bash
# حفظ قاعدة البيانات
docker-compose exec database mongodump \
  --out /backup/$(date +%Y%m%d_%H%M%S)

# استعادة قاعدة البيانات
docker-compose exec database mongorestore \
  --dir /backup/20260323_120000
```

### حذف قاعدة البيانات
```bash
docker-compose exec database mongo --eval "db.dropDatabase()"
```

---

## 🐛 استكشاف الأخطاء

### تنظيف Docker الكامل
```bash
docker-compose down -v
docker system prune -a --volumes
docker-compose up --build
```

### التحقق من الاتصالات
```bash
# هل الفرونت إند يتصل بالباك إند؟
docker-compose logs frontend | grep "api"

# هل الباك إند يتصل بـ DB؟
docker-compose logs backend | grep "MongoDB"

# معالجة الأخطاء
docker-compose logs | grep -i "error"
```

---

## 📱 الوصول للتطبيق

| الخدمة | الرابط | الملاحظات |
|-------|----------|-----------|
| **الفرونت إند** | http://localhost:3030 | الواجهة الرئيسية |
| **الباك إند** | http://localhost:5000 | Root endpoint |
| **API Health** | http://localhost:5000/health | حالة الخادم |
| **المنتجات API** | http://localhost:5000/api/products | قائمة المنتجات |
| **الطلبات API** | http://localhost:5000/api/orders | قائمة الطلبات |

---

## 🔐 متغيرات البيئة الهامة

### في Backend
```bash
MONGO_URI=mongodb://database:27017/hakeem_db
NODE_ENV=development
PORT=5000
HOST=0.0.0.0
FRONTEND_URL=http://localhost:3030
JWT_SECRET=your-secret-key-change-in-production
```

### في Frontend
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🎯 الحالات الشائعة

### الفرونت إند يقول "Cannot fetch API"
```bash
# 1. تحقق من أن الباك إند يعمل
curl http://localhost:5000/health

# 2. تحقق من CORS
docker-compose logs backend | grep CORS

# 3. أعد تشغيل الكل
docker-compose restart
```

### المنتجات لا تظهر
```bash
# 1. تحقق من قاعدة البيانات
docker-compose logs database | grep "ready"

# 2. تحقق من API
curl http://localhost:5000/api/products

# 3. الوقت
sleep 10
```

### الإرفاق الملفات لا يعمل
```bash
# تحقق من المنفذ الصحيح
docker-compose logs backend | grep "upload"

# تحقق من الأذونات
docker-compose exec backend ls -la uploads/
```

---

## 🚀 نشر الإنتاج

### استخدام docker-compose.prod.yml
```bash
docker-compose -f docker-compose.prod.yml up --build
```

### متغيرات الإنتاج المهمة
```bash
NODE_ENV=production
MONGO_URI=mongodb://user:password@your-mongodb-host:27017/hakeem_db
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=generate-a-strong-secret
```

---

## 📝 الملفات المهمة

| الملف | الوصف |
|-------|--------|
| `docker-compose.yml` | تكوين التطوير |
| `docker-compose.prod.yml` | تكوين الإنتاج |
| `Makefile` | أوامر سريعة |
| `backend/server.js` | نقطة البدء للباك إند |
| `frontend/next.config.js` | تكوين Next.js |
| `backend/config/database.js` | اتصال MongoDB |

---

## ⌚ الانتظار والصبر

عند بدء التطبيق:
1. **البداية (0-10 ثواني):** Docker يحمل الصور
2. **المرحلة 1 (10-20 ثانية):** قاعدة البيانات تبدأ
3. **المرحلة 2 (20-30 ثانية):** الباك إند يتصل بـ DB
4. **النهاية (30+ ثانية):** كل شيء جاهز! ✅

**انتظر 30 ثانية على الأقل قبل الاختبار**.

---

## 💡 نصائح إضافية

- استخدم `docker-compose up -d` للتشغيل في الخلفية
- استخدم `Ctrl+C` لإيقاف العرض في الـ Terminal
- استخدم `docker-compose logs` لعرض السجلات بعد الإيقاف
- استخدم `docker-compose build` لإعادة بناء الصور فقط
- استخدم `docker stats` لمراقبة الموارد

---

**آخر تحديث:** 23 مارس 2026  
**الإصدار:** v1.3.0
