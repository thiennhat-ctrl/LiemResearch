const AUTH_MESSAGE_TRANSLATIONS: Record<string, string> = {
  'Account created successfully. Please login.': 'Account created successfully. Please sign in.',
  'Email is required.': 'Please enter your email.',
  'Please enter a valid email address.': 'Please enter a valid email address.',
  'Invalid email format': 'Invalid email format.',
  'Password is required.': 'Please enter your password.',
  'Login failed': 'Login failed.',
  'Email and password are required': 'Please enter your email and password.',
  'Invalid email or password': 'Invalid email or password.',
  'Your account has been banned': 'Your account has been banned.',
  'Missing required fields': 'Please fill in all required fields.',
  'Please enter your full name': 'Please enter your full name.',
  'Full name contains invalid characters': 'Full name contains invalid characters.',
  'Please select your university.': 'Please select your university.',
  'Please choose a university from the list.': 'Please choose a university from the list.',
  'Passwords do not match': 'Passwords do not match.',
  'Email already exists': 'This email is already in use.',
  'Register failed': 'Registration failed.',
};

export function translateAuthMessage(message: string) {
  return AUTH_MESSAGE_TRANSLATIONS[message] || message;
}
