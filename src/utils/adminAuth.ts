export interface AdminCredentials {
  email: string;
  passwordHash: string;
  updatedAt: string;
}

const STORAGE_KEY = 'afriversity_admin_credentials';
const DEFAULT_ADMIN_EMAIL = 'admin@afriversity.org';
const DEFAULT_ADMIN_PASSWORD = 'password123';

export const getAdminCredentials = (): AdminCredentials => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.email && parsed.passwordHash) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read admin credentials', e);
  }

  return {
    email: DEFAULT_ADMIN_EMAIL,
    passwordHash: DEFAULT_ADMIN_PASSWORD,
    updatedAt: new Date().toISOString()
  };
};

export const updateAdminCredentials = (newEmail: string, newPassword: string): boolean => {
  try {
    const creds: AdminCredentials = {
      email: newEmail.trim().toLowerCase(),
      passwordHash: newPassword,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
    return true;
  } catch (e) {
    console.error('Failed to update admin credentials', e);
    return false;
  }
};

export const changeAdminPassword = (currentPassword: string, newPassword: string): { success: boolean; message: string } => {
  const current = getAdminCredentials();
  if (current.passwordHash !== currentPassword) {
    return { success: false, message: 'Current password does not match our records.' };
  }
  if (!newPassword || newPassword.length < 6) {
    return { success: false, message: 'New password must be at least 6 characters long.' };
  }
  const success = updateAdminCredentials(current.email, newPassword);
  if (success) {
    return { success: true, message: 'Administrator password changed successfully!' };
  }
  return { success: false, message: 'Could not update password. Please try again.' };
};

export const verifyAdminCredentials = (inputEmail: string, inputPassword: string): boolean => {
  const current = getAdminCredentials();
  return (
    current.email.toLowerCase() === inputEmail.trim().toLowerCase() &&
    current.passwordHash === inputPassword
  );
};
