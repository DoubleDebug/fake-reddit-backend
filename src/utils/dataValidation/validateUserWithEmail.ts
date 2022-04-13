import { getFirestore } from 'firebase-admin/firestore';
import { ResponseStatus } from '../../types';
import { DB_COLLECTIONS } from '../misc/constants.js';

export async function validateUserWithEmail(
    data: any
): Promise<ResponseStatus> {
    // check for correct types
    if (typeof data.email !== 'string')
        return {
            success: false,
            message: 'The email address is required.',
        };
    if (typeof data.username !== 'string')
        return {
            success: false,
            message: 'The username is required.',
        };
    if (typeof data.password !== 'string')
        return {
            success: false,
            message: 'The password is required.',
        };

    // check for empty fields
    if (data.email === '')
        return {
            success: false,
            message: 'The email address cannot be empty.',
        };

    if (data.username === '')
        return {
            success: false,
            message: 'The username cannot be empty.',
        };

    if (data.password === '')
        return {
            success: false,
            message: 'The password cannot be empty.',
        };

    // check for email format - anything@anything.anything
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        return {
            success: false,
            message: 'The email address is invalid.',
        };

    // check for username format
    // length must be from 3 to 20      -   (?=.{3,20}$)
    // cannot start with a dot          -   (?!\.)
    // cannot have 2 consecutive dots   -   (?!.*?\.\.)
    // can have following characters    -   [a-zA-Z0-9._]
    // cannot end in a dot              -   (?<![.])
    if (
        !/^(?=.{3,20}$)(?!\.)(?!.*?\.\.)[a-zA-Z0-9._]+(?<![.])$/.test(
            data.username
        )
    )
        return {
            success: false,
            message: 'The username is invalid.',
        };

    // check for password format
    // length must be from 5 to 20      -   (?=.{5,20}$)
    // can have following characters    -   [a-zA-Z0-9._ ]
    if (!/^(?=.{5,20}$)[a-zA-Z0-9._ ]+$/.test(data.password))
        return {
            success: false,
            message: 'The password is invalid.',
        };

    // check if username already exists
    const db = getFirestore();
    const usersWithSameUsername = await db
        .collection(DB_COLLECTIONS.USERS)
        .where('username', '==', data.username)
        .get();
    if (!usersWithSameUsername.empty)
        return {
            success: false,
            message: 'The username is already taken.',
        };

    // everything is OK
    return {
        success: true,
    };
}
