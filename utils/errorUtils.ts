import { AxiosError } from 'axios';

export const errorStatusMessage = (error: AxiosError) => {
  if (error.response && error.response.status) {
    const { status } = error.response;

    switch (status) {
      case 400:
        return 'Your request could not be completed. \nPlease check the required fields and try again.';
      case 401:
        return 'You must be authenticated to complete this action. \nPlease log in and try again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Resource was not found, please check and try again.';
      case 408:
        return 'Request timed out. Please try again';
      case 500:
        return 'An internal server error occurred.';
      default:
        return `An error occurred: ${status}`;
    }
  } else {
    return `An unknown error occurred: ${error.message}`;
  }
};
