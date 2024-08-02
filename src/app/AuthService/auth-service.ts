import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { getManagementToken, getUserAccessToken } from './getUserAccessToken';

// Interfaces for User Metadata and User Data
export interface UserMetadata {
    firstName: string;
    lastName: string;
}

export interface UserData {
    email: string;
    password: string;
    connection: string;
    email_verified: boolean;
}

// Function to log in with email and password
const loginWithEmailPassword = async (email: string, password: string) => {
    try {
        const response = await axios.post(`https://${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/oauth/token`, {
            grant_type: 'password',
            username: email,
            password: password,
            audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
            client_id: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
            client_secret: process.env.NEXT_PUBLIC_AUTH0_CLIENT_SECRET,
            scope: 'openid profile email',
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const authResult = response.data;
        localStorage.setItem('authResult', JSON.stringify(authResult));
        localStorage.setItem('email', email);
        console.log('result', authResult);

        // Confirm access token is set
        const accessToken = JSON.parse(localStorage.getItem('authResult') || '{}').access_token;
        if (accessToken) {
            console.log('Access token is set:', accessToken);
        } else {
            console.log('Access token is not set');
        }
        return authResult;
    } catch (error: any) {
        if (error.response) {
            console.error('Auth0 login error:', error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }
        throw error;
    }
};

const createUser = async (userData: UserData, token: string) => {
    console.log("token", token);
    console.log("userData", userData);

    try {
        // Step 1: Create the user
        const userResponse = await axios.post(`https://${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/api/v2/users`, userData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return userResponse;
    } catch (error: any) {
        console.error('Error creating user:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getAllUsers = async () => {
    try {
        const authResult = JSON.parse(localStorage.getItem('authResult') || '{}');
        const accessToken = authResult.access_token;

        if (!accessToken) {
            throw new Error('Access token not found');
        }

        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        return response.data;
    } catch (error: any) {
        console.error('Error fetching users:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch users');
    }
};

const changeUserRoleByEmail = async (email: string, newRoleId: string) => {
    try {
        const authResult = JSON.parse(localStorage.getItem('authResult') || '{}');
        const accessToken = authResult.access_token;

        if (!accessToken) {
            throw new Error('Access token not found');
        }

        // Get the management token
        const managementToken = await getManagementToken();

        // Get the current user's details from Auth0
        const currentUserResponse = await axios.get(`https://${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/userinfo`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const currentUser = currentUserResponse.data;

        // Get current user's roles
        const currentRolesResponse = await axios.get(`https://${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/api/v2/users/${currentUser.sub}/roles`, {
            headers: {
                'Authorization': `Bearer ${managementToken}`,
            },
        });

        const currentRoles = currentRolesResponse.data;
        const isAdmin = currentRoles.some((role: any) => role.id === 'rol_6JTZeXdfl5WbJD9w'); // Replace with actual admin role ID

        //   if (!isAdmin) {
        //     alert('You do not have permission to change roles.');
        //     throw new Error('Insufficient permissions');
        //   }

        // Get the user by email from Auth0
        const userResponse = await axios.get(`https://${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/api/v2/users-by-email`, {
            params: { email },
            headers: {
                'Authorization': `Bearer ${managementToken}`,
            },
        });

        const user = userResponse.data[0]; // Assuming the email is unique and returns a single user
        const userId = user.user_id;

        // Get current roles of the user to be updated
        const userRolesResponse = await axios.get(`https://${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/api/v2/users/${userId}/roles`, {
            headers: {
                'Authorization': `Bearer ${managementToken}`,
            },
        });

        const userRoles = userRolesResponse.data;

        // Remove existing roles
        if (userRoles.length > 0) {
            const currentRoleIds = userRoles.map((role: any) => role.id);
            await axios.delete(`https://${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/api/v2/users/${userId}/roles`, {
                data: { roles: currentRoleIds },
                headers: {
                    'Authorization': `Bearer ${managementToken}`,
                    'Content-Type': 'application/json',
                },
            });
        }

        // Assign new role in Auth0
        await axios.post(`https://${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/api/v2/users/${userId}/roles`, {
            roles: [newRoleId],
        }, {
            headers: {
                'Authorization': `Bearer ${managementToken}`,
                'Content-Type': 'application/json',
            },
        });

        // Log values before sending to the backend
        console.log(`Updating user role in backend: sub = ${userId}, isAdmin = ${newRoleId === 'rol_6JTZeXdfl5WbJD9w'}`);

        // Update role in the backend
        await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}/role`, {
            isAdmin: newRoleId === 'rol_6JTZeXdfl5WbJD9w', // Replace with actual role ID for admin
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

    } catch (error: any) {
        console.error('Error changing user role:', error.response ? error.response.data : error.message);
        throw new Error('Failed to change user role');
    }
};

const loginAndSaveUserRole = async (email: string, password: string): Promise<any> => {
    try {
        const authResult = JSON.parse(localStorage.getItem('authResult') || '{}');
        const accessToken = authResult.access_token;

        if (!accessToken) {
            throw new Error('Access token not found');
        }

        // Get the management token
        const managementToken = await getManagementToken();

        console.log('meka wada 1');
        // Step 2: Get user details from Auth0
        const userResponse = await axios.get(`https://${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/userinfo`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        console.log('meka wada 2');
        const userId = userResponse.data.sub;


        // Step 3: Get user's roles from Auth0
        const rolesResponse = await axios.get(`https://${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/api/v2/users/${userId}/roles`, {
            headers: {
                'Authorization': `Bearer ${managementToken}`,
            },
        });
        console.log('meka wada 3');
        const roles = rolesResponse.data;
        if (roles.length > 0) {
            const role = roles[0].name; // Assuming each user has one role
      
            // Convert the role to a boolean value
            const isAdmin = role.toLowerCase() === 'admin';
            console.log('Role:', role); // Log the role name
            console.log('isAdmin (should be boolean):', isAdmin); // Log the isAdmin value
            console.log('Type of isAdmin:', typeof isAdmin); // Log the type of isAdmin to ensure it's a boolean
      
            // Step 4: Save the role in your backend database
            await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}/role`, {
              isAdmin: isAdmin, // Pass the boolean value here
            }, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            });
      
            // Step 5: Return some response, e.g., success message or token
            return { message: 'Login successful', role, isAdmin };
          } else {
            throw new Error('No roles found for the user');
          }
    } catch (error: any) {
        console.error('Error during login:', error.message);
        throw new Error('Login failed');
    }
};




const createUserAndAssignRole = async (userData: UserData, token: string) => {
    console.log("token", token);
    console.log("userData", userData);

    try {
        // Step 1: Create the user
        const userResponse = await axios.post(`https://${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/api/v2/users`, userData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const userId = userResponse.data.user_id;

        // Assign the default role to the user
        //   await axios.post(`https://${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/api/v2/users/${userId}/roles`, {
        //     roles: [process.env.NEXT_PUBLIC_USER_ROLE_ID]
        //   }, {
        //     headers: {
        //       'Authorization': `Bearer ${token}`,
        //       'Content-Type': 'application/json'
        //     }
        //   });

        return userResponse;
    } catch (error: any) {
        console.error('Error creating user or assigning role:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const createNewUserAndAssignRole = async (userData: UserData, roleId: string) => {
    const { getAccessTokenSilently } = useAuth0();
    const token = await getAccessTokenSilently();
    console.log("token", token);
    console.log("userData", userData);

    try {
        // Step 1: Create the user
        const userResponse = await axios.post(`https://${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/api/v2/users`, userData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const userId = userResponse.data.user_id;

        const result = await axios.post(`https://${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/api/v2/users/${userId}/roles`,
            { roles: [roleId] }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('User created:', roleId);

        return result;
    } catch (error: any) {
        console.error('Error creating user or assigning role:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// User role change functions
const getUserByEmail = async (email: string) => {
    const { getAccessTokenSilently } = useAuth0();
    const token = await getAccessTokenSilently();
    try {
        const response = await axios.get(`https://${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/api/v2/users-by-email`, {
            params: { email },
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.data[0]; // Assuming the email is unique and returns a single user
    } catch (error: any) {
        console.error('Error fetching user by email:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const getUserRoles = async (userId: string) => {
    const { getAccessTokenSilently } = useAuth0();
    const token = await getAccessTokenSilently();
    try {
        const response = await axios.get(`https://${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/api/v2/users/${userId}/roles`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.data; // Returns the list of roles assigned to the user
    } catch (error: any) {
        console.error('Error fetching user roles:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const removeUserRoles = async (userId: string, roleIds: string[]) => {
    const { getAccessTokenSilently } = useAuth0();
    const token = await getAccessTokenSilently();
    try {
        await axios.delete(`https://${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/api/v2/users/${userId}/roles`, {
            data: { roles: roleIds },
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
    } catch (error: any) {
        console.error('Error removing user roles:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const assignUserRole = async (userId: string, roleId: string) => {
    const { getAccessTokenSilently } = useAuth0();
    const token = await getAccessTokenSilently();
    try {
        const result = await axios.post(`https://${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/api/v2/users/${userId}/roles`,
            { roles: [roleId] }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return result;
    } catch (error: any) {
        console.error('Error assigning user role:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// const changeUserRoleByEmail = async (email: string, newRoleId: string) => {
//     try {
//         // Step 1: Get the user by email
//         const user = await getUserByEmail(email);

//         if (!user) {
//             throw new Error(`User with email ${email} not found`);
//         }

//         const userId = user.user_id;

//         // Step 2: Get current roles
//         const currentRoles = await getUserRoles(userId);

//         // Step 3: Remove existing roles
//         const currentRoleIds = currentRoles.map((role: any) => role.id);
//         if (currentRoleIds.length > 0) {
//             await removeUserRoles(userId, currentRoleIds);
//         }

//         // Step 4: Assign the new role to the user
//         const result = await assignUserRole(userId, newRoleId);

//         console.log('User role changed:', newRoleId);
//         return result;
//     } catch (error: any) {
//         console.error('Error changing user role:', error.response ? error.response.data : error.message);
//         throw error;
//     }
// };

const changeUserPassword = async (email: string, newPassword: string) => {
    try {
        const { getAccessTokenSilently } = useAuth0();
        const token = await getAccessTokenSilently();
        const user = await getUserByEmail(email);

        if (!user) {
            throw new Error(`User with email ${email} not found`);
        }

        const userId = user.user_id;

        const response = await axios.patch(`https://${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/api/v2/users/${userId}`, {
            password: newPassword,
            connection: "Username-Password-Authentication"
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Password changed successfully for:', email);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            console.error('Auth0 API error:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        throw error;
    }
};

export { loginWithEmailPassword, createUserAndAssignRole, createNewUserAndAssignRole, loginAndSaveUserRole, changeUserRoleByEmail, changeUserPassword, createUser };
