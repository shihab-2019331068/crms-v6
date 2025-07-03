'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AccessCardProps {
  access: string;
  onClick?: (access: string) => void;
}

const accessDetails: { [key: string]: { title: string; description: string; link: string } } = {
  manageDepartment: {
    title: 'Manage Departments',
    description: 'Create, edit, and delete departments.',
    link: '/dashboard/managing/departments'
  },
  manageRooms: {
    title: 'Manage Rooms',
    description: 'Add, edit, and remove rooms.',
    link: '/dashboard/managing/rooms'
  },
  manageLabs: {
    title: 'Manage Labs',
    description: 'Add, edit, and remove labs.',
    link: '/dashboard/managing/labs'
  },
  manageUsers: {
    title: 'Manage Users',
    description: 'Add, edit, and remove users.',
    link: '/dashboard/managing/users'
  },
  manageAccess: {
    title: 'Manage Access',
    description: 'Add, edit, and remove user accesses.',
    link: '/dashboard/managing/users'
  }
};

const AccessCard: React.FC<AccessCardProps> = ({ access, onClick }) => {
  const details = accessDetails[access];

  if (!details) {
    return null;
  }

  return (
    <Card
      className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
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
