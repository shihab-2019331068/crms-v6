'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Button } from "@/components/ui/button";
import AccessCard from '@/components/AccessCard';
import { FaArrowLeft } from "react-icons/fa";
import TeacherRoutine from './TeacherPages/teacherRoutine';

const viewingPages = ['TeacherRoutine'];

const ViewingPageT = () => {
  const { user } = useAuth();
  const [activeForm, setActiveForm] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{ id: number; role: string; departmentId: number | null } | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/user/${user.email}`);
        setUserData({
          id: response.data.id,
          role: response.data.role,
          departmentId: response.data.departmentId
        });
        console.log("User: ", response.data);
      } catch (error) {
        console.error('Failed to fetch user details', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [user]);

  const handleCardClick = (access: string) => {
    setActiveForm(access);
  };

  const renderActiveForm = () => {
    switch (activeForm) {
      case 'TeacherRoutine':
        // Conditionally render based on user role
        if (userData?.role === 'teacher' && userData.id) {
          return <TeacherRoutine teacherId={userData.id} />;
        }
        return <div className="text-red-500">Could not determine user role or department to show routine.</div>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        Loading Viewing Data...
      </div>
    );
  }

  return (
    <div className="p-6 page-bg-background text-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          Viewing Dashboard
        </h1>
        {activeForm && (
            <Button variant="outline" onClick={() => setActiveForm(null)}>
                <FaArrowLeft className="mr-2 h-4 w-4" /> Back to View
            </Button>
        )}
      </div>

      {renderActiveForm()}

      {!activeForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {viewingPages.map((access) => (
            <AccessCard key={access} access={access} onClick={handleCardClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewingPageT;