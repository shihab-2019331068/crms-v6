import React, { useEffect, useState } from 'react';
import api from "@/services/api";
// import AuthForm from "@/components/AuthForm"; // Unused import removed
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Unused imports removed
// import { FaTrash, FaInfoCircle, FaEllipsisV, FaUserTie } from 'react-icons/fa'; // Unused imports removed
import TeacherCourses from '@/components/teacherCourses';
// import MultiSelectDropdown from '@/components/multiSelectDropdown'; // Unused import removed
import UserAccessCard from '@/components/userAccessCard';


const accessList = [
  "manageRoom",
  "manageLab",
  "manageAccess",
  "manageCourse",
  "manageSemester",
  "manageRoutine",
  "manageTeacher",
  "manageStudent",
]

interface Department {
  id: string;
  name: string;
  acronym?: string;
}

export interface User {
  id: number;
  name:string;
  email: string;
  role: string;
  department: Department;
  session?: string;
  access?: string[];
}

interface mngAccessProps {
  deptId: number
}

export default function mngAccess({ deptId }: mngAccessProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [openOptionsUserId, setOpenOptionsUserId] = useState<number | null>(null);
  const [openAccessListUserId, setOpenAccessListUserId] = useState<number | null>(null);
  const [selectedAccess, setSelectedAccess] = useState<string[]>([]);
  
  // Filter state
  const [roleFilter, setRoleFilter] = useState<string>("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<User[]>(`/department/${deptId}/users`, { withCredentials: true });
      console.log(response.data);
      return response.data;
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      throw new Error(error.response?.data?.error || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [deptId]); // Added deptId to dependency array for correctness

  // Filtered users based on the selected role
  const filteredUsers = users.filter(user => {
    if (!roleFilter) return false; // Don't show any users if no role is selected
    return user.role === roleFilter;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedUsers = filteredUsers.slice(startIndex, endIndex);

  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    setCurrentPage(1); // Reset to the first page when filter changes
  }

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
      <h2 className="text-2xl font-bold mb-4">Manage User Access</h2>
      {success && <div className="text-green-600 mb-2">{success}</div>}
      
      {/* Role selection buttons */}
      <div className="flex justify-center items-center gap-4 mb-8">
        <button
            onClick={() => handleRoleFilterChange('department_admin')}
            className={`px-6 py-3 text-lg font-semibold cursor-pointer rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none ${
              roleFilter === 'department_admin' 
                ? 'bg-indigo-600 text-white ring-2 ring-offset-2 ring-indigo-500' 
                : 'bg-white text-gray-800 hover:bg-indigo-100'
            }`}
          >
            Department Admins
          </button>
          <button
            onClick={() => handleRoleFilterChange('teacher')}
            className={`px-6 py-3 text-lg font-semibold cursor-pointer rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none ${
              roleFilter === 'teacher' 
                ? 'bg-teal-600 text-white ring-2 ring-offset-2 ring-teal-500' 
                : 'bg-white text-gray-800 hover:bg-teal-100'
            }`}
          >
            Teachers
          </button>
          <button
            onClick={() => handleRoleFilterChange('student')}
            className={`px-6 py-3 text-lg font-semibold cursor-pointer rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none ${
              roleFilter === 'student' 
                ? 'bg-rose-600 text-white ring-2 ring-offset-2 ring-rose-500' 
                : 'bg-white text-gray-800 hover:bg-rose-100'
            }`}
          >
            Students
          </button>
      </div>

      {roleFilter ? (
        <>
          <div className="overflow-x-auto w-full">
            <div className="overflow-y-auto max-h-[calc(15*3rem)] relative">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedUsers.map((user) => (
                  <UserAccessCard
                    key={user.id}
                    user={user}
                    accessList={accessList}
                    accessListOpen={openAccessListUserId === user.id}
                    setOpenAccessListUserId={setOpenAccessListUserId}
                    selectedAccess={selectedAccess}
                    setSelectedAccess={setSelectedAccess}
                    optionOpen={openOptionsUserId === user.id}
                    setOpenOptionsUserId={setOpenOptionsUserId}
                    loading={loading}
                    error={error}
                    success={success}
                    setLoading={setLoading}
                    setError={setError}
                    setSuccess={setSuccess}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
             <div className="mt-4 flex justify-center items-center space-x-2">
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
          )}
        </>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">Please select a role above to view users.</p>
          </div>
        )}
      </div>
  );
}