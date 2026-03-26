import React, { useEffect } from 'react';
import EditProfile from './EditProfile';
import { useSelector } from 'react-redux';

const Profile = () => {
  const user = useSelector((store) => store.user);
  const company = useSelector((store) => store.company);

  // Log the Redux store state for debugging
  useEffect(() => {
    console.log('User:', user);
    console.log('Company:', company);
  }, [user, company]);

  // Ensure both user and company have correct data
  if (!user && !company) {
    return <div>You are not logged in.</div>;
  }

  return (
    <div>
      {user && user.role === 'user' && (
        <EditProfile user={user} role="user" />
      )}
      {company && company.role === 'company' && (
        <EditProfile user={company} role="company" />
      )}
    </div>
  );
};

export default Profile;
