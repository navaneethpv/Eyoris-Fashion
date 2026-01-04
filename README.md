# 🛍️ Eyoris Fashion - AI Powered E-Commerce Platform

Eyoris Fashion is a modern, high-end e-commerce application leveraging Artificial Intelligence to enhance the shopping experience. Built with a robust **Next.js 16** frontend and an **Express/MongoDB** backend, it features AI-driven tagging, luxury aesthetics, and seamless authentication.

## 📂 Project Structure

This project is a monorepo-style structure containing:

- **[web](./web)**: 🎨 The frontend application (Next.js, React, Tailwind CSS).
- **[api](./api)**: ⚙️ The backend server (Express, MongoDB, AI Services).

## 🚀 Quick Start

### 🛠️ Prerequisites
- Node.js (v18+)
- pnpm (recommended) or npm
- MongoDB instance (local or Atlas)

### 1. ⚙️ Setup Backend (API)
Navigate to the `api` directory:
```bash
cd api
pnpm install
```
Configure your environment variables (see [api/README.md](./api/README.md)) and start the server:
```bash
pnpm dev
```

### 2. 🎨 Setup Frontend (Web)
Navigate to the `web` directory:
```bash
cd web
pnpm install
```
Configure your environment variables (see [web/README.md](./web/README.md)) and start the development server:
```bash
pnpm dev
```

## ✨ Features
- **🔮 AI-Powered Visual Search**: Find products using images.
- **🏷️ Smart Tagging**: Automated product categorization and tagging using Google Gemini.
- **💎 Luxury UI/UX**: Cinematic animations, 3D backgrounds, and premium typography.
- **🔒 Secure Auth**: Powered by Clerk.
- **📊 Admin Dashboard**: Comprehensive management for products, users, and orders.
