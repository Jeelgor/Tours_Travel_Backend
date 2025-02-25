const handleBooking = async (bookingData) => {
  try {
    const token = localStorage.getItem('token'); // Get token from localStorage
    
    if (!token) {
      // Redirect to login if no token
      navigate('/login');
      return;
    }

    const response = await axios.post('http://localhost:3000/api/book', bookingData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      // Handle successful booking
      console.log('Booking successful:', response.data);
    }
  } catch (error) {
    console.error('Booking error:', error.response?.data || error.message);
  }
}; 