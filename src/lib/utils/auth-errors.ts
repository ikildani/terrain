/**
 * Maps raw Supabase auth error messages to user-friendly text.
 * Used across all auth pages (login, signup, reset-password, update-password).
 */
export function getFriendlyAuthError(message: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': 'Incorrect email or password. Please try again or reset your password.',
    'Email not confirmed':
      'Please verify your email address before signing in. Check your inbox for a confirmation link.',
    'User already registered': 'An account with this email already exists. Try signing in instead.',
    'Signup requires a valid password': 'Please enter a password with at least 8 characters.',
    'Email rate limit exceeded': 'Too many attempts. Please wait a few minutes and try again.',
    'For security purposes, you can only request this after': 'Please wait before requesting another email.',
    'New password should be different from the old password':
      'Your new password must be different from your current password.',
    'Password should be at least': 'Please enter a password with at least 8 characters.',
    'Unable to validate email address': 'Please enter a valid email address.',
  };

  for (const [key, friendly] of Object.entries(map)) {
    if (message.includes(key)) return friendly;
  }
  return message; // fallback to original
}
