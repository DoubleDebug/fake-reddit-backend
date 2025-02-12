import { getAuth } from 'firebase-admin/auth';
import type { ResponseStatusWithData } from '../../types';
import { validateEmail, validatePassword } from './validateUserWithEmail';

export async function validateAccountData(
  uid: string,
  data: {
    email: string | undefined;
    emailVerified?: boolean;
    password: string | undefined;
    displayName: string | undefined;
    photoURL: string | undefined;
  }
): Promise<ResponseStatusWithData> {
  if (data.email) {
    const v_email = validateEmail(data.email);
    if (!v_email.success) return v_email;
    data.emailVerified = false;
  } else {
    delete data.email;
  }
  if (data.password) {
    const v_pass = validatePassword(data.password);
    if (!v_pass.success) return v_pass;
  } else {
    delete data.password;
  }
  if (!data.displayName) {
    delete data.displayName;
  }
  if (!data.photoURL) {
    delete data.photoURL;
  }

  // check if any of the fields DON'T NEED to be updated
  // because they are the same
  const userData = await getAuth().getUser(uid);
  if (userData.email === data.email) {
    delete data.email;
    data.emailVerified !== undefined && delete data.emailVerified;
  }
  if (userData.displayName === data.displayName) {
    delete data.displayName;
  }
  if (userData.photoURL === data.photoURL) {
    delete data.photoURL;
  }

  // check if there's nothing left to be updated
  if (Object.keys(data).length === 0)
    return {
      success: false,
      message: `Nothing to update.`,
    };

  return {
    success: true,
    data: data,
  };
}
