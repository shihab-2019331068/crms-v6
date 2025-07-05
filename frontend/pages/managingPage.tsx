'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import AccessCard from '@/components/AccessCard';
import ManageDept from './managingPages/mngDept';
import ManageRoomSA from './managingPages/mngRoomSA';
import ManageLabSA from './managingPages/mngLabSA';
import ManageUser from './managingPages/mngUser';
import ManageAccess from './managingPages/mngAccess';
import ManageRoom from './managingPages/mngRoom';
import ManageLab from './managingPages/mngLab';
import ManageCourse from './managingPages/mngCourse';
import ManageSemester from './managingPages/mngSemester';
import ManageRoutine from './managingPages/mngRoutine';
import ManageTeacher from './managingPages/mngTeacher';
import ManageStudent from './managingPages/mngStudent';




interface ManagingPageProps {
  sidebarOpen?: boolean
}

const ManagingPage = ({ sidebarOpen = true }: ManagingPageProps) => {
  const { user } = useAuth();
  const [accesses, setAccesses] = useState<string[]>([]);
  const [activeForm, setActiveForm] = useState<string | null>(null);
  
  // Change 1: Initialize deptId to null and add a loading state
  const [deptId, setDeptId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAccesses = async () => {
      // Don't do anything if we don't have a user object yet
      if (!user?.email) {
        setLoading(false); // No user, stop loading
        return;
      }

      try {
        setLoading(true); // Start loading when fetch begins
        const response = await api.get(`/user/${user.email}`);
        setAccesses(response.data.accesses || []);
        setDeptId(response.data.departmentId);
      } catch (error) {
        console.error('Failed to fetch user accesses', error);
      } finally {
        setLoading(false); // Stop loading when fetch is done (success or fail)
      }
    };

    fetchUserAccesses();
  }, [user]); // Dependency on `user` is correct

  const handleCardClick = (access: string) => {
    setActiveForm(access);
  };

  const renderActiveForm = () => {
    // Change 2: Handle the case where deptId is needed but not yet loaded
    // SA forms don't need a deptId, so they can be rendered anytime
    const needsDeptId = [
      'manageAccess', 'manageRoom', 'manageLab', 'manageCourse',
      'manageSemester', 'manageRoutine', 'manageTeacher', 'manageStudent'
    ].includes(activeForm || '');

    // If a form needs a deptId but we don't have one yet, show a message.
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
      // Now we can be sure deptId is a number when we reach these cases
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

  // Change 3: Show a global loading indicator while fetching user data
  if (loading) {
    return (
      <div className={`min-h-screen p-6`}>
        Loading Management Data...
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 page-bg-background transition-all duration-300 text-gray-800 ${ sidebarOpen ? "w-316" : "w-364" }`}>
      <h1 className="text-2xl font-bold mb-4">
        Management Dashboard
        {activeForm && (
          <button
            className="btn btn-outline btn-sm ml-4 cursor-pointer custom-bordered-btn"
            onClick={() => setActiveForm(null)}
          >
            Back to Manage
          </button>
        )}
      </h1>
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