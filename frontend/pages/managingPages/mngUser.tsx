import React, { useEffect, useState } from 'react';
import api from "@/services/api";
import AuthForm from "@/components/AuthForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaTrash, FaInfoCircle, FaEllipsisV, FaUserTie } from 'react-icons/fa';
import TeacherCourses from '@/components/teacherCourses';

interface Department {
  id: string;
  name: string;
  acronym?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: Department;
  session?: string;
}

interface mngUserProps {
  sidebarOpen?: boolean
}

export default function mngUser({ sidebarOpen = true }: mngUserProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDummyAddForm, setShowDummyAddForm] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [openOptionsUserId, setOpenOptionsUserId] = useState<number | null>(null);
  
  // Add filter states
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<User[]>("/dashboard/super-admin/users", { withCredentials: true });
      return response.data;
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      throw new Error(error.response?.data?.error || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get<Department[]>("/departments", { withCredentials: true });
      setDepartments(response.data);
    } catch {
      setDepartments([]);
    }
  };

  const handleDeleteUser = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/dashboard/super-admin/user/${id}`, { withCredentials: true });
      setSuccess("User deleted successfully!");
      const res = await api.get<User[]>("/users", { withCredentials: true });
      setUsers(res.data);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const handleMakeHeadAdmin = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.post(
        `/grant-access`,
        { userId: id, access: ["accessManager"] },
        { withCredentials: true }
      );
      setSuccess("User successfully made Head Admin!");
      const res = await api.get<User[]>("/dashboard/super-admin/users", { withCredentials: true });
      setUsers(res.data);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to make user Head Admin");
    } finally {
      setLoading(false);
    }
  };

  // Filtered users
  const filteredUsers = users.filter(user => {
    if (!roleFilter) return false; // Don't show any users if no role is selected
    const roleMatch = roleFilter === "all" || user.role === roleFilter;
    // If department info is available on user, filter by department
    // Adjust this logic if user object has department info (e.g., user.department)
    const departmentMatch = departmentFilter === "all" || 
    (user.department && user.department.acronym === departmentFilter);
    return roleMatch && departmentMatch;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedUsers = filteredUsers.slice(startIndex, endIndex);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    fetchDepartments();
  }, []);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  if (selectedTeacherId) {
    return (
      <div>
        <button onClick={() => setSelectedTeacherId(null)} className="btn btn-outline btn-sm mt-1 cursor-pointer custom-bordered-btn">{"<-- "}Back to Users</button>
        <TeacherCourses teacherId={selectedTeacherId} />
      </div>
    )
  }

  return (
    <div className={`min-h-screen p-6 page-bg-light transition-all duration-300 w-full`}>
      <h2 className="text-2xl font-bold mb-4">User List</h2>
      {success && <div className="text-green-600 mb-2">{success}</div>}
      
      {/* Filter controls */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="mr-2">Role:</label>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="border px-2 py-1 rounded bg-gray-500"
          >
            <option value="">Select Role</option>
            <option value="super_admin">Super Admin</option>
            <option value="department_admin">Department Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
        </div>
        <div>
          <label className="mr-2">Department:</label>
          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="border px-2 py-1 rounded bg-gray-500"
          >
            <option value="all">All</option>
            {departments.map(dep => (
              <option key={dep.id} value={dep.acronym}>
                {dep.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {roleFilter ? (
        <div className="overflow-x-auto w-full">
          <div className="overflow-y-auto max-h-[calc(15*3rem)] relative">
            <div className="grid lg:grid-cols-4 gap-4">
              {displayedUsers.map((user) => {
                const optionOpen = openOptionsUserId === user.id;
                return (
                  <Card key={user.id} onClick={() => setOpenOptionsUserId(optionOpen ? null : user.id)} className="hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <CardHeader>
                      <CardTitle>{user.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                      {user.department && (<div className="flex items-center text-sm text-gray-500">
                        <FaInfoCircle className="mr-1" /> {user.department?.acronym || ''}
                      </div>)}
                      <div className="flex items-center space-x-2">
                        {optionOpen && (
                          <div className="flex flex-col space-y-1 items-start">
                            <button
                              onClick={() => handleMakeHeadAdmin(user.id)}
                              className="flex items-center text-blue-500 hover:bg-blue-500 hover:text-white px-3 py-1 rounded transition-colors duration-200 cursor-pointer"
                            >
                              <FaUserTie className="mr-1" /> Make Head
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="flex items-center text-red-500 hover:bg-red-500 hover:text-white px-3 py-1 rounded transition-colors duration-200 cursor-pointer"
                            >
                              <FaTrash className="mr-1" /> Delete
                            </button>
                          </div>
                        )}
                        <button className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200 cursor-pointer" aria-label="Options">
                          <FaEllipsisV />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-lg text-gray-400">Please select a role to view users.</p>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="mt-4 space-x-2">
          <button
            className="btn btn-outline btn-sm mb-4 cursor-pointer custom-bordered-btn"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              className={`btn btn-outline btn-sm mb-4 cursor-pointer custom-bordered-btn ${currentPage === index + 1 ? 'btn-active' : ''}`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            className="btn btn-outline btn-sm mb-4 cursor-pointer custom-bordered-btn"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
  );
}