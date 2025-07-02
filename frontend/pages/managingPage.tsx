'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import AccessCard from '@/components/AccessCard';
import ManageDept from './managingPages/mngDept';
import ManageRoomSA from './managingPages/mngRoomSA';
import ManageLabSA from './managingPages/mngLabSA';
import ManageUser from './managingPages/mngUser';

interface ManagingPageProps {
  sidebarOpen?: boolean
}

const ManagingPage = ({ sidebarOpen = true }: ManagingPageProps) => {
  const { user } = useAuth();
  const [accesses, setAccesses] = useState<string[]>([]);
  const [activeForm, setActiveForm] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAccesses = async () => {
      if (user?.email) {
        try {
          const response = await api.get(`/user/${user.email}`);
          setAccesses(response.data.accesses || []);
        } catch (error) {
          console.error('Failed to fetch user accesses', error);
        }
      }
    };

    fetchUserAccesses();
  }, [user]);

  const handleCardClick = (access: string) => {
    setActiveForm(access);
  };

  const renderActiveForm = () => {
    switch (activeForm) {
      case 'manageDepartment':
        return <ManageDept />;
      case 'manageRooms':
        return <ManageRoomSA />;
      case 'manageLabs':
        return <ManageLabSA />;
      case 'manageUsers':
        return <ManageUser />;
      default:
        return (
            <div >
            </div>
        );
    }
  };

  return (
    <div className={`min-h-screen p-6 page-bg-light transition-all duration-300 text-black ${ sidebarOpen ? "w-300" : "w-348" }`}>
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
