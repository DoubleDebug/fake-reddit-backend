import algoliasearch, { SearchIndex } from 'algoliasearch';

/**
 * Initializes Algolia client
 * and returns the index identified with the 'indexName' parameter
 */
export function initAlgolia(indexName: string): SearchIndex | null {
    const APP_ID = process.env.ALGOLIA_APP_ID;
    const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
    if (!APP_ID || !ADMIN_KEY) return null;

    const client = algoliasearch(APP_ID, ADMIN_KEY);
    return client.initIndex(indexName);
}
