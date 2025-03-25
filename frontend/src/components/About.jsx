import { useState, useEffect } from 'react'
import Title from './Title'
import owner from "../assets/owner.jpg"
import about from "../assets/about.png"
import { TbLocation } from 'react-icons/tb'
import { RiSecurePaymentLine, RiSoundModuleLine } from 'react-icons/ri'
import { FaQuoteLeft, FaUsersLine } from 'react-icons/fa6'

const About = () => {
  const [quote, setQuote] = useState("Loading inspirational quote...");
  const [quoteAuthor, setQuoteAuthor] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        // Using ZenQuotes API which provides free access to motivational quotes
        const response = await fetch("https://zenquotes.io/api/random");
        
        if (!response.ok) {
          throw new Error("Failed to fetch quote");
        }
        
        const data = await response.json();
        if (data && data.length > 0) {
          setQuote(data[0].q);
          setQuoteAuthor(data[0].a);
        } else {
          // Fallback quotes if API fails
          const fallbackQuotes = [
            { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
            { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
            { text: "Quality means doing it right when no one is looking.", author: "Henry Ford" },
            { text: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.", author: "Steve Jobs" }
          ];
          const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
          setQuote(randomQuote.text);
          setQuoteAuthor(randomQuote.author);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching quote:", err);
        // Set a default quote if there's an error
        setQuote("Quality printing is not what you pay for, it's what you get.");
        setQuoteAuthor("Arian Printing");
        setLoading(false);
      }
    };

    fetchQuote();
  }, []);

  return (
    <section className='max-padd-container py-16'>
      {/* CONTAINER */}
      <div className='flex flex-col md:flex-row gap-5 gap-y-10'>
        {/* TESTIMONIAL */}
        <div className='flex-1 flexCenter flex-col'>
          <Title title1={'Owners'} title2={"Greetings"} title1Styles={"h3"} titleStyles={'!pb-2'}/>
          <img src={owner} alt="" height={100} width={100} className='rounded-2xl'/>
          <h4 className='h4 mt-6'>Tude Dogen Ne</h4>
          <p className='relative bottom-2'>Owner Of Arian</p>
          <FaQuoteLeft className='text-3xl'/>
          <div className='max-w-[280px] mt-5 text-center'>
            {loading ? (
              <p>Loading inspirational quote...</p>
            ) : (
              <>
                <p className="italic">&ldquo;{quote}&rdquo;</p>
                {quoteAuthor && <p className="text-sm mt-2 font-semibold">— {quoteAuthor}</p>}
              </>
            )}
          </div>
        </div>
        {/* BANNER */}
        <div className='flex-[2] flex rounded-2xl relative'>
          <img src={about} alt="" className='rounded-2xl'/>
          <div className='absolute h-full w-full bg-white/20 top-0 left-0'/>
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 p-6 rounded-xl'>
            <h4 className='bold-18 text-center'>Top view in this <br />
            week</h4>
            <h2 className='h2 uppercase'>Trending</h2>
          </div>
        </div>
      </div>
      {/* FEATURES */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-10'>
        <div className='flexCenter flex-col gap-2'>
          <div className='bg-white p-3 rounded-full'>
            <TbLocation className='text-3xl'/>
          </div>
          <h5 className='h5'>Worldwide Shipping</h5>
          <p className='text-center'>We ship to over 200 countries worldwide</p>
        </div>
        <div className='flexCenter flex-col gap-2'>
          <div className='bg-white p-3 rounded-full'>
            <RiSecurePaymentLine className='text-3xl'/>
          </div>
          <h5 className='h5'>Secure Payment</h5>
          <p className='text-center'>Your payment information is secure</p>
        </div>
        <div className='flexCenter flex-col gap-2'>
          <div className='bg-white p-3 rounded-full'>
            <RiSoundModuleLine className='text-3xl'/>
          </div>
          <h5 className='h5'>Quality Support</h5>
          <p className='text-center'>We ensure our product quality all the time</p>
        </div>
        <div className='flexCenter flex-col gap-2'>
          <div className='bg-white p-3 rounded-full'>
            <FaUsersLine className='text-3xl'/>
          </div>
          <h5 className='h5'>Happy Customer</h5>
          <p className='text-center'>We ensure our product quality all the time</p>
        </div>
      </div>
    </section>
  )
}

export default About