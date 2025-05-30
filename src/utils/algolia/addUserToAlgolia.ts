import type { ResponseStatus } from '../../types';
import { getAlgoliaClient } from '../algolia/initAlgolia';
import { log } from '../misc/log';

export async function addUserToAlgolia(data: {
  objectID: string;
  name: string;
  photoURL: string;
}): Promise<ResponseStatus> {
  // init Algolia index
  const index = getAlgoliaClient();
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
      indexName: 'users',
      body: {
        objectID: data.objectID,
        name: data.name,
        photoURL: data.photoURL,
      },
    })
    .catch((err: any) => {
      errorMessage += err.message;
    });

  if (!response) {
    log(`Failed to add user to Algolia. ${errorMessage}`, false);
    return {
      success: false,
      message: errorMessage,
    };
  }

  log('Added a user to Algolia.');
  return {
    success: true,
  };
}
