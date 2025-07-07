// src/app/dashboard/department-admin/routines/components/MainDashboard.tsx
import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaRobot, FaCalendarAlt } from "react-icons/fa";
import { View } from "../types";

interface MainDashboardProps {
  setView: (view: View) => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ setView }) => (
  <div className="text-center">
    <h1 className="text-3xl md:text-4xl font-bold mb-8">Routine Management</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
      <Card
        onClick={() => setView("generate")}
        className="cursor-pointer transition-transform transform hover:scale-105 hover:shadow-lg"
      >
        <CardHeader className="items-center text-center">
          <FaRobot className="h-16 w-16 text-blue-500 mb-4" />
          <CardTitle className="text-2xl">Generate Routine</CardTitle>
          <CardDescription>
            Automatically create a routine for major courses of selected
            semesters.
          </CardDescription>
        </CardHeader>
      </Card>
      <Card
        onClick={() => setView("view_edit")}
        className="cursor-pointer transition-transform transform hover:scale-105 hover:shadow-lg"
      >
        <CardHeader className="items-center text-center">
          <FaCalendarAlt className="h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-2xl">View & Edit Routine</CardTitle>
          <CardDescription>
            View the full schedule, filter, and manually add or modify class
            slots.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  </div>
);