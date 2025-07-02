import React, { useEffect, useState } from 'react';
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaTrash, FaChair, FaBuilding, FaInfoCircle } from 'react-icons/fa';

import {
  Department,
}  from "./mngDept";

export interface Lab {
  id: number;
  name: string;
  labNumber: string;
  capacity: number;
  status: string;
  departmentAcronym: string | null;
}

interface mngLabSAProps {
  sidebarOpen?: boolean
}

export default function mngLabSA({ sidebarOpen = true }: mngLabSAProps) {
  const { user } = useAuth();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [showAddLabForm, setShowAddLabForm] = useState(false);
  const [labName, setLabName] = useState("");
  const [labNumber, setLabNumber] = useState("");
  const [labCapacity, setLabCapacity] = useState("");
  const [labDeptId, setLabDeptId] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);

  
  const [tableWidth, setTableWidth] = useState(1);
  useEffect(() => {
    const handleResize = () => {
      setTableWidth (window.innerWidth - 300);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Log initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchLabs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Lab[]>("/labs", { withCredentials: true });
      return response.data;
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      throw new Error(error.response?.data?.error || 'Failed to fetch labs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLab = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/dashboard/super-admin/lab/${id}`, { withCredentials: true });
      setSuccess("Lab deleted successfully!");
      // Refetch labs after deletion
      const res = await api.get<Lab[]>("/labs", { withCredentials: true });
      setLabs(res.data);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to delete lab");
    } finally {
      setLoading(false);
    }
  }

  const handleAddLab = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess("");
    if (!labName.trim() || !labNumber.trim() || !labCapacity.trim() || !labDeptId.trim()) {
      setError("All fields are required");
      setLoading(false);
      return;
    }
    try {
      await api.post(
        "/dashboard/super-admin/lab",
        {
          name: labName,
          labNumber,
          capacity: Number(labCapacity),
          departmentId: Number(labDeptId),
        },
        { withCredentials: true }
      );
      setSuccess("Lab added successfully!");
      // Refetch labs after adding
      const res = await api.get<Lab[]>("/labs", { withCredentials: true });
      setLabs(res.data);
      setLabName("");
      setLabNumber("");
      setLabCapacity("");
      setLabDeptId("");
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to add lab");
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments for dropdown
  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Department[]>('/departments', { withCredentials: true });
      setDepartments(response.data);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      throw new Error(error.response?.data?.error || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs()
      .then(setLabs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    fetchDepartments();
  }, []);
  

  if (loading) return <div>Loading labs...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className={`min-h-screen p-6 page-bg-light transition-all duration-300 w-full`}>
      <h2 className="text-2xl font-bold mb-4">Lab List</h2>
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {user?.role === "super_admin" && (
        <div>
          <button
            className="btn btn-outline btn-sm mb-4 cursor-pointer custom-bordered-btn"
            onClick={() => setShowAddLabForm((v) => !v)}
          >
            [+add lab]
          </button>
        </div>
      )}
      {showAddLabForm && (<form onSubmit={handleAddLab} className="mb-6 max-w-2xl flex flex-col gap-2">
        <input
          type="text"
          placeholder="Lab Name"
          value={labName}
          onChange={e => setLabName(e.target.value)}
          className="input input-bordered w-full"
          required
        />
        <input
          type="text"
          placeholder="Lab Number"
          value={labNumber}
          onChange={e => setLabNumber(e.target.value)}
          className="input input-bordered w-full"
          required
        />
        <input
          type="number"
          placeholder="Capacity"
          value={labCapacity}
          onChange={e => setLabCapacity(e.target.value)}
          className="input input-bordered w-full"
          required
        />
        <select
          value={labDeptId}
          onChange={e => setLabDeptId(e.target.value)}
          className="input input-bordered w-full form-bg-dark text-white"
          required
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name} ({dept.acronym})
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="btn btn-outline btn-sm mt-2 cursor-pointer custom-bordered-btn"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Lab"}
        </button>
      </form>)}
      <div className="flex flex-col gap-4">
        {labs.map((lab) => (
          <Card key={lab.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle>{lab.labNumber}</CardTitle>
            </CardHeader>
            
            <CardContent className="flex justify-between items-center">
              <div className="flex items-center text-sm text-gray-500">
                <FaChair className="mr-1" /> {lab.capacity}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <FaInfoCircle className="mr-1" /> {lab.status}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <FaBuilding className="mr-1" /> {lab.departmentAcronym}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDeleteLab(lab.id)}
                  className="flex items-center text-red-500 hover:bg-red-500 hover:text-white px-3 py-1 rounded transition-colors duration-200 cursor-pointer"
                >
                  <FaTrash className="mr-1" /> Delete
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
