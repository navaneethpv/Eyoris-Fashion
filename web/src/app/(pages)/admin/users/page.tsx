"use client"
import { useEffect, useState } from 'react';


import { useAuth } from '@clerk/nextjs';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const { getToken } = useAuth();
  const base =
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000";
  const baseUrl = base.replace(/\/$/, "");

  const fetchUsers = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${baseUrl}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to fetch users:", res.statusText);
        return;
      }

      const data = await res.json();
      setUsers(data.users || []);
      setCurrentUserRole(data.currentUserRole);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleRoleChange = async (userId: string, action: 'promote' | 'demote') => {
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const token = await getToken();
      const res = await fetch(`${baseUrl}/api/admin/users/${userId}/${action}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("User role updated successfully!");
        fetchUsers();
      } else {
        const err = await res.json();
        alert(`Failed: ${err.message}`);
      }
    } catch (error) {
      console.error("Role update error:", error);
    }
  };

  useEffect(() => {
    fetchUsers(); // Initial fetch
    const interval = setInterval(fetchUsers, 10000); // 10,000 ms = 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Registered Users</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              {currentUserRole === 'super_admin' && <th className="px-6 py-4">Actions</th>}
              <th className="px-6 py-4">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-bold text-gray-900">
                  <div className="flex items-center gap-2">
                    <span>{user.name}</span>

                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'Administrator'
                    ? 'bg-purple-50 text-purple-600'
                    : 'bg-blue-50 text-blue-600'
                    }`}>
                    {user.role}
                  </span>
                </td>
                {currentUserRole === 'super_admin' && (
                  <td className="px-6 py-4">
                    {user.rawRole !== 'super_admin' && (
                      <div className="flex gap-2">
                        {user.rawRole === 'customer' && (
                          <button
                            onClick={() => handleRoleChange(user.id, 'promote')}
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                          >
                            Make Admin
                          </button>
                        )}
                        {user.rawRole === 'admin' && (
                          <button
                            onClick={() => handleRoleChange(user.id, 'demote')}
                            className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                          >
                            Remove Admin
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                )}
                <td className="px-6 py-4 text-gray-500">{user.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}