import { clerkMiddleware } from "@clerk/nextjs/server";

// Define protected routes
// const isProtectedRoute = createRouteMatcher([
//   '/cart(.*)',
//   '/profile(.*)',
//   '/admin(.*)'
// ]);

// export default clerkMiddleware(async (auth, req) => {
//   if (isProtectedRoute(req)) {
//     await auth.protect();
//   }
// })

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};