---
name: Locale fallback and env override
overview: اضافه کردن یک زنجیرهٔ fallback برای تشخیص زبان (اول از تنظیمات داکیوسورس، بعد از document.lang، بعد از themeConfig یا env) و اختیاری کردن override از طریق env تا وقتی context در دسترس نیست هم بتوان زبان را فهمید یا با env عوض کرد؛ ترجمه‌ها همچنان از Docusaurus (translate) باشند و در صورت کار کردن i18n همه‌جا چندزبانگی بماند.
todos: []
isProject: false
---

# پلن: تشخیص زبان با Fallback و امکان Override از env

## مشکل

- لاگ تم در کنسول دیده نمی‌شود؛ احتمالاً به‌خاطر Hydration یا زمان لود چانک، کامپوننت تم در شرایطی اجرا می‌شود که `useDocusaurusContext()` در دسترس نیست یا درخت React خراب است.
- کاربر می‌خواهد اگر از تنظیمات داکیوسورس نشد خواند، بتوان از **env** (مثلاً `window.env`) زبان را عوض کرد.
- ترجیح: اگر بشود از تنظیمات داکیوسورس بخوانیم و با عوض کردن زبان توسط کاربر، همهٔ صفحه (از جمله جستجو) چندزبانگی باشد، بهتر است.

## راه‌حل پیشنهادی

یک **منبع واحد برای locale** با اولویت‌بندی مشخص، و استفاده از آن در تم جستجو؛ ترجمه‌های UI همچنان از `translate()` داکیوسورس (و در نتیجه از `i18n/<locale>/theme.json`) باشند.

### ۱) زنجیرهٔ تشخیص locale (اولویت از بالا به پایین)

| اولویت | منبع | نحوهٔ دسترسی |
|--------|------|---------------|
| ۱ | Docusaurus context | `useDocusaurusContext().i18n?.currentLocale` |
| ۲ | HTML (داکیوسورس روی `<html>` ست می‌کند) | `document.documentElement.lang` (فقط در useEffect / بعد از mount) |
| ۳ | تنظیمات تم (config) | `themeConfig.typesense.localeOverride` (اختیاری) |
| ۴ | env / تزریق از سایت | مثلاً `window.__SEARCH_THEME_LOCALE__` یا `window.env?.LOCALE` (قرارداد با پروژهٔ مصرف‌کننده) |
| ۵ | پیش‌فرض | مثلاً `'en'` |

با این ترتیب: تا وقتی داکیوسورس و context درست کار می‌کنند، همان زبان انتخاب‌شده توسط کاربر در سایت استفاده می‌شود و همه‌جا (از جمله جستجو) چندزبانگی می‌ماند. اگر context در دسترس نبود، از `document.documentElement.lang` استفاده می‌شود (همان زبانی که داکیوسورس روی صفحه گذاشته). در نهایت کاربر می‌تواند با **config** یا **env** زبان جستجو را override کند.

### ۲) پیاده‌سازی در تم

- **هوک جدید `useCurrentLocale()`**  
در تم (مثلاً `src/hooks/useCurrentLocale.ts`) یک هوک که:
- داخلش از `useDocusaurusContext()` استفاده کند (اگر در دسترس بود، همان را برگرداند).
- در `useEffect` مقدار `document.documentElement.lang` را بخواند و در state ذخیره کند.
- خروجی نهایی: یک مقدار `locale: string` که از این ترتیب به‌دست آمده: context → document.lang (بعد از mount) → `themeConfig.typesense.localeOverride` → `window.__SEARCH_THEME_LOCALE__` یا `window.env?.LOCALE` → `'en'`.
- برای جلوگیری از hydration mismatch، خواندن `document` و `window` فقط داخل `useEffect` یا بعد از یک چک `typeof window !== 'undefined'` در کدی که فقط روی کلاینت اجرا می‌شود.

- **استفاده در SearchBar و SearchPage**  
هر جایی که الان فقط از `useDocusaurusContext()` برای `currentLocale` استفاده می‌شود، به‌جای آن از `useCurrentLocale()` استفاده شود تا هم با داکیوسورس هماهنگ باشد هم در صورت نبود context از document/config/env استفاده کند.

- **یک خط لاگ شفاف**  
داخل همان هوک (یا در یک `useEffect` در SearchBar که فقط یک بار اجرا شود) یک **لاگ واحد** چاپ شود که مشخص کند:
- منبع فعلی locale چیست: `context` | `document` | `config` | `window` | `default`
- مقدار نهایی: مثلاً `fa` یا `en`.
این لاگ به کاربر کمک می‌کند بفهمد تم الان از کجا زبان را می‌گیرد و آیا با env درست عوض شده یا نه.

### ۳) تنظیمات تم و env

- **اختیاری در themeConfig**  
در [src/theme-search-typesense.d.ts](src/theme-search-typesense.d.ts) و [src/validateThemeConfig.ts](src/validateThemeConfig.ts) فیلد اختیاری `localeOverride?: string` به `themeConfig.typesense` اضافه شود تا در `docusaurus.config.js` بتوان زبان جستجو را ثابت کرد.

- **قرارداد env**  
در مستندات (مثلاً README یا یک بخش کوچک در docs) توضیح داده شود که اگر پروژهٔ مصرف‌کننده بخواهد از «env» زبان را به تم بدهد، می‌تواند قبل از لود تم یکی از این‌ها را ست کند:
- `window.__SEARCH_THEME_LOCALE__ = 'fa'`
- یا اگر قبلاً `window.env` دارند: `window.env.LOCALE = 'fa'`  
و تم در fallback از این مقدار استفاده می‌کند.

### ۴) ترجمه‌ها (بدون تغییر در منبع اصلی)

- **هیچ جایگزینی برای `translate()` یا فایل‌های i18n انجام نشود.**  
ترجمه‌های مودال و صفحهٔ جستجو همچنان از `translate()` داکیوسورس و فایل‌های `i18n/<locale>/theme.json` (در سایت مصرف‌کننده یا در تم) استفاده می‌کنند.
- مقدار `locale` از `useCurrentLocale()` برای مواردی استفاده می‌شود که نیاز به «شناسایی زبان» داریم (مثلاً فیلتر جستجو، لاگ، یا ارسال به سرویس خارجی)، نه برای جایگزینی خود ترجمه‌ها. با این کار وقتی داکیوسورس درست کار کند و کاربر زبان را عوض کند، همان locale از context می‌آید و همهٔ صفحه (از جمله جستجو) چندزبانگی می‌ماند.

### ۵) خلاصهٔ فایل‌ها

- **جدید:** `src/hooks/useCurrentLocale.ts` — هوک با زنجیرهٔ fallback بالا + یک خط لاگ مشخص برای منبع و مقدار locale.
- **تغییر:** [src/theme/SearchBar/index.tsx](src/theme/SearchBar/index.tsx) — استفاده از `useCurrentLocale()` به‌جای فقط context؛ حذف یا ساده‌سازی لاگ‌های قبلی و نگه‌داشتن همان یک لاگ شفاف در هوک.
- **تغییر:** [src/theme/SearchPage/index.tsx](src/theme/SearchPage/index.tsx) — هر جایی که `currentLocale` از context استفاده می‌شود، از `useCurrentLocale()` استفاده شود.
- **تغییر:** [src/index.ts](src/index.ts) — در صورت نیاز برای مسیرهای سرور/پلاگین؛ اگر فقط کلاینت نیاز دارد، ممکن است تغییری لازم نباشد.
- **تغییر:** [src/theme-search-typesense.d.ts](src/theme-search-typesense.d.ts) و [src/validateThemeConfig.ts](src/validateThemeConfig.ts) — اضافه کردن `localeOverride?: string`.
- **مستندات:** یک پاراگراف کوتاه در README یا `docs/` برای توضیح `localeOverride` و قرارداد `window.__SEARCH_THEME_LOCALE__` / `window.env.LOCALE`.

## نتیجه

- اگر داکیوسورس و context درست کار کنند: زبان از همان تنظیمات داکیوسورس و با تغییر زبان توسط کاربر، همهٔ صفحه (از جمله جستجو) چندزبانگی است.
- اگر به‌هر دلیل context در دسترس نبود: اول از `document.documentElement.lang`، بعد از config، بعد از env استفاده می‌شود و کاربر می‌تواند با env (یا config) زبان جستجو را عوض کند.
- یک خط لاگ مشخص می‌گوید منبع فعلی و مقدار locale چیست تا بتوان تشخیص داد آیا از env درست خوانده می‌شود یا نه.