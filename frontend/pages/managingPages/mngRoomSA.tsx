import React, { useEffect, useState } from 'react';
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaTrash, FaChair, FaBuilding, FaInfoCircle, FaEllipsisV } from 'react-icons/fa';

import {
  Department,
}  from "./mngDept";

export interface Room {
  id: number;
  roomNumber: string;
  capacity: number;
  status: string;
  departmentId: number;
  departmentAcronym: string | null;
}

interface mngRoomSAProps {
  departmentId?: number;
  sidebarOpen?: boolean;
}

export default function mngRoomSA({ departmentId, sidebarOpen = true }: mngRoomSAProps) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [roomNumber, setRoomNumber] = useState("");
  const [roomCapacity, setRoomCapacity] = useState("");
  const [roomDeptId, setRoomDeptId] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [openOptionsRoomId, setOpenOptionsRoomId] = useState<number | null>(null);

  
  const [tableWidth, setTableWidth] = useState(1);
  useEffect(() => {
    const handleResize = () => {
      setTableWidth (window.innerWidth - 300);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Log initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Room[]>("/rooms", { withCredentials: true });
      return response.data;
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      throw new Error(error.response?.data?.error || 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/dashboard/super-admin/room/${id}`, { withCredentials: true });
      setSuccess("Room deleted successfully!");
      // Refetch rooms after deletion
      const res = await api.get<Room[]>("/rooms", { withCredentials: true });
      setRooms(res.data);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to delete room");
    } finally {
      setLoading(false);
    }
  }

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess("");
    if (!roomNumber.trim() || !roomCapacity.trim() || !roomDeptId.trim()) {
      setError("All fields are required");
      setLoading(false);
      return;
    }
    try {
      await api.post(
        "/dashboard/super-admin/room",
        {
          roomNumber,
          capacity: Number(roomCapacity),
          departmentId: Number(roomDeptId),
        },
        { withCredentials: true }
      );
      setSuccess("Room added successfully!");
      // Refetch rooms after adding
      const res = await api.get<Room[]>("/rooms", { withCredentials: true });
      setRooms(res.data);
      setRoomNumber("");
      setRoomCapacity("");
      setRoomDeptId("");
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to add room");
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
    fetchRooms()
      .then(setRooms)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    fetchDepartments();
  }, []);

  const filteredRooms = departmentId
    ? rooms.filter((room) => room.departmentId === departmentId)
    : rooms;

  if (loading) return <div>Loading rooms...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className={`min-h-screen p-6 page-bg-light transition-all duration-300 w-full`}>
      <h2 className="text-2xl font-bold mb-4">Room List</h2>
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {user?.role === "super_admin" && (
        <div>
          <button
            className="btn btn-outline btn-sm mb-4 cursor-pointer custom-bordered-btn"
            onClick={() => setShowAddForm((v) => !v)}
          >
            [+add room]
          </button>
        </div>
      )}
      {showAddForm && (<form onSubmit={handleAddRoom} className="mb-6 flex max-w-2xl flex-col gap-2">
        <input
          type="text"
          placeholder="Room Number"
          value={roomNumber}
          onChange={e => setRoomNumber(e.target.value)}
          className="input input-bordered w-full"
          required
        />
        <input
          type="number"
          placeholder="Capacity"
          value={roomCapacity}
          onChange={e => setRoomCapacity(e.target.value)}
          className="input input-bordered w-full"
          required
        />
        {/* Department Dropdown */}
        <select
          value={roomDeptId}
          onChange={e => setRoomDeptId(e.target.value)}
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
          {loading ? "Adding..." : "Add Room"}
        </button>
      </form>)}
      <div className="grid lg:grid-cols-3 gap-4">
        {rooms.map((room) => {
          const optionOpen = openOptionsRoomId === room.id;
          return (
            <Card key={room.id} onClick={() => setOpenOptionsRoomId(optionOpen ? null : room.id)} 
            title="Click to open options" className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <CardHeader>
                <CardTitle>{room.roomNumber}</CardTitle>
              </CardHeader>
              
              <CardContent className="flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-500">
                  <FaChair className="mr-1" /> {room.capacity}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FaInfoCircle className="mr-1" /> {room.status}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FaBuilding className="mr-1" /> {room.departmentAcronym}
                </div>
                <div className="flex flex-col space-y-1 items-start">
                  {optionOpen && (
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="flex items-center text-red-500 hover:bg-red-500 hover:text-white px-3 py-1 rounded transition-colors duration-200 cursor-pointer"
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                  )}
                </div>
                <button className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200 cursor-pointer" aria-label="Options">
                  <FaEllipsisV />
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
