import React from 'react';
import RoleProfilesPage from '../../components/admin/RoleProfilesPage';
import { apiGetStudents, apiCreateStudent, apiDeleteStudent } from '../../api/studentsApi';

const StudentsPage = () => {
  return (
    <RoleProfilesPage
      pageTitle="Students"
      pageSubtitle="Create and manage student profiles from existing student-role users."
      roleName="student"
      routeBase="students"
      getProfiles={apiGetStudents}
      createProfile={apiCreateStudent}
      deleteProfile={apiDeleteStudent}
      singularLabel="Student"
      pluralLabel="Students"
    />
  );
};

export default StudentsPage;