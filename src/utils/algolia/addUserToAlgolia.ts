import { ResponseStatus } from '../../types';
import { initAlgolia } from '../algolia/initAlgolia.js';
import { log } from '../misc/log.js';

export async function addUserToAlgolia(data: {
    objectID: string;
    name: string;
    photoURL: string;
}): Promise<ResponseStatus> {
    // init Algolia index
    const index = initAlgolia('users');
    if (!index) {
        const errorMessage = 'Failed to initialize Algolia client.';
        log(errorMessage, false);
        return {
            success: false,
            message: errorMessage,
        };
    }

    // add user to Algolia
    let errorMessage = '';
    const response = await index
        .saveObject({
            objectID: data.objectID,
            name: data.name,
            photoURL: data.photoURL,
        })
        .catch((err) => {
            errorMessage += err.message;
        });

    if (!response) {
        log(`Failed to add user to Algolia. ${errorMessage}`, false);
        return {
            success: false,
            message: errorMessage,
        };
    }

    log('Added user to Algolia.');
    return {
        success: true,
    };
}
