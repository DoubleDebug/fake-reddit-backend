import axios from 'axios';
import { IMGUR_API_URL } from './constants.ts';

/**
 * Uploads the image to Imgur and returns the URL.
 * Returns null if it fails to authenticate the Imgur client.
 */
export async function uploadToImgur(url: string): Promise<string | null> {
  const clientId = process.env.IMGUR_CLIENT_ID;
  const clientSecret = process.env.IMGUR_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const response = await axios.post(
    IMGUR_API_URL,
    {
      image: url,
      type: 'url',
    },
    {
      headers: {
        Authorization: `Client-ID ${clientId}`,
      },
    }
  );
  return response.data?.data?.link || null;
}
