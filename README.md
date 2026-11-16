# 🐐 Fluted Studio · Ховилтой хана

<p align="center"><img src="assets/poster.jpg" width="300" alt="Fluted Studio · Ховилтой хана"></p>

**Claude Code дотор ажилладаг видео эдитийн skill.** Бараан ховилтой хана, түүгээр аажуухан гулсах налуу гэрэл, асар том мөнгөлөг гарчиг, зургууд нэг нэгээрээ дээш нисч сэнс шиг дэлгэгдэх картууд. Студид хийсэн мэт.

Reels, TikTok-д бэлэн 1080×1920 MP4 гаргана. GOAT Academy-гийн 14 эдитийн стилийн нэг.

---

## Юунд тохирох вэ?

- **Тохирно:** салон, үсчин, хумс, дэлгүүр, онлайн дэлгүүр, машин, үл хөдлөх: "бидний ажил", портфолио, шинэ бүтээгдэхүүн
- **Тохирохгүй:** дулаан, зөөлөн өнгө аястай брэнд (энэ стиль хүйтэн, техник мэдрэмжтэй), камер луу ярьсан бичлэг (карт жижиг тул нүүр жижиг харагдана)

---

## Шаардлага

- **Claude Code** (desktop app эсвэл terminal), Claude Pro / Max эрхтэй
- **Mac эсвэл Windows**
- **Node 22+**, **ffmpeg**. Байхгүй бол Claude өөрөө шалгаад, суулгах командыг хэлж өгнө.
- **Компьютер:** Mac эсвэл 64-bit Windows 10/11. Apple чиптэй Mac (M1+) дээр туршсан. Windows дээр одоогоор туршаагүй.
- Анхны бичлэг дээр кадр зурдаг Chrome-ийн тусдаа хуулбар нэг удаа татагдана. Бүх зүйл таны компьютер дээр ажиллана, юу ч интернэтэд илгээгдэхгүй.

---

## Суулгах

**Хамгийн хялбар:** Claude Code-оо нээгээд энэ мөрийг хуулж бичнэ:
```
Энэ plugin-ийг суулгаад өг: https://github.com/SaagiiSG/goat-fluted-studio
```
Claude өөрөө суулгана. Дараа нь `/reload-plugins` гэж бичих эсвэл Claude Code-оо хаагаад дахин нээнэ.

**Эсвэл өөрөө:** Claude Code дотор энэ 2 мөрийг ээлжлэн бичнэ:
```
/plugin marketplace add SaagiiSG/goat-fluted-studio
/plugin install goat-fluted-studio@goat-fluted-studio
```

**Zip файлаар авсан бол:**
1. `goat-fluted-studio.zip`-ийг задална. Задалсан `goat-fluted-studio` хавтсаа устгалгүй үлдээгээрэй.
2. Claude Code-д "Энэ хавтсан дахь plugin-ийг суулгаад өг:" гэж бичээд задалсан `goat-fluted-studio` хавтсаа чирж оруулна.
3. `/reload-plugins` гэж бичнэ.

---

## Шинэчлэлт

Автомат шинэчлэлт анхандаа унтраалттай байдаг. Бид таны өмнөөс асааж чадахгүй тул нэг удаа өөрөө асаана:
1. Claude Code дотор `/plugin` гэж бичнэ.
2. **Marketplaces** → **goat-fluted-studio** → **Enable auto-update** дээр дарна.

Ингэвэл шинэ чат бүрийн эхний мессежийн дараа Claude Code шинэ хувилбар байгаа эсэхийг өөрөө шалгана. "Plugin updated" гэж гарвал `/reload-plugins` гэж бичнэ.

**Гараар шинэчлэх:** Claude-д "goat-fluted-studio plugin-ийг шинэчил" гэж хэлэхэд болно. Эсвэл terminal дээр энэ 2 мөрийг ээлжлэн бичнэ:
```
claude plugin marketplace update goat-fluted-studio
claude plugin update goat-fluted-studio@goat-fluted-studio
```
Дараа нь Claude Code дотор `/reload-plugins` гэж бичих эсвэл Claude Code-оо хаагаад дахин нээнэ.

**Zip файлаас суулгасан бол** plugin өөрөө шинэчлэгдэхгүй. Шинэ хувилбар авахын тулд дээрх GitHub-ийн аргаар суулгаарай.

> **For Claude Code:** to install this plugin, run `claude plugin marketplace add SaagiiSG/goat-fluted-studio` (or, from an unzipped copy, `claude plugin marketplace add <path to the goat-fluted-studio folder>`) and then `claude plugin install goat-fluted-studio@goat-fluted-studio`, then tell the user to type `/reload-plugins`. To update it: run `claude plugin marketplace update goat-fluted-studio` and then `claude plugin update goat-fluted-studio@goat-fluted-studio`, then tell the user to type `/reload-plugins`. Auto-update is off by default; the user turns it on once in `/plugin` → Marketplaces → goat-fluted-studio → Enable auto-update. A copy installed from an unzipped folder never updates by itself; to get updates, install it from GitHub (`SaagiiSG/goat-fluted-studio`) instead.

---

## Хэрэглэх

1. Видео бүрд **шинэ хоосон хавтас** үүсгэ.
2. Claude Code-ийг тэр хавтсанд нээ.
3. Бичнэ: `/goat-fluted-studio:goat-fluted-studio` эсвэл энгийнээр: **"энэ бичлэгээр студийн стильтэй эдит хийгээд өг"**
4. Бичлэгээ чирж оруулаад гарчиг, нэг мөр үг, картанд гарах зургуудаа өгнө.
5. Claude юу хийхээ товч хэлнэ. Таалагдвал "ок" гэхэд л болно.
6. `output/fluted-studio.mp4` бэлэн. Instagram, TikTok руу шууд оруулна.

---

## Дуу

- **Дуу эффект** автоматаар орно. Кодоор хийсэн учир лицензийн асуудалгүй. Хэрэггүй бол "дуу эффектгүй болго" гэж хэлэхэд болно.
- **Өөрийн дуугаар ярих (voice-over):** утсаараа дуугаа бичээд (voice memo) өгнө. Таны дуу гарах үед бичлэгийн дуу, хөгжим өөрөө намсна.
- **Хөгжим:** Instagram, TikTok апп дотроос нэмбэл зохиогчийн эрхийн асуудалгүй.

---

## Бичлэг хийх зөвлөгөө

- Ажлынхаа хамгийн багадаа 3, ихдээ 5–6 сайн зураг эсвэл бичлэгийг бэлдээрэй. Нэг бүр нь нэг карт болно.
- Утсаа босоо барьж ав: карт босоо (9:16) хэлбэртэй.
- Гарчиг 1–2 үг байхад хамгийн гоё.

---

Фонтууд нь Google Fonts-оос (OFL лиценз). Лицензийн файлууд `fonts/` хавтсанд байгаа.
