# BlogSpace — Full Codebase Audit

Scope: **every file** in the `BLOG WEBSITE/` repo — server (Express/MongoDB, all controllers/routes/middleware/models/utils/tests) and client (every component, page, hook, util, and context in React/Vite), reviewed line-by-line. 168 files, ~14,355 lines.

Severity key: 🔴 Critical 🟠 High 🟡 Moderate ⚪ Low/Code-quality

## ✅ Fix status

All 🔴 Critical items, and H1/H2/H4/H6/H7/H8/H9 among the 🟠 High items, have been **applied directly to the code** (see `BlogSpace_Fixed.zip`). Details of each fix are inline below, marked `[FIXED]`. H3, H5, and everything in 🟡/⚪ are still open — H5's regex-escaping was folded into the H9 fix, so it's also `[FIXED]`.

**Fixed and verified with `node --check`:** `server/models/User.js`, `server/controllers/authController.js`, `server/controllers/blogController.js`, `server/app.js`, `server/middleware/aiRateLimit.js`. Client-side JSX edits were re-viewed by hand (no JSX toolchain available in this sandbox to auto-check). **Not run:** the actual test suite — the uploaded `node_modules` only contains DOMPurify's dependency tree, missing express/mongoose/vitest/mongodb-memory-server entirely, so `npm test` isn't runnable here. Run it yourself after `npm install` before deploying — the existing suite in `server/tests/` should catch any regression in the auth/blog flows touched above.

---

## 🔴 CRITICAL

### C1. [FIXED] Public profile endpoint leaks raw refresh tokens — full account takeover
**File:** `server/models/User.js` (schema) + `server/controllers/userController.js:getPublicProfile` + `server/routes/userRoutes.js:37`

```js
refreshTokens: [{ token: String, createdAt: Date, userAgent: String, ip: String }]
```
This field has **no `select: false`**, unlike `password` and `twoFactorSecret`. `getPublicProfile` does:
```js
const user = await User.findById(req.params.id).select('-password -email')
```
— which excludes `password` (redundant, already hidden) and `email`, but **not** `refreshTokens`. The route is mounted with `optionalAuth`, meaning it requires **no authentication at all**:
```js
router.get('/:id/profile', optionalAuth, getPublicProfile)
```
**Impact:** Anyone can `GET /api/users/<any-user-id>/profile` and receive that user's live, valid refresh-token JWTs, IPs, and user agents in the JSON response. Since `POST /api/auth/refresh` trusts *any* JWT that both verifies and exists in `user.refreshTokens[]` (it never checks it came from the original browser), an attacker can copy a leaked token into their own `refreshToken` cookie and mint a fresh access token for the victim's account — **complete, self-service account takeover with zero credentials**, for every user on the platform, including admins.

**Fix:** Add `select: false` to `refreshTokens` in the schema (and to `verificationToken`/`resetPasswordToken`/`resetPasswordExpire` while you're at it — no reason those should ever be selected by default). Also explicitly `.select('-refreshTokens -password -email -...')` on every user-returning query as defense in depth, since `getAllUsers` (admin panel) has the same leak.

### C2. [FIXED] "Sign out" never actually signs the user out server-side
**File:** `client/src/context/AuthContext.jsx:38-43`, `client/src/components/common/Navbar.jsx:173,224`

`authAPI.logout` (which calls `POST /api/auth/logout` to revoke the refresh token and clear the httpOnly cookie) is defined in `services/api.js` but is **never called anywhere in the client**. The Navbar "Sign out" button only calls the AuthContext's local `logout()`, which just clears `localStorage`:
```js
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  ...
}
```
**Impact:** the `refreshToken` httpOnly cookie is never cleared and the token is never revoked server-side (stays valid in `user.refreshTokens[]` for up to 30 days). On a shared/public computer, "signing out" is cosmetic — the session can still be silently resumed via `/api/auth/refresh`.

**Fix:** `Navbar`'s sign-out handler should `await authAPI.logout()` before calling the context `logout()`.

---

## 🟠 HIGH

### H1. [FIXED] Mass-assignment on blog update — any field can be overwritten, including ownership
**File:** `server/controllers/blogController.js:189` (`updateBlog`)
```js
const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
```
The ownership check above it is real, but once past it, **the entire request body** is written to the document. Nothing stops a `PUT /api/blogs/:id` body of `{ "author": "<attacker-id>", "isDeleted": false, "featured": true, "status": "published", "views": 999999 }` from succeeding — including transferring ownership of someone else's post, forging like/view counts, or bypassing the dedicated admin-only `toggleFeatured`/`updateStatus` endpoints entirely.

**Fix:** whitelist updatable fields explicitly, e.g. `const { title, content, category, tags, image, gallery } = req.body` and build the update object from that, the same way `userController.updateProfile` already does correctly.

### H2. [FIXED] Two parallel, inconsistent auth-token schemes — most flows are non-revocable
**File:** `server/controllers/authController.js`

`login` uses a proper scheme: 15-minute access token + httpOnly rotating refresh-token cookie, capped at 5 sessions, revocable via `logout`. But `register`, `googleAuth`, `githubCallback`, and `resetPassword` all instead call `utils/generateToken.js`, issuing a single **30-day** access token with **no refresh record and no revocation path** — `logout()` only ever pulls from `refreshTokens`, which these flows never populate. Concretely:
- Anyone who registers with email/password gets a 30-day token that cannot be invalidated by logging out.
- Every Google/GitHub OAuth login gets a permanent-until-expiry 30-day token, full stop.
- `resetPassword` — the one place you'd most want to kill existing sessions after a suspected compromise — doesn't touch `refreshTokens` at all, so a stolen refresh token **survives a password reset**.
- GitHub's token additionally travels in a URL query string (`/auth/callback?token=...`, see `githubCallback` and `client/src/pages/AuthCallback.jsx`), which can leak via browser history, `Referer` headers, and server access logs.

**Fix:** route every login-producing flow (register, Google, GitHub, reset-password) through the same `completeLogin()` helper used by password login, so all sessions are short-lived + revocable, and reset-password explicitly clears `user.refreshTokens = []` to kill existing sessions.

### H3. `createBlog` is admin-only, but the rest of the app assumes multi-author ownership
**File:** `server/routes/blogRoutes.js:21`
```js
router.post('/', protect, adminOnly, createBlog)
```
Yet `updateBlog`, `updateStatus`, and `deleteBlog` all contain ownership checks like `blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin'`, and the client ships a full `AuthorDashboard.jsx` + `getAuthorStats` endpoint. Since only admins can ever create a blog, `blog.author` can only ever be an admin, so all that non-admin-author logic is currently dead code — and any regular "user" role account can never actually become an author through the API, despite the UI/data model being built for it.

**Fix:** decide the intended model. If regular users should be able to author posts (matches the rest of the code), change `createBlog` to `protect` only. If posts should stay admin-only, remove the now-misleading ownership branches and the unreachable AuthorDashboard-for-regular-users path.

### H4. [FIXED] Rate limiting is likely globally shared across all users (trust proxy not configured)
**File:** `server/app.js:58-63`, `server/middleware/aiRateLimit.js`

No `app.set('trust proxy', ...)` is set anywhere in the server. Both the global limiter and the AI-specific limiters key off `req.ip`. Behind Render/Vercel/Cloudflare (matches your documented deployment), Express without `trust proxy` sees every request as coming from the proxy's IP — meaning the "100 requests / 15 min" and "10 AI requests / min" limits are effectively **one shared bucket for your entire user base**, not per-visitor. In practice this means either the site rate-limits itself off during any traffic spike, or (if `X-Forwarded-For` ends up used unsafely) the limiter can be trivially bypassed by spoofing that header.

**Fix:** `app.set('trust proxy', 1)` (or the exact hop count for your proxy chain) in `app.js`, and re-enable `validate.xForwardedForHeader` once that's set instead of suppressing the warning.

### H5. [FIXED] Unauthenticated ReDoS via blog search
**File:** `server/controllers/blogController.js:26-33` (`getBlogs`)
```js
query.$or = [{ title: { $regex: search, $options: 'i' } }, ...]
```
`search` is user-supplied and passed straight into `$regex` with no escaping of regex metacharacters. A crafted pattern (e.g. nested-quantifier catastrophic backtracking) run against `content` (which can be tens of thousands of characters) can hang MongoDB's regex engine / the event loop. This endpoint requires no authentication.

**Fix:** escape regex special characters in `search` before building the query (e.g. a small `escapeRegex()` helper), or move to a text index (`$text`) instead of `$regex` for free-text search.

---

## 🟠 HIGH (found in full pass)

### H6. [FIXED] Notification bell is completely broken — wrong axios call
**File:** `client/src/components/common/NotificationBell.jsx:6,10-15`
```js
import axios from '../../services/api'   // this IS the configured API instance (default export)
const notificationAPI = {
  getAll: () => axios.default.get('/notifications'),   // .default doesn't exist on it
  ...
}
```
`services/api.js` does `export default API`. With native ESM (`"type": "module"` in `package.json`, Vite/esbuild — confirmed), `import axios from '../../services/api'` gives you the axios instance directly; there is no `.default` wrapper the way there might be under certain CommonJS interop. `axios.default` is `undefined`, so every call — `getAll`, `markRead`, `markAllRead`, `remove` — throws `Cannot read properties of undefined (reading 'get')`. The bell renders (it's mounted unconditionally for any logged-in user, desktop and mobile), but the query fails immediately, so **notifications never load for anyone, on any account.** Fix: change every `axios.default.x(...)` to `axios.x(...)`, or better, just import and use `commentAPI`-style helpers from `services/api.js` directly instead of re-declaring a parallel `notificationAPI` object.

### H7. [FIXED] Author link on every article page points to a route that doesn't exist
**File:** `client/src/pages/SingleBlog.jsx:283`
```js
<Link to={`/profile/${blog.author?._id}`}>
```
`App.jsx`'s router has no `/profile/:id` route — only a static `/profile` (the *current* user's own page) and a separate `/author/:id` (the public author page, used correctly by `BlogCard.jsx`). Clicking an author's name/avatar on any article page lands on the 404 page instead of that author's profile. One-line fix: change to `/author/${blog.author?._id}`.

### H8. [FIXED] Admin "Manage Comments" — blog links and titles are blank on every row
**File:** `client/src/pages/admin/ManageComments.jsx:205,207`
```js
<Link to={`/blog/${comment.blogSlug}`}>{comment.blogTitle}</Link>
```
The server's `getAllComments` populates a nested `blog` object (`.populate('blog', 'title slug')`), so each comment has `comment.blog.slug` / `comment.blog.title` — there's no flat `blogSlug`/`blogTitle` field. Every row in this admin moderation table links to `/blog/undefined` with an empty title. Fix: `comment.blog?.slug` / `comment.blog?.title`.

### H9. [FIXED] Read-time filter is fully non-functional
**File:** `client/src/components/common/SearchFilters.jsx` + `client/src/pages/BlogList.jsx:39-40` vs `server/controllers/blogController.js:getBlogs`
The client builds and sends `minReadTime`/`maxReadTime` query params, and the UI presents them as a working filter — but `getBlogs` on the server never reads or applies either param (it only handles `category, search, tag, sortBy, status, featured`). The filter silently does nothing; results are unaffected regardless of what the user enters.

---

## 🟡 MODERATE

### M1. [FIXED] Draft/unpublished articles are readable through the AI endpoints
**File:** `server/controllers/aiController.js:summarizeArticle`, `server/controllers/articleChatController.js`

Both do `Blog.findById(req.params.id)` with no `status === 'published'` check and no ownership check, unlike `getBlogBySlug` which correctly restricts drafts to admins. Since both routes use `optionalAuth`, an unauthenticated visitor who knows/guesses a draft's ObjectId can get the AI to summarize it or answer questions about its content — indirectly disclosing unpublished material.

**Fix:** mirror the same `status`/ownership gate used in `getBlogBySlug`.

### M2. [FIXED] Duplicate, unused, and inconsistent auth middleware left in the codebase
**Files:** `server/middleware/authMiddleware.js`, `server/middleware/adminMiddleware.js`, `server/routes/testAiRoute.js`

`authMiddleware.js`'s `protect` is a second, buggier implementation of the one in `auth.js` — it doesn't check `isBanned`, and if `User.findById` returns `null` (e.g. deleted user with a still-valid token) it calls `next()` anyway instead of rejecting, silently proceeding with `req.user === null`. It isn't wired into any route today (grep confirms every route imports from `./middleware/auth`), but it's a live footgun for the next person who `require`s the wrong file by habit. Same for `adminMiddleware.js` duplicating `adminOnly`, and `testAiRoute.js`, which isn't mounted in `app.js` at all. Delete the dead files.

### M3. [PARTIALLY FIXED] Password-reset session revocation & brute-force protection gaps
**File:** `server/controllers/authController.js`, `server/routes/authRoutes.js`
- ~~`resetPassword` doesn't invalidate other active sessions~~ — **fixed as part of H2**: `resetPassword` now calls `completeLogin(..., { revokeExisting: true })`, wiping every other active session.
- ~~`forgot-password` has no dedicated rate limit~~ — **fixed**: added `emailSendRateLimit` (5/15min per IP) to `POST /auth/forgot-password`.
- **Still open:** `forgot-password`/`reset-password` still have no reCAPTCHA (would need a client-side change too, since reCAPTCHA tokens are generated in the browser). `login`/`register` do have reCAPTCHA, which is good, but there's still no account lockout / exponential backoff after repeated failed logins for a specific account (only IP-based limiting, which now works correctly per the H4 fix, but is still a blunter instrument than per-account lockout).

### M4. [FIXED] `javascript:` URIs are not blocked in rendered blog links
**File:** `client/src/components/blog/ContentRenderer.jsx:185`
```js
parts.push(<a key={key++} href={m[9]} target="_blank" rel="noreferrer">{m[8]}</a>)
```
The custom markdown renderer (good — it avoids `dangerouslySetInnerHTML` entirely, so most content is safely escaped by React) takes the URL straight out of `[text](url)` syntax and drops it into `href` with no scheme allow-listing. A `[click me](javascript:alert(document.cookie))`-style link in a blog body or AI-generated article executes on click. Combine with H3 (currently only admins author posts, so today this is low-impact) but if authorship ever opens up to regular users this becomes stored XSS against every reader.

**Fix:** validate the URL scheme is `http:`/`https:`/`mailto:` before rendering as `href`; otherwise render as plain text.

### M5. Access token stored in `localStorage`
**File:** `client/src/services/api.js:10`, `client/src/context/AuthContext.jsx`

Standard-but-real tradeoff: the JWT access token lives in `localStorage`, which any successful XSS can read directly (unlike an httpOnly cookie). The refresh token is correctly httpOnly, which limits the blast radius to the 15-minute access token window for the `login` flow — but per H2, the non-`login` flows hand out 30-day tokens that also end up in `localStorage`, meaning an XSS bug anywhere in the app could steal a month-long-valid credential.

### M6. [FIXED] Global `axios` defaults carry the bearer token to any request via that import
**File:** `client/src/context/AuthContext.jsx:15,34`
```js
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
```
This sets a default on the shared `axios` module itself, not on the scoped `API` instance from `services/api.js`. Today only `Newsletter.jsx` also imports bare `axios`, and it happens to call your own backend, so there's no active leak — but it's a latent footgun: any future plain `axios.get('https://some-third-party...')` anywhere in the app will silently attach the user's bearer token to that external request.

**Fix:** use the scoped `API` instance everywhere (`Newsletter.jsx` should use `newsletterAPI.subscribe` instead of hand-rolling its own request), and drop the global `axios.defaults` mutation in `AuthContext`.

### M7. [PARTIALLY FIXED] Newsletter subscribe has no email-ownership verification (spam/abuse vector)
**File:** `server/controllers/newsletterController.js:subscribe`

Subscribing sends a "Welcome" email immediately to whatever address is submitted, with no double opt-in/confirmation step. **Fixed:** added `emailSendRateLimit` (5 requests/15min per IP) to the subscribe endpoint, closing the easy mass-abuse path. **Still open:** there's still no double opt-in (confirm-by-clicking-a-link-in-the-welcome-email) — the rate limit caps *volume* from a single IP but doesn't stop someone from subscribing one specific victim email once from each of a few different IPs/networks. A confirmation step is the complete fix if this matters for your use case; the rate limit alone significantly raises the cost of abuse in the meantime.

### M8. [FIXED] Comment nesting is silently capped at 2 levels
**File:** `server/controllers/commentController.js:getComments`

Replies are fetched one level deep (`parentComment: comment._id` off each top-level comment). A reply-to-a-reply is stored fine (nothing stops creating it) but is **never returned** by `getComments`, since there's no recursive/deeper fetch. This is confirmed to be a genuine gap rather than a design choice: the client's `NestedComments.jsx` component *does* recursively render `comment.replies` at increasing `depth`, actively expecting arbitrary nesting — the frontend is built for a feature the backend silently cuts off at depth 1.

### M9. [FIXED] Own-profile endpoints also return raw session tokens (same schema fix as C1)
**File:** `server/controllers/authController.js:getMe`, `server/controllers/userController.js:getProfile`/`updateProfile`

Same root cause as C1 (missing `select: false` on `User.refreshTokens`), narrower blast radius: `GET /api/auth/me`, `GET /api/users/profile`, and `PUT /api/users/profile` all return `req.user` / the updated document as-is, which includes the caller's own `refreshTokens` array (their own valid session tokens, plus IP/user-agent history) in the JSON response, and this ends up sitting in the React Query cache in the browser. Not exploitable by a third party the way C1 is, but it's unnecessary exposure — a stored XSS anywhere in the app could scrape every active session token for that user, not just the current one. The same one-line schema fix (C1) resolves this too.

### M10. [FIXED] GitHub sign-up bypasses the site's password rules entirely
**File:** `server/controllers/authController.js:githubCallback`

Unlike `register` (which requires `password`), `githubCallback` calls `User.create({..., password: undefined})`. That's correct and necessary for OAuth accounts, but it means `comparePassword` will be invoked against a `bcrypt.compare(candidate, undefined)` if that account ever attempts a local password-login (e.g. someone registers via GitHub, then later tries "Forgot password" or types a password on the login form believing they set one). Depending on the bcryptjs version this either always resolves `false` (clean "invalid credentials," fine) or throws (`login`'s outer `catch` turns it into a generic 500 rather than the same clean message the wrong-password path gives). Worth an explicit test to confirm which happens, since a 500 here would be a minor but confusing bug for anyone who forgets which method they signed up with.

---

## ⚪ LOW / CODE QUALITY

- **`server/app.js:52-53`** — `/api/notifications` and `/api/ai` are mounted *before* the global rate limiter, relying entirely on their own route-level limiters (which the AI routes do have; notifications has none at all, though its low cost makes this low-risk).
- **`getBlogs`** (`blogController.js:11`) — `limit` query param has no upper bound; `?limit=100000` is not clamped, allowing an easy read-heavy DoS query.
- **`getAllUsers`** (`userController.js:141`) — no pagination; will degrade badly once the user table grows.
- **`toggleBan`/`deleteUser`** (`userController.js`) — `logAction(...)` calls are not awaited (intentionally fire-and-forget per its own comment, which is fine, but worth confirming that's still the desired tradeoff for irreversible actions like user deletion).
- **`deleteUser`** — hard-deletes the `User` doc but leaves their `Blog`/`Comment` documents in place with a dangling `author`/`user` reference; author name will render as empty/broken wherever those are populated.
- **`followToggle`** (`userController.js:79-95`) — the two `findByIdAndUpdate` calls (pull follower, pull following) aren't wrapped in a transaction; a failure between them leaves the relationship one-sided.
- **[FIXED] `cronTriggerDigest`** (`newsletterController.js:136`) — secret comparison now uses `crypto.timingSafeEqual` instead of `!==`.
- **`regenerateBackupCodes` / `disableTwoFactor`** (`twoFactorController.js`) — password confirmation is silently skipped for OAuth accounts (`user.password` falsy), which is a reasonable necessity but is undocumented in the code/comments and worth a comment noting the tradeoff.
- **[FIXED] `User.email`** now has a `match` regex validator at the schema level.
- **`sanitize.js`** — applies DOMPurify's HTML profile to *every* string field on every request body (titles, tags, names, etc.), not just rich-content fields; harmless most of the time but can silently mangle unusual characters in unrelated fields.
- **`getComments`** — N+1 query pattern (one query per top-level comment to fetch its replies); fine at current scale, will need batching later.
- **`app.js` comment** ("CORS — allow all origins") is stale/misleading — the actual code restricts to an explicit origin allowlist, which is correct; just fix the comment.
- **`ProtectedRoute.jsx`** — the `loading` branch is unreachable dead code; `AuthContext`'s `loading` state is initialized `false` and never set `true` anywhere.
- **Two versions of `generateToken`/`protect`/`adminOnly` logic** exist between `authController.js`'s inline helpers and `utils/generateToken.js` — worth consolidating into one source of truth per H2's fix.
- **[FIXED] `Register.jsx`** — the "Terms of Service" and "Privacy Policy" links now correctly point to `/terms` and `/privacy` instead of both pointing at `/`.
- **`AuthContext.jsx`** sets `axios.defaults.headers.common['Authorization']` on the *global* `axios` module rather than the scoped `API` instance from `services/api.js`. `Newsletter.jsx` separately imports plain `axios` too (and duplicates the subscribe call instead of using `newsletterAPI.subscribe`) — currently harmless since it only calls the app's own backend, but it's a latent footgun: any future plain `axios.get('https://third-party...')` anywhere in the app will silently carry the user's bearer token.
- **`ManageUsers.jsx`** (and the `getAllUsers` endpoint it calls) has no self-protection: an admin can ban or delete their own account with no extra confirmation or block.
- **`ManageComments.jsx`** — beyond H8's broken link, no client-side issue found otherwise; the moderation actions (approve/reject/delete) are correctly wired to `commentAPI` with matching backend routes.
- **Every other component and page not called out above** (all of `components/blog/*`, `components/common/*`, `components/admin/*`, `hooks/*`, `utils/*`, remaining `pages/*` including `Home.jsx`, `Categories.jsx`, `SearchResults.jsx`, `NotFound.jsx`, `Privacy.jsx`, `Terms.jsx`, `VerifyEmail.jsx`, `UnsubscribeConfirm.jsx`, `AuthorPage.jsx`, `AuthorDashboard.jsx`, `CreateBlog.jsx`, `EditBlog.jsx`, `Dashboard.jsx`, `PlatformAnalytics.jsx`, `AuditLogs.jsx`, `TwoFactorSettings.jsx`) — reviewed line-by-line, no dangerouslySetInnerHTML, no unescaped output, no mass-assignment on the client side, no hardcoded secrets, form payloads correctly whitelisted to match server expectations. Clean.
- **Server test suite** (`server/tests/`) — well-written, all passing-by-design unit and integration tests covering JWT, password hashing, 2FA/TOTP/backup-codes, reCAPTCHA fail-open behavior, the cron-secret fail-closed guard, and blog/comment auth flows. No issues; this is genuinely solid coverage for the areas it touches.

---

## Priority order if you're fixing incrementally

1. **C1 / M9** — add `select: false` to `refreshTokens` on `User` (and to `verificationToken`/`resetPasswordToken`/`resetPasswordExpire` while you're there) — one-line-per-field fix, closes an unauthenticated account-takeover.
2. **C2** — wire up `authAPI.logout()` in the Navbar sign-out handler (both desktop and mobile buttons).
3. **H6** — fix `axios.default.get(...)` → `axios.get(...)` in `NotificationBell.jsx`. Trivial one-word-per-line fix, but it's a completely dead feature for every user right now.
4. **H1** — whitelist fields in `updateBlog`.
5. **H4** — set `trust proxy` so rate limiting actually works per-visitor.
6. **H7 / H8** — fix the two broken links (`/profile/:id` → `/author/:id` in `SingleBlog.jsx`; `comment.blogSlug`/`blogTitle` → `comment.blog?.slug`/`comment.blog?.title` in `ManageComments.jsx`).
7. **H2** — unify the token-issuance flows (bigger refactor, but everything else about your session model — rotation, 5-session cap, ban checks — is already solid, this just needs to apply everywhere).
8. Everything else roughly in severity order.

Nothing here is a fundamental architecture problem. The auth design (short access token + rotating httpOnly refresh token + 2FA + backup codes + audit log) is genuinely solid where it's actually used, and the test suite covering it is well-written. The issues are mostly *inconsistent application* of that design (H2, H3) plus a handful of quick, surgical fixes (C1's missing `select: false`, H1's mass assignment, H6/H7/H8's broken wiring) rather than anything requiring a rebuild.

---

## Changelog — exact fixes applied

- `server/models/User.js` — added `select: false` to `refreshTokens`, `verificationToken`, `resetPasswordToken`, `resetPasswordExpire`.
- `server/controllers/authController.js` —
  - `refreshAccessToken`, `login`, `verifyLoginTwoFactor` now explicitly `.select('+refreshTokens')` (needed since the schema change above would otherwise silently break refresh and collapse multi-session support to 1 session).
  - Replaced the standalone `generateToken()` calls in `register`, `googleAuth`, `resetPassword`, and `githubCallback` with the shared session helper (refactored `completeLogin` into `issueSession` + `completeLogin`, so the GitHub redirect flow can reuse the same session logic without a JSON response).
  - `resetPassword` now calls `completeLogin(..., { revokeExisting: true })`, killing every other active session on password reset.
  - `githubCallback` now sets the real httpOnly refresh cookie and redirects with a 15-minute token instead of a 30-day one.
  - Removed the now-unused `require('../utils/generateToken')` import.
- `server/utils/generateToken.js` — deleted (dead code after the above).
- `server/middleware/authMiddleware.js`, `server/middleware/adminMiddleware.js`, `server/routes/testAiRoute.js` — deleted (confirmed unreferenced anywhere).
- `server/controllers/blogController.js` — `updateBlog` now whitelists `title/content/excerpt/image/gallery/category/tags`; `getBlogs` escapes regex metacharacters in `search`, clamps `limit` to 50, and applies `minReadTime`/`maxReadTime`.
- `server/app.js` — added `app.set('trust proxy', 1)`; removed `validate.xForwardedForHeader: false` from the global rate limiter.
- `server/middleware/aiRateLimit.js` — removed `validate.xForwardedForHeader: false` from both limiters (no longer needed now that `trust proxy` is set correctly).
- `client/src/context/AuthContext.jsx` — `logout()` is now async and calls `authAPI.logout()` before clearing local state.
- `client/src/components/common/NotificationBell.jsx` — fixed `axios.default.x(...)` → `axios.x(...)` in all four calls.
- `client/src/pages/SingleBlog.jsx` — author link now points to `/author/${id}` instead of the nonexistent `/profile/${id}`.
- `client/src/pages/admin/ManageComments.jsx` — fixed both the broken blog link/title (`comment.blog?.slug`/`comment.blog?.title`) and the client-side search filter that had the same bug.

**Still open** (not modified): H3 (admin-only blog creation vs. multi-author code), M1, M3–M8, M10, and everything in the Low/Code-quality section — see each entry above for details and recommended fixes.

**Before deploying:** run `npm install` and the existing test suite (`server/tests/`) yourself — this sandbox's uploaded `node_modules` was incomplete (missing express/mongoose/vitest entirely), so I could only syntax-check the edited server files with `node --check` (all pass) and hand-verify the client JSX edits, not actually execute the suite.

---

## Changelog — round 2

- `server/controllers/aiController.js` (`summarizeArticle`) and `server/controllers/articleChatController.js` (`askAboutArticle`, `getChat`) — added the same `status === 'published'` gate (unless admin) that `getBlogBySlug` already used, closing the draft-content leak. Also fixed `getChat`'s handling of a missing `sessionId` for anonymous callers.
- `client/src/components/blog/ContentRenderer.jsx` — added `isSafeHref()`; markdown links now only render as clickable `<a>` tags if the URL scheme is `http:`/`https:`/`mailto:` (or a relative URL); anything else renders as plain text.
- `client/src/context/AuthContext.jsx` — removed the global `axios.defaults.headers.common['Authorization']` mutation entirely (no longer needed — the scoped `API` instance in `services/api.js` already attaches the token per-request via its own interceptor).
- `client/src/components/common/Newsletter.jsx` — switched from a hand-rolled bare-`axios` POST to `newsletterAPI.subscribe`.
- `server/middleware/emailRateLimit.js` — new file, a 5-requests/15-min-per-IP limiter for any endpoint that emails an address the caller supplies.
- `server/routes/newsletterRoutes.js` — applied `emailSendRateLimit` to `/subscribe`.
- `server/routes/authRoutes.js` — applied `emailSendRateLimit` to `/forgot-password`.
- `server/controllers/commentController.js` — rewrote `getComments` to fetch the entire comment thread in one query and build an arbitrary-depth reply tree in memory (was previously capped at one level of replies, and had an N+1 query pattern). Rewrote `deleteComment` to cascade-delete the full reply subtree (BFS over all descendants) instead of only direct children, since deeper nesting means a deleted comment can now have grandchildren that would otherwise be orphaned.
- `server/controllers/authController.js` (`login`) — now explicitly checks `user.password` exists before calling `comparePassword`, so accounts created via Google/GitHub OAuth get a clean 401 on a password-login attempt instead of risking an unhandled comparison against a missing hash.
- `server/controllers/newsletterController.js` (`cronTriggerDigest`) — secret comparison now uses `crypto.timingSafeEqual` instead of `!==`.
- `server/models/User.js` — added an email-format `match` validator.
- `client/src/pages/Register.jsx` — fixed the Terms of Service / Privacy Policy links (both previously pointed at `/`).

**Two bugs introduced and self-caught via `node --check` before considering the work done:** a duplicate `accessToken` declaration in `githubCallback` (round 1) and a duplicate `filter` declaration in `askAboutArticle` (round 2). Both fixed immediately; every server file touched across both rounds now passes `node --check` clean.

**Still open:** H3 (architectural — admin-only vs. multi-author blog creation, left as a decision for you), M5 (access token in `localStorage` — a standard tradeoff, not something to silently change), the reCAPTCHA-on-forgot-password and per-account-lockout halves of M3, the double-opt-in half of M7, and the remaining Low/code-quality items (`getAllUsers` pagination, `followToggle` transaction safety, `deleteUser` orphaned-data cleanup, `sanitize.js`'s blanket field coverage, the N+1-adjacent items already resolved by the M8 rewrite).
