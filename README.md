# Celo Arab FanZone DApp

هذا التطبيق هو واجهة أمامية (Frontend) تتفاعل مع عقد ذكي على شبكة Celo.

## العقد الذكي (Smart Contract)
تم إنشاء ملف العقد الذكي في المسار:
`contracts/FanZone.sol`

### كيفية النشر (Deploy):
1. اذهب إلى [Remix IDE](https://remix.ethereum.org/).
2. أنشئ ملفاً جديداً والصق الكود الموجود في `contracts/FanZone.sol`.
3. قم بعمل Compile للعقد.
4. اختر شبكة "Injected Provider - MetaMask" وتأكد من أنك متصل بشبكة **Celo Alfajores Testnet**.
5. اضغط Deploy.

### ملاحظات هامة:
- المنطق في `App.tsx` و `blockchainService.ts` حالياً يقوم بمحاكاة التفاعل أو إرسال معاملات بسيطة.
- لربط الواجهة بالعقد الحقيقي، يجب عليك:
    1. نشر العقد والحصول على عنوانه (Contract Address).
    2. نسخ ملف `ABI` (من Remix) ووضعه في المشروع.
    3. تحديث `blockchainService.ts` لاستخدام `new ethers.Contract(address, abi, signer)`.
