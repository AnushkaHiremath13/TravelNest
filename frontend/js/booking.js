document.addEventListener('DOMContentLoaded', function() {
    const resort = JSON.parse(localStorage.getItem('selectedResort'));
    const bookingData = JSON.parse(localStorage.getItem('bookingDetails'));
  
    if (!resort || !bookingData) {
      alert('Booking data missing! Please search again.');
      window.location.href = 'search.html';
      return;
    }
  
    document.getElementById('resort-name').textContent = resort.name;
    document.getElementById('resort-location').textContent = resort.location;
    document.getElementById('resort-img').src = resort.photos[0];
  
    document.getElementById('checkin').textContent = bookingData.checkin;
    document.getElementById('checkout').textContent = bookingData.checkout;
    document.getElementById('guests').textContent = `${bookingData.guests} guests`;
    document.getElementById('rooms').textContent = `${bookingData.rooms} room(s)`;
  
    document.getElementById('price').textContent = `₹${resort.price}`;
  
    // Calculate total price
    const checkinDate = new Date(bookingData.checkin);
    const checkoutDate = new Date(bookingData.checkout);
    const nights = Math.round((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
    const total = nights * resort.price * bookingData.rooms;
  
    document.getElementById('total-price').textContent = total;
    
  });
      