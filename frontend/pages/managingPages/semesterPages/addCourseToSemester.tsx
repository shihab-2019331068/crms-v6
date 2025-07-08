import React, { useState } from 'react';
import api from "@/services/api";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Semester } from './types';
import { FaUpload } from 'react-icons/fa';

interface AddCourseToSemesterProps {
  semester: Semester;
  onCoursesAdded: () => void;
}

export default function AddCourseToSemester({ semester, onCoursesAdded }: AddCourseToSemesterProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [addCourseLoading, setAddCourseLoading] = useState(false);
  const [addCourseError, setAddCourseError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Basic validation for file type
      if (!file.type.includes('csv')) {
        setAddCourseError("Please select a valid .csv file.");
        setSelectedFile(null);
        e.target.value = ""; // Reset input
        return;
      }
      setSelectedFile(file);
      setAddCourseError("");
    }
  };

  const handleAddCourseToSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setAddCourseError("Please select a file to upload.");
      return;
    }
    setAddCourseLoading(true);
    setAddCourseError("");

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('semesterId', semester.id.toString());

    try {
      // The API endpoint is assumed to be updated to handle CSV uploads.
      await api.post("/dashboard/department-admin/semester/course/upload-csv", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      setSelectedFile(null);
      onCoursesAdded();
    } catch (err: any) {
      setAddCourseError(err.response?.data?.error || "Failed to add courses. Check CSV format and course codes.");
    } finally {
      setAddCourseLoading(false);
    }
  };

  return (
    <form onClick={(e) => e.stopPropagation()} className="p-4 border rounded-md bg-background space-y-3" onSubmit={handleAddCourseToSemester}>
      <div>
        <h4 className="text-sm font-semibold">Upload Courses via CSV</h4>
        <p className="text-xs text-muted-foreground mt-1">
          Format: A single column with the header <code className="bg-muted px-1 rounded font-mono text-gray-800">course_code</code>. Each row should contain one existing course code.
        </p>
      </div>

      <div className="w-full">
        <label htmlFor="course-csv-upload" className="sr-only">Choose CSV file</label>
        <Input
          id="course-csv-upload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={addCourseLoading}
          className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
        />
        {selectedFile && (
            <p className="text-xs text-green-600 mt-2">
                File: {selectedFile.name}
            </p>
        )}
      </div>
      
      <Button type="submit" size="sm" className="w-full hover:underline" disabled={addCourseLoading || !selectedFile}>
        <FaUpload className="mr-2 h-3.5 w-3.5" />
        {addCourseLoading ? "Processing..." : "Upload and Add Courses"}
      </Button>

      {addCourseError && <p className="text-red-500 text-xs text-center mt-1">{addCourseError}</p>}
    </form>
  );
}