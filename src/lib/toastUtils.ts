import { ToastType } from '@/components/ToastContainer';

export interface ToastConfig {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export const toastMessages = {
  // Success messages
  createSuccess: (item: string) => ({
    type: 'success' as ToastType,
    title: `${item} Created`,
    message: `New ${item.toLowerCase()} has been created successfully!`,
  }),
  
  updateSuccess: (item: string) => ({
    type: 'success' as ToastType,
    title: `${item} Updated`,
    message: `${item} has been updated successfully!`,
  }),
  
  deleteSuccess: (item: string) => ({
    type: 'success' as ToastType,
    title: `${item} Deleted`,
    message: `${item} has been deleted successfully!`,
  }),
  
  assignSuccess: (item: string) => ({
    type: 'success' as ToastType,
    title: `${item} Assigned`,
    message: `${item} has been assigned successfully!`,
  }),
  
  loginSuccess: {
    type: 'success' as ToastType,
    title: 'Login Successful',
    message: 'Welcome back!',
  },
  
  registerSuccess: {
    type: 'success' as ToastType,
    title: 'Registration Successful',
    message: 'Account created successfully!',
  },
  
  statusUpdateSuccess: (status: string) => ({
    type: 'success' as ToastType,
    title: 'Status Updated',
    message: `Status updated to ${status}`,
  }),
  
  // Error messages
  createError: (item: string) => ({
    type: 'error' as ToastType,
    title: 'Create Failed',
    message: `Failed to create ${item.toLowerCase()}. Please try again.`,
  }),
  
  updateError: (item: string) => ({
    type: 'error' as ToastType,
    title: 'Update Failed',
    message: `Failed to update ${item.toLowerCase()}. Please try again.`,
  }),
  
  deleteError: (item: string) => ({
    type: 'error' as ToastType,
    title: 'Delete Failed',
    message: `Failed to delete ${item.toLowerCase()}. Please try again.`,
  }),
  
  assignError: (item: string) => ({
    type: 'error' as ToastType,
    title: 'Assignment Failed',
    message: `Failed to assign ${item.toLowerCase()}. Please try again.`,
  }),
  
  loginError: (message: string) => ({
    type: 'error' as ToastType,
    title: 'Login Failed',
    message,
  }),
  
  registerError: (message: string) => ({
    type: 'error' as ToastType,
    title: 'Registration Failed',
    message,
  }),
  
  validationError: (message: string) => ({
    type: 'error' as ToastType,
    title: 'Validation Error',
    message,
  }),
  
  // Warning messages
  confirmationRequired: (action: string) => ({
    type: 'warning' as ToastType,
    title: 'Confirmation Required',
    message: `Please confirm that you want to ${action}.`,
  }),
  
  // Info messages
  loading: (action: string) => ({
    type: 'info' as ToastType,
    title: 'Processing',
    message: `${action} in progress...`,
  }),
}; 