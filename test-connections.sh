#!/bin/bash

# 🧪 نص اختبار الاتصال بين الأجزاء
# استخدام: bash test-connections.sh

echo "=========================================="
echo "🧪 فحص الاتصلات بين الأجزاء"
echo "=========================================="
echo ""

# الألوان
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# الدالة لطباعة النتائج
test_connection() {
    local name=$1
    local url=$2
    
    echo -n "🔍 اختبار $name ... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" -eq 200 ] || [ "$response" -eq 404 ] || [ "$response" -eq 500 ]; then
        echo -e "${GREEN}✅ متصل (HTTP $response)${NC}"
        return 0
    else
        echo -e "${RED}❌ غير متصل (HTTP $response)${NC}"
        return 1
    fi
}

# 1️⃣ اختبار الفرونت إند
echo -e "${YELLOW}1️⃣ اختبار الفرونت إند${NC}"
test_connection "الفرونت إند" "http://localhost:3030"
FRONTEND_OK=$?
echo ""

# 2️⃣ اختبار الباك إند
echo -e "${YELLOW}2️⃣ اختبار الباك إند${NC}"
test_connection "الباك إند" "http://localhost:5000/health"
BACKEND_OK=$?
echo ""

# 3️⃣ اختبار API
echo -e "${YELLOW}3️⃣ اختبار API${NC}"
echo -n "🔍 جلب المنتجات ... "
products=$(curl -s "http://localhost:5000/api/products" | grep -q "success" && echo "ok" || echo "fail")
if [ "$products" = "ok" ]; then
    echo -e "${GREEN}✅ نجح${NC}"
    API_OK=0
else
    echo -e "${RED}❌ فشل${NC}"
    API_OK=1
fi
echo ""

# 4️⃣ اختبار قاعدة البيانات
echo -e "${YELLOW}4️⃣ اختبار قاعدة البيانات${NC}"
echo -n "🔍 الاتصال بـ MongoDB ... "
mongodb=$(curl -s "http://localhost:5000/health" | grep -q "success" && echo "ok" || echo "fail")
if [ "$mongodb" = "ok" ]; then
    echo -e "${GREEN}✅ متصل${NC}"
    DB_OK=0
else
    echo -e "${RED}❌ غير متصل${NC}"
    DB_OK=1
fi
echo ""

# الملخص النهائي
echo "=========================================="
echo "📊 ملخص النتائج"
echo "=========================================="
[ $FRONTEND_OK -eq 0 ] && echo -e "${GREEN}✅ الفرونت إند${NC}" || echo -e "${RED}❌ الفرونت إند${NC}"
[ $BACKEND_OK -eq 0 ] && echo -e "${GREEN}✅ الباك إند${NC}" || echo -e "${RED}❌ الباك إند${NC}"
[ $API_OK -eq 0 ] && echo -e "${GREEN}✅ API${NC}" || echo -e "${RED}❌ API${NC}"
[ $DB_OK -eq 0 ] && echo -e "${GREEN}✅ قاعدة البيانات${NC}" || echo -e "${RED}❌ قاعدة البيانات${NC}"
echo ""

# النتيجة النهائية
if [ $FRONTEND_OK -eq 0 ] && [ $BACKEND_OK -eq 0 ] && [ $API_OK -eq 0 ] && [ $DB_OK -eq 0 ]; then
    echo -e "${GREEN}🎉 جميع الاتصالات تعمل بشكل صحيح!${NC}"
    exit 0
else
    echo -e "${RED}⚠️ هناك بعض المشاكل في الاتصالات${NC}"
    exit 1
fi
