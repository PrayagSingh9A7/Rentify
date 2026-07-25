# Rentify MERN End-to-End Audit Report

Audit date: 2026-07-24  
Scope: `client/`, `server/`, data pipeline, route/API contracts, models, stores, pages, middleware, services, utilities.  
Verification performed: static source tracing, frontend production build (`npm run build` in `client/`), endpoint-to-client contract comparison. No fixes were made.

## Executive Summary

Rentify is a Vite React + Zustand frontend backed by an Express/Mongoose API with JWT bearer authentication, Cloudinary uploads, Socket.IO chat, and MongoDB property data seeded from ETL datasets. The core structure is recognizable, but the application is not production-ready. The largest risk is contract drift: recently added booking, inquiry, notification, owner-dashboard, nearby-property, and property-creation flows do not match the backend they call.

Several important user journeys are currently broken at runtime despite the frontend build passing: owner-created properties fail schema validation, booking status actions call the wrong HTTP method, inquiries call a missing store function and missing backend endpoints, notifications parse a non-existent response field and use the wrong method, owner dashboard subpages are exposed without route protection, and nearby properties call a route that does not exist.

## Architecture

### Folder Structure

- `client/`: Vite React SPA.
- `client/src/pages`: route-level pages for home, search, auth, property detail, owner dashboard, chat, maintenance, and dashboard subpages.
- `client/src/components`: reusable layout, property cards/filters, booking/inquiry modals, notification bell, skeletons.
- `client/src/store`: Zustand stores for auth, properties, bookings, inquiries, notifications.
- `client/src/services/api.js`: shared Axios instance and auth-token interceptor.
- `client/src/hooks/useSocket.js`: Socket.IO client setup.
- `server/`: Express API.
- `server/index.js`: app bootstrap, middleware, route mounting, Socket.IO, Mongo connection.
- `server/routes`: route declarations.
- `server/controllers`: request handlers.
- `server/services`: booking/notification/property/storage services.
- `server/models`: Mongoose schemas.
- `server/utils`: email, property query/sort helpers.
- `server/data-pipeline`: CSV ingestion, cleaning, enrichment, deduplication, generated JSON outputs.

### Data Flow

1. React pages and components call Zustand store actions or call `api` directly.
2. `client/src/services/api.js` attaches `Authorization: Bearer <localStorage token>` to every request.
3. Express routes use `protect` or `optionalAuth` to attach `req.user`.
4. Controllers call Mongoose models or service functions.
5. MongoDB documents are returned as `{ success, data }` in most places, with several inconsistent variants.
6. Socket.IO is initialized in `server/index.js`; chat messages are saved through REST and emitted to conversation rooms.

### Frontend to Backend Interaction

The frontend assumes `/api` as the Axios base URL and calls route fragments like `/properties`, `/bookings`, `/notifications`. Backend mounts the same base paths under `/api`. Authentication is token-based, not cookie-based, even though CORS and Axios both enable credentials.

### Architectural Flaws

- API contracts are decentralized and duplicated across pages/stores; no generated client, shared route constants, OpenAPI schema, or runtime validators.
- Business rules are split unevenly between controllers and services; only bookings/notifications have service files, while properties and inquiries mix validation, persistence, authorization, and response formatting in controllers.
- Newer modules were added without aligning existing domain names (`price` vs `rent`, `type` vs `propertyType`, lowercase vs title-case statuses).
- Role authorization is inconsistent; some owner-only route pages and backend actions check ownership, others only check authentication.
- Socket.IO trusts client-supplied `userId` and room joins without JWT verification or membership checks.
- No centralized error class/status mapping, so expected 404/403 errors become 400 or 500 in several flows.
- Data-pipeline generated outputs are committed into the application tree, increasing repo size and noise.

### Duplicated Logic

- Property filtering exists in `server/controllers/property.controller.js` and `server/utils/buildPropertyQuery.js`, but the controller does not use the utility.
- Property sorting exists in `server/controllers/property.controller.js` and `server/utils/propertySort.js`, but the controller does not use the utility.
- Owner dashboard embeds bookings, inquiries, and notifications summaries while separate dashboard pages repeat similar store/data logic.
- Booking/inquiry stores include `fetch*` and `refresh*` methods that perform identical GET requests.
- Upload routes support `/upload/images` while property routes also support `/:id/images`; the frontend only uses the generic upload endpoint.

### Missing Modules

- No centralized request validation layer despite `express-validator` dependency.
- No async error wrapper or typed/custom application errors.
- No API contract/schema documentation.
- No authorization middleware usage beyond `protect`; `authorize` exists but is unused.
- No audit logging, structured logging, or request correlation.
- No test suite found for API, stores, components, or data pipeline.
- No token refresh/session invalidation module.
- No owner/tenant tenancy validation for maintenance complaints.

### Dead or Stale Code

- `server/config/db.js` exports `connectDB`, but `server/index.js` connects directly.
- `server/services/property.service.js`, `server/utils/buildPropertyQuery.js`, and `server/utils/propertySort.js` appear unused by routes/controllers.
- `server/middleware/auth.js` exports `authorize`, but no route uses it.
- `server/sockets/socket.js` exports `getOnlineUsers`, but no caller uses it.
- `client/src/data/properties.js` powers the home page while real `/properties/featured` exists.
- `client/src/components/booking/BookingStatusBadge.jsx` is not referenced by the observed booking page/store.
- Root `package.json` only contains Tailwind/PostCSS dev dependencies and no workspace scripts.

## Findings

### Critical

1. Severity: Critical  
   Category: API / Frontend  
   File: `client/src/store/propertyStore.js:37-38`, `server/controllers/property.controller.js:184-202`  
   Problem: Frontend expects `data.pagination`, backend returns top-level `total`, `page`, `limit`, `totalPages`, `hasNextPage`, `hasPrevPage`.  
   Root Cause: Response shape drift without a shared contract.  
   Impact: Search pagination never receives `pages`; pagination UI is disabled/incorrect and result counts are unreliable.  
   Recommended Fix: Normalize backend to return `{ data, pagination: { total, page, limit, pages, hasNextPage, hasPrevPage } }` or update store/UI consistently.

2. Severity: Critical  
   Category: API / Frontend  
   File: `client/src/store/bookingStore.js:68,93,124,149`, `server/routes/booking.routes.js:25-31`  
   Problem: Frontend uses `PATCH` for approve/reject/cancel/complete; backend only defines `PUT`.  
   Root Cause: HTTP methods were not contract-verified.  
   Impact: All owner booking status actions return 404 and cannot work.  
   Recommended Fix: Align methods; preferably expose `PATCH` for partial status updates or update the client to `PUT`.

3. Severity: Critical  
   Category: API / Frontend  
   File: `client/src/store/notificationStore.js:46,66`, `server/routes/notification.routes.js:25,28`  
   Problem: Frontend uses `PATCH` to mark notifications read; backend only defines `PUT`.  
   Root Cause: Same endpoint contract drift.  
   Impact: Notification read/unread state cannot be persisted.  
   Recommended Fix: Align methods and add integration tests for notification actions.

4. Severity: Critical  
   Category: API / Frontend  
   File: `client/src/store/notificationStore.js:17-18`, `server/services/notification.service.js:52-57`, `server/controllers/notification.controller.js:17-20`  
   Problem: Frontend stores `notifications: data.data`, but backend returns `{ success, notifications, total, page, totalPages }`.  
   Root Cause: Backend response shape inconsistent with the common `{ data }` pattern.  
   Impact: `notifications` becomes `undefined`, causing UI crashes when components read `.length` or `.map`.  
   Recommended Fix: Return `data: notifications` plus `pagination`, or update store to read `data.notifications` defensively.

5. Severity: Critical  
   Category: Frontend  
   File: `client/src/store/inquiryStore.js:10`, `client/src/components/inquiry/InquiryModal.jsx:7-15`  
   Problem: Store exports `ccreateInquiry`, but modal selects `state.createInquiry`.  
   Root Cause: Typo not caught by tests/types.  
   Impact: Clicking "Send Inquiry" calls `undefined` and throws; inquiry creation is broken before hitting the API.  
   Recommended Fix: Rename to `createInquiry` and add component/store tests.

6. Severity: Critical  
   Category: API / Frontend  
   File: `client/src/store/inquiryStore.js:84-88,118`, `server/routes/inquiry.routes.js:19-25`  
   Problem: Frontend calls `PATCH /inquiries/:id/reply` and `DELETE /inquiries/:id`; backend only supports `PUT /inquiries/:id/status`.  
   Root Cause: Frontend implemented reply/delete features that do not exist server-side.  
   Impact: Owner inquiry replies and inquiry deletion are non-functional.  
   Recommended Fix: Either implement reply/delete endpoints and schema fields or change UI to supported status updates.

7. Severity: Critical  
   Category: Database / Frontend / API  
   File: `client/src/pages/owner/AddPropertyPage.jsx:11-18,70-87,149-153`, `server/models/Property.js:25-35`, `server/controllers/property.controller.js:240-248`  
   Problem: Owner form submits legacy `type` values (`pg`, `flat`, etc.) but schema requires `propertyType` enum values (`Apartment`, `Villa`, etc.).  
   Root Cause: Schema migrated to ETL `propertyType` while owner form stayed on old taxonomy.  
   Impact: Owner-created listings fail validation with missing required `propertyType`.  
   Recommended Fix: Adopt one taxonomy, map old UI values to schema values, or make `propertyType` explicit in the form.

8. Severity: Critical  
   Category: API / Frontend  
   File: `client/src/store/propertyStore.js:67`, `server/routes/property.routes.js:14`  
   Problem: Frontend calls `GET /properties/my`; backend route is `GET /properties/owner/my-listings`.  
   Root Cause: Route rename not propagated.  
   Impact: Any UI using `fetchMyProperties` receives 404.  
   Recommended Fix: Update client or add a backward-compatible route alias.

9. Severity: Critical  
   Category: API / Frontend / Database  
   File: `client/src/store/propertyStore.js:78`, `client/src/components/property/NearbyProperties.jsx:6-19`, `server/routes/property.routes.js:15`, `server/controllers/property.controller.js:363-372`  
   Problem: Frontend calls `/properties/:id/nearby`; backend only exposes `/properties/nearby?lat&lng&radius`.  
   Root Cause: Nearby feature contract was implemented with different addressing models.  
   Impact: Nearby properties never load.  
   Recommended Fix: Either pass coordinates to `/nearby` or add `/:id/nearby` that loads the source property and derives coordinates.

10. Severity: Critical  
    Category: Security / Frontend  
    File: `client/src/App.jsx:67-79`  
    Problem: `/dashboard/bookings`, `/dashboard/inquiries`, and `/dashboard/notifications` routes are declared after the catch-all and are not wrapped in `ProtectedRoute ownerOnly`.  
    Root Cause: Routes were appended outside the owner route block.  
    Impact: Unauthorized users can render owner dashboard pages client-side; the pages then trigger protected API calls and leak UI structure. Depending on React Router scoring, they may still match despite the catch-all position.  
    Recommended Fix: Move these routes before `*` and wrap them in `ProtectedRoute ownerOnly`.

11. Severity: Critical  
    Category: Security / Backend  
    File: `server/controllers/chat.controller.js:43-61`, `server/controllers/chat.controller.js:72-75`  
    Problem: `getMessages` marks/returns messages for any `conversationId` without verifying the requester is a participant; `sendMessage` attempts a participant check but uses `ObjectId.includes(req.user.id)`, which is unreliable.  
    Root Cause: Missing membership authorization and ObjectId/string comparison bug.  
    Impact: Authenticated users can read or mark other conversations if they know IDs; legitimate participants may be blocked from sending.  
    Recommended Fix: Validate conversation membership with `participants.some(id => id.equals(req.user._id))` in every chat endpoint.

12. Severity: Critical  
    Category: Security / Backend  
    File: `server/sockets/socket.js:8-16,24-35`  
    Problem: Socket events trust client-supplied `userId` and allow joining any `conversationId` room without JWT authentication or membership authorization.  
    Root Cause: Socket layer is not integrated with auth middleware/domain checks.  
    Impact: A malicious client can impersonate users, observe online state, join arbitrary rooms, and receive messages emitted to those rooms.  
    Recommended Fix: Authenticate sockets with JWT during handshake and authorize room joins against `Conversation.participants`.

13. Severity: Critical  
    Category: Security / Backend  
    File: `server/controllers/auth.controller.js:20-24`, `server/models/User.js:9`  
    Problem: Registration accepts `role` from the request body and the schema includes `admin`.  
    Root Cause: Self-service registration is allowed to choose privileged roles without an allowlist.  
    Impact: A user can potentially self-register as `admin` if the client or a raw API request sends `role: "admin"`.  
    Recommended Fix: Allow only tenant/owner from public registration; create admins through a protected administrative path.

### High

14. Severity: High  
    Category: Backend / Authorization  
    File: `server/routes/booking.routes.js:22`, `server/controllers/booking.controller.js:53-61`  
    Problem: `GET /bookings/owner` only requires authentication, not owner role.  
    Root Cause: Role authorization middleware is unused.  
    Impact: Tenants can call owner endpoints and receive empty/ambiguous data; authorization model is inconsistent.  
    Recommended Fix: Require `authorize('owner', 'admin')` or enforce role in controller.

15. Severity: High  
    Category: Backend / Authorization  
    File: `server/routes/inquiry.routes.js:23`, `server/controllers/inquiry.controller.js:77-93`  
    Problem: `GET /inquiries/owner` is not role-restricted.  
    Root Cause: Same missing role middleware.  
    Impact: Weakens owner/tenant separation and complicates frontend authorization assumptions.  
    Recommended Fix: Enforce owner/admin role on owner inquiry routes.

16. Severity: High  
    Category: Backend / Authorization  
    File: `server/controllers/property.controller.js:240-248`  
    Problem: Any authenticated user can create a property; no owner role check.  
    Root Cause: Route uses `protect` only.  
    Impact: Tenants can create listings through raw API requests.  
    Recommended Fix: Require owner/admin role before property creation.

17. Severity: High  
    Category: Database / Booking  
    File: `server/models/Booking.js:85-90`, `server/services/booking.service.js:31-47`  
    Problem: Duplicate booking index is not unique and service-level slot check is non-atomic.  
    Root Cause: Race-prone read-before-write pattern.  
    Impact: Concurrent requests can double-book the same slot.  
    Recommended Fix: Use a unique partial index for active statuses or transactional/atomic reservation logic.

18. Severity: High  
    Category: Backend / Booking  
    File: `server/services/booking.service.js:104-200`  
    Problem: Status transitions are not validated; approved/rejected/cancelled/completed can be overwritten without state rules.  
    Root Cause: No booking state machine.  
    Impact: Completed visits can be cancelled, rejected bookings can be completed, and audit timestamps become inconsistent.  
    Recommended Fix: Enforce allowed transitions and persist transition history.

19. Severity: High  
    Category: Backend / Notification  
    File: `server/services/booking.service.js:47-70`, `server/controllers/booking.controller.js:8-19`  
    Problem: Booking creation/status changes do not create notifications, while inquiry/review do.  
    Root Cause: Notification flow is not integrated into booking service.  
    Impact: Owners/tenants are not notified about booking requests or decisions.  
    Recommended Fix: Emit notifications for booking create/approve/reject/cancel/complete.

20. Severity: High  
    Category: Backend / Inquiry  
    File: `server/controllers/inquiry.controller.js:16-22`, `server/models\Property.js:236-239`  
    Problem: Inquiry creation does not increment `Property.inquiryCount`.  
    Root Cause: Denormalized counter not maintained.  
    Impact: Owner dashboard stats undercount inquiries.  
    Recommended Fix: Increment the counter atomically when an inquiry is created, or compute from `Inquiry` documents.

21. Severity: High  
    Category: API / Frontend  
    File: `client/src/pages/dashboard/OwnerBookingsPage.jsx:86,126,182`, `server/models/Booking.js:50-59`, `server/services/booking.service.js:94-95`  
    Problem: Frontend expects `booking.user` and lowercase statuses (`pending`, `approved`); backend populates `tenant` and uses title-case statuses (`Pending`, `Approved`).  
    Root Cause: Domain naming/status casing mismatch.  
    Impact: Tenant name is blank and approve/complete buttons never render.  
    Recommended Fix: Align field names and status enum casing across backend and UI.

22. Severity: High  
    Category: API / Database  
    File: `server/services/booking.service.js:60,80`  
    Problem: Booking property population selects `price`, but property schema uses `rent`.  
    Root Cause: Stale field name.  
    Impact: Booking UIs cannot display pricing if they depend on populated price.  
    Recommended Fix: Populate `rent` instead of `price`.

23. Severity: High  
    Category: Database / API  
    File: `server/controllers/ai.controller.js:104,112`, `server/models/Property.js:25-42`  
    Problem: Recommendations filter by legacy `type`, while ETL data uses required `propertyType`.  
    Root Cause: Incomplete schema migration.  
    Impact: Recommendations can return zero or irrelevant documents.  
    Recommended Fix: Use `propertyType` consistently or map legacy values.

24. Severity: High  
    Category: Backend / Review  
    File: `server/controllers/review.controller.js:27-44`  
    Problem: Reviews can be created for a missing property; notification then dereferences `property.owner`.  
    Root Cause: No property existence check before creating review.  
    Impact: Orphan reviews may be inserted and request may fail after partial write.  
    Recommended Fix: Load and validate property before `Review.create`; use transactions for review + aggregate update + notification.

25. Severity: High  
    Category: Backend / Review / Performance  
    File: `server/controllers/review.controller.js:33-39`  
    Problem: Average rating recalculates by loading all reviews after each new review.  
    Root Cause: O(n) aggregate update in request path.  
    Impact: Slow writes for popular properties and race-prone aggregate values.  
    Recommended Fix: Use `$avg` aggregation or incremental aggregate updates with transaction safety.

26. Severity: High  
    Category: Backend / Maintenance / Authorization  
    File: `server/controllers/maintenance.controller.js:4-14`  
    Problem: Any tenant can file maintenance against any property, even without a booking/lease relationship.  
    Root Cause: No tenant-property relationship validation.  
    Impact: Owners can receive arbitrary complaints from unrelated users.  
    Recommended Fix: Validate approved/completed booking or tenancy before allowing maintenance creation.

27. Severity: High  
    Category: Security / Backend  
    File: `server/controllers/auth.controller.js:58-73`  
    Problem: Forgot-password endpoint reveals whether an email exists.  
    Root Cause: Returns 404 for unknown email.  
    Impact: Enables account enumeration.  
    Recommended Fix: Always return a generic success message and rate-limit auth-specific endpoints.

28. Severity: High  
    Category: Security / Backend  
    File: `server/controllers/auth.controller.js:26-27,44-45,80-81,100-101,114-115`, `server/index.js:76-83`  
    Problem: Raw error messages are returned to clients.  
    Root Cause: No production error sanitizer.  
    Impact: Validation, database, and infrastructure details can leak.  
    Recommended Fix: Map expected errors to safe messages; log detailed errors server-side only.

29. Severity: High  
    Category: Security / Frontend  
    File: `client/src/store/authStore.js:5-15`, `client/src/services/api.js:8-20`  
    Problem: JWT is stored in `localStorage`.  
    Root Cause: Bearer-token SPA session design without XSS mitigation.  
    Impact: Any XSS compromises user sessions.  
    Recommended Fix: Prefer secure, httpOnly, sameSite cookies or harden CSP and token lifetime.

30. Severity: High  
    Category: Security / Backend  
    File: `server/index.js:48-53`, `server/routes/auth.routes.js:7-12`  
    Problem: Rate limit is global and not stricter for auth/password-reset endpoints.  
    Root Cause: Single broad `/api` limiter.  
    Impact: Login/bruteforce and password reset abuse are insufficiently constrained.  
    Recommended Fix: Add auth-specific low-threshold limiter, account lock/backoff, and reset throttling.

### Medium

31. Severity: Medium  
    Category: Backend / API  
    File: `server/controllers/property.controller.js:158-161`  
    Problem: `page` and `limit` are not clamped or validated.  
    Root Cause: Raw `Number()` conversion.  
    Impact: Negative skip, `NaN`, excessive limits, or invalid pagination can degrade API behavior.  
    Recommended Fix: Clamp page >= 1 and limit to a sane maximum.

32. Severity: Medium  
    Category: Backend / API  
    File: `server/controllers/property.controller.js:40-49,120-126`, `server/controllers/ai.controller.js:8-10`  
    Problem: User input is injected into regular expressions.  
    Root Cause: No regex escaping or text-index use.  
    Impact: ReDoS/performance issues and unexpected matching.  
    Recommended Fix: Escape regex input or use `$text`/Atlas Search with limits.

33. Severity: Medium  
    Category: Backend / API  
    File: `server/controllers/property.controller.js:76`  
    Problem: Default destructured `isAvailable = true` is boolean, then compared to string `"true"`, producing `false` when the query omits `isAvailable`.  
    Root Cause: Boolean/string mismatch in query parsing.  
    Impact: Default property search may return unavailable listings or no available listings depending stored values; intended default is unclear.  
    Recommended Fix: Parse explicitly: only set filter when query param exists, or default to `{ isAvailable: true }`.

34. Severity: Medium  
    Category: Frontend / Search  
    File: `client/src/pages/SearchPage.jsx:16`, `client/src/store/propertyStore.js:20`, `server/controllers/property.controller.js:56-57`  
    Problem: URL and filters use `type`, but backend primary filter uses `propertyType`.  
    Root Cause: Taxonomy drift.  
    Impact: Category links search legacy `type` and miss ETL records with only `propertyType`.  
    Recommended Fix: Use `propertyType` in URL/store/UI or provide backend mapping.

35. Severity: Medium  
    Category: Frontend / Search  
    File: `client/src/pages/SearchPage.jsx:24-26`, `client/src/components/property/SearchFilters.jsx:45,54,108,115`  
    Problem: Every keystroke updates store filters and triggers `fetchProperties`. The Search button also calls fetch manually.  
    Root Cause: Filter state and committed-search state are coupled.  
    Impact: Excessive API calls and flickery loading during typing.  
    Recommended Fix: Debounce or stage form inputs and fetch only on submit/filter commit.

36. Severity: Medium  
    Category: Frontend / Search  
    File: `client/src/pages/SearchPage.jsx:57,66,79`  
    Problem: UI reads `pagination.pages`, but backend/store currently do not populate it; `disabled={filters.page >= pagination?.pages||1}` also has confusing operator precedence.  
    Root Cause: Contract mismatch plus fragile expression.  
    Impact: Pagination controls do not render or behave correctly.  
    Recommended Fix: Use `pagination.totalPages` or normalized `pages`; parenthesize comparisons.

37. Severity: Medium  
    Category: Backend / Property  
    File: `server/controllers/property.controller.js:263`  
    Problem: `updateProperty` parses `rules` from `data.amenities` instead of `data.rules`.  
    Root Cause: Copy-paste bug.  
    Impact: Updating rules corrupts them with amenities or throws JSON parse errors.  
    Recommended Fix: Parse `JSON.parse(data.rules)`.

38. Severity: Medium  
    Category: Frontend / Performance  
    File: `client/src/pages/owner/AddPropertyPage.jsx:292-295`  
    Problem: `URL.createObjectURL(img)` is called during render without revocation.  
    Root Cause: Preview URLs are not memoized/cleaned up.  
    Impact: Memory leaks during repeated image selection/removal.  
    Recommended Fix: Create preview URLs once and revoke them in cleanup.

39. Severity: Medium  
    Category: Backend / Upload  
    File: `server/routes/upload.routes.js:7-25`  
    Problem: Upload route assumes `req.files`/`req.file` exists and has no local error handling for Multer/Cloudinary failures.  
    Root Cause: Direct inline handler after upload middleware.  
    Impact: Empty uploads or storage failures can produce 500s or confusing responses.  
    Recommended Fix: Validate files and use upload-specific error middleware.

40. Severity: Medium  
    Category: Database / Performance  
    File: `server/models/Chat.js:3-29`, `server/controllers/chat.controller.js:28-61`  
    Problem: Chat collections lack indexes for `participants`, `conversation + createdAt`, and unread message scans.  
    Root Cause: Schemas do not define query-path indexes.  
    Impact: Conversation/message queries slow down as chat volume grows.  
    Recommended Fix: Add compound indexes matching conversation list and message pagination queries.

41. Severity: Medium  
    Category: Database / Performance  
    File: `server/models/Maintenance.js:3-30`, `server/controllers/maintenance.controller.js:23-33`  
    Problem: Maintenance queries by `owner`/`tenant` sorted by `createdAt`, but schema has no indexes.  
    Root Cause: Missing indexes for read paths.  
    Impact: Maintenance list queries degrade with volume.  
    Recommended Fix: Add `{ owner: 1, createdAt: -1 }` and `{ tenant: 1, createdAt: -1 }`.

42. Severity: Medium  
    Category: Database / Performance  
    File: `server/models/Inquiry.js:55-59`, `server/controllers/inquiry.controller.js:48-88`  
    Problem: Inquiry compound index `{ property, owner, user }` does not serve `owner`-only or `user`-only sorted queries well.  
    Root Cause: Index order does not match list access patterns.  
    Impact: Owner/my inquiry pages scan more documents than necessary.  
    Recommended Fix: Add `{ owner: 1, createdAt: -1 }` and `{ user: 1, createdAt: -1 }`.

43. Severity: Medium  
    Category: API / Backend  
    File: `server/controllers/booking.controller.js:20-24,86-90,111-115,136-140,160-164`  
    Problem: All service errors in booking actions become HTTP 400, including unauthorized and not found.  
    Root Cause: Service throws plain `Error` without status metadata.  
    Impact: Clients cannot distinguish validation, auth, and missing resource cases.  
    Recommended Fix: Use typed errors/status codes or controller-specific mapping.

44. Severity: Medium  
    Category: Frontend / Auth  
    File: `client/src/services/api.js:16-21`  
    Problem: Any 401 globally redirects to `/login`, including expected optional-auth or background calls.  
    Root Cause: Global interceptor performs navigation side effects.  
    Impact: Users can be unexpectedly kicked to login from background failures.  
    Recommended Fix: Centralize auth expiry handling with route-aware behavior.

45. Severity: Medium  
    Category: Backend / Auth  
    File: `server/controllers/auth.controller.js:105-112`  
    Problem: Password update does not validate `newPassword` presence/length before assigning.  
    Root Cause: Reliance on Mongoose validation only and no request validation.  
    Impact: Weak or invalid password updates return inconsistent errors.  
    Recommended Fix: Validate request body before loading/updating user.

46. Severity: Medium  
    Category: Backend / Config  
    File: `server/index.js:93`, `server/controllers/auth.controller.js:6-7,68`, `server/config/cloudinary.js:3-7`, `server/utils/email.js:4-18`  
    Problem: Required environment variables are not validated at startup.  
    Root Cause: No config module/schema.  
    Impact: Server can boot into broken or insecure states, then fail at runtime.  
    Recommended Fix: Add startup env validation for `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, Cloudinary, email settings.

47. Severity: Medium  
    Category: Frontend / Routing  
    File: `client/src/pages/HomePage.jsx:8,40-41`, `client/src/store/propertyStore.js:45-48`  
    Problem: Home page uses static `client/src/data/properties.js` instead of backend featured listings.  
    Root Cause: Dummy data was not removed after API implementation.  
    Impact: Home page displays stale/fake data and ignores backend availability.  
    Recommended Fix: Use `fetchFeatured` and remove static data when no longer needed.

48. Severity: Medium  
    Category: Backend / Property  
    File: `server/controllers/property.controller.js:287-300`  
    Problem: `toggleSaveProperty` does not verify the property exists and uses non-atomic array mutation.  
    Root Cause: Direct user document mutation without `$addToSet`/`$pull` and no property lookup.  
    Impact: Users can save nonexistent ObjectIds; concurrent toggles may produce inconsistent state.  
    Recommended Fix: Validate property and use atomic update operators.

49. Severity: Medium  
    Category: Backend / AI  
    File: `server/controllers/ai.controller.js:6-11,34-35`  
    Problem: Locality advisor accepts missing `city`, ignores `propertyType`, and returns random safety/connectivity scores.  
    Root Cause: Placeholder implementation exposed as production endpoint.  
    Impact: API can error on invalid regex input and returns non-deterministic advice.  
    Recommended Fix: Validate inputs and mark placeholder metrics as unavailable or source them from data.

50. Severity: Medium  
    Category: Frontend / Socket  
    File: `client/src/hooks/useSocket.js:8-12`  
    Problem: Socket connects to `VITE_API_URL`, which in Axios includes `/api` by convention. Socket.IO server listens at the origin path, not under `/api`.  
    Root Cause: API base URL reused as socket origin.  
    Impact: In production, sockets can connect to the wrong URL/path.  
    Recommended Fix: Add a separate `VITE_SOCKET_URL` or strip `/api`.

### Low

51. Severity: Low  
    Category: Backend / Code Quality  
    File: `server/services/storage/index.js:4-7`  
    Problem: IBM storage branch returns the same Cloudinary upload and includes a placeholder comment.  
    Root Cause: Incomplete abstraction.  
    Impact: `STORAGE_PROVIDER=ibm` silently does not use IBM.  
    Recommended Fix: Remove the option or implement IBM storage.

52. Severity: Low  
    Category: Backend / Code Quality  
    File: `server/index.js:72`, `server/routes/notification.routes.js:1-36`  
    Problem: Mixed quote/style/formatting and route mount for notifications is easy to miss among adjacent comments.  
    Root Cause: Inconsistent formatting.  
    Impact: Low direct runtime risk, higher maintenance friction.  
    Recommended Fix: Run formatter/linter across server code.

53. Severity: Low  
    Category: Frontend / Accessibility  
    File: `client/src/components/notifications/NotificationBell.jsx:36-44`, `client/src/components/property/SearchFilters.jsx:64-75`, `client/src/pages/owner/AddPropertyPage.jsx:292-296`  
    Problem: Several icon/action buttons lack accessible labels or have empty image alt text for meaningful previews.  
    Root Cause: Visual-only control implementation.  
    Impact: Screen reader and keyboard users get a degraded experience.  
    Recommended Fix: Add `aria-label`, semantic button text, and meaningful alt text where content matters.

54. Severity: Low  
    Category: Frontend / Performance  
    File: `client` build output  
    Problem: Production build emits a single 599.19 kB minified JS chunk, above Vite's 500 kB warning threshold.  
    Root Cause: No route-level code splitting or manual chunks.  
    Impact: Slower first load, especially mobile.  
    Recommended Fix: Lazy-load route pages and split heavy dependencies.

55. Severity: Low  
    Category: Backend / Code Quality  
    File: `server/config/db.js:3-11`, `server/index.js:93-101`  
    Problem: Database connection logic is duplicated/stale.  
    Root Cause: `connectDB` helper is unused.  
    Impact: Confusing maintenance and inconsistent options.  
    Recommended Fix: Use one connection path.

56. Severity: Low  
    Category: Backend / Code Quality  
    File: `server/utils/email.js:18`  
    Problem: Plain text is interpolated into HTML email without escaping.  
    Root Cause: Convenience HTML fallback.  
    Impact: Low today because reset text is server-built, but unsafe if reused with user content.  
    Recommended Fix: Escape HTML or use templates.

57. Severity: Low  
    Category: Frontend / Code Quality  
    File: `client/src/pages/auth/RegisterPage.jsx:49,74`, `client/src/components/layout/Navbar.jsx:9-12`  
    Problem: Register page logo letter uses `N` while the app brand uses `R`.  
    Root Cause: Copy/paste branding drift.  
    Impact: Polished-product inconsistency.  
    Recommended Fix: Centralize a `Logo` component.

58. Severity: Low  
    Category: Repository / Code Quality  
    File: `README.zip`, `client.zip`, `server.zip`, `package.zip`, `package-lock.zip`  
    Problem: Archive files are present in the repo root.  
    Root Cause: Generated/backup artifacts committed or left in workspace.  
    Impact: Repository bloat and confusing source of truth.  
    Recommended Fix: Remove archives from source control and add ignore rules if appropriate.

## API Contract Matrix

| Frontend call | Backend route | Result |
|---|---|---|
| `POST /auth/login` | `POST /auth/login` | OK |
| `POST /auth/register` | `POST /auth/register` | Security risk: accepts public `role` including `admin` |
| `GET /auth/me` | `GET /auth/me` | OK |
| `POST /auth/forgot-password` | `POST /auth/forgot-password` | OK, but leaks email existence |
| `PUT /auth/reset-password/:token` | `PUT /auth/reset-password/:token` | OK |
| `PUT /auth/update-password` | `PUT /auth/update-password` | OK, weak validation |
| `GET /properties` | `GET /properties` | Critical response mismatch: no `pagination` object |
| `GET /properties/featured` | `GET /properties/featured` | OK, but home page does not use it |
| `GET /properties/:id` | `GET /properties/:id` | OK |
| `GET /properties/my` | None | Critical 404 |
| `GET /properties/:id/nearby` | None; backend has `/properties/nearby?lat&lng` | Critical 404 |
| `GET /properties/:id/similar` | `GET /properties/:id/similar` | OK |
| `POST /properties` | `POST /properties` | Critical body mismatch: client sends `type`, schema requires `propertyType` |
| `PUT /properties/:id` | `PUT /properties/:id` | OK method, but `rules` parse bug |
| `DELETE /properties/:id` | `DELETE /properties/:id` | OK |
| `POST /properties/:id/save` | `POST /properties/:id/save` | OK, but no property existence/atomic update |
| `POST /upload/images` | `POST /upload/images` | OK, weak empty/error handling |
| `GET /bookings/my` | `GET /bookings/my` | OK, populated field uses `price` instead of `rent` |
| `GET /bookings/owner` | `GET /bookings/owner` | OK route, weak role auth; UI expects `user` not `tenant` |
| `POST /bookings` | `POST /bookings` | OK, no notification and race risk |
| `PATCH /bookings/:id/approve` | Backend `PUT` only | Critical mismatch |
| `PATCH /bookings/:id/reject` | Backend `PUT` only; backend expects `reason`, client sends `cancellationReason` | Critical mismatch |
| `PATCH /bookings/:id/cancel` | Backend `PUT` only | Critical mismatch |
| `PATCH /bookings/:id/complete` | Backend `PUT` only | Critical mismatch |
| `POST /inquiries` | `POST /inquiries` | Backend OK, frontend store method typo breaks call |
| `GET /inquiries/my` | `GET /inquiries/my` | OK |
| `GET /inquiries/owner` | `GET /inquiries/owner` | OK route, weak role auth |
| `PATCH /inquiries/:id/reply` | None | Critical 404 |
| `DELETE /inquiries/:id` | None | Critical 404 |
| `GET /notifications` | `GET /notifications` | Critical response mismatch: backend returns `notifications`, frontend reads `data` |
| `GET /notifications/unread-count` | `GET /notifications/unread-count` | OK |
| `PATCH /notifications/:id/read` | Backend `PUT` only | Critical mismatch |
| `PATCH /notifications/read-all` | Backend `PUT` only | Critical mismatch |
| `DELETE /notifications/:id` | `DELETE /notifications/:id` | OK |
| `DELETE /notifications` | `DELETE /notifications` | OK |
| `GET /chat/conversations` | `GET /chat/conversations` | OK |
| `POST /chat/conversations` | `POST /chat/conversations` | OK, no recipient/property validation |
| `GET /chat/conversations/:id/messages` | Same | Critical auth gap |
| `POST /chat/conversations/:id/messages` | Same | Participant check bug |
| `GET /maintenance` | `GET /maintenance` | OK |
| `POST /maintenance` | `POST /maintenance` | OK, missing tenancy validation |
| `PUT /maintenance/:id/status` | Same | OK |
| `POST /ai/locality-advisor` | Same | OK route, weak validation/random scores |
| `POST /ai/expense-predictor` | Same | OK |

## Database Audit Summary

- Property indexes cover common city/type/rent filters and geospatial search, but default query construction and field-name drift reduce their usefulness.
- Chat and maintenance collections are missing indexes for their primary access paths.
- Inquiry indexes do not match owner/user list queries.
- Booking slot protection is indexed but not unique, so it does not actually prevent duplicate active bookings.
- Review aggregate updates are race-prone and O(n).
- Denormalized counters (`inquiryCount`, implied booking/save counts in UI) are not consistently maintained.
- Nearby geospatial data may be invalid if ETL/owner-created records do not sync `address.coordinates` into GeoJSON `location.coordinates`.

## Authentication and Authorization Audit Summary

- JWT signing/verification exists, but `JWT_SECRET` is not startup-validated.
- Cookies are not used despite CORS and Axios enabling credentials.
- Protected backend routes use bearer tokens only.
- Owner permissions are enforced for property update/delete/calendar/images and booking status changes by owner id, but not for creating properties or listing owner resources by role.
- Tenant permissions are weak for maintenance creation and booking cancellation state transitions.
- Admin role exists but public registration can request roles and no admin-specific route protection is used.
- Socket authentication is missing entirely.

## Production Readiness

- Environment validation is missing.
- Error responses expose raw exception messages.
- Auth-specific rate limiting is missing.
- Upload handling is Cloudinary-only despite a configurable `STORAGE_PROVIDER`.
- No request schema validation/sanitization.
- No centralized logger beyond `morgan`/`console.log`.
- No tests, CI evidence, or API contract checks.
- Frontend bundle needs route splitting.
- Committed archives/generated outputs should be cleaned from source control.

## Verification Notes

- `client`: `npm run build` succeeded.
- Build warning: `assets/index-*.js` is 599.19 kB minified, above Vite's warning threshold.
- `server`: `node --check index.js` could not be run in this shell because `node` was not found directly, even though `npm run build` succeeded in the client through npm.

## Issue Counts

- Total issues found: 58
- Critical: 13
- High: 17
- Medium: 20
- Low: 8

## Scores

- Architecture: 5/10
- Backend: 5/10
- Frontend: 5/10
- Security: 3/10
- Scalability: 4/10
- Production Readiness: 3/10
- Maintainability: 4/10

## Prioritized Roadmap

### Phase 1: Critical

1. Fix API method/URL/response mismatches for properties, bookings, inquiries, notifications, and nearby properties.
2. Fix owner property creation by aligning `type`/`propertyType` taxonomy.
3. Protect owner dashboard subroutes on the client and enforce role checks on backend owner routes.
4. Secure chat REST and Socket.IO with membership checks and JWT-authenticated sockets.
5. Prevent public admin self-registration.

### Phase 2: High

1. Add role authorization middleware to owner-only backend endpoints.
2. Add atomic booking slot protection and booking state-transition validation.
3. Integrate booking notifications.
4. Validate property existence before reviews and use transactions for review aggregate updates.
5. Add maintenance tenancy validation.
6. Harden auth flows: generic forgot-password response, auth-specific rate limits, safer session storage.

### Phase 3: Medium

1. Add request validation/sanitization and explicit pagination clamps.
2. Escape regex input or use proper text search.
3. Add missing indexes for chat, maintenance, inquiries, and booking active-slot constraints.
4. Normalize API response shapes.
5. Fix frontend search debouncing and pagination expressions.
6. Add startup env validation and production-safe error mapping.

### Phase 4: Nice to Have

1. Remove stale/dummy code and committed archive files.
2. Centralize API route constants or generate a typed API client.
3. Add route-level code splitting.
4. Improve accessibility labels and image preview cleanup.
5. Standardize formatting/linting and add CI checks.
