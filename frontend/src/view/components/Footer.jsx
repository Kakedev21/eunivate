import React from 'react';
import { webinar1, webinar2, webinar3 } from '../../constants/assets';
import { FaArrowUp } from 'react-icons/fa';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-16 px-1 lg:px-20 relative">
      <h3 className="text-2xl font-bold p-4 text-left">
        Our Recent Blog
      </h3>
      
      <div className="flex flex-col lg:flex-row items-start mt-4 gap-4">
        <div className="flex flex-col gap-4 w-full lg:w-1/2">
          {/* Webinar 3 */}
          <div className="flex flex-col lg:flex-row items-start gap-4 w-full order-1 lg:order-none">
            <div className="relative w-full lg:w-1/2 aspect-w-1 aspect-h-1">
              <img 
                src={webinar3} 
                alt="Blog Image 1" 
                className="object-cover w-full h-full"
              />
            </div>
            <div className="text-left w-full lg:w-1/2">
              <h3 className="text-red-500 font-bold text-[16px]">November 16, 2014</h3>
              <h3 className="font-bold text-lg mt-2">Webinar</h3>
              <p className="text-gray-400">
                Delight can be experienced <span className="block ">viscerally, behaviourally, and</span>
                <span className="block">reflectively. A great design is ...</span>
              </p>
            </div>
          </div>

          {/* Webinar 1 */}
          <div className="flex flex-col lg:flex-row items-start gap-4 mt-4 w-full order-3 lg:order-none lg:mt-4">
            <div className="relative w-full lg:w-1/2 aspect-w-1 aspect-h-1">
              <img 
                src={webinar1} 
                alt="Blog Image 2" 
                className="object-cover w-full h-full"
              />
            </div>
            <div className="text-left w-full lg:w-1/2">
              <h3 className="text-red-500 font-bold text-[16px]">September 24, 2017</h3>
              <h3 className="font-bold text-lg mt-2">Webinar</h3>
              <p className="text-gray-400">
                Visual-design principles can be  
                <span className="block">applied consistently throughout</span>
                <span className="block">the process of creating a </span>
                <span className="block">polished UX map... </span>
              </p>
            </div>
          </div>
        </div>

        {/* Webinar 2 */}
        <div className="flex flex-col items-start w-full lg:w-1/2 mt-1 order-2 lg:order-none">
          <div className="relative w-full aspect-w-1 aspect-h-1">
            <img 
              src={webinar2} 
              alt="Blog Image 3" 
              className="object-cover w-full h-full" 
            />
          </div>
          
          <div className="mt-4 text-left">
            <h4 className="text-red-500 font-bold text-[16px]">March 13, 2014</h4>
            <h3 className="font-bold text-lg mt-2">Startup Competition</h3>
            <p className="text-gray-400">
              Agile methods aim to overcome usability barriers in traditional development, but post new threats to user experience quality. 
            </p>
          </div>
        </div>
      </div>

      <div className="absolute right-4 bottom-4">
        <button 
          onClick={scrollToTop} 
          className="flex items-center justify-center border-4 border-red-500 bg-white text-red-500 rounded-full w-11 h-11 shadow-lg hover:bg-red-500 hover:text-white transition-colors"
        >
          <FaArrowUp className="text-xl" />
        </button>
      </div>

      {/* Mobile styles */}
      <style jsx>{`
        @media (max-width: 640px) {
          .flex-col {
            display: flex;
            flex-direction: column;
          }
          .lg\:flex-row {
            display: none; /* Hide the row layout on mobile */
          }
          .order-1, .order-3 {
            order: 1; /* Make Webinar 3 and 1 come first */
          }
          .order-2 {
            order: 2; /* Center Webinar 2 in the order */
            margin: 0 auto; /* Center it */
          }
        }
      `}</style>
    </section>
  );
}

export default Footer;
