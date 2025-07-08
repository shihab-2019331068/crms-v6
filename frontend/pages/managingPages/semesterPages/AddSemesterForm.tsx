import React, { useState } from 'react';
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaArrowLeft } from 'react-icons/fa';
import { semesterNameOptions, generateShortnameFromName } from './helpers';

interface AddSemesterFormProps {
  departmentId?: number;
  onBack: () => void;
  onSemesterAdded: () => void;
}

export function AddSemesterForm({ departmentId, onBack, onSemesterAdded }: AddSemesterFormProps) {
  const [name, setName] = useState("");
  const [shortname, setShortname] = useState("");
  const [session, setSession] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post('/add-semester', { name, shortname, session, departmentId }, { withCredentials: true });
      setSuccess("Semester added successfully!");
      setName("");
      setShortname("");
      setSession("");
      onSemesterAdded(); // Notify parent component
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add semester.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button variant="outline" onClick={onBack} className="mb-6">
        <FaArrowLeft className="mr-2" /> Back
      </Button>
      <Card className="max-w-md mx-auto">
        <CardHeader><CardTitle>Create a New Semester</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="semesterName" className="block text-sm font-medium mb-1">Semester Name</label>
              <Select onValueChange={(value) => { setName(value); setShortname(generateShortnameFromName(value)); }} value={name}>
                <SelectTrigger id="semesterName"><SelectValue placeholder="Select a semester" /></SelectTrigger>
                <SelectContent className="bg-black text-white">
                  {semesterNameOptions.map((opt) => (<SelectItem key={opt} value={opt} className="hover:bg-gray-800">{opt}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="session" className="block text-sm font-medium mb-1">Session</label>
              <Input id="session" type="text" value={session} onChange={(e) => setSession(e.target.value)} placeholder="e.g., 2023-2024" pattern="\d{4}-\d{4}" title="Session must be in YYYY-YYYY format" required />
            </div>
            <Button type="submit" disabled={loading || !name || !session} className="w-full border">
              {loading ? "Creating..." : "Create Semester"}
            </Button>
            {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}