import { SignUp } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <SignUp />
      </div>
    </div>
  );
}