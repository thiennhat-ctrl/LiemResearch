# Phase A — Chia Việc Theo Feature

**4 người, 4 feature, mỗi người ship 1 thứ.**

Mỗi feature là **1 thứ demoable** — show được cho thầy, viết được trên CV. Không có "Track A/B/C" technical jargon. Tên đơn giản.

---

## 🗂️ Quick Overview

| Người | Feature | Cái gì sẽ tồn tại sau khi xong |
|---|---|---|
| **Lead (bạn)** | 📊 **Paper Sync System** | DB có 100+ paper thật từ OpenAlex, sync chạy được, dedup hoạt động |
| **Dev 1** | 📱 **Mobile Login/Register** | Mở Expo Go trên điện thoại đăng ký + đăng nhập được, token persist |
| **Dev 2** | 🎨 **UI Component Library** | Có PaperCard, EmptyState, 404, dark mode — dùng được khắp app |
| **Dev 3** | 🔧 **Team Workflow Tools** | CI tự chạy khi PR, lint auto-format khi commit, docker build được |

**Ghi chú:** Web Login/Register **đã xong** (commit `9e1002c`) — không cần chia cho ai nữa.

---

## 📊 Lead (bạn) — Paper Sync System

### Mục tiêu rõ ràng
Cuối Phase A, demo cho thầy:
> *"Đây — em bấm nút Sync, sau 2 phút có 100 bài báo về LLM-in-education từ OpenAlex. Click vào xem thấy title, author, year, journal."*

### Output bạn ship
1. 10 Mongoose models trong DB (journals, authors, keywords, ...)
2. Worker chạy nền (`pnpm worker:sync`)
3. Admin endpoint `POST /api/v1/admin/sync` trigger được
4. Cron job tự chạy 2h sáng mỗi ngày
5. ~100 paper thật trong MongoDB Atlas

### Spec chi tiết
[`docs/superpowers/specs/2026-05-25-phase-a-design.md`](superpowers/specs/2026-05-25-phase-a-design.md)

### Files bạn động vào
```
apps/backend/src/modules/api-sync/*          (toàn bộ module mới)
apps/backend/src/modules/papers/models/*     (6 models mới)
apps/backend/src/modules/audit/*             (module mới)
apps/backend/src/workers/sync.worker.ts      (entry point worker)
apps/backend/scripts/seed-providers.ts       (seed api_providers)
```

### Done khi
- [ ] `curl POST /api/v1/admin/sync` → return runId
- [ ] Worker logs ~200 paper upsert
- [ ] MongoDB count `research_papers` ≥ 100
- [ ] Re-run sync → `totalDuplicates` tăng
- [ ] `pnpm typecheck` pass

**Effort:** 6–10 giờ.

---

## 📱 Dev 1 — Mobile Login/Register

### Mục tiêu rõ ràng
Cuối Phase A, demo:
> *"Em mở app trên điện thoại, đăng ký account mới, đóng app, mở lại — vẫn đăng nhập."*

### Output bạn ship
1. Màn hình Login + Register trên Expo
2. Token lưu vào secure storage (Keychain iOS / Keystore Android)
3. Protected route — chưa login bị đẩy về Login
4. Logout button hoạt động

### Code mẫu để copy
**Web đã có sẵn pattern hoàn chỉnh ở:**
- `apps/web/src/features/auth/components/login-form.tsx` ← copy logic, đổi UI sang RN
- `apps/web/src/features/auth/components/register-form.tsx`
- `apps/web/src/components/protected-route.tsx`

### Reuse những gì đã có (KHÔNG viết lại)
- `apps/mobile/src/features/auth/index.ts` — đã export `useLogin`, `useRegister`, `useLogout`, `useCurrentUser`
- `apps/mobile/src/services/api-client.ts` — axios + JWT refresh đã sẵn
- `apps/mobile/src/stores/auth-store.ts` — đã wire với `expo-secure-store`

### Files bạn tạo
```
apps/mobile/src/features/auth/components/login-form.tsx     NEW
apps/mobile/src/features/auth/components/register-form.tsx  NEW
apps/mobile/src/features/auth/schemas/auth.schemas.ts       COPY từ web
apps/mobile/app/(auth)/_layout.tsx                          NEW
apps/mobile/app/(auth)/login.tsx                            NEW
apps/mobile/app/(auth)/register.tsx                         NEW
apps/mobile/src/components/protected-route.tsx              NEW
apps/mobile/app/_layout.tsx                                 EDIT
```

### Tech cần dùng
- React Native components: `View`, `Text`, `TextInput`, `Pressable`
- NativeWind classNames (Tailwind cho RN) — đã setup
- `react-hook-form` + `@hookform/resolvers` — cần install
- `expo-router` cho navigation
- Validation: copy nguyên `loginSchema`, `registerSchema` Zod từ web

### Done khi
- [ ] `pnpm dev:mobile` mở Expo Go, scan QR vào app
- [ ] Đăng ký tạo account mới — backend nhận
- [ ] Đóng app, mở lại — vẫn login
- [ ] Logout → quay lại màn Login
- [ ] Test trên iOS simulator HOẶC Android emulator HOẶC điện thoại thật

**Effort:** 4–6 giờ.

---

## 🎨 Dev 2 — UI Component Library

### Mục tiêu rõ ràng
Cuối Phase A, demo:
> *"Bất kỳ trang nào empty thì hiện 'EmptyState đẹp', đang load hiện skeleton, lỗi hiện ErrorBoundary, đổi dark mode được, 404 page có nút Back."*

→ Đây là **design foundation**. Phase B-C sau sẽ dùng lại các component này nhiều lần.

### Output bạn ship
1. 6 components mới reusable
2. 2 pages: 404, ErrorBoundary
3. Dark mode toggle hoạt động và persist
4. MainLayout có theme toggle

### Files bạn tạo
```
apps/web/src/components/empty-state.tsx          NEW — title + desc + CTA optional
apps/web/src/components/loading-spinner.tsx      NEW — inline spinner
apps/web/src/components/skeleton.tsx             NEW — hoặc shadcn add skeleton
apps/web/src/components/paper-card.tsx           NEW — hiển thị 1 paper (dùng Paper từ shared-types)
apps/web/src/components/theme-toggle.tsx         NEW — light/dark switch
apps/web/src/components/page-error.tsx           NEW — ErrorBoundary wrapper

apps/web/src/pages/not-found.tsx                 NEW — 404 page
apps/web/src/pages/error.tsx                     NEW — generic crash page

apps/web/src/main.tsx                            EDIT — wrap với ThemeProvider
apps/web/src/layouts/MainLayout.tsx              EDIT — thêm ThemeToggle vào header
apps/web/src/routes/app-routes.tsx               EDIT — add Route path="*" → 404
```

### Tech cần dùng
- shadcn `Card`, `Button` đã có
- `next-themes` cho dark mode (đã trong package.json)
- `lucide-react` cho icons (đã có)
- Type `Paper` từ `@trend/shared-types` (cho PaperCard prop)
- Test với **mock data** — không cần đợi Track Sync xong

### PaperCard sample
```tsx
import type { Paper } from "@trend/shared-types";

<PaperCard
  paper={mockPaper}
  onClick={(p) => console.log(p.id)}
  showCitations
/>
```

### Done khi
- [ ] Vào URL bất kỳ không tồn tại → 404 page với nút "Back home"
- [ ] Click theme toggle → trang flip dark/light, reload vẫn giữ
- [ ] Render `<PaperCard paper={mockPaper}/>` standalone đẹp
- [ ] Throw error trong component → ErrorBoundary catch, không white screen
- [ ] `<EmptyState/>`, `<LoadingSpinner/>`, `<Skeleton/>` dùng được independent

**Effort:** 4–6 giờ.

---

## 🔧 Dev 3 — Team Workflow Tools

### Mục tiêu rõ ràng
Cuối Phase A, demo:
> *"Em commit code → tự động format. Em push PR → GitHub Actions tự chạy lint + typecheck. Code xấu không vào main được."*

→ Đây là **process foundation**. Bảo vệ chất lượng code cho cả team.

### Output bạn ship
1. ESLint config — bắt lỗi code khi commit
2. Prettier — tự format khi save
3. Husky pre-commit hook — chặn commit code xấu
4. Commitlint — chặn commit message lung tung
5. GitHub Actions CI — chạy khi PR
6. Backend Dockerfile — deploy được sau này
7. CONTRIBUTING.md — onboarding cho dev mới

### Files bạn tạo
```
.eslintrc.cjs                         NEW — root
apps/{backend,web,mobile}/.eslintrc.cjs  NEW — kế thừa root
.prettierrc.json                      NEW
.prettierignore                       NEW

.husky/pre-commit                     NEW — runs lint-staged
.husky/commit-msg                     NEW — runs commitlint
.lintstagedrc.json                    NEW
commitlint.config.cjs                 NEW

.github/workflows/ci.yml              NEW — lint + typecheck + build matrix
.github/pull_request_template.md      NEW

.vscode/settings.json                 NEW
.vscode/extensions.json               NEW

apps/backend/Dockerfile               NEW — multi-stage node:22-alpine
apps/backend/.dockerignore            NEW

CONTRIBUTING.md                       NEW — branch naming, PR rules
```

### Lệnh setup
```bash
# Tại repo root
pnpm add -D -w eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser \
  eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-import \
  eslint-plugin-jsx-a11y prettier eslint-config-prettier husky lint-staged \
  @commitlint/cli @commitlint/config-conventional
pnpm exec husky init
```

Add vào root `package.json`: `"prepare": "husky"`.

### Done khi
- [ ] `pnpm lint` chạy từ root, không lỗi cho code hiện tại
- [ ] Commit file với `var x = 1` → bị chặn (rule no-var)
- [ ] Commit message `"wip"` → bị commitlint chặn (cần `feat:` hoặc `fix:`)
- [ ] Mở PR trên GitHub → CI tự chạy lint + typecheck, status check hiện
- [ ] `docker build -t trend-backend apps/backend` ra image < 200 MB
- [ ] Dev mới đọc CONTRIBUTING.md tự setup được

### ⚠️ KHÔNG được động vào
- `apps/backend/src/modules/api-sync/*` (Lead's territory)
- `apps/backend/src/modules/papers/models/*` (Lead's territory)

Nếu muốn config affect chỉ những file đã có, không phải đoán file Lead sẽ tạo.

**Effort:** 3–4 giờ.

---

## 🧭 Coordination Rules (Cho 4 Người)

### 1. Branch naming
```
feat/<your-name>/<short-description>
ví dụ:
  feat/long/mobile-login
  feat/thanh/paper-card
  feat/nam/ci-workflow
```

### 2. Commit message format (sau khi Dev 3 setup commitlint)
```
feat: short description           ← thêm tính năng
fix: short description            ← sửa bug
docs: short description           ← chỉ docs
refactor: short description       ← đổi code không đổi behavior
chore: short description          ← config, build, devops
```

### 3. PR flow
- Push lên branch riêng → mở PR vào `dev` (không vào `main`)
- Reviewer = ít nhất 1 người trong team
- CI phải xanh mới merge
- Lead merge `dev` → `main` cuối Phase A

### 4. Daily standup
- 9h sáng mỗi ngày Discord voice (15 phút)
- Mỗi người 30 giây: hôm qua làm X, hôm nay làm Y, vướng Z
- Block ở chỗ nào → cả nhóm pair giúp

### 5. Pull `dev` mỗi sáng
```bash
git checkout dev && git pull
git checkout feat/your-branch && git rebase dev
```

### 6. KHÔNG share secret qua git
- `.env` đã trong `.gitignore`
- Secrets share qua Discord pin (xem template trong CLAUDE.md)
- Mỗi người tự lấy Gemini key riêng

---

## ✅ Phase A "Done" Definition

Cả team xong khi:
- [ ] Lead: Sync system hoạt động, 100+ papers trong DB
- [ ] Dev 1: Mobile auth chạy trên Expo Go
- [ ] Dev 2: UI components + 404 + theme toggle merged
- [ ] Dev 3: CI xanh trên mọi PR, pre-commit hook chặn code xấu
- [ ] CLAUDE.md §10 (Roadmap) update Phase A → DONE
- [ ] Lead merge `dev` → `main`

---

## 🎯 Sau Phase A — Ai Xong Sớm Làm Gì?

**Phase B prep** (đọc + prototype, low-risk):
- Đọc [Atlas Vector Search docs](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/)
- Stub `apps/backend/src/modules/embeddings/embedding.worker.ts`
- Prototype semantic search controller với fake 768-dim vector
- Đọc Gemini prompt engineering guide

→ Không lãng phí thời gian, sẵn sàng Phase B.

---

## 📞 Khi Stuck

Format ngắn gọn gửi vào Discord:

```
🆘 Stuck
Feature: [Sync System / Mobile Auth / ...]
File: [path]
Đã thử: [những gì đã làm]
Error: [paste error]
```

Ai trên đầu thấy có thể giúp ngay. Lead luôn ưu tiên trả lời.
