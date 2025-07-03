// --- START OF FILE mnglab.tsx ---

import React, { useEffect, useState } from 'react';
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaChair, FaBuilding, FaInfoCircle, FaEllipsisV } from 'react-icons/fa';
// Removed unused imports for Button and Input as they are replaced with standard HTML elements.

import {
  Department,
}  from "./mngDept";


export interface Lab {
  id: number;
  labName: string;
  labNumber: string;
  capacity: number;
  status: string;
  departmentId: number;
  departmentAcronym: string | null;
}

interface mngLabProps {
  // Make departmentId optional to handle initial render states gracefully
  departmentId?: number; 
}

export default function MngLab({ departmentId }: mngLabProps) { // Renamed to PascalCase for convention
  const { user } = useAuth();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [openOptionsLabId, setOpenOptionsLabId] = useState<number | null>(null);
  const [editingCapacity, setEditingCapacity] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);


  const handleUpdateCapacity = async (labId: number) => {
    setError(null);
    setSuccess("");
    if (!editingCapacity || isNaN(Number(editingCapacity)) || Number(editingCapacity) < 0) {
      setError("Please enter a valid, non-negative capacity.");
      return;
    }
    setIsUpdating(true);
    try {
      const response = await api.post(`/lab/${labId}/capacity`, { capacity: Number(editingCapacity) });
      const updatedLab = response.data;

      setLabs(prevLabs => prevLabs.map(lab => lab.id === labId ? { ...lab, capacity: updatedLab.capacity } : lab));
      setSuccess("Lab capacity updated successfully!");
      setOpenOptionsLabId(null);
    } catch (err) {
      const updateError = err as { response?: { data?: { error?: string } } };
      setError(updateError.response?.data?.error || 'Failed to update capacity.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async (labId: number, newStatus: 'AVAILABLE' | 'BOOKED') => {
    setError(null);
    setSuccess("");
    setIsUpdating(true);
    try {
      const response = await api.post(`/lab/${labId}/status`, { status: newStatus });
      const updatedlab = response.data;
      
      setLabs(prevLabs => prevLabs.map(lab => lab.id === labId ? { ...lab, status: updatedlab.status } : lab));
      setSuccess(`lab status set to ${newStatus}.`);
    } catch (err) {
      const updateError = err as { response?: { data?: { error?: string } } };
      setError(updateError.response?.data?.error || 'Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
  };


  useEffect(() => {
    const fetchAndFilterlabs = async () => {
      if (!departmentId) {
        setLabs([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await api.get<Lab[]>("/labs", { params: { departmentId: departmentId }, withCredentials: true });
        const alllabs = response.data;
        
        // The filter logic remains the same, but it's now guaranteed to have a valid ID.
        const filteredData = alllabs.filter(lab => lab.departmentId === departmentId);
        setLabs(filteredData);

      } catch (err) {
        const fetchError = err as { response?: { data?: { error?: string } } };
        setError(fetchError.response?.data?.error || 'Failed to fetch labs');
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterlabs();
  }, [departmentId]);

  if (loading) return <div>Loading labs...</div>;

  if (!departmentId) {
    return <div className="text-gray-500 mt-6">Please select a department to see its labs.</div>
  }

  return (
    <div className={`p-6 page-bg-light transition-all duration-300 w-full`}>
      <h2 className="text-2xl font-bold mb-4">Manage labs</h2>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}

      {labs.length === 0 && !loading && (
         <div className="text-gray-500">No labs found for this department.</div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {labs.map((lab) => {
          const optionOpen = openOptionsLabId === lab.id;
          return (
            <Card key={lab.id} className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-200">
              <div
                onClick={() => {
                  setOpenOptionsLabId(optionOpen ? null : lab.id);
                  if (!optionOpen) {
                    setEditingCapacity(String(lab.capacity));
                    setError(null);
                    setSuccess("");
                  }
                }}
                className="cursor-pointer"
              >
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle>{lab.labNumber}</CardTitle>
                  <FaEllipsisV className="text-gray-400" />
                </CardHeader>
                <CardContent className="flex justify-between py-6 items-center text-sm text-gray-600">
                  <div className="flex items-center"><FaChair className="mr-2" /> Capacity: {lab.capacity}</div>
                  <div className={`flex items-center font-semibold ${lab.status === 'AVAILABLE' ? 'text-green-600' : 'text-yellow-600'}`}>
                    <FaInfoCircle className="mr-2" /> {lab.status}
                  </div>
                </CardContent>
              </div>
              
              {optionOpen && (
                <CardContent className="border-t pt-4">
                  <div className="space-y-4">
                    {/* Capacity Management */}
                    <div className="space-y-2">
                      <label htmlFor={`capacity-${lab.id}`} className="text-sm font-medium text-gray-700">Set Capacity</label>
                      <div className="flex items-center space-x-2">
                        {/* --- CORRECTED: Standard HTML input element with Tailwind classes --- */}
                        <input
                          id={`capacity-${lab.id}`}
                          type="number"
                          value={editingCapacity}
                          onChange={(e) => setEditingCapacity(e.target.value)}
                          placeholder="e.g., 50"
                          disabled={isUpdating}
                          className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {/* --- CORRECTED: Standard HTML button element with Tailwind classes --- */}
                        <button 
                          onClick={() => handleUpdateCapacity(lab.id)} 
                          disabled={isUpdating}
                          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                    
                    {/* Status Management */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Set Status</label>
                      <div className="flex items-center space-x-2">
                        {/* --- CORRECTED: Standard HTML button element with Tailwind classes --- */}
                        <button
                          onClick={() => handleUpdateStatus(lab.id, 'AVAILABLE')}
                          disabled={isUpdating || lab.status === 'AVAILABLE'}
                          className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-800 font-semibold rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          Available
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(lab.id, 'BOOKED')}
                          disabled={isUpdating || lab.status === 'BOOKED'}
                          className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-800 font-semibold rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          Booked
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}