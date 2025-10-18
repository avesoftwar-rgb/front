# 🚀 دليل النشر السريع - ShopMart

## ⚡ الخطوات السريعة (15 دقيقة)

### 📋 ما تحتاجه:
- ✅ حساب GitHub (مجاني)
- ✅ حساب MongoDB Atlas (مجاني)
- ✅ حساب Render (مجاني)
- ✅ حساب Vercel (مجاني) - اختياري

---

## 1️⃣ رفع المشروع على GitHub (دقيقتان)

```bash
# في مجلد المشروع
git init
git add .
git commit -m "Initial commit - Ready for deployment"
git remote add origin https://github.com/avesoftwar-rgb/ahmaddd.git
git branch -M main
git push -u origin main
```

✅ **تم!** المشروع الآن على GitHub

---

## 2️⃣ إعداد MongoDB Atlas (5 دقائق)

### الخطوات:
1. اذهب إلى: https://www.mongodb.com/cloud/atlas
2. سجل دخول أو أنشئ حساب
3. **Build a Database** → اختر **FREE (M0)**
4. اختر Region: **Frankfurt** أو الأقرب
5. اضغط **Create**

### إعداد الأمان:
```
Security > Database Access
→ Add New Database User
→ Username: shopmart_user
→ Password: [احفظها]
→ Database User Privileges: Read and write to any database
→ Add User

Security > Network Access
→ Add IP Address
→ Allow Access from Anywhere (0.0.0.0/0)
→ Confirm
```

### احصل على Connection String:
```
Deployment > Database
→ Connect
→ Connect your application
→ Copy connection string
```

سيكون مثل:
```
mongodb+srv://shopmart_user:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

✅ **احفظ هذا النص!** ستحتاجه في الخطوة التالية

---

## 3️⃣ نشر Backend على Render (5 دقائق)

### الخطوات:
1. اذهب إلى: https://render.com
2. سجل دخول بحساب GitHub
3. **New +** → **Web Service**
4. **Connect GitHub** → اختر `avesoftwar-rgb/ahmaddd`

### الإعدادات:
```
Name: shopmart-api
Region: Frankfurt (EU Central)
Branch: main
Root Directory: apps/api
Runtime: Node
Build Command: npm install --production
Start Command: npm start
Plan: Free
```

### Environment Variables:
اضغط **Advanced** وأضف:

```bash
MONGODB_URI
[الصق Connection String من MongoDB Atlas - استبدل PASSWORD]

PORT
3001

NODE_ENV
production

CORS_ORIGINS
http://localhost:5173
```

4. اضغط **Create Web Service**
5. انتظر 3-5 دقائق حتى يكتمل Build

### احفظ URL الخاص بك:
```
https://shopmart-api.onrender.com
```

### اختبر:
افتح في المتصفح:
```
https://shopmart-api.onrender.com/api/health
```

يجب أن ترى:
```json
{"status": "healthy", ...}
```

✅ **Backend جاهز!**

---

## 4️⃣ نشر Frontend على Vercel (3 دقائق)

### الخطوات:
1. اذهب إلى: https://vercel.com
2. سجل دخول بحساب GitHub
3. **Add New** → **Project**
4. **Import** → اختر `avesoftwar-rgb/ahmaddd`

### الإعدادات:
```
Framework Preset: Vite
Root Directory: apps/storefront
Build Command: npm run build
Output Directory: dist
```

### Environment Variables:
```
VITE_API_URL
https://shopmart-api.onrender.com
[استبدل بـ URL الخاص بك من Render]
```

5. اضغط **Deploy**
6. انتظر 2-3 دقائق

### احفظ Frontend URL:
```
https://your-project-name.vercel.app
```

✅ **Frontend جاهز!**

---

## 5️⃣ تحديث CORS (دقيقة واحدة)

ارجع إلى Render:
```
Dashboard → shopmart-api
→ Environment
→ عدّل CORS_ORIGINS
→ أضف Frontend URL:
```

```
CORS_ORIGINS
https://your-project-name.vercel.app
```

احفظ (سيعيد النشر تلقائياً)

---

## 6️⃣ إضافة البيانات (دقيقتان)

### من Local:
```bash
cd apps/api

# عدّل config.env - ضع MongoDB URI
MONGODB_URI=mongodb+srv://shopmart_user:PASSWORD@...

# شغل seed
npm run seed
```

### أو من Render Shell:
```
Dashboard → shopmart-api
→ Shell (في القائمة العلوية)
→ npm run seed
```

---

## ✅ اختبر التطبيق!

### Backend:
```
https://shopmart-api.onrender.com/api/health
https://shopmart-api.onrender.com/api/products
```

### Frontend:
```
https://your-project-name.vercel.app
```

### جرّب:
1. افتح Frontend
2. تصفح المنتجات
3. أضف منتج للسلة
4. اذهب للـ Checkout
5. استخدم: `demouser@example.com`
6. اطلب Order
7. تتبع الطلب بالـ Real-time!

---

## 🎉 تم النشر بنجاح!

### URLs الخاصة بك:
```
✅ GitHub: https://github.com/avesoftwar-rgb/ahmaddd
✅ Backend: https://shopmart-api.onrender.com
✅ Frontend: https://your-project-name.vercel.app
✅ Database: MongoDB Atlas
```

---

## 🔄 لتحديث المشروع مستقبلاً:

```bash
git add .
git commit -m "تحديث: وصف التعديلات"
git push origin main
```

سيتم النشر تلقائياً على Render و Vercel! 🚀

---

## 🆘 مشاكل شائعة:

### Backend لا يعمل:
- تحقق من Logs في Render Dashboard
- تأكد من صحة MONGODB_URI
- تأكد من Password في Connection String

### CORS Error:
- تأكد من Frontend URL في CORS_ORIGINS
- بدون "/" في النهاية
- أعد نشر Backend

### Frontend لا يتصل:
- تحقق من VITE_API_URL في Vercel
- افتح Browser Console لرؤية الأخطاء
- تأكد من Backend يعمل

---

## 📚 للمزيد من التفاصيل:
راجع **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** للشرح الكامل

---

**بالتوفيق! 🎊**

