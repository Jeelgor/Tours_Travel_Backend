const handleLogin = async (loginData) => {
  try {
    const response = await axios.post('http://localhost:3000/Auth/users/loginuser', loginData);
    
    if (response.data.token) {
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      // Navigate to desired page
      navigate('/dashboard');
    }
  } catch (error) {
    console.error('Login error:', error);
  }
}; 