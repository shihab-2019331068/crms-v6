'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Button } from "@/components/ui/button";
import AccessCard from '@/components/AccessCard';
import {
  FaArrowLeft,
} from "react-icons/fa";
import ViewRoutine from './viewingPages/viewRoutine';

const viewingPages = ['ViewRoutine'];

interface ViewingPageProps {
  sidebarOpen?: boolean
}

const ViewingPage = ({ sidebarOpen = true }: ViewingPageProps) => {
  const { user } = useAuth();
  const [accesses, setAccesses] = useState<string[]>([]);
  const [activeForm, setActiveForm] = useState<string | null>(null);
  
  // Change 1: Initialize deptId to null and add a loading state
  const [deptId, setDeptId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Store fetched user details
  const [userData, setUserData] = useState<{ id: number; role: string; departmentId: number | null } | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      // Don't do anything if we don't have a user object yet
      if (!user?.email) {
        setLoading(false); // No user, stop loading
        return;
      }

      try {
        setLoading(true); // Start loading when fetch begins
        const response = await api.get(`/user/${user.email}`);
        setUserData({
          id: response.data.id,
          role: response.data.role,
          departmentId: response.data.departmentId
        });

        //log response data
        console.log(response.data);
      } catch (error) {
        console.error('Failed to fetch user details', error);
      } finally {
        setLoading(false); // Stop loading when fetch is done (success or fail)
      }
    };

    fetchUserDetails();
  }, [user]); // Dependency on `user` is correct

  const handleCardClick = (access: string) => {
    setActiveForm(access);
  };

  const renderActiveForm = () => {
    
    switch (activeForm) {
      case 'ViewRoutine':
        // Conditionally render based on user role
        if (userData?.role === 'student' && userData.id) {
          return <ViewRoutine studentId={userData.id} />;
        }
        if (userData?.departmentId) {
          return <ViewRoutine departmentId={userData.departmentId} />;
        }
        return <div className="text-red-500">Could not determine user role or department to show routine.</div>;
      default:
        return null;
    }
  };

  // Change 3: Show a global loading indicator while fetching user data
  if (loading) {
    return (
      <div className={`min-h-screen p-6`}>
        Loading Viewing Data...
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 page-bg-background transition-all duration-300 text-white ${ sidebarOpen ? "w-316" : "w-364" }`}>
      <h1 className="text-2xl font-bold mb-4">
        Viewing Dashboard
        {activeForm && (
            <Button variant="outline" onClick={() => setActiveForm(null)}>
                <FaArrowLeft className="mr-2 h-4 w-4" /> Back to View
            </Button>
        )}
      </h1>
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

export default ViewingPage;