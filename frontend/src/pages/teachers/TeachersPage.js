import React from 'react';
import RoleProfilesPage from '../../components/admin/RoleProfilesPage';
import { apiGetTeachers, apiCreateTeacher, apiDeleteTeacher } from '../../api/teachersApi';

const TeachersPage = () => {
  return (
    <RoleProfilesPage
      pageTitle="Teachers"
      pageSubtitle="Create and manage teacher profiles from existing teacher-role users."
      roleName="teacher"
      routeBase="teachers"
      getProfiles={apiGetTeachers}
      createProfile={apiCreateTeacher}
      deleteProfile={apiDeleteTeacher}
      singularLabel="Teacher"
      pluralLabel="Teachers"
    />
  );
};

export default TeachersPage;