import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    // Instant OTP login is the standard authentication model for Ravenza
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
}
