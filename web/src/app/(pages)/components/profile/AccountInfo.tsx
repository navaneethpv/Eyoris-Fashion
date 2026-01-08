"use client";
import { useState, useRef } from "react";
import {
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Edit2,
  Check,
  X,
  Camera,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface AccountInfoProps {
  clerkUser: any; // Using any since @clerk/types is not installed
}

export default function AccountInfo({ clerkUser }: AccountInfoProps) {
  const primaryEmail = clerkUser.emailAddresses.find(
    (e: any) => e.id === clerkUser.primaryEmailAddressId
  );

  // Name editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [firstName, setFirstName] = useState(clerkUser.firstName || "");
  const [lastName, setLastName] = useState(clerkUser.lastName || "");
  const [isSavingName, setIsSavingName] = useState(false);

  // Photo upload state
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle name update
  const handleSaveName = async () => {
    if (!firstName.trim()) {
      alert("First name cannot be empty");
      return;
    }

    setIsSavingName(true);
    try {
      await clerkUser.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setIsEditingName(false);
    } catch (error) {
      console.error("Name update failed:", error);
      alert("Failed to update name. Please try again.");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCancelEdit = () => {
    setFirstName(clerkUser.firstName || "");
    setLastName(clerkUser.lastName || "");
    setIsEditingName(false);
  };

  // Handle photo upload
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      await clerkUser.setProfileImage({ file });
      // Optionally show success message
    } catch (error) {
      console.error("Photo upload failed:", error);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* 🛑 HEADER CARD 🛑 */}
      <div className="relative overflow-hidden bg-white rounded-3xl p-8 shadow-[0_2px_40px_rgba(0,0,0,0.03)] border border-gray-100">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          {/* Profile Photo */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-purple-200 to-pink-200 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-500" />
            <img
              src={clerkUser.imageUrl}
              alt="Avatar"
              className="relative w-24 h-24 rounded-full object-cover border-[6px] border-white shadow-xl shadow-purple-100/50"
            />
            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="absolute bottom-1 right-1 bg-black text-white rounded-full p-2.5 hover:bg-gray-800 hover:scale-110 shadow-lg transition-all duration-300 disabled:opacity-50"
              title="Change profile photo"
            >
              {isUploadingPhoto ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          {/* Name & Edit Section */}
          <div className="flex-1 w-full relative z-10">
            <AnimatePresence mode="wait">
              {isEditingName ? (
                <motion.div
                  key="edit-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-gray-50/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-100"
                >
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 justify-center md:justify-start">
                    <Edit2 className="w-3 h-3" />
                    Edit Personal Details
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                        disabled={isSavingName}
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                        disabled={isSavingName}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSavingName}
                      className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveName}
                      disabled={isSavingName}
                      className="flex items-center justify-center gap-2 px-8 py-2.5 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-900 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/10"
                    >
                      {isSavingName ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="display-name"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center md:items-start"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 tracking-tight">
                      {clerkUser.fullName || "Eyoris Customer"}
                    </h2>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-2 bg-gray-50 text-gray-400 hover:text-black hover:bg-black/5 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                      title="Edit name"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-purple-100/50">
                      Standard Member
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      ID: {clerkUser.id.slice(-8)}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 🛑 DETAIL SECTION 🛑 */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h3 className="text-lg font-serif font-medium text-gray-900">
            Contact Information
          </h3>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Private & Secure
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email Card */}
          <motion.div
            whileHover={{ y: -4, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}
            className="group flex p-6 bg-white border border-gray-100 rounded-2xl transition-all duration-300"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full mr-5 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Primary Email</p>
              <p className="font-medium text-gray-900 font-serif text-lg">
                {primaryEmail?.emailAddress || "N/A"}
              </p>
            </div>
          </motion.div>

          {/* Phone Card */}
          <motion.div
            whileHover={{ y: -4, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}
            className="group flex p-6 bg-white border border-gray-100 rounded-2xl transition-all duration-300"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-full mr-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
              <p className="font-medium text-gray-900 font-serif text-lg">
                {clerkUser.phoneNumbers[0]?.phoneNumber || "Not Set"}
              </p>
            </div>
          </motion.div>

          {/* Join Date Card */}
          <motion.div
            whileHover={{ y: -4, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}
            className="group flex p-6 bg-white border border-gray-100 rounded-2xl transition-all duration-300"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-orange-50 text-orange-600 rounded-full mr-5 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Member Since</p>
              <p className="font-medium text-gray-900 font-serif text-lg">
                {clerkUser.createdAt
                  ? new Date(clerkUser.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                  : "N/A"}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 🛑 SECURITY CARD 🛑 */}
      <div className="pt-8">
        <Link
          href="https://dashboard.clerk.com"
          target="_blank"
          className="group relative overflow-hidden flex items-center justify-between p-8 bg-black rounded-3xl transition-all duration-500 hover:shadow-2xl hover:shadow-purple-900/20"
        >
          {/* Animated Sheen */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

          <div className="flex items-center gap-6 relative z-10">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white">
              <ShieldCheck className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-serif text-xl text-white font-medium mb-1">
                Account Security
              </h4>
              <p className="text-sm text-gray-400 font-medium">
                Manage your password and active sessions
              </p>
            </div>
          </div>

          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black group-hover:scale-110 transition-transform duration-300">
            <ChevronRight className="w-5 h-5" />
          </div>
        </Link>
      </div>
    </div>
  );
}
