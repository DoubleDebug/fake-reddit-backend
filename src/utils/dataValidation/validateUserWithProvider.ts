import { ResponseStatus } from '../../types';

export function validateUserWithProvider(data: any): ResponseStatus {
    if (typeof data.id !== 'string')
        return {
            success: false,
            message: 'The user ID is required.',
        };
    if (typeof data.name !== 'string')
        return {
            success: false,
            message: 'The display name is required.',
        };

    return {
        success: true,
    };
}
