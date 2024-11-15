import React from 'react';
import { DashboardLayout } from './DashboardLayout';
import { NewsForm } from '../NewsForm';

export const WriterDashboard: React.FC<{ user: any }> = ({ user }) => {
  return (
    <DashboardLayout role="writer">
      <NewsForm />
    </DashboardLayout>
  );
};