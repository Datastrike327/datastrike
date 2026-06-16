# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # local dev server (http://localhost:3000)
npm run build    # production build — run before pushing to catch TS errors
npm run lint     # ESLint
```

No tests exist in this project.

On Windows, npm needs PATH set explicitly:
```powershell
$env:PATH = "C:\Program Files\nodejs\;$env:PATH"; npm run build
```

## Architecture

Next.js 16 App Router, Tailwind CSS v4, shadcn/ui (base-ui v1), Supabase (auth + PostgreSQL), next-themes (dark/light), deployed on Vercel.

### Route structure

| Route | Type | Notes |
|---|---|---|
| `/` | Server | Hero + live counts + featured opportunities + courses from Supabase |
| `/opportunities` | **Server → Client hybrid** | Server fetches initial data, passes to `OpportunitiesClient`; filters (category/format/grade) + save/unsave run client-side |
| `/opportunities/[id]` | Server | Detail page with apply button + related |
| `/courses` | Server | List with enrollment progress |
| `/courses/[id]` | Server | Lesson list, enroll, progress, certificate on 100% |
| `/courses/[id]/[lessonId]` | Server | Lesson content + quiz (`LessonQuiz` client component) |
| `/dashboard` | Server (protected) | Tabs: courses, saved, recommendations + deadline sidebar |
| `/onboarding` | Client (protected) | 3-step: grade → interests → goals |
| `/admin` | Server (protected) | CRUD for opportunities + courses + user list |
| `/auth/login` + `/auth/register` | Client | Register redirects to `/onboarding` |

`src/middleware.ts` protects `/dashboard`, `/onboarding`, `/admin` — redirects to `/auth/login` if no session.

### Supabase clients — never mix

- `src/lib/supabase/client.ts` — `createBrowserClient`, for `"use client"` components only. **Must be called inside `useEffect` or event handlers, never in component body** — calling it at component level crashes SSR prerendering.
- `src/lib/supabase/server.ts` — `createServerClient` with cookies, for server components and `middleware.ts`.

The `/opportunities` page was previously a pure client component that caused "No API key found" errors on Vercel (NEXT_PUBLIC_* vars baked-in at build time). The fix: server component fetches initial data and passes it as props to the `OpportunitiesClient` wrapper — client-side Supabase is only used for save/unsave mutations.

### UI components — @base-ui/react does NOT support asChild

shadcn/ui v4 uses `@base-ui/react` for Dialog, Sheet, DropdownMenu, etc. These components have no `asChild` prop — passing it causes a TypeScript build error.

`Button` (`src/components/ui/button.tsx`) was rewritten with `@radix-ui/react-slot` and **does** support `asChild`. All `<Button asChild><Link>` patterns work.

For other components, use these patterns instead:

```tsx
// SheetTrigger — apply buttonVariants via className
<SheetTrigger className={cn("md:hidden", buttonVariants({ variant: "ghost", size: "sm" }))}>
  <Menu />
</SheetTrigger>

// DropdownMenuTrigger — render content directly, no Avatar wrapper
<DropdownMenuTrigger className="flex items-center justify-center h-9 w-9 rounded-full bg-primary ...">
  {initials}
</DropdownMenuTrigger>

// DropdownMenuItem — onClick + router.push instead of asChild+Link
<DropdownMenuItem onClick={() => router.push("/dashboard")}>...</DropdownMenuItem>

// Dialog — use controlled open state, trigger button outside Dialog element
const [open, setOpen] = useState(false);
<Button onClick={() => setOpen(true)}>Open</Button>
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>...</DialogContent>
</Dialog>
```

### Dark theme

`next-themes` ThemeProvider wraps the layout in `src/app/layout.tsx` with `attribute="class"`. The `<html>` tag needs `suppressHydrationWarning`. `src/components/layout/theme-toggle.tsx` is a client component (needs `mounted` guard before rendering to avoid hydration mismatch). The `.dark` CSS class and all CSS variables are already defined in `src/app/globals.css`.

### Database schema

7 tables (full SQL in `supabase-full-setup.sql`):
- `opportunities` — title, category, format, deadline, tags[], apply_url, **grades int[]** (which grade levels it's for, e.g. `{9,10,11}`)
- `courses` — title, description, level, tags[]
- `lessons` — course_id, content, order_num, `quiz jsonb` (array of `{q, options[], answer: number}`)
- `user_profiles` — grade, interests[], goals[], `is_admin bool`, `onboarding_done bool`; auto-created on signup via DB trigger
- `saved_opportunities` — user_id + opportunity_id (unique)
- `enrollments` — user_id + course_id, `progress` 0–100
- `lesson_completions` — user_id + lesson_id (unique)

RLS on all tables. Public read on opportunities/courses/lessons. Admin writes require `is_admin = true`. To grant admin: set `is_admin = true` in Supabase Table Editor → user_profiles.

If you add `grades` to the DB, run this SQL first:
```sql
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS grades int[] DEFAULT '{8,9,10,11}';
```

### Recommendation logic

Tag-based matching in `/dashboard` and `/` (homepage): user's `interests[]` values (e.g. `['stem', 'math']`) are compared against opportunity/course `tags[]`. Pure array intersection — `INTERESTS` values in `types.ts` must match `tags` values in the DB seed data.

### Key types

All domain types are in `src/lib/types.ts`. Constants exported from the same file: `CATEGORIES`, `FORMATS`, `GRADES`, `LEVELS`, `INTERESTS`, `GOALS`.

### Vercel deployment

- Repo: `Datastrike327/datastrike` (main branch → auto-deploy)
- URL: `https://datastrike-iota.vercel.app/`
- Required env vars in Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_*` vars are baked in at **build time**, not runtime. A Vercel "Redeploy" button reuses the old build — a new git push is required to re-bake changed env vars.
- `middleware.ts` filename is deprecated in Next.js 16 (rename to `proxy.ts` to silence warning) — currently still functional
