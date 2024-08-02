import axios from 'axios';

export const getManagementToken = async (): Promise<string> => {
  try {
    const response = await axios.post(`https://${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/oauth/token`, {
      client_id: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
      client_secret: process.env.NEXT_PUBLIC_AUTH0_CLIENT_SECRET,
      audience: `https://${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/api/v2/`,
      grant_type: 'client_credentials'
    });

    console.log('11111Token', response.data.access_token);
    return response.data.access_token;
  } catch (error: any) {
    console.error('Error getting management token:', error.response ? error.response.data : error.message);
    throw new Error('Failed to get management token');
  }
};

export const getUserAccessToken = async (email: string, password: string): Promise<string> => {
  try {
    const response = await axios.post(`https://${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/oauth/token`, {
      grant_type: 'password',
      username: email,
      password: password,
      audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
      client_id: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
      client_secret: process.env.NEXT_PUBLIC_AUTH0_CLIENT_SECRET,
    });

    return response.data.access_token;
  } catch (error: any) {
    console.error('Error getting user access token:', error.response ? error.response.data : error.message);
    throw new Error('Failed to get user access token');
  }
};
