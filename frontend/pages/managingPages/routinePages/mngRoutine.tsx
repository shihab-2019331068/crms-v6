// src/app/dashboard/department-admin/routines/page.tsx
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaArrowLeft } from "react-icons/fa";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Import types
import { View } from "./types";

// Import sub-components
import { MainDashboard } from "./components/MainDashboard";
import { GenerateRoutineView } from "./components/GenerateRoutineView";
import { FullRoutineView } from "./components/FullRoutineView";

// --- MAIN COMPONENT ---
export default function ManageRoutinePage({ departmentId }: { departmentId?: number }) {
  const [view, setView] = useState<View>("main");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };
  
  const goBackToMain = () => {
    setView("main");
    resetMessages();
  };

  // --- VIEW RENDERING LOGIC ---
  const renderView = () => {
    if (!departmentId) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Department not selected. Please select a department first.
          </AlertDescription>
        </Alert>
      );
    }

    switch (view) {
      case "generate":
        return (
          <GenerateRoutineView
            departmentId={departmentId}
            setSuccess={setSuccess}
            setError={setError}
          />
        );
      case "view_edit":
        return (
          <FullRoutineView
            departmentId={departmentId}
            setSuccess={setSuccess}
            setError={setError}
          />
        );
      case "main":
      default:
        return <MainDashboard setView={setView} />;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {view !== "main" && (
        <Button variant="outline" onClick={goBackToMain}>
          <FaArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      )}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="default" className="mb-4 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      {renderView()}
    </div>
  );
}
