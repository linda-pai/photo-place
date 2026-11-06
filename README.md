# Photo Pacer — Frontend

![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=flat-square)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-06B6D4?style=flat-square&logo=tailwindcss)
![Ant Design](https://img.shields.io/badge/Ant%20Design-5.12-1890FF?style=flat-square&logo=antdesign)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)

**Photo Pacer** ([www.photopacer.com](https://www.photopacer.com)) is a photo platform for marathons and other sports events. Photographers upload event photos, the system detects race bib numbers automatically, and runners find their photos by bib number or photographer, then download them for free or buy them online.

This repo is the **Next.js frontend**. The API, database and bib detection live in a separate Express backend (`photopacer-backend`).

**Related docs**: [USER_FLOWS.md](./USER_FLOWS.md) · [UPLOAD_PIPELINE.md](./UPLOAD_PIPELINE.md)

---

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Scripts](#scripts)
7. [Project Structure](#project-structure)
8. [Core Mechanisms](#core-mechanisms)
9. [Development Guide](#development-guide)
10. [Deployment](#deployment)
11. [Known Issues & TODO](#known-issues--todo)
12. [FAQ](#faq)

---

## Features

### Visitors / Runners

| Feature                | Description                                                                   |
| ---------------------- | ----------------------------------------------------------------------------- |
| **Event browsing**     | Event list on the home page, plus a calendar view (`/calendar`, FullCalendar) |
| **Albums**             | Event album at `/events/[id]` with a lightbox viewer (react-spring-lightbox)  |
| **Search**             | Filter photos by bib number or photographer; "unidentified" and "more" tabs   |
| **Free download**      | Photos priced at 0 can be downloaded directly in full resolution             |
| **Cart & checkout**    | Paid photos go into a cart (stored in a cookie); pay via LINE Pay or Newebpay |
| **My orders**          | `/user/orders`: purchased photos, ZIP download, GIF generation                |
| **Report a photo**     | Report pornographic/violent, infringing, hateful or harassing photos          |
| **Notify me**          | Leave contact info to be notified when photos are uploaded (NotifyForm)       |
| **Sign-in**            | Google / LINE OAuth via NextAuth                                              |

### Photographers (`/uploadService`, `/photographer/*`)

| Feature              | Description                                                                         |
| -------------------- | ----------------------------------------------------------------------------------- |
| **Upload**           | Pick an event, then batch-upload; multipart upload straight to S3 with progress     |
| **Pricing**          | Set a price per upload. **Defaults to 0 (free download)**                           |
| **Watermark**        | Choose a watermark style when uploading                                             |
| **Upload records**   | `/photographer/records`: details, detection progress and earnings for each upload   |
| **Bib review**       | `/photographer/checkBibs`: review and fix detection results; `noneDetected` lists unidentified photos |
| **Featured/removed** | `/photographer/featured`, `/photographer/removed`                                   |
| **Sold list**        | `/photographer/soldList`                                                            |
| **Display name**     | Custom photographer name shown on the platform                                      |

> Uploads are allowed only for events dated between 8 days ago and 1 day ahead (`utils/isUploadable.ts`).

### Admins (`/cms/*`, `/createEvent`, `/uploadImagePage`)

| Page                    | Description                                          |
| ----------------------- | ---------------------------------------------------- |
| `/createEvent`          | Create an event                                      |
| `/cms/eventManagement`  | Edit events; mark an album as **private** (`isPrivate`) |
| `/cms/uploadManagement` | Upload records across all photographers              |
| `/cms/checkBibsAdmin`   | Bib review for admins                                |
| `/cms/orderList`        | Orders                                               |
| `/cms/userManagement`   | Users                                                |
| `/cms/notify`           | "Notify me" sign-ups                                 |

---

## Architecture

```
┌──────────────────────────────┐
│           Browser            │
└──────────────┬───────────────┘
               │ HTTPS
┌──────────────▼───────────────┐
│  Next.js frontend (this repo) │   Pages Router, port 3000
│  ├─ SSR pages (getServerSideProps)
│  ├─ NextAuth (Google / LINE)  │
│  └─ API routes: auth, payment confirm, imageZip
└───────┬───────────────┬──────┘
        │ REST (JSON)   │ multipart PUT (presigned URLs)
┌───────▼─────────┐  ┌──▼──────────────────────────┐
│ Express backend  │  │ AWS S3 (ap-northeast-1)      │
│ port 3001        │  │ photo-pacer-buckets          │
│ ├─ events/photos │  │ ├─ images/      (production) │
│ ├─ upload/detect │  │ └─ images-dev/  (development)│
│ ├─ orders/payment│  └──────────────────────────────┘
│ └─ MongoDB       │
└─────────────────┘
```

All business APIs are called at `${NEXT_PUBLIC_SERVER_URL}/api/...`. The frontend's own Next.js API routes are only:

| Route                     | Purpose                                                              |
| ------------------------- | -------------------------------------------------------------------- |
| `/api/auth/[...nextauth]` | NextAuth; calls backend `/api/user/createUser` on sign-in            |
| `/api/linepay/confirm`    | LINE Pay return URL; forwards confirmation to the backend            |
| `/api/newebpay/confirm`   | Newebpay return URL; forwards payload to the backend for decryption  |
| `/api/imageZip`           | Bundles purchased photos into a ZIP                                  |

---

## Tech Stack

| Area                | Technology                                                          |
| ------------------- | ------------------------------------------------------------------- |
| Framework           | Next.js 14.0 (Pages Router, `output: "standalone"`), React 18       |
| Language            | TypeScript 5                                                        |
| UI / styling        | Ant Design 5, Tailwind CSS 3, styled-components 6                   |
| Auth                | NextAuth 4 (Google and LINE providers, JWT session)                 |
| Calendar / timeline | FullCalendar 6, react-vertical-timeline-component                   |
| Images              | react-spring-lightbox, react-dropzone, sharp, JSZip                 |
| Misc                | cookies-next, js-sha256, next-sitemap, rc-tween-one                 |
| Deployment          | Docker (multi-stage, node:21.4-alpine), Docker Compose              |

---

## Getting Started

### Prerequisites

- Node.js 21.4+ (matches the Dockerfile)
- Yarn (the repo uses `yarn.lock`)
- A running Photo Pacer backend (default `http://localhost:3001`)

### Install and run

```bash
git clone https://github.com/linda-pai/photo-place.git
cd photo-place
yarn install

# Create local env vars (see next section); .env.development is a usable template
cp .env.development .env.local

yarn dev
# open http://localhost:3000
```

### Sanity check

- The home page lists events (the backend is reachable)
- Google / LINE sign-in works (OAuth and NextAuth are configured)

---

## Environment Variables

There is no `.env.example`; use the existing `.env.development` / `.env.production` as templates. Variables the code reads:

| Variable                           | Required | Description                                                         |
| ---------------------------------- | -------- | ------------------------------------------------------------------- |
| `NEXT_PUBLIC_SERVER_URL`           | ✅       | Backend base URL, e.g. `http://localhost:3001`                      |
| `NEXT_PUBLIC_APP_URL`              | ✅       | Frontend URL (payment return URLs, share links)                     |
| `NEXT_PUBLIC_APP_NAME`             | ✅       | Site name used in page titles / SEO                                 |
| `NEXTAUTH_URL`                     | ✅       | NextAuth URL; in production set it on the host or in compose        |
| `NEXT_PUBLIC_NEXTAUTH_SECRET`      | ✅       | NextAuth secret (random 32 bytes). **The code reads this name, not `NEXTAUTH_SECRET`** |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`     | ✅       | Google OAuth client ID                                              |
| `NEXT_PUBLIC_GOOGLE_CLIENT_SECRET` | ✅       | Google OAuth client secret                                          |
| `NEXT_PUBLIC_LINE_CHANNEL_ID`      | ✅       | LINE Login channel ID                                               |
| `NEXT_PUBLIC_LINE_CHANNEL_SECRET`  | ✅       | LINE Login channel secret                                           |
| `NEXT_PUBLIC_SALT`                 | ✅       | Salt for the `secret` header hash sent to the backend               |
| `NEXT_PUBLIC_ADMIN_ID`             | ✅       | Admin's OAuth user ID (also has photographer access)                |
| `NEXT_PUBLIC_PP_ID`                | ✅       | Second admin's OAuth user ID                                        |
| `NEXT_SHARP_PATH`                  |          | Path to sharp in production (already set in the Dockerfile)         |

> ⚠️ Anything prefixed `NEXT_PUBLIC_` is bundled into client-side JavaScript. The OAuth secrets, NextAuth secret and salt currently use this prefix — see [Known Issues](#known-issues--todo).

---

## Scripts

| Command           | Description                                                                         |
| ----------------- | ----------------------------------------------------------------------------------- |
| `yarn dev`        | Dev server on port 3000                                                             |
| `yarn build`      | Production build; `postbuild` runs `next-sitemap` to generate sitemap / robots.txt |
| `yarn build:dev`  | Runs `cp .env.stage .env.local`, then builds (you must provide `.env.stage`)        |
| `yarn start`      | Start the built app                                                                 |
| `yarn start:dev`  | Dev server with `NODE_ENV=development`                                              |
| `yarn start:prod` | `next start` with `NODE_ENV=production`                                             |
| `yarn lint`       | ESLint (`eslint-config-next`)                                                       |

---

## Project Structure

```
photo-place/
├── pages/                      # Routes (Pages Router)
│   ├── index.tsx               # Home: event list
│   ├── calendar.tsx            # Event calendar
│   ├── events/[id].tsx         # Event album, search, download / add to cart
│   ├── auth/signIn.tsx         # Sign-in page
│   ├── user/                   # shoppingCart, checkout, orders
│   ├── uploadService/          # Photographer upload flow (choose event → upload)
│   ├── photographer/           # Photographer dashboard (records, checkBibs, featured…)
│   ├── cms/                    # Admin dashboard
│   ├── createEvent.tsx         # Create event (admin)
│   ├── uploadImagePage.tsx     # Admin upload page
│   ├── policies/               # Privacy policy, terms of use
│   └── api/                    # NextAuth, payment confirm, imageZip
├── components/                 # UI components, grouped by feature (image, upload, checkout, orders, records, cms…)
├── lib/
│   ├── upload/                 # Multipart upload, S3 URLs, upload records, watermark + detection trigger
│   ├── payment/                # handlePayment, LINE Pay, Newebpay
│   ├── event/ order/ photographer/ editImages/
│   ├── roles/index.ts          # Admin / photographer user ID allowlists
│   └── gtag.js                 # Google Analytics
├── hooks/                      # useAuth, usePermission, useIsMobile, useWindowSize
├── context/RolesContext.tsx    # Roles context (currently unused)
├── constants/index.ts          # Payment codes, image status, charge types, report types…
├── types/interfaces/           # Event, Image, Cart, Upload, User, Notify types
├── utils/                      # parallelUploadWithLimit, downloadImage, generateGif…
├── static/eventData.json
├── styles/globals.css
├── public/                     # Static assets, sitemap, robots.txt
├── Dockerfile / Dockerfile.dev
├── docker-compose.yml / docker-compose-dev.yml
├── next.config.js              # Allowed S3 image hosts, standalone output
└── next-sitemap.config.js
```

---

## Core Mechanisms

### 1. Photo upload (multipart, direct to S3)

Full details in [UPLOAD_PIPELINE.md](./UPLOAD_PIPELINE.md). In short:

```
Choose an event (must be within the upload window) → pick photos, price, watermark
  → parallelUploadWithLimit uploads in batches of 500 (each batch finishes before the next starts)
    → for each photo:
       POST /api/upload/start-upload                    get uploadId / key
       for each 5 MB chunk: GET /api/upload/get-upload-url → PUT the chunk to S3
       POST /api/upload/complete-upload                 complete the multipart upload
       POST /api/images/updateWatermarkUrlAndDetectText backend applies watermark and detects bibs
  → photographer tracks progress at /photographer/records
```

- Files go from the browser straight to S3 and never pass through the frontend server.
- Code: `components/upload/UploadImages.tsx`, `lib/upload/*`, `utils/parallelUploadWithLimit.ts`.

### 2. Free downloads and paid purchases

- Photographers set a price when uploading; the default is **0**.
- Price 0: the album shows "Free Download"; clicking it calls `/api/images/getUrlById/:eventId/:id` and downloads the original.
- Price > 0: add to cart, then check out.

```
Cart (cookie: cart) → select items (cookie: checkoutData) → choose payment method
  → lib/payment/handlePayment → backend creates the order and returns the payment page
  → pay with LINE Pay / Newebpay
  → return to /api/linepay/confirm or /api/newebpay/confirm → backend confirms / decrypts
  → /user/orders shows purchased photos (ZIP download, GIF generation)
```

Payment method codes are in `constants/index.ts` (`LINEPAY: 2`, `NEWEBPAY: 3`).

### 3. Private albums

Admins mark an event as `isPrivate` in `/cms/eventManagement`. Private events are left out of the event selector options (`lib/event/formatOptions.ts`), and their album page hides the search bar.

### 4. Bib detection and photo categories

The backend detects bib numbers after upload. Album categories (`IMAGE_STATUS`):

| Value | Meaning      |
| ----- | ------------ |
| 1     | All          |
| 3     | Identified   |
| 4     | Unidentified |
| 5     | More         |

Photographers can fix detection results at `/photographer/checkBibs`, and mark photos as featured, removed or reported (`REMOVE_IMAGE_STATUS`).

### 5. Authentication and permissions

- **Sign-in**: NextAuth (Google / LINE) with a JWT session. `session.id` is the OAuth user ID; sign-in also calls backend `/api/user/createUser`.
- **Backend calls** send `Authorization: Bearer ${session.id}` and `secret: sha256(session.id + NEXT_PUBLIC_SALT)`.
- **Roles** are user ID allowlists in `lib/roles/index.ts`:
  - `ROLE_ADMIN`: `NEXT_PUBLIC_ADMIN_ID`, `NEXT_PUBLIC_PP_ID`
  - `ROLE_PHOTOGRAPHER`: the admin plus the listed photographer IDs (**edit this file to add a photographer**)
- **Page permissions** (`hooks/usePermission.ts`):

| Path               | Required role     |
| ------------------ | ----------------- |
| `/cms`             | ROLE_ADMIN        |
| `/createEvent`     | ROLE_ADMIN        |
| `/uploadImagePage` | ROLE_ADMIN        |
| `/uploadService`   | ROLE_PHOTOGRAPHER |
| `/photographer`    | ROLE_PHOTOGRAPHER |

---

## Development Guide

### Add a page

```tsx
// pages/myPage.tsx → served at /myPage
export default function MyPage() {
  return <div className="container mx-auto">{/* content */}</div>;
}
```

The site layout (Navbar, Footer) is applied to every page in `pages/_app.tsx` via `components/Layout.tsx`.

### Call the backend

```ts
import { sha256 } from "js-sha256";

const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/endpoint`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.id}`,
    secret: sha256(session.id + process.env.NEXT_PUBLIC_SALT),
  },
  body: JSON.stringify(data),
});
```

### Protect a page

Call `usePermission()` in the page and add its path to `permissionByPath`:

```ts
import usePermission from "@/hooks/usePermission";

const isAllowed = usePermission();
```

### Add a photographer

Add the photographer's OAuth user ID (a numeric string for Google, starting with `U` for LINE) to `ROLE_PHOTOGRAPHER` in `lib/roles/index.ts`.

### S3 image hosts

`next/image` only allows `/images/**` and `/images-dev/**` on `photo-pacer-buckets.s3.ap-northeast-1.amazonaws.com`. To add a source, update `images.remotePatterns` in `next.config.js`.

---

## Deployment

### Docker Compose (current setup)

`docker-compose.yml` starts both the frontend (`photopacer2023/photopacer-frontend`, port 3000) and the backend (`photopacer2023/photopacer-backend`, port 3001) on `photopacer-network`.

```bash
# production (Dockerfile, reads .env.production, NEXTAUTH_URL=https://www.photopacer.com)
docker compose up -d --build

# development / staging (Dockerfile.dev, runs yarn build:dev)
docker compose -f docker-compose-dev.yml up -d --build
```

The Dockerfile is a three-stage build (deps → builder → runner) using Next.js standalone output, starts with `node server.js`, and installs a Linux build of sharp separately.

### Build the frontend image only

```bash
docker build -f Dockerfile -t photopacer-frontend .
docker run -p 3000:3000 photopacer-frontend
```

### Deployment checklist

- `.env.production` exists and has every [required variable](#environment-variables)
- `NEXTAUTH_URL` matches the production domain
- Google / LINE OAuth redirect URIs include `https://<domain>/api/auth/callback/google` and `/api/auth/callback/line`
- `siteUrl` in `next-sitemap.config.js` is correct

---

## Known Issues & TODO

- **Page permission checks are disabled**: the check inside `usePermission()` is commented out and it always returns `true`. The frontend does not block unauthorized users from `/cms`, `/photographer` and similar pages; only the backend API enforces access.
- **Secrets exposed to the client**: `NEXT_PUBLIC_GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_LINE_CHANNEL_SECRET`, `NEXT_PUBLIC_NEXTAUTH_SECRET` and `NEXT_PUBLIC_SALT` are bundled into client code. Server-only values should drop the `NEXT_PUBLIC_` prefix.
- **Photographer list is hardcoded** in `lib/roles/index.ts`. `RolesContext` was meant to load roles from the backend but is not in use.
- `yarn build:dev` depends on `.env.stage`, which is not in the repo.
- `NEXT_PUBLIC_JWT_SECRET` and `NEXT_PUBLIC_LIFF_ID` in the `.env.*` files are not used by the code.
- Build output (`.next/`, `tsconfig.tsbuildinfo`) is tracked by git; consider adding it to `.gitignore`.

---

## FAQ

**Q: The home page is blank or shows no events?**
A: Check that the backend at `NEXT_PUBLIC_SERVER_URL` is running, and look for failed API calls in the browser's Network tab.

**Q: OAuth sign-in fails?**
A: Check the client ID / secret, `NEXTAUTH_URL` and `NEXT_PUBLIC_NEXTAUTH_SECRET`, and that the redirect URIs are configured in the OAuth console.

**Q: A photographer can't upload?**
A: Make sure their user ID is in `ROLE_PHOTOGRAPHER` and the event date is within the upload window (8 days ago to 1 day ahead).

**Q: Photo uploads fail?**
A: Check the backend `/api/upload/*` endpoints, that the S3 bucket CORS allows `PUT` and exposes the `ETag` header, and that the presigned URLs haven't expired.

**Q: Images don't render (next/image error)?**
A: The image host or path isn't listed in `remotePatterns` in `next.config.js`.

**Q: sharp errors in production?**
A: Use the project's Dockerfile, which installs a Linux build of sharp and sets `NEXT_SHARP_PATH`.

---

## License

Private project (`"private": true` in `package.json`); no license granted.
