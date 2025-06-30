import React, { useEffect, useState } from 'react';
import api from "@/services/api";
import AuthForm from "@/components/AuthForm";

import TeacherCourses from './teacherCourses';

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

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDummyAddForm, setShowDummyAddForm] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);

  // Dummy user creation states
  const [dummyRole, setDummyRole] = useState<"teacher" | "student">("student");
  const [dummyStartIndex, setDummyStartIndex] = useState(1);
  const [dummyEndIndex, setDummyEndIndex] = useState(1);
  const [dummySession, setDummySession] = useState("");
  const [dummyDepartmentId, setDummyDepartmentId] = useState<string>("");
  const [dummyDepartmentAcronym, setDummyDepartmentAcronym] = useState("");

  
  const [tableWidth, setTableWidth] = useState(1);
  useEffect(() => {
    const handleResize = () => {
      setTableWidth (window.innerWidth - 300);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Log initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAddDummyUsers = async () => {
    setLoading(true);
    setError(null);
    setSuccess("");

    if (dummyRole === "student" && !dummySession.trim()) {
      setError("Session is required for dummy students.");
      setLoading(false);
      return;
    }

    for (let i = dummyStartIndex; i <= dummyEndIndex; i++) {
      const name = `${dummyDepartmentAcronym.toUpperCase()} ${dummyRole} ${i}`;
      const email = `${dummyDepartmentAcronym.toLowerCase()}${dummyRole}${i}@example.com`;
      const password = "pass123";

      try {
        await api.post(
          "/signup",
          {
            name,
            email,
            password,
            confirmPassword: password,
            role: dummyRole,
            department: dummyDepartmentId,
            session: dummyRole === "student" ? dummySession : undefined,
          },
          { withCredentials: true }
        );
        setSuccess(`Added ${dummyRole} ${name}`);
      } catch (err) {
        const error = err as { response?: { data?: { error?: string } } };
        setError(error.response?.data?.error || `Failed to add dummy ${dummyRole} ${name}`);
        setLoading(false);
        return; // Stop on first error
      }
    }
    setSuccess(`Successfully added ${dummyEndIndex - dummyStartIndex + 1} dummy ${dummyRole}s.`);
    const res = await api.get<User[]>("/dashboard/super-admin/users", { withCredentials: true });
    setUsers(res.data);
    setLoading(false);
  };

  // Add filter states
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Validation helpers (copy from register page)
  function isNonEmpty(str: string) {
    return !!str && str.trim().length > 0;
  }
  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  function isStrongPassword(password: string) {
    return password.length >= 6 && /[A-Za-z]/.test(password) && /\d/.test(password);
  }

  async function handleRegister(data: { name: string; email: string; password: string; confirmPassword: string; role: string; department: string; session?: string }) {
    setError("");
    // Custom validation for super_admin: department not required, session required for student
    if (
      !isNonEmpty(data.name) ||
      !isNonEmpty(data.email) ||
      !isNonEmpty(data.password) ||
      !isNonEmpty(data.confirmPassword) ||
      !isNonEmpty(data.role) ||
      (data.role !== "super_admin" && !isNonEmpty(data.department)) ||
      (data.role === "student" && !isNonEmpty(data.session ?? ''))
    ) {
      setError("All fields are required.");
      return;
    }
    if (!isValidEmail(data.email)) {
      setError("Invalid email address.");
      return;
    }
    if (!isStrongPassword(data.password)) {
      setError("Password must be at least 6 characters and contain letters and numbers.");
      return;
    }
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/signup", data, { withCredentials: true });
      setSuccess("User registered successfully!");
      setShowAddForm(false);
      fetchUsers().then(setUsers).catch(err => setError(err.message));
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to register user");
    } finally {
      setLoading(false);
    }
  }

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
    <div>
      <h2 className="text-2xl font-bold mb-4">User List</h2>
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <button
        className="btn btn-outline btn-sm mb-4 cursor-pointer custom-bordered-btn"
        onClick={() => setShowAddForm((v) => !v)}
      >
        [+add user]
      </button>
      <button
        className="btn btn-outline btn-sm mb-4 ml-4 cursor-pointer custom-bordered-btn"
        onClick={() => setShowDummyAddForm((v) => !v)}
      >
        {showDummyAddForm ? "[-hide dummy user form]" : "[+add dummy users]"}
      </button>
      {showAddForm && (
        <AuthForm type="register" onSubmit={handleRegister} loading={loading} error={error || ""} departments={departments} />
      )}

      {showDummyAddForm && (
        <div className="mt-6 p-4 border rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Add Multiple Dummy Users</h3>
        <div className="flex flex-col gap-2 mb-4">
          <label className="block">
            Role:
            <select
              value={dummyRole}
              onChange={e => setDummyRole(e.target.value as "teacher" | "student")}
              className="input input-bordered w-full mt-1 form-bg-dark text-white"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </label>
          <label className="block">
            Department:
            <select
              value={dummyDepartmentAcronym}
              onChange={e => {
                const selectedAcronym = e.target.value;
                setDummyDepartmentAcronym(selectedAcronym);
                const selectedDept = departments.find(dept => dept.acronym === selectedAcronym);
                if (selectedDept) {
                  setDummyDepartmentId(selectedDept.id);
                }
              }}
              className="input input-bordered w-full mt-1 form-bg-dark text-white"
              required
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.acronym}>
                  {dept.name} ({dept.acronym})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            Start Index:
            <input
              type="number"
              value={dummyStartIndex}
              onChange={e => setDummyStartIndex(Number(e.target.value))}
              className="input input-bordered w-full mt-1"
            />
          </label>
          <label className="block">
            End Index:
            <input
              type="number"
              value={dummyEndIndex}
              onChange={e => setDummyEndIndex(Number(e.target.value))}
              className="input input-bordered w-full mt-1"
            />
          </label>
          {dummyRole === "student" && (
            <label className="block">
              Session (e.g., 2019-2020):
              <input
                type="text"
                value={dummySession}
                onChange={e => setDummySession(e.target.value)}
                className="input input-bordered w-full mt-1"
                placeholder="2019-2020"
              />
            </label>
          )}
        </div>
        <button
          className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn"
          onClick={handleAddDummyUsers}
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Dummy Users"}
        </button>
      </div>)}
      
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
        <div className="overflow-x-auto min-w-[1550px]">
          <div className="overflow-y-auto max-h-[calc(15*3rem)] relative">
            <table className="border" style={{ width: tableWidth }}>
              <thead className="sticky top-0 bg-gray-700 z-10">
                <tr>
                  {roleFilter === "super_admin" && (
                    <>
                      <th className="py-2 px-4 border-b">Name</th>
                      <th className="py-2 px-4 border-b">Email</th>
                    </>
                  )}
                  {roleFilter === "department_admin" && (
                    <>
                      <th className="py-2 px-4 border-b">Name</th>
                      <th className="py-2 px-4 border-b">Email</th>
                      <th className="py-2 px-4 border-b">Department</th>
                      <th className="py-2 px-4 border-b">Actions</th>
                    </>
                  )}
                  {roleFilter === "teacher" && (
                    <>
                      <th className="py-2 px-4 border-b">Name</th>
                      <th className="py-2 px-4 border-b">Email</th>
                      <th className="py-2 px-4 border-b">Department</th>
                      <th className="py-2 px-4 border-b">Actions</th>
                      <th className="py-2 px-4 border-b">Courses</th>
                    </>
                  )}
                  {roleFilter === "student" && (
                    <>
                      <th className="py-2 px-4 border-b">Name</th>
                      <th className="py-2 px-4 border-b">Email</th>
                      <th className="py-2 px-4 border-b">Department</th>
                      <th className="py-2 px-4 border-b">Session</th>
                      <th className="py-2 px-4 border-b">Actions</th>
                      <th className="py-2 px-4 border-b">View</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {displayedUsers.map((user) => (
                  <tr key={user.id} className="border-b">
                    {roleFilter === "super_admin" && (
                      <>
                        <td className="py-2 px-4">{user.name}</td>
                        <td className="py-2 px-4">{user.email}</td>
                      </>
                    )}
                    {roleFilter === "department_admin" && (
                      <>
                        <td className="py-2 px-4">{user.name}</td>
                        <td className="py-2 px-4">{user.email}</td>
                        <td className="py-2 px-4">{user.department?.acronym || ''}</td>
                        <td className="py-2 px-4">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="btn btn-outline btn-sm mt-2 cursor-pointer custom-bordered-btn"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                    {roleFilter === "teacher" && (
                      <>
                        <td className="py-2 px-4">{user.name}</td>
                        <td className="py-2 px-4">{user.email}</td>
                        <td className="py-2 px-4">{user.department?.acronym || ''}</td>
                        <td className="py-2 px-4">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="btn btn-outline btn-sm mt-2 cursor-pointer custom-bordered-btn"
                          >
                            Delete
                          </button>
                        </td>
                        <td className="py-2 px-4">
                          <button
                            onClick={() => setSelectedTeacherId(user.id)}
                            className="btn btn-outline btn-sm mt-2 cursor-pointer custom-bordered-btn"
                          >
                            Courses
                          </button>
                        </td>
                      </>
                    )}
                    {roleFilter === "student" && (
                      <>
                        <td className="py-2 px-4">{user.name}</td>
                        <td className="py-2 px-4">{user.email}</td>
                        <td className="py-2 px-4">{user.department?.acronym || ''}</td>
                        <td className="py-2 px-4">{user.session}</td>
                        <td className="py-2 px-4">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="btn btn-outline btn-sm mt-2 cursor-pointer custom-bordered-btn"
                          >
                            Delete
                          </button>
                        </td>
                        <td className="py-2 px-4">
                          <button
                            className="btn btn-outline btn-sm mt-2 cursor-pointer custom-bordered-btn"
                          >
                            View
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
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