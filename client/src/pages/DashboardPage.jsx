import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from '../components/Dashboard/StudentDashboard';
import TeacherDashboard from '../components/Dashboard/TeacherDashboard';

export default function DashboardPage({
  setActiveTab,
  onOpenJoinModal,
  onOpenCreateClassModal,
  onOpenCreateAssignmentModal,
  onOpenQuizGenModal,
  onOpenAI
}) {
  const { isTeacher } = useAuth();

  if (isTeacher) {
    return (
      <TeacherDashboard
        setActiveTab={setActiveTab}
        onOpenCreateClassModal={onOpenCreateClassModal}
        onOpenCreateAssignmentModal={onOpenCreateAssignmentModal}
        onOpenQuizGenModal={onOpenQuizGenModal}
        onOpenAI={onOpenAI}
      />
    );
  }

  return (
    <StudentDashboard
      setActiveTab={setActiveTab}
      onOpenJoinModal={onOpenJoinModal}
      onOpenAI={onOpenAI}
    />
  );
}
