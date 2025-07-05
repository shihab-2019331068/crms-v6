'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AccessCardProps {
  access: string;
  onClick?: (access: string) => void;
}

const accessDetails: { [key: string]: { title: string; description: string; link: string } } = {
  manageDepartmentSA: {
    title: 'Manage Departments',
    description: 'Create, edit, and delete departments.',
    link: '/dashboard/managing/departments'
  },
  manageRoomsSA: {
    title: 'Manage Rooms',
    description: 'Add, edit, and remove rooms.',
    link: '/dashboard/managing/rooms'
  },
  manageLabsSA: {
    title: 'Manage Labs',
    description: 'Add, edit, and remove labs.',
    link: '/dashboard/managing/labs'
  },
  manageUsersSA: {
    title: 'Manage Users',
    description: 'Add, edit, and remove users.',
    link: '/dashboard/managing/users'
  },
  manageAccess: {
    title: 'Manage Access',
    description: 'Add, edit, and remove user accesses.',
    link: '/dashboard/managing/users'
  },
  manageRoom: {
    title: 'Manage Room',
    description: 'Manage Department Rooms.',
    link: '/dashboard/managing/users'
  },
  manageLab: {
    title: 'Manage Lab',
    description: 'Manage Department Labs.',
    link: '/dashboard/managing/users'
  },
  manageCourse: {
    title: 'Manage Course',
    description: 'Manage Department Courses.',
    link: '/dashboard/managing/users'
  },
  manageSemester: {
    title: 'Manage Semester',
    description: 'Manage Department Semesters.',
    link: '/dashboard/managing/users'
  },
  manageRoutine: {
    title: 'Manage Routine',
    description: 'Manage Department Routines.',
    link: '/dashboard/managing/users'
  },
  manageTeacher: {
    title: 'Manage Teacher',
    description: 'Manage Department Teachers.',
    link: '/dashboard/managing/users'
  },
  manageStudent: {
    title: 'Manage Student',
    description: 'Manage Department Students.',
    link: '/dashboard/managing/users'
  },
  ViewRoutine: {
    title: 'View Routine',
    description: 'View your class schedule for the current semester.',
    link: '/dashboard/viewing/routine'
  }
};

const AccessCard: React.FC<AccessCardProps> = ({ access, onClick }) => {
  const details = accessDetails[access];

  if (!details) {
    return null;
  }

  return (
    <Card
className="bg-white text-gray-800 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
      onClick={() => onClick && onClick(access)}
    >
      <CardHeader>
        <CardTitle>{details.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{details.description}</p>
      </CardContent>
    </Card>
  );
};

export default AccessCard;
