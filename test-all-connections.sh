#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 اختبار شامل للاتصالات - HAKEEM GALLERY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Frontend
echo -n "1️⃣  اختبار الفرونت إند (http://localhost:3030) ... "
if curl -s http://localhost:3030 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ يعمل${NC}"
else
    echo -e "${RED}❌ لا يعمل${NC}"
fi

# Test 2: Backend Health
echo -n "2️⃣  اختبار الباك إند Health (http://localhost:5000/health) ... "
if curl -s http://localhost:5000/health | grep -q "success"; then
    echo -e "${GREEN}✅ يعمل${NC}"
else
    echo -e "${RED}❌ لا يعمل${NC}"
fi

# Test 3: API Products
echo -n "3️⃣  اختبار API المنتجات (http://localhost:5000/api/products) ... "
if curl -s http://localhost:5000/api/products | grep -q "success"; then
    echo -e "${GREEN}✅ يعمل${NC}"
else
    echo -e "${RED}❌ لا يعمل${NC}"
fi

# Test 4: Database Connection
echo -n "4️⃣  اختبار اتصال قاعدة البيانات ... "
if docker-compose logs backend | grep -q "MongoDB Connected"; then
    echo -e "${GREEN}✅ متصل${NC}"
else
    echo -e "${YELLOW}⚠️  تحقق من السجلات${NC}"
fi

# Test 5: CORS
echo -n "5️⃣  اختبار CORS ... "
CORS_TEST=$(curl -s -H "Origin: http://localhost:3030" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS http://localhost:5000/api/products -i | grep "Access-Control-Allow-Origin")
if [ ! -z "$CORS_TEST" ]; then
    echo -e "${GREEN}✅ مفعل${NC}"
else
    echo -e "${YELLOW}⚠️  تحقق من السجلات${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 المعلومات الإضافية:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Show running containers
echo ""
echo "🐳 Docker Containers:"
docker-compose ps

# Show recent logs
echo ""
echo "📋 آخر سجلات Backend (5 أسطر):"
docker-compose logs backend --tail=5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ الاختبار انتهى"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
