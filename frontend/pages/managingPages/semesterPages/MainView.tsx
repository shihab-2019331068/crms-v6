import React from 'react';
import { FaPlusCircle, FaTasks, FaArchive } from 'react-icons/fa';
import { ViewType } from './types';

interface MainViewProps {
  onNavigate: (view: ViewType) => void;
}

export function MainView({ onNavigate }: MainViewProps) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-8">Semester Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button onClick={() => onNavigate('add')} className="p-8 rounded-lg shadow-md transition-transform transform hover:scale-105 semester-btn flex flex-col items-center justify-center">
          <FaPlusCircle className="text-4xl mb-4 text-blue-500" />
          <span className="text-xl font-semibold">Add Semester</span>
        </button>
        <button onClick={() => onNavigate('manage')} className="p-8 rounded-lg shadow-md transition-transform transform hover:scale-105 semester-btn flex flex-col items-center justify-center">
          <FaTasks className="text-4xl mb-4 text-green-500" />
          <span className="text-xl font-semibold">Manage Semesters</span>
        </button>
        <button onClick={() => onNavigate('archived')} className="p-8 rounded-lg shadow-md transition-transform transform hover:scale-105 semester-btn flex flex-col items-center justify-center">
          <FaArchive className="text-4xl mb-4 text-gray-500" />
          <span className="text-xl font-semibold">Archived Semesters</span>
        </button>
      </div>
    </div>
  );
}