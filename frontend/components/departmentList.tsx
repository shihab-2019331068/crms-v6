import React, { useEffect, useState } from 'react';
import api from "@/services/api";
import DepartmentManage from "./departmentManage";


export interface Department {
  id: number;
  name: string;
  acronym: string;
}


export default function DepartmentList() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAcronym, setNewAcronym] = useState("");
  const [manageDeptId, setManageDeptId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteDeptId, setDeleteDeptId] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Department[]>('/departments', { withCredentials: true });
      return response.data;
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      throw new Error(error.response?.data?.error || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = (id: number) => {
    setDeleteDeptId(id);
    setShowDeleteConfirm(true);
  }

  const confirmDelete = async () => {
    if (!deleteDeptId) return;
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/dashboard/super-admin/department/${deleteDeptId}`,
        {
          withCredentials: true,
          data: { email, password }
        });
      setSuccess("Department deleted successfully!");
      setShowDeleteConfirm(false);
      setDeleteDeptId(null);
      setEmail("");
      setPassword("");
      // Refetch departments after deletion
      const res = await api.get<Department[]>("/departments", { withCredentials: true });
      setDepartments(res.data);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to delete department");
    } finally {
      setLoading(false);
    }
  }

  const handleAddDepartment = async (name: string, acronym: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/dashboard/super-admin/department', { name, acronym }, { withCredentials: true });
      setSuccess("Department added successfully!");
      // Refetch departments after adding
      const res = await api.get<Department[]>("/departments", { withCredentials: true });
      setDepartments(res.data);
      setNewName("");
      setNewAcronym("");
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to add department");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments()
      .then(setDepartments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);


  const [tableWidth, setTableWidth] = useState(1);
  useEffect(() => {
    const handleResize = () => {
      setTableWidth (window.innerWidth - 300);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Log initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError("Department name is required");
      return;
    }
    handleAddDepartment(newName, newAcronym);
  };

  if (loading) return <div>Loading departments...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  if (manageDeptId) {
    return (
      <div>
        <button onClick={() => setManageDeptId(null)} className="btn btn-outline btn-sm mt-1 cursor-pointer custom-bordered-btn">{"<-- "}Back to Departments</button>
        <DepartmentManage departmentId={manageDeptId} />
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Department List</h2>
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {/* Add Department Button */}
      {!showAddForm && (
        <button
          className="btn btn-outline btn-sm mb-4 cursor-pointer custom-bordered-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add Department
        </button>
      )}

      {/* Add Department Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
          <input
            type="text"
            placeholder="Department Name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="input input-bordered w-full"
            required
          />
          <input
            type="text"
            placeholder="Acronym"
            value={newAcronym}
            onChange={e => setNewAcronym(e.target.value)}
            className="input input-bordered w-full"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="btn btn-outline btn-sm mt-2 cursor-pointer custom-bordered-btn"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Department"}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm mt-2 cursor-pointer custom-bordered-btn"
              onClick={() => {
                setShowAddForm(false);
                setNewName("");
                setNewAcronym("");
                setError(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <table className="border" style={{ width: tableWidth }}>
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Acronym</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((dept) => (
            <tr key={dept.id} className="border-b">
              <td className="py-2 px-4">{dept.name}</td>
              <td className="py-2 px-4">{dept.acronym}</td>
              <td className="py-2 px-4">
                <button
                  onClick={() => handleDeleteDepartment(dept.id)}
                  className="text-white px-1 rounded btn-sm cursor-pointer custom-bordered-btn"
                >
                  Delete
                </button>
                <button
                  onClick={() => setManageDeptId(dept.id)}
                  className="text-white px-1 rounded btn-sm cursor-pointer custom-bordered-btn"
                >
                  Manage
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-dark p-4 rounded-lg">
            <h3 className="text-lg font-bold">Confirm Deletion</h3>
            <p>Please enter your email and password to confirm deletion.</p>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full mt-2"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full mt-2"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-outline btn-sm mt-1 cursor-pointer custom-bordered-btn">Cancel</button>
              <button onClick={confirmDelete} className="btn btn-outline btn-sm mt-1 cursor-pointer custom-bordered-btn btn-error">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
