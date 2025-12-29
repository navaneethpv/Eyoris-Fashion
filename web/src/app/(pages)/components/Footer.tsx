import Link from "next/link";
import { Heart, ShoppingBag, User, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0b0b0b] text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-14">

        {/* ================= MAIN GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* BRAND */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition">
                <span className="text-white font-extrabold text-xl">E</span>
              </div>
              <span className="text-2xl font-semibold tracking-wide text-white">
                Eyoris <span className="font-light text-gray-300">Fashion</span>
              </span>
            </Link>

            <p className="mt-6 max-w-md text-sm leading-relaxed text-gray-400">
              Discover your perfect style with <span className="text-white">AI-powered fashion</span> recommendations.
              From everyday elegance to statement looks, style comes together effortlessly.
            </p>

            <div className="mt-6 flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="hover:text-white transition">
                contact@eyorisfashion.com
              </span>
            </div>
          </div>

          {/* SHOP */}
          <div>
            <h4 className="text-white font-semibold tracking-widest uppercase text-sm mb-5">
              Shop
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                ["Men's Fashion", "/product?gender=men"],
                ["Women's Fashion", "/product?gender=women"],
                ["Kids' Fashion", "/product?gender=kids"],
                ["All Products", "/product"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="relative inline-block hover:text-white transition after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ACCOUNT */}
          <div>
            <h4 className="text-white font-semibold tracking-widest uppercase text-sm mb-5">
              Account
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 hover:text-white transition group"
                >
                  <User className="w-4 h-4 group-hover:scale-110 transition" />
                  My Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="flex items-center gap-3 hover:text-white transition group"
                >
                  <Heart className="w-4 h-4 group-hover:scale-110 transition" />
                  Wishlist
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="flex items-center gap-3 hover:text-white transition group"
                >
                  <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition" />
                  Shopping Bag
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ================= BOTTOM BAR ================= */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-sm">

          <p className="text-gray-500">
            © 2025 <span className="text-white">Eyoris Fashion</span>. All rights reserved.
          </p>

          <div className="flex gap-8">
            {["Privacy Policy", "Terms of Service", "Contact Us"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(/\s+/g, "")}`}
                className="relative hover:text-white transition after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
