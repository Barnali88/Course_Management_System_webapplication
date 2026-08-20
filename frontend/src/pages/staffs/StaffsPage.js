import React from 'react';
import RoleProfilesPage from '../../components/admin/RoleProfilesPage';
import { apiGetStaffs, apiCreateStaff, apiDeleteStaff } from '../../api/staffsApi';

const StaffsPage = () => {
  return (
    <RoleProfilesPage
      pageTitle="Staffs"
      pageSubtitle="Create and manage staff profiles from existing staff-role users."
      roleName="staff"
      routeBase="staffs"
      getProfiles={apiGetStaffs}
      createProfile={apiCreateStaff}
      deleteProfile={apiDeleteStaff}
      singularLabel="Staff"
      pluralLabel="Staffs"
    />
  );
};

export default StaffsPage;