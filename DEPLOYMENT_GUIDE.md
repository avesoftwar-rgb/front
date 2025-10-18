# 🚀 دليل النشر الكامل / Complete Deployment Guide

## 📋 المحتويات / Table of Contents

1. [المتطلبات / Prerequisites](#المتطلبات--prerequisites)
2. [إعداد MongoDB Atlas](#إعداد-mongodb-atlas)
3. [النشر على Render](#النشر-على-render)
4. [النشر على Vercel (Frontend)](#النشر-على-vercel-frontend)
5. [المتغيرات البيئية / Environment Variables](#المتغيرات-البيئية--environment-variables)

---

## المتطلبات / Prerequisites

### الحسابات المطلوبة / Required Accounts:
- ✅ حساب GitHub
- ✅ حساب MongoDB Atlas (مجاني)
- ✅ حساب Render (مجاني)
- ✅ حساب Vercel (مجاني) - اختياري للواجهة الأمامية

---

## 📦 الخطوة 1: رفع المشروع على GitHub

### 1.1 تهيئة Git Repository
```bash
# إذا لم يكن مهيأ بعد
git init

# إضافة جميع الملفات
git add .

# عمل commit أول
git commit -m "Initial commit - Ready for deployment"

# ربط المشروع بـ GitHub
git remote add origin https://github.com/avesoftwar-rgb/ahmaddd.git

# رفع المشروع
git branch -M main
git push -u origin main
```

---

## 🗄️ الخطوة 2: إعداد MongoDB Atlas

### 2.1 إنشاء Cluster جديد
1. اذهب إلى: https://www.mongodb.com/cloud/atlas
2. سجل دخول أو أنشئ حساب جديد
3. اضغط "Build a Database"
4. اختر **FREE** (M0 Sandbox)
5. اختر المنطقة الأقرب لك (Frankfurt/EU)
6. اسم الـ Cluster: `Cluster0` (افتراضي)

### 2.2 إعداد Database Access
1. من القائمة الجانبية: **Security > Database Access**
2. اضغط **Add New Database User**
3. أنشئ مستخدم:
   - Username: `shopmart_user`
   - Password: (احفظه في مكان آمن)
   - Database User Privileges: **Read and write to any database**
4. اضغط **Add User**

### 2.3 إعداد Network Access
1. من القائمة الجانبية: **Security > Network Access**
2. اضغط **Add IP Address**
3. اختر **Allow Access from Anywhere** (0.0.0.0/0)
   - ⚠️ للإنتاج: حدد IP محدد لأمان أفضل
4. اضغط **Confirm**

### 2.4 الحصول على Connection String
1. من القائمة الجانبية: **Deployment > Database**
2. اضغط **Connect** على الـ Cluster الخاص بك
3. اختر **Connect your application**
4. انسخ الـ Connection String:
```
mongodb+srv://shopmart_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
5. استبدل `<password>` بكلمة المرور الفعلية

---

## 🚀 الخطوة 3: النشر على Render (Backend)

### 3.1 إنشاء Web Service جديد
1. اذهب إلى: https://render.com
2. سجل دخول أو أنشئ حساب
3. من Dashboard، اضغط **New +**
4. اختر **Web Service**

### 3.2 ربط GitHub Repository
1. اضغط **Connect GitHub Account**
2. اختر repository: `avesoftwar-rgb/ahmaddd`
3. اضغط **Connect**

### 3.3 إعدادات الـ Service

#### Basic Settings:
```
Name: shopmart-api
Region: Frankfurt (EU Central)
Branch: main
Root Directory: apps/api
Runtime: Node
```

#### Build Settings:
```
Build Command: npm install --production
Start Command: npm start
```

#### Plan:
```
Instance Type: Free
```

### 3.4 إضافة Environment Variables
اضغط على **Advanced** ثم أضف:

```bash
MONGODB_URI=mongodb+srv://shopmart_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/shopmart?retryWrites=true&w=majority
PORT=3001
NODE_ENV=production
CORS_ORIGINS=http://localhost:5173,https://your-frontend-url.vercel.app
```

⚠️ **مهم جداً**: 
- استبدل `YOUR_PASSWORD` بكلمة المرور الفعلية
- استبدل `your-frontend-url.vercel.app` بعنوان الواجهة الأمامية (بعد نشرها)

### 3.5 Deploy!
1. اضغط **Create Web Service**
2. انتظر حتى يكتمل الـ build (2-5 دقائق)
3. احفظ الـ URL الخاص بالـ API:
```
https://shopmart-api.onrender.com
```

### 3.6 التحقق من النشر
افتح المتصفح واذهب إلى:
```
https://shopmart-api.onrender.com/api/health
```
يجب أن ترى:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": 123,
  "environment": "production"
}
```

---

## 🌐 الخطوة 4: النشر على Vercel (Frontend)

### 4.1 إنشاء مشروع جديد
1. اذهب إلى: https://vercel.com
2. سجل دخول بحساب GitHub
3. اضغط **Add New** > **Project**
4. استورد: `avesoftwar-rgb/ahmaddd`

### 4.2 إعدادات الـ Build

```
Framework Preset: Vite
Root Directory: apps/storefront
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 4.3 Environment Variables
أضف المتغير التالي:
```bash
VITE_API_URL=https://shopmart-api.onrender.com
```

### 4.4 Deploy!
1. اضغط **Deploy**
2. انتظر حتى يكتمل الـ deployment
3. احفظ الـ URL:
```
https://your-project.vercel.app
```

### 4.5 تحديث CORS في Render
1. ارجع إلى Render Dashboard
2. افتح `shopmart-api` service
3. اذهب إلى **Environment**
4. عدّل `CORS_ORIGINS` وأضف URL الـ Vercel:
```
CORS_ORIGINS=https://your-project.vercel.app
```
5. احفظ التغييرات (سيعيد النشر تلقائياً)

---

## 🔧 الخطوة 5: إضافة البيانات الأولية (Seed Data)

### 5.1 من Dashboard
يمكنك استخدام Shell في Render:
1. في Render Dashboard > shopmart-api
2. اضغط على **Shell** (في القائمة العلوية)
3. شغل الأمر:
```bash
npm run seed
```

### 5.2 من Local (الطريقة الأسهل)
```bash
# في ملف apps/api/config.env، غير MONGODB_URI إلى Atlas URI
MONGODB_URI=mongodb+srv://shopmart_user:PASSWORD@cluster0.xxxxx.mongodb.net/shopmart

# شغل seed محلياً
cd apps/api
npm run seed
```

---

## 📝 متغيرات البيئة الكاملة / Complete Environment Variables

### Backend (Render)
```bash
# Required
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shopmart?retryWrites=true&w=majority
PORT=3001
NODE_ENV=production

# CORS (مهم!)
CORS_ORIGINS=https://your-frontend.vercel.app

# Optional
LLM_ENDPOINT=
API_KEY=
```

### Frontend (Vercel)
```bash
# API Endpoint
VITE_API_URL=https://shopmart-api.onrender.com
```

---

## ✅ التحقق من النشر / Verification

### Backend Health Check
```bash
curl https://shopmart-api.onrender.com/api/health
```

### Frontend
افتح: `https://your-project.vercel.app`

### API Endpoints Test
```bash
# Get Products
curl https://shopmart-api.onrender.com/api/products

# Get Specific Product
curl https://shopmart-api.onrender.com/api/products/PRODUCT_ID
```

---

## 🔄 تحديثات مستقبلية / Future Updates

### رفع التحديثات:
```bash
git add .
git commit -m "Update: description of changes"
git push origin main
```

سيتم نشر التحديثات تلقائياً على:
- ✅ Render (Backend) - خلال 2-5 دقائق
- ✅ Vercel (Frontend) - خلال 1-3 دقائق

---

## 🆘 استكشاف الأخطاء / Troubleshooting

### مشكلة: Backend لا يعمل
1. تحقق من Logs في Render Dashboard
2. تأكد من صحة `MONGODB_URI`
3. تأكد من Network Access في MongoDB Atlas

### مشكلة: CORS Error
1. تحقق من `CORS_ORIGINS` في متغيرات Render
2. تأكد من إضافة frontend URL بدون slash في النهاية
3. أعد نشر Backend بعد التعديل

### مشكلة: Frontend لا يتصل بـ Backend
1. تحقق من `VITE_API_URL` في Vercel
2. تأكد من أن Backend يعمل بفحص `/api/health`
3. افتح Console في المتصفح لرؤية الأخطاء

### مشكلة: Database Connection Failed
1. تحقق من Username/Password في MongoDB Atlas
2. تأكد من Network Access (0.0.0.0/0)
3. جرب الاتصال من Local أولاً

---

## 📚 موارد إضافية / Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

## 🎉 تم النشر بنجاح!

الآن مشروعك:
- ✅ موجود على GitHub
- ✅ Backend يعمل على Render
- ✅ Frontend يعمل على Vercel
- ✅ Database على MongoDB Atlas
- ✅ جاهز للاستخدام!

**Backend URL**: https://shopmart-api.onrender.com
**Frontend URL**: https://your-project.vercel.app

---

**Created with ❤️ for ShopMart E-Commerce Platform**

