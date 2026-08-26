import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

import axios from 'axios';


const AuthContext = createContext(null);


// FASTAPI BACKEND
const API = 'http://127.0.0.1:8000';


export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const [token, setToken] = useState(null);

  const [loading, setLoading] = useState(true);


  // RESTORE SESSION
  useEffect(() => {

    const savedToken = localStorage.getItem(
      'drishti_auth_token'
    );

    const savedUser = localStorage.getItem(
      'drishti_auth_user'
    );


    if (savedToken) {

      setToken(savedToken);

      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${savedToken}`;

    }


    if (savedUser) {

      try {

        setUser(
          JSON.parse(savedUser)
        );

      } catch (error) {

        localStorage.removeItem(
          'drishti_auth_user'
        );

      }

    }


    setLoading(false);

  }, []);


  // LOGIN
  const login = async (
    username,
    password
  ) => {

    try {

      const formData = new URLSearchParams();

      formData.append(
        'username',
        username.trim()
      );

      formData.append(
        'password',
        password
      );


      const response = await axios.post(

        `${API}/auth/login`,

        formData,

        {
          headers: {
            'Content-Type':
              'application/x-www-form-urlencoded'
          }
        }

      );


      const accessToken =
        response.data.access_token;


      if (!accessToken) {

        return {
          success: false,
          message:
            'Invalid server response'
        };

      }


      const loggedInUser = {

        username: username,

        role: 'COMMAND_ADMIN'

      };


      // SAVE TOKEN
      setToken(accessToken);

      setUser(loggedInUser);


      localStorage.setItem(
        'drishti_auth_token',
        accessToken
      );


      localStorage.setItem(
        'drishti_auth_user',
        JSON.stringify(loggedInUser)
      );


      // ADD TOKEN TO FUTURE REQUESTS
      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${accessToken}`;


      return {
        success: true
      };


    } catch (err) {

      console.error(
        'Login error:',
        err
      );


      return {

        success: false,

        message:

          err.response?.data?.detail ||

          'Authentication failed. Please check credentials.'

      };

    }

  };


  // LOGOUT
  const logout = () => {

    setUser(null);

    setToken(null);


    localStorage.removeItem(
      'drishti_auth_token'
    );

    localStorage.removeItem(
      'drishti_auth_user'
    );


    delete axios.defaults.headers.common[
      'Authorization'
    ];

  };


  return (

    <AuthContext.Provider

      value={{

        user,

        token,

        loading,

        login,

        logout,

        isAuthenticated: !!token

      }}

    >

      {children}

    </AuthContext.Provider>

  );

};


export const useAuth = () => {

  const context = useContext(AuthContext);


  if (!context) {

    throw new Error(

      'useAuth must be used within an AuthProvider'

    );

  }


  return context;

};