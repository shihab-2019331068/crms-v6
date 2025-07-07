'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FaBuilding,
  FaDoorOpen,
  FaFlask,
  FaUsersCog,
  FaKey,
  FaBook,
  FaCalendarAlt,
  FaRegClock,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaEye
} from 'react-icons/fa';

interface AccessCardProps {
  access: string;
  onClick?: (access: string) => void;
}

// Enhanced details with icons and improved descriptions
const accessDetails: { [key: string]: { title: string; description: string; icon: React.ReactElement } } = {
  manageDepartmentSA: {
    title: 'Manage Departments',
    description: 'Create, update, and manage university departments.',
    icon: <FaBuilding className="h-7 w-7 text-indigo-500" />
  },
  manageRoomsSA: {
    title: 'Manage All Rooms',
    description: 'Oversee and manage all rooms across every department.',
    icon: <FaDoorOpen className="h-7 w-7 text-green-500" />
  },
  manageLabsSA: {
    title: 'Manage All Labs',
    description: 'Oversee and manage all labs across every department.',
    icon: <FaFlask className="h-7 w-7 text-cyan-500" />
  },
  manageUsersSA: {
    title: 'Manage Users',
    description: 'Add users, edit profiles, and assign system-wide roles.',
    icon: <FaUsersCog className="h-7 w-7 text-slate-500" />
  },
  manageAccess: {
    title: 'Manage Access',
    description: 'Grant or revoke management permissions for department staff.',
    icon: <FaKey className="h-7 w-7 text-amber-500" />
  },
  manageRoom: {
    title: 'Manage Dept. Rooms',
    description: 'Add or update classroom information for your department.',
    icon: <FaDoorOpen className="h-7 w-7 text-green-500" />
  },
  manageLab: {
    title: 'Manage Dept. Labs',
    description: 'Add or update lab information for your department.',
    icon: <FaFlask className="h-7 w-7 text-cyan-500" />
  },
  manageCourse: {
    title: 'Manage Courses',
    description: 'Define and organize all courses offered by your department.',
    icon: <FaBook className="h-7 w-7 text-orange-500" />
  },
  manageSemester: {
    title: 'Manage Semesters',
    description: 'Set up academic semesters and sessions for your department.',
    icon: <FaCalendarAlt className="h-7 w-7 text-red-500" />
  },
  manageRoutine: {
    title: 'Manage Routine',
    description: 'Build and publish class schedules and routines for a semester.',
    icon: <FaRegClock className="h-7 w-7 text-purple-500" />
  },
  manageTeacher: {
    title: 'Manage Teachers',
    description: 'Maintain faculty records and assignments for your department.',
    icon: <FaChalkboardTeacher className="h-7 w-7 text-blue-500" />
  },
  manageStudent: {
    title: 'Manage Students',
    description: 'Manage student records and enrollment within your department.',
    icon: <FaUserGraduate className="h-7 w-7 text-teal-500" />
  },
  ViewRoutine: {
    title: 'View Routine',
    description: 'Check your personal class schedule for the active semester.',
    icon: <FaEye className="h-7 w-7 text-gray-500" />
  },
  TeacherRoutine: {
    title: 'View Routine',
    description: 'Check your personal class schedule for the active semester.',
    icon: <FaEye className="h-7 w-7 text-gray-500" />
  }
};

const AccessCard: React.FC<AccessCardProps> = ({ access, onClick }) => {
  const details = accessDetails[access];

  if (!details) {
    return null;
  }

  // The 'link' property was unused so it has been removed from the details object.
  // The 'onClick' handler passed from the parent component is used instead.

  return (
    <Card
      className="bg-white text-gray-800 border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
      onClick={() => onClick && onClick(access)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-gray-700 group-hover:text-black transition-colors">
            {details.title}
        </CardTitle>
        {details.icon}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
            {details.description}
        </p>
      </CardContent>
    </Card>
  );
};

export default AccessCard;