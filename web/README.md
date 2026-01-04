# 🎨 Eyoris Fashion - Frontend

The frontend is a high-performance **Next.js 16** application designed with a "luxury fashion" aesthetic using **Tailwind CSS v4** and **Framer Motion**.

## 🛠️ Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (Turbopack) ⚡
- **Language**: TypeScript 📘
- **Styling**: Tailwind CSS v4 💅, Framer Motion 🎬
- **3D/Visuals**: Three.js 🧊, React Three Fiber, Postprocessing
- **Auth**: Clerk 🔒
- **Icons**: Lucide React 🖌️

## 🚀 Getting Started

### 1. 📦 Install Dependencies
```bash
pnpm install
```

### 2. 🔑 Configure Environment Variables
Create a file named `.env.local` in the `web` directory.
Add the following keys (replace values with your actual credentials):

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. ▶️ Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. 🏗️ Build for Production
```bash
pnpm build
pnpm start
```

## 🧩 Key Components
- **`src/app`**: App Router pages.
- **`src/components/GridScan.tsx`**: Custom 3D background component.
- **`src/lib`**: Utilities and API clients.
