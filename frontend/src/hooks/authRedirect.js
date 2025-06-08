// hooks/authRedirect.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const authRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('authToken');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);
};

export default authRedirect;
