import React, { useEffect, useState } from 'react';
import api from "@/services/api";
import { Button } from '@/components/ui/button';
import { FaArrowLeft } from 'react-icons/fa';

import { MainView } from './MainView';
import { AddSemesterForm } from './AddSemesterForm';
import { SemesterCard } from './SemesterCard';
import { Semester, ViewType } from './types';

interface mngSemesterProps {
  departmentId?: number;
}

export default function MngSemester({ departmentId }: mngSemesterProps) {
  const [currentView, setCurrentView] = useState<ViewType>('main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const fetchSemesters = async () => {
    if (!departmentId) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/dashboard/department-admin/semesters", {
        params: { departmentId },
        withCredentials: true,
      });
      const sortedSemesters = res.data.sort((a: Semester, b: Semester) => a.name.localeCompare(b.name));
      setSemesters(sortedSemesters);
    } catch {
      setError("Failed to fetch semesters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'manage' || currentView === 'archived') {
      fetchSemesters();
    }
  }, [currentView, departmentId]);

  const handleSemesterAdded = () => {
    fetchSemesters();
    setCurrentView('manage');
  };

  const renderSemesterListView = (isArchivedView: boolean) => {
    const title = isArchivedView ? "Archived Semesters" : "Manage Active Semesters";
    const filteredSemesters = semesters.filter(s => s.isArchived === isArchivedView);

    return (
      <div>
        <Button variant="outline" onClick={() => setCurrentView('main')} className="mb-6 semester-btn">
          <FaArrowLeft className="mr-2" /> Back
        </Button>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {loading && <p>Loading semesters...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        {!loading && filteredSemesters.length === 0 && (
          <div className="text-center p-10 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              {isArchivedView ? "There are no archived semesters." : "There are no active semesters."}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {filteredSemesters.map((semester) => (
            <SemesterCard
              key={semester.id}
              semester={semester}
              onUpdate={fetchSemesters}
            />
          ))}
        </div>
      </div>
    );
  };
  
  const renderContent = () => {
    switch (currentView) {
      case 'add':
        return <AddSemesterForm departmentId={departmentId} onBack={() => setCurrentView('main')} onSemesterAdded={handleSemesterAdded} />;
      case 'manage':
        return renderSemesterListView(false);
      case 'archived':
        return renderSemesterListView(true);
      case 'main':
      default:
        return <MainView onNavigate={setCurrentView} />;
    }
  };

  return <div className="p-4">{renderContent()}</div>;
}