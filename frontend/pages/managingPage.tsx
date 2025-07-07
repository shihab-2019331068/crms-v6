'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import AccessCard from '@/components/AccessCard';
import { Button } from "@/components/ui/button"; // Added for consistency
import { FaArrowLeft } from "react-icons/fa"; // Added for consistency
import ManageDept from './managingPages/mngDept';
import ManageRoomSA from './managingPages/mngRoomSA';
import ManageLabSA from './managingPages/mngLabSA';
import ManageUser from './managingPages/mngUser';
import ManageAccess from './managingPages/mngAccess';
import ManageRoom from './managingPages/mngRoom';
import ManageLab from './managingPages/mngLab';
import ManageCourse from './managingPages/mngCourse';
import ManageSemester from './managingPages/mngSemester';
import ManageRoutine from './managingPages/routinePages/mngRoutine';
import ManageTeacher from './managingPages/mngTeacher';
import ManageStudent from './managingPages/mngStudent';

interface ManagingPageProps {
  sidebarOpen?: boolean
}

const ManagingPage = ({ sidebarOpen = true }: ManagingPageProps) => {
  const { user } = useAuth();
  const [accesses, setAccesses] = useState<string[]>([]);
  const [activeForm, setActiveForm] = useState<string | null>(null);
  
  const [deptId, setDeptId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAccesses = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/user/${user.email}`);
        setAccesses(response.data.accesses || []);
        setDeptId(response.data.departmentId);
      } catch (error) {
        console.error('Failed to fetch user accesses', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAccesses();
  }, [user]);

  const handleCardClick = (access: string) => {
    setActiveForm(access);
  };

  const renderActiveForm = () => {
    const needsDeptId = [
      'manageAccess', 'manageRoom', 'manageLab', 'manageCourse',
      'manageSemester', 'manageRoutine', 'manageTeacher', 'manageStudent'
    ].includes(activeForm || '');

    if (needsDeptId && deptId === null) {
      return <div>Could not determine department. User may not be assigned one.</div>;
    }
    
    switch (activeForm) {
      case 'manageDepartmentSA':
        return <ManageDept />;
      case 'manageRoomsSA':
        return <ManageRoomSA />;
      case 'manageLabsSA':
        return <ManageLabSA />;
      case 'manageUsersSA':
        return <ManageUser />;
      case 'manageAccess':
        return <ManageAccess deptId={deptId!} />;
      case 'manageRoom':
        return <ManageRoom departmentId={deptId!} />;
      case 'manageLab':
        return <ManageLab departmentId={deptId!} />;
      case 'manageCourse':
        return <ManageCourse departmentId={deptId!} />;
      case 'manageSemester':
        return <ManageSemester departmentId={deptId!} />;
      case 'manageRoutine':
        return <ManageRoutine departmentId={deptId!} />;
      case 'manageTeacher':
        return <ManageTeacher departmentId={deptId!} />;
      case 'manageStudent':
        return <ManageStudent departmentId={deptId!} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen p-6`}>
        Loading Management Data...
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 page-bg-background transition-all duration-300 text-gray-800 ${ sidebarOpen ? "w-316" : "w-364" }`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          Management Dashboard
        </h1>
        {activeForm && (
          <Button variant="outline" onClick={() => setActiveForm(null)}>
            <FaArrowLeft className="mr-2 h-4 w-4" /> Back to Manage
          </Button>
        )}
      </div>
      
      {renderActiveForm()}
      
      {!activeForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accesses.map((access) => (
            <AccessCard key={access} access={access} onClick={handleCardClick} />
          ))}
        </div>
      )}

    </div>
  );
};

export default ManagingPage;