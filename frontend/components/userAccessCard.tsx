'use client';

import React, { useState } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaInfoCircle, FaEllipsisV, FaUserTie, FaSpinner } from 'react-icons/fa';

// --- MultiSelectDropdown Component (No changes needed) ---
interface MultiSelectDropdownProps {
  accessList: string[];
  selectedOptions: string[];
  setSelectedOptions: (options: string[]) => void;
}

const MultiSelectDropdown = ({ accessList, selectedOptions, setSelectedOptions }: MultiSelectDropdownProps) => {
  const toggleAccess = (value: string) => {
    const newOptions = selectedOptions.includes(value)
      ? selectedOptions.filter((item) => item !== value)
      : [...selectedOptions, value];
    setSelectedOptions(newOptions);
  };
  // ... (rest of the component is the same)
  return (
    <div className="relative w-full">
      <div className="border rounded p-2 overflow-y-auto bg-white shadow-inner">
        {accessList.map((access) => (
          <label
            key={access}
            className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              value={access}
              checked={selectedOptions.includes(access)}
              onChange={() => toggleAccess(access)}
              className="accent-blue-500"
            />
            <span>{access}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

// --- UserAccessCard Component (Updated Logic) ---
interface UserAccessCardProps {
    user: any;
    accessList: string[];
    accessListOpen: boolean;
    setOpenAccessListUserId: (userId: number | null) => void;
    optionOpen: boolean;
    setOpenOptionsUserId: (userId: number | null) => void;
    onAccessUpdated: () => void; // Callback to tell parent to refetch users
}

export default function UserAccessCard({ user, accessList, accessListOpen, setOpenAccessListUserId, optionOpen, setOpenOptionsUserId, onAccessUpdated }: UserAccessCardProps) {
    
    // This state is now LOCAL to the card, not from the parent
    const [currentAccesses, setCurrentAccesses] = useState<string[]>([]);
    const [isFetchingAccess, setIsFetchingAccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // This function is called when the user clicks "Manage Access"
    const handleOpenAccessMenu = async () => {
      // If the menu is already open, just close it.
      if (accessListOpen) {
        setOpenAccessListUserId(null);
        return;
      }

      setIsFetchingAccess(true);
      setError(null);
      try {
        // Fetch the LATEST access rights for this user
        const response = await api.get(`/user/${user.email}`);
        setCurrentAccesses(response.data.accesses || []);
        // Only open the dropdown after successfully fetching the data
        setOpenAccessListUserId(user.id);
      } catch (err) {
        console.error('Failed to fetch user accesses', err);
        setError('Could not load permissions.');
      } finally {
        setIsFetchingAccess(false);
      }
    };

    const handleGiveAccess = async () => {
      try {
          await api.post(
              `/grant-access`,
              { userId: user.id, access: currentAccesses },
              { withCredentials: true }
          );
          setOpenAccessListUserId(null); // Close the dropdown on success
        //   onAccessUpdated(); // Tell the parent component to refresh its user list
      } catch (err) {
          const error = err as { response?: { data?: { error?: string } } };
          setError(error.response?.data?.error || "Failed to update user access");
      }
    };

    return (
        <Card key={user.id} onClick={() => setOpenOptionsUserId(optionOpen ? null : user.id)} 
        title='Click for options'
        className="hover:shadow-lg transition-all duration-300 cursor-pointer">
        <CardHeader>
            <CardTitle>{user.name}</CardTitle>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </CardHeader>
        <CardContent className="flex justify-between items-center">
            {user.department && (<div className="flex items-center text-sm text-gray-500">
            <FaInfoCircle className="mr-1" /> {user.department?.acronym || ''}
            </div>)}
            <div className="flex items-center space-x-2">
            {optionOpen && (
                <div className="flex flex-col space-y-1 items-start">
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenAccessMenu();
                    }}
                    className="flex items-center text-blue-500 hover:bg-blue-500 hover:text-white px-3 py-1 rounded transition-colors duration-200 cursor-pointer"
                >
                    {isFetchingAccess ? <FaSpinner className="animate-spin mr-1" /> : <FaUserTie className="mr-1" />}
                    {accessListOpen ? 'Cancel' : 'Manage Access'}
                </button>
                {accessListOpen && !isFetchingAccess && (
                    <div onClick={(e) => e.stopPropagation()} className="p-2 rounded shadow-lg bg-gray-50 w-full">
                      <h4 className="font-bold mb-2 text-sm">Select Access</h4>
                      <MultiSelectDropdown 
                        accessList={accessList} 
                        selectedOptions={currentAccesses} 
                        setSelectedOptions={setCurrentAccesses} 
                      />
                      <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGiveAccess();
                          }}
                          className="mt-2 bg-green-500 text-white px-2 py-1 rounded text-sm cursor-pointer hover:bg-green-600 transition-colors duration-200"
                      >
                          Save Access
                      </button>
                    </div>
                )}
                </div>
            )}
            <button className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200 cursor-pointer" aria-label="Options">
                <FaEllipsisV />
            </button>
            </div>
        </CardContent>
        </Card>
    );
}