import { useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaDribbble, FaFacebookF, FaInstagram } from 'react-icons/fa6';

const NewsLetter = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !email.includes('@') || !email.includes('.')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    
    try {
      // Send subscription to backend API
      const response = await api.post('/api/subscribers', { email });
      
      console.log('Subscription response:', response.data);
      
      // Show success message
      toast.success(response.data.message || 'Thank you for subscribing to our newsletter!');
      
      // Clear the input
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      
      // Show error message from API if available, otherwise show generic message
      const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again later.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='max-padd-container border-t-[1px] border-b-[1px] border-primary py-4'>
      <div className='flexBetween flex-wrap gap-7'>
        <div>
          <h4 className='bold-14 uppercase tracking-wider'>Subscribe newsletter</h4>
          <p>Get latest information on Events, Sales & Offers.</p>
        </div>
        <div>
          <form onSubmit={handleSubmit} className='flex bg-primary'>
            <input 
              type="email" 
              placeholder='Email Address' 
              className='p-4 bg-primary w-[266px] outline-none text-[13px]'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button 
              type="submit"
              className='btn-dark !rounded-none !text-[13px] !font-bold uppercase'
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
        <div className='flex gap-x-3 pr-14'>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className='h-8 w-8 rounded-full hover:bg-tertiary hover:text-white flexCenter transition-all duration-500'>
            <FaFacebookF />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className='h-8 w-8 rounded-full hover:bg-tertiary hover:text-white flexCenter transition-all duration-500'>
            <FaInstagram />
          </a>
          <a href="https://dribbble.com" target="_blank" rel="noopener noreferrer" className='h-8 w-8 rounded-full hover:bg-tertiary hover:text-white flexCenter transition-all duration-500'>
            <FaDribbble />
          </a>
        </div>
      </div>
    </section>
  )
}

export default NewsLetter