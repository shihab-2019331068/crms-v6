import React, { useEffect, useState } from 'react';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// NOTE: Using 'sonner' for toast notifications. Replace with your preferred library.
import { toast } from "sonner";


export interface Department {
  id: number;
  name: string;
  acronym: string;
}

export default function MngDeptPage() {
  // Component State
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Add Department Form State
  const [newName, setNewName] = useState("");
  const [newAcronym, setNewAcronym] = useState("");

  // Edit Dialog State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [departmentToEdit, setDepartmentToEdit] = useState<Department | null>(null);
  const [editName, setEditName] = useState("");
  const [editAcronym, setEditAcronym] = useState("");

  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  // --- Data Fetching ---
  const fetchDepartments = async () => {
    try {
      const response = await api.get<Department[]>('/departments', { withCredentials: true });
      setDepartments(response.data);
      return response.data; // Return data for chaining
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to fetch departments');
      return []; // Return empty array on failure
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDepartments().finally(() => setLoading(false));
  }, []);


  // --- API Actions ---
  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Department name cannot be empty.");
      return;
    }
    setActionLoading(true);
    try {
      await api.post('/dashboard/super-admin/department', { name: newName, acronym: newAcronym }, { withCredentials: true });
      toast.success("Department added successfully!");
      await fetchDepartments(); // Refetch data
      setNewName("");
      setNewAcronym("");
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to add department");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentToEdit) return;

    setActionLoading(true);
    try {
        await api.put(`/dashboard/super-admin/department/${departmentToEdit.id}`, 
            { name: editName, acronym: editAcronym }, 
            { withCredentials: true }
        );
        toast.success("Department updated successfully!");
        setIsEditDialogOpen(false);
        await fetchDepartments();
    } catch (err) {
        const error = err as { response?: { data?: { error?: string } } };
        toast.error(error.response?.data?.error || "Failed to update department");
    } finally {
        setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!departmentToDelete) return;

    setActionLoading(true);
    try {
      await api.delete(`/dashboard/super-admin/department/${departmentToDelete.id}`, {
        withCredentials: true,
        data: { email, password }
      });
      toast.success("Department deleted successfully!");
      setIsDeleteDialogOpen(false);
      await fetchDepartments();
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to delete department");
    } finally {
      setActionLoading(false);
      setEmail("");
      setPassword("");
    }
  };


  // --- UI Event Handlers ---
  const handleEditClick = (dept: Department) => {
    setDepartmentToEdit(dept);
    setEditName(dept.name);
    setEditAcronym(dept.acronym);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (dept: Department) => {
    setDepartmentToDelete(dept);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return <div className="p-8">Loading departments...</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Manage Departments</h2>
      <div className="grid gap-8 lg:grid-cols-3">

        {/* Left Column: Add Department Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Department</CardTitle>
              <CardDescription>Enter the details for the new department.</CardDescription>
            </CardHeader>
            <form onSubmit={handleAddDepartment}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newName">Department Name</Label>
                  <Input
                    id="newName"
                    placeholder="e.g., Computer Science"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newAcronym">Acronym</Label>
                  <Input
                    id="newAcronym"
                    placeholder="e.g., CS"
                    value={newAcronym}
                    onChange={e => setNewAcronym(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={actionLoading} className="border">
                  {actionLoading ? "Adding..." : "Add Department"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Right Column: Manage Departments Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Existing Departments</CardTitle>
              <CardDescription>View, edit, or delete departments.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Acronym</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <TableRow key={dept.id}>
                        <TableCell className="font-medium">{dept.name}</TableCell>
                        <TableCell>{dept.acronym}</TableCell>
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
                              <DropdownMenuItem onSelect={() => handleEditClick(dept)}
                                className="text-green-600 focus:text-green-600 focus:bg-green-50"
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onSelect={() => handleDeleteClick(dept)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        No departments found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Department Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleUpdateDepartment}>
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
              <DialogDescription>Make changes to the department details here. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editName" className="text-right">Name</Label>
                <Input id="editName" value={editName} onChange={(e) => setEditName(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editAcronym" className="text-right">Acronym</Label>
                <Input id="editAcronym" value={editAcronym} onChange={(e) => setEditAcronym(e.target.value)} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className='border' disabled={actionLoading}>{actionLoading ? "Saving..." : "Save changes"}</Button>
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
              This action cannot be undone. This will permanently delete the <strong>{departmentToDelete?.name}</strong> department. 
              Please enter your credentials to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={actionLoading || !email || !password}>
              {actionLoading ? "Deleting..." : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}