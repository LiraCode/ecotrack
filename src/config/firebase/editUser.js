// User Actions
import { updateProfile } from 'firebase/auth';
import { auth } from './firebase';

const updateCurrentUser = async (displayName, photoURL) => {
  if (auth.currentUser) {
    try {
      await updateProfile(auth.currentUser, {
        displayName,
        photoURL,
      });
      console.log('User profile updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  } else {
    console.error('No user is currently signed in');
    return false;
  }
};

export default updateCurrentUser;