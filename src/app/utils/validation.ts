import { 
  SignInFormData, 
  SignInFormErrors, 
  SignUpFormData, 
  SignUpFormErrors,
  ResetPasswordFormData,
  ResetPasswordFormErrors,
  UpdatePasswordFormData,
  UpdatePasswordFormErrors,
  ProfileFormData,
  ProfileFormErrors
} from '@/app/types/auth';

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

export function validateStrongPassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  return { isValid: true };
}

export function validateUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateSignInForm(data: SignInFormData): SignInFormErrors {
  const errors: SignInFormErrors = {};

  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else if (!validatePassword(data.password)) {
    errors.password = 'Password must be at least 6 characters long';
  }

  return errors;
}

export function validateSignUpForm(data: SignUpFormData): SignUpFormErrors {
  const errors: SignUpFormErrors = {};

  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else {
    const passwordValidation = validateStrongPassword(data.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
    }
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (data.firstName && data.firstName.length < 2) {
    errors.firstName = 'First name must be at least 2 characters long';
  }

  if (data.lastName && data.lastName.length < 2) {
    errors.lastName = 'Last name must be at least 2 characters long';
  }

  return errors;
}

export function validateResetPasswordForm(data: ResetPasswordFormData): ResetPasswordFormErrors {
  const errors: ResetPasswordFormErrors = {};

  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  return errors;
}

export function validateUpdatePasswordForm(data: UpdatePasswordFormData): UpdatePasswordFormErrors {
  const errors: UpdatePasswordFormErrors = {};

  if (!data.currentPassword) {
    errors.currentPassword = 'Current password is required';
  }

  if (!data.newPassword) {
    errors.newPassword = 'New password is required';
  } else {
    const passwordValidation = validateStrongPassword(data.newPassword);
    if (!passwordValidation.isValid) {
      errors.newPassword = passwordValidation.message;
    }
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password';
  } else if (data.newPassword !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (data.currentPassword === data.newPassword) {
    errors.newPassword = 'New password must be different from current password';
  }

  return errors;
}

export function validateProfileForm(data: ProfileFormData): ProfileFormErrors {
  const errors: ProfileFormErrors = {};

  if (data.firstName && data.firstName.length < 2) {
    errors.firstName = 'First name must be at least 2 characters long';
  }

  if (data.lastName && data.lastName.length < 2) {
    errors.lastName = 'Last name must be at least 2 characters long';
  }

  if (data.username && !validateUsername(data.username)) {
    errors.username = 'Username must be 3-20 characters and contain only letters, numbers, and underscores';
  }

  if (data.website && !validateUrl(data.website)) {
    errors.website = 'Please enter a valid URL';
  }

  if (data.bio && data.bio.length > 500) {
    errors.bio = 'Bio must be less than 500 characters';
  }

  return errors;
}

export function hasValidationErrors(errors: Record<string, any>): boolean {
  return Object.keys(errors).length > 0;
}
