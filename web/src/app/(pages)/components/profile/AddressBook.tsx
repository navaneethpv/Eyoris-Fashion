
"use client";
import { useState, useEffect } from "react";
import { Plus, MapPin, Edit2, Trash2, CheckCircle2, Phone, Home, Briefcase } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import AddressForm from "./AddressForm";
import Modal from "../Modal";

interface AddressBookProps {
  clerkUser?: any;
  onSelect?: (address: any) => void;
  selectedId?: string;
}

export default function AddressBook({ clerkUser, onSelect, selectedId }: AddressBookProps) {
  const { getToken } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  // Delete Confirmation State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const baseUrl = base.replace(/\/$/, "");

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch(`${baseUrl}/api/user/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error("Failed to fetch addresses", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const confirmDelete = (id: string) => {
    setAddressToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!addressToDelete) return;

    try {
      const token = await getToken();
      const res = await fetch(`${baseUrl}/api/user/addresses/${addressToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAddresses(prev => prev.filter(a => a._id !== addressToDelete));
        setShowDeleteModal(false);
        setAddressToDelete(null);
      }
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const handleSetDefault = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection
    try {
      const token = await getToken();
      const res = await fetch(`${baseUrl}/api/user/addresses/${id}/default`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchAddresses();
      }
    } catch (error) {
      console.error("Failed to set default", error);
    }
  }

  const openAdd = () => {
    setEditingAddress(null);
    setIsFormOpen(true);
  };

  const openEdit = (addr: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddress(addr);
    setIsFormOpen(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'work': return <Briefcase className="w-3 h-3" />;
      case 'home': return <Home className="w-3 h-3" />;
      default: return <MapPin className="w-3 h-3" />;
    }
  };

  if (loading && addresses.length === 0) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 sm:pb-0">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-gray-900">Saved Addresses</h3>
        {/* Desktop Add Button */}
        <button
          onClick={openAdd}
          className="hidden sm:flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg shadow-gray-200"
        >
          <Plus className="w-4 h-4" /> Add New Address
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {addresses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <MapPin className="w-8 h-8 text-gray-300" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">No addresses saved yet</h4>
              <p className="text-gray-500 font-medium text-sm mb-6">Add an address to checkout faster</p>
              <button
                onClick={openAdd}
                className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
              >
                Add Address
              </button>
            </motion.div>
          ) : (
            addresses.map((addr) => {
              const isSelected = selectedId === addr._id || (!selectedId && addr.isDefault);

              return (
                <motion.div
                  key={addr._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => onSelect && onSelect(addr)}
                  className={`relative p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer group select-none ${isSelected
                      ? "bg-green-50/50 border-green-500 shadow-sm"
                      : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-md"
                    }`}
                >
                  {/* Selection Checkmark */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 text-green-600 bg-white rounded-full p-0.5 shadow-sm ring-1 ring-green-100">
                      <CheckCircle2 className="w-5 h-5 fill-green-50" />
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    {/* Header: Type & Badges */}
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {getTypeIcon(addr.type)} {addr.type}
                      </span>
                      {addr.isDefault && (
                        <span className="px-2 py-1 bg-black/5 text-black text-[10px] font-bold rounded-lg uppercase tracking-wider">
                          Default
                        </span>
                      )}
                    </div>

                    {/* Address Content */}
                    <div className="pr-8">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-base font-bold text-gray-900">{addr.name || "User Name"}</span>
                        <span className="text-sm font-semibold text-gray-500">{addr.phone}</span>
                      </div>

                      <p className="text-sm text-gray-600 leading-relaxed font-medium">
                        {addr.street}, {addr.city}
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium">
                        {addr.district}, {addr.state} - <span className="text-gray-900 font-bold">{addr.zip}</span>
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center gap-3 mt-1 pt-3 border-t border-gray-100/50">
                      {!addr.isDefault && (
                        <button
                          onClick={(e) => handleSetDefault(addr._id, e)}
                          className="text-xs font-bold text-gray-400 hover:text-black transition-colors"
                        >
                          Set as Default
                        </button>
                      )}
                      <div className="flex-1" />
                      <button
                        onClick={(e) => openEdit(addr, e)}
                        className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors active:scale-90"
                        title="Edit Address"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); confirmDelete(addr._id); }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors active:scale-90"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Sticky Add Button */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-200 sm:hidden z-40">
        <button
          onClick={openAdd}
          className="w-full flex items-center justify-center gap-2 bg-black text-white py-3.5 rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" /> Add New Address
        </button>
      </div>

      <AddressForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchAddresses}
        initialData={editingAddress}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Address?"
      >
        <div className="space-y-6">
          <p className="text-gray-600 text-sm leading-relaxed">
            Are you sure you want to delete this address? This action cannot be undone.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="py-3 px-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="py-3 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
