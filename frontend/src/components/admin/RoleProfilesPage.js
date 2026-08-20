import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiGetUsers } from '../../api/usersApi';
import { getImageUrl } from '../../api/axiosInstance';
import PageHeader from '../common/PageHeader';
import Modal from '../common/Modal';
import { useToast } from '../common/Toast';

const StatCard = ({ label, value, hint }) => (
  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
    <p className="mt-3 text-3xl font-display font-bold text-white">{value}</p>
    {hint ? <p className="mt-2 text-xs text-slate-400">{hint}</p> : null}
  </div>
);

const getRoleName = (user) => {
  const directRole = (user?.role?.name || user?.role || user?.role_name || '').toLowerCase();
  if (directRole) return directRole;

  if (user?.role_id === 1) return 'admin';
  if (user?.role_id === 2) return 'teacher';
  if (user?.role_id === 3) return 'student';
  if (user?.role_id === 4) return 'staff';

  return '';
};

const getLinkedUserId = (record) => {
  return (
    record?.user_id ||
    record?.user?.id ||
    record?.user?.user_id ||
    null
  );
};

const getRecordId = (record) => record?.id;

const getDisplayName = (record, usersById) => {
  const linkedUserId = getLinkedUserId(record);
  const linkedUser = linkedUserId ? usersById[linkedUserId] : null;

  return (
    record?.user?.name ||
    record?.name ||
    linkedUser?.name ||
    record?.user?.email ||
    linkedUser?.email ||
    'Unnamed user'
  );
};

const getDisplayEmail = (record, usersById) => {
  const linkedUserId = getLinkedUserId(record);
  const linkedUser = linkedUserId ? usersById[linkedUserId] : null;

  return record?.user?.email || linkedUser?.email || 'No email';
};

const getDisplayImage = (record, usersById) => {
  const linkedUserId = getLinkedUserId(record);
  const linkedUser = linkedUserId ? usersById[linkedUserId] : null;

  return (
    record?.user?.image ||
    record?.user?.profile_image ||
    record?.user?.avatar ||
    linkedUser?.image ||
    linkedUser?.profile_image ||
    linkedUser?.avatar ||
    null
  );
};

const RoleProfilesPage = ({
  pageTitle,
  pageSubtitle,
  roleName,
  routeBase,
  getProfiles,
  createProfile,
  deleteProfile,
  singularLabel,
  pluralLabel,
}) => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, profilesData] = await Promise.all([
        apiGetUsers().catch(() => []),
        getProfiles().catch(() => []),
      ]);

      setUsers(usersData || []);
      setProfiles(profilesData || []);
    } catch {
      toast.show(`Failed to load ${pluralLabel.toLowerCase()}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [getProfiles, pluralLabel, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const usersById = useMemo(() => {
    const map = {};
    users.forEach((user) => {
      map[user.id] = user;
    });
    return map;
  }, [users]);

  const linkedUserIds = useMemo(() => {
    return new Set(profiles.map((profile) => getLinkedUserId(profile)).filter(Boolean));
  }, [profiles]);

  const roleMatchedUsers = useMemo(() => {
    return users.filter((user) => getRoleName(user) === roleName.toLowerCase());
  }, [users, roleName]);

  const eligibleUsers = useMemo(() => {
    return roleMatchedUsers.filter((user) => !linkedUserIds.has(user.id));
  }, [roleMatchedUsers, linkedUserIds]);

  const missingProfiles = eligibleUsers;

  const handleCreateProfile = async () => {
    if (!selectedUserId) {
      toast.show(`Select a ${singularLabel.toLowerCase()} user first`, 'error');
      return;
    }

    setSubmitting(true);
    try {
      await createProfile({ user_id: Number(selectedUserId) });
      toast.show(`${singularLabel} profile created`, 'success');
      setSelectedUserId('');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.show(err?.response?.data?.detail || `Failed to create ${singularLabel.toLowerCase()} profile`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickCreate = async (userId) => {
    try {
      await createProfile({ user_id: Number(userId) });
      toast.show(`${singularLabel} profile created`, 'success');
      load();
    } catch (err) {
      toast.show(err?.response?.data?.detail || `Failed to create ${singularLabel.toLowerCase()} profile`, 'error');
    }
  };

  const handleDelete = async (profileId) => {
    if (!deleteProfile) return;
    const confirmed = window.confirm(`Are you sure you want to remove this ${singularLabel.toLowerCase()} profile?`);
    if (!confirmed) return;

    setDeletingId(profileId);
    try {
      await deleteProfile(profileId);
      toast.show(`${singularLabel} profile removed`, 'success');
      load();
    } catch (err) {
      toast.show(err?.response?.data?.detail || `Failed to remove ${singularLabel.toLowerCase()} profile`, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-7">
      <PageHeader
        title={pageTitle}
        subtitle={pageSubtitle}
        action={
          <button
            onClick={() => {
              setSelectedUserId('');
              setModalOpen(true);
            }}
            className="btn-primary !rounded-2xl"
          >
            Add {singularLabel}
          </button>
        }
      />

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard label={pluralLabel} value={profiles.length} hint={`Created ${pluralLabel.toLowerCase()} profiles`} />
        <StatCard label="Eligible users" value={roleMatchedUsers.length} hint={`Users with ${roleName} role`} />
        <StatCard label="Missing profiles" value={missingProfiles.length} hint={`Users who still need a ${singularLabel.toLowerCase()} profile`} />
      </div>

      <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-brand-600/20 via-white/5 to-fuchsia-600/10 p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-brand-200 mb-3">Smart linking</p>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-white leading-tight">
          Connect role-based users to real {pluralLabel.toLowerCase()} profiles
        </h2>
        <p className="mt-4 max-w-3xl text-sm md:text-base text-slate-300 leading-7">
          Your backend keeps users separate from {pluralLabel.toLowerCase()} records. That means assigning a role alone is not enough.
          From this page, you can link role-matched users to real {pluralLabel.toLowerCase()} profiles in one place.
        </p>
      </div>

      <div className="grid xl:grid-cols-[0.95fr_1.05fr] gap-6">
        <div className="card p-6 bg-white/[0.04] border-white/10 rounded-[28px]">
          <h3 className="section-title mb-4">Users waiting for {singularLabel.toLowerCase()} profile</h3>

          {missingProfiles.length === 0 ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-300">
              Great — every {roleName} user already has a linked {singularLabel.toLowerCase()} profile.
            </div>
          ) : (
            <div className="space-y-3">
              {missingProfiles.map((user) => {
                const image = getImageUrl(user.image || user.profile_image || user.avatar);

                return (
                  <div key={user.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/5 shrink-0 flex items-center justify-center text-lg font-semibold text-white">
                      {image ? (
                        <img src={image} alt={user.name || user.email} className="w-full h-full object-cover" />
                      ) : (
                        (user.name || user.email || 'U')[0]?.toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{user.name || 'Unnamed user'}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      <p className="text-xs text-amber-300 mt-2">
                        {singularLabel} profile missing
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleQuickCreate(user.id)}
                        className="btn-primary !rounded-2xl !px-4 !py-2 text-sm"
                      >
                        Create
                      </button>
                      <Link
                        to="/users"
                        className="btn-secondary !rounded-2xl !px-4 !py-2 text-sm"
                      >
                        Open user
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-6 bg-white/[0.04] border-white/10 rounded-[28px]">
          <h3 className="section-title mb-4">Existing {pluralLabel.toLowerCase()}</h3>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-slate-400">
              No {pluralLabel.toLowerCase()} found yet.
            </div>
          ) : (
            <div className="space-y-3">
              {profiles.map((profile) => {
                const profileId = getRecordId(profile);
                const displayName = getDisplayName(profile, usersById);
                const email = getDisplayEmail(profile, usersById);
                const image = getImageUrl(getDisplayImage(profile, usersById));
                const linkedUserId = getLinkedUserId(profile);

                return (
                  <div key={profileId} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/5 shrink-0 flex items-center justify-center text-lg font-semibold text-white">
                      {image ? (
                        <img src={image} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        (displayName || email || 'U')[0]?.toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                      <p className="text-xs text-slate-400 truncate">{email}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="badge-gray capitalize">{roleName}</span>
                        <span className="badge-blue">Profile ID: {profileId}</span>
                        {linkedUserId ? <span className="badge-gray">User ID: {linkedUserId}</span> : null}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to="/users"
                        className="btn-secondary !rounded-2xl !px-4 !py-2 text-sm"
                      >
                        Users
                      </Link>
                      {deleteProfile ? (
                        <button
                          onClick={() => handleDelete(profileId)}
                          disabled={deletingId === profileId}
                          className="btn-secondary !rounded-2xl !px-4 !py-2 text-sm"
                        >
                          {deletingId === profileId ? 'Removing...' : 'Remove'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedUserId('');
        }}
        title={`Add ${singularLabel}`}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Select {roleName} user
            </label>
            <select
              className="input-field bg-white text-slate-900"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">Select a user</option>
              {eligibleUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {eligibleUsers.length === 0 ? (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              No available {roleName} users are waiting for a {singularLabel.toLowerCase()} profile.
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setModalOpen(false);
                setSelectedUserId('');
              }}
              className="btn-secondary !rounded-2xl"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateProfile}
              disabled={submitting || !selectedUserId}
              className="btn-primary !rounded-2xl"
            >
              {submitting ? 'Creating...' : `Create ${singularLabel}`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoleProfilesPage;