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

// Import Department interface
import { Department } from "./mngDept"; 

// NOTE: Using 'sonner' for toast notifications. Replace with your preferred library.
import { toast } from "sonner";

export interface Lab {
  id: number;
  name: string;
  labNumber: string;
  capacity: number;
  status: string;
  departmentId: number; // Included for filtering logic
  departmentAcronym: string | null;
}

interface MngLabPageProps {
  departmentId?: number; // Prop for filtering labs by department
}

export default function MngLabPage({ departmentId }: MngLabPageProps) {
  // Component State
  const [labs, setLabs] = useState<Lab[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Add Lab Form State
  const [labName, setLabName] = useState("");
  const [labNumber, setLabNumber] = useState("");
  const [labCapacity, setLabCapacity] = useState("");
  const [labDeptId, setLabDeptId] = useState("");

  // Edit Dialog State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [labToEdit, setLabToEdit] = useState<Lab | null>(null);
  const [editLabName, setEditLabName] = useState("");
  const [editLabNumber, setEditLabNumber] = useState("");
  const [editLabCapacity, setEditLabCapacity] = useState("");
  
  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [labToDelete, setLabToDelete] = useState<Lab | null>(null);

  // --- Data Fetching ---
  const fetchLabsAndDepartments = async () => {
    setLoading(true);
    try {
      const [labsRes, deptsRes] = await Promise.all([
        api.get<Lab[]>("/labs", { withCredentials: true }),
        api.get<Department[]>('/departments', { withCredentials: true })
      ]);
      setLabs(labsRes.data);
      setDepartments(deptsRes.data);
    } catch (err) {
      toast.error("Failed to fetch initial data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const refetchLabs = async () => {
    try {
      const response = await api.get<Lab[]>("/labs", { withCredentials: true });
      setLabs(response.data);
    } catch (err) {
      toast.error("Failed to refresh lab list.");
    }
  };

  useEffect(() => {
    fetchLabsAndDepartments();
  }, []);

  // Filter labs based on the departmentId prop
  const filteredLabs = useMemo(() => 
    departmentId ? labs.filter((lab) => lab.departmentId === departmentId) : labs,
    [labs, departmentId]
  );

  // --- API Actions ---
  const handleAddLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labName.trim() || !labNumber.trim() || !labCapacity.trim() || !labDeptId) {
      toast.error("All fields are required to add a lab.");
      return;
    }

    setActionLoading(true);
    try {
      await api.post("/dashboard/super-admin/lab", {
          name: labName,
          labNumber,
          capacity: Number(labCapacity),
          departmentId: Number(labDeptId),
        }, { withCredentials: true });
      
      toast.success("Lab added successfully!");
      await refetchLabs();
      setLabName("");
      setLabNumber("");
      setLabCapacity("");
      setLabDeptId("");
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to add lab");
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleUpdateLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labToEdit) return;

    setActionLoading(true);
    try {
        await api.put(`/dashboard/super-admin/lab/${labToEdit.id}`, 
            { name: editLabName, labNumber: editLabNumber, capacity: Number(editLabCapacity) }, 
            { withCredentials: true }
        );
        toast.success("Lab updated successfully!");
        setIsEditDialogOpen(false);
        await refetchLabs();
    } catch (err) {
        const error = err as { response?: { data?: { error?: string } } };
        toast.error(error.response?.data?.error || "Failed to update lab");
    } finally {
        setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!labToDelete) return;

    setActionLoading(true);
    try {
      await api.delete(`/dashboard/super-admin/lab/${labToDelete.id}`, { withCredentials: true });
      toast.success("Lab deleted successfully!");
      setIsDeleteDialogOpen(false);
      await refetchLabs();
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to delete lab");
    } finally {
      setActionLoading(false);
    }
  };

  // --- UI Event Handlers ---
  const handleEditClick = (lab: Lab) => {
    setLabToEdit(lab);
    setEditLabName(lab.name);
    setEditLabNumber(lab.labNumber);
    setEditLabCapacity(String(lab.capacity));
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (lab: Lab) => {
    setLabToDelete(lab);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return <div className="p-8">Loading labs...</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Manage Labs</h2>
      <div className="grid gap-8 lg:grid-cols-3">

        {/* Left Column: Add Lab Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Lab</CardTitle>
              <CardDescription>Enter the details for the new lab.</CardDescription>
            </CardHeader>
            <form onSubmit={handleAddLab}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="labName">Lab Name</Label>
                  <Input id="labName" placeholder="e.g., Programming Lab 1" value={labName} onChange={e => setLabName(e.target.value)} required />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="labNumber">Lab Number</Label>
                  <Input id="labNumber" placeholder="e.g., L-201" value={labNumber} onChange={e => setLabNumber(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="labCapacity">Capacity</Label>
                  <Input id="labCapacity" type="number" placeholder="e.g., 30" value={labCapacity} onChange={e => setLabCapacity(e.target.value)} required/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="labDeptId">Department</Label>
                    <Select value={labDeptId} onValueChange={setLabDeptId} required>
                        <SelectTrigger id="labDeptId">
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
                  {actionLoading ? "Adding..." : "Add Lab"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Right Column: Manage Labs Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Existing Labs</CardTitle>
              <CardDescription>
                {departmentId 
                    ? `Showing labs for a specific department.`
                    : "View, edit, or delete all labs."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='text-gray-800'>Name</TableHead>
                    <TableHead className='text-gray-800'>Lab No.</TableHead>
                    <TableHead className='text-gray-800'>Department</TableHead>
                    <TableHead className='text-gray-800'>Capacity</TableHead>
                    <TableHead className='text-gray-800'>Status</TableHead>
                    <TableHead className="text-right text-gray-800">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLabs.length > 0 ? (
                    filteredLabs.map((lab) => (
                      <TableRow key={lab.id}>
                        <TableCell className="font-medium">{lab.name}</TableCell>
                        <TableCell>{lab.labNumber}</TableCell>
                        <TableCell>{lab.departmentAcronym || 'N/A'}</TableCell>
                        <TableCell>{lab.capacity}</TableCell>
                        <TableCell>{lab.status}</TableCell>
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
                              <DropdownMenuItem onSelect={() => handleEditClick(lab)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onSelect={() => handleDeleteClick(lab)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No labs found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Lab Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleUpdateLab}>
            <DialogHeader>
              <DialogTitle>Edit Lab</DialogTitle>
              <DialogDescription>Make changes to the lab details. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editLabName" className="text-right">Name</Label>
                <Input id="editLabName" value={editLabName} onChange={(e) => setEditLabName(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editLabNumber" className="text-right">Lab No.</Label>
                <Input id="editLabNumber" value={editLabNumber} onChange={(e) => setEditLabNumber(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editLabCapacity" className="text-right">Capacity</Label>
                <Input id="editLabCapacity" type="number" value={editLabCapacity} onChange={(e) => setEditLabCapacity(e.target.value)} className="col-span-3" />
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
              This action cannot be undone. This will permanently delete the <strong>{labToDelete?.name} ({labToDelete?.labNumber})</strong> lab.
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