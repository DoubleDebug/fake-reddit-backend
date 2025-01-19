import { algoliasearch } from 'algoliasearch';
import type { Algoliasearch } from 'algoliasearch';

/**
 * Initializes Algolia client
 * and returns the index identified with the 'indexName' parameter
 */
export function getAlgoliaClient(): Algoliasearch | null {
  const APP_ID = process.env.ALGOLIA_APP_ID;
  const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
  if (!APP_ID || !ADMIN_KEY) return null;

  return algoliasearch(APP_ID, ADMIN_KEY);
}
