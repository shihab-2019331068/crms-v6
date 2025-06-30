import React, { useState } from 'react';
import RoomList from "./RoomList";
import CourseList from "./CourseList";
import SemesterList from "./SemesterList";
import FinalRoutine from "./finalRoutine";

interface DepartmentManageProps {
    departmentId: number;
}

const DepartmentManage: React.FC<DepartmentManageProps> = ({ departmentId }) => {
  const [view, setView] = useState<"rooms" | "courses" | "semesters" | "routine" | null>(null);

  const renderContent = () => {
    switch (view) {
      case 'rooms':
        return <RoomList departmentId={departmentId} />;
      case 'courses':
        return <CourseList departmentId={departmentId} />;
      case 'semesters':
        return <SemesterList departmentId={departmentId} />;
      case 'routine':
        return <FinalRoutine departmentId={departmentId} />;
      default:
        return <p>Select an option to manage.</p>;
    }
  };

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <button className="btn btn-outline btn-sm mt-1 cursor-pointer custom-bordered-btn" onClick={() => setView('rooms')}>Rooms</button>
        <button className="btn btn-outline btn-sm mt-1 cursor-pointer custom-bordered-btn" onClick={() => setView('courses')}>Courses</button>
        <button className="btn btn-outline btn-sm mt-1 cursor-pointer custom-bordered-btn" onClick={() => setView('semesters')}>Semesters</button>
        <button className="btn btn-outline btn-sm mt-1 cursor-pointer custom-bordered-btn" onClick={() => setView('routine')}>Routine</button>
      </div>
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default DepartmentManage;