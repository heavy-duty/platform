import { HttpErrorResponse } from '@angular/common/http';

export const getErrorMessage = (error: unknown) => {
	if (typeof error === 'string') {
		return error;
	} else if (error instanceof Error) {
		if (error.message.includes('failed to send transaction:')) {
			return error.message.split(': ')[2];
		} else {
			return error.message;
		}
	} else if (error instanceof HttpErrorResponse) {
		return error.error.error;
	} else {
		try {
			console.error(error);
		} catch (error) {
			throw new Error('Console not available');
		}
		return 'Unknown error';
	}
};
