import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/cart(.*)",
  "/orders(.*)",
  "/profile(.*)",
  "/admin(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    // ⭐ Clerk handles everything internally (cookies, timing, edge)
    auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|webp|svg|ico|woff2?|ttf)).*)",
  ],
};
