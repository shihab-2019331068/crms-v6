import React, { useEffect, useState, useMemo } from 'react';
import api from "@/services/api";
import { MoreHorizontal } from "lucide-react";

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Import Department interface from the other file
import { Department } from "./mngDept"; 

// NOTE: Using 'sonner' for toast notifications. Replace with your preferred library.
import { toast } from "sonner";

export interface Room {
  id: number;
  roomNumber: string;
  capacity: number;
  status: string;
  departmentId: number;
  departmentAcronym: string | null;
}

interface MngRoomPageProps {
  departmentId?: number; // Prop for filtering rooms by department
}

export default function MngRoomPage({ departmentId }: MngRoomPageProps) {
  // Component State
  const [rooms, setRooms] = useState<Room[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Add Room Form State
  const [roomNumber, setRoomNumber] = useState("");
  const [roomCapacity, setRoomCapacity] = useState("");
  const [roomDeptId, setRoomDeptId] = useState("");

  // Edit Dialog State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);
  const [editRoomNumber, setEditRoomNumber] = useState("");
  const [editRoomCapacity, setEditRoomCapacity] = useState("");
  
  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  // --- Data Fetching ---
  const fetchRoomsAndDepartments = async () => {
    setLoading(true);
    try {
      const [roomsRes, deptsRes] = await Promise.all([
        api.get<Room[]>("/rooms", { withCredentials: true }),
        api.get<Department[]>('/departments', { withCredentials: true })
      ]);
      setRooms(roomsRes.data);
      setDepartments(deptsRes.data);
    } catch (err) {
      toast.error("Failed to fetch initial data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const refetchRooms = async () => {
    try {
      const response = await api.get<Room[]>("/rooms", { withCredentials: true });
      setRooms(response.data);
    } catch (err) {
      toast.error("Failed to refresh room list.");
    }
  };

  useEffect(() => {
    fetchRoomsAndDepartments();
  }, []);

  // Filter rooms based on the departmentId prop
  const filteredRooms = useMemo(() => 
    departmentId ? rooms.filter((room) => room.departmentId === departmentId) : rooms,
    [rooms, departmentId]
  );

  // --- API Actions ---
  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim() || !roomCapacity.trim() || !roomDeptId) {
      toast.error("All fields are required to add a room.");
      return;
    }

    setActionLoading(true);
    try {
      await api.post("/dashboard/super-admin/room", {
          roomNumber,
          capacity: Number(roomCapacity),
          departmentId: Number(roomDeptId),
        }, { withCredentials: true });
      
      toast.success("Room added successfully!");
      await refetchRooms();
      setRoomNumber("");
      setRoomCapacity("");
      setRoomDeptId("");
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to add room");
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomToEdit) return;

    setActionLoading(true);
    try {
        await api.put(`/dashboard/super-admin/room/${roomToEdit.id}`, 
            { roomNumber: editRoomNumber, capacity: Number(editRoomCapacity) }, 
            { withCredentials: true }
        );
        toast.success("Room updated successfully!");
        setIsEditDialogOpen(false);
        await refetchRooms();
    } catch (err) {
        const error = err as { response?: { data?: { error?: string } } };
        toast.error(error.response?.data?.error || "Failed to update room");
    } finally {
        setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!roomToDelete) return;

    setActionLoading(true);
    try {
      await api.delete(`/dashboard/super-admin/room/${roomToDelete.id}`, { withCredentials: true });
      toast.success("Room deleted successfully!");
      setIsDeleteDialogOpen(false);
      await refetchRooms();
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to delete room");
    } finally {
      setActionLoading(false);
    }
  };

  // --- UI Event Handlers ---
  const handleEditClick = (room: Room) => {
    setRoomToEdit(room);
    setEditRoomNumber(room.roomNumber);
    setEditRoomCapacity(String(room.capacity));
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (room: Room) => {
    setRoomToDelete(room);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return <div className="p-8">Loading rooms...</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Manage Rooms</h2>
      <div className="grid gap-8 lg:grid-cols-3">

        {/* Left Column: Add Room Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Room</CardTitle>
              <CardDescription>Enter the details for the new room.</CardDescription>
            </CardHeader>
            <form onSubmit={handleAddRoom}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number</Label>
                  <Input id="roomNumber" placeholder="e.g., A-101" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomCapacity">Capacity</Label>
                  <Input id="roomCapacity" type="number" placeholder="e.g., 50" value={roomCapacity} onChange={e => setRoomCapacity(e.target.value)} required/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="roomDeptId">Department</Label>
                    <Select value={roomDeptId} onValueChange={setRoomDeptId} required>
                        <SelectTrigger id="roomDeptId">
                            <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                        <SelectContent className='bg-white'>
                            {departments.map((dept) => (
                                <SelectItem key={dept.id} value={String(dept.id)} className='hover:bg-gray-300'>
                                    {dept.name} ({dept.acronym})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={actionLoading} className='border border-slate-600'>
                  {actionLoading ? "Adding..." : "Add Room"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Right Column: Manage Rooms Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Existing Rooms</CardTitle>
              <CardDescription>
                {departmentId 
                    ? `Showing rooms for a specific department.`
                    : "View, edit, or delete all rooms."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='text-gray-800'>Room No.</TableHead>
                    <TableHead className='text-gray-800'>Department</TableHead>
                    <TableHead className='text-gray-800'>Capacity</TableHead>
                    <TableHead className='text-gray-800'>Status</TableHead>
                    <TableHead className="text-gray-800">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.length > 0 ? (
                    filteredRooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">{room.roomNumber}</TableCell>
                        <TableCell>{room.departmentAcronym || 'N/A'}</TableCell>
                        <TableCell>{room.capacity}</TableCell>
                        <TableCell>{room.status}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className='bg-white'>
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onSelect={() => handleEditClick(room)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onSelect={() => handleDeleteClick(room)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No rooms found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Room Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleUpdateRoom}>
            <DialogHeader>
              <DialogTitle>Edit Room</DialogTitle>
              <DialogDescription>Make changes to the room details. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editRoomNumber" className="text-right">Room No.</Label>
                <Input id="editRoomNumber" value={editRoomNumber} onChange={(e) => setEditRoomNumber(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editRoomCapacity" className="text-right">Capacity</Label>
                <Input id="editRoomCapacity" type="number" value={editRoomCapacity} onChange={(e) => setEditRoomCapacity(e.target.value)} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={actionLoading}>{actionLoading ? "Saving..." : "Save changes"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete room <strong>{roomToDelete?.roomNumber}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={actionLoading} className='cursor-pointer hover:underline'>
              {actionLoading ? "Deleting..." : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}