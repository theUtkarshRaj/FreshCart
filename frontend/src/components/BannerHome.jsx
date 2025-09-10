import React from 'react';
import { bannerStyles } from '../assets/dummyStyles';
import { features } from '../assets/Dummy';
import { FiSearch, FiTruck } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import BannerFood from '../assets/banner.png';

const BannerHome = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (typeof onSearch === 'function') {
      onSearch(value.trim().toLowerCase()); // Call onSearch on every input change
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedTerm = searchTerm.trim();
    if (trimmedTerm) {
      navigate(`/items?search=${encodeURIComponent(trimmedTerm)}`);
    } else {
      alert('Please enter a valid search term');
    }
  };

  return (
    <div className='relative overflow-hidden pt-16'>
      {/* BG gradient */}
      <div className={bannerStyles.backgroundGradient}></div>

      {/* Decorative circles */}
      <div className="hidden sm:block absolute top-6 left-6 w-20 h-20 rounded-full bg-teal-100 opacity-30"></div>
      <div className="hidden md:block absolute bottom-12 right-28 w-32 h-32 rounded-full bg-seafoam-200 opacity-30"></div>
      <div className="hidden lg:block absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-mint-200 opacity-30"></div>

      <div className='relative z-10 mt-8 sm:mt-10 lg:mt-12 max-w-7xl mx-auto'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-center'>
          {/* left content */}
          <div className='text-center md:text-left'>
            <div className={bannerStyles.tag}>
              <span className='flex items-center text-sm sm:text-base'>
                <FiTruck className='mr-2' />
                Free delivery on orders over ₹500
              </span>
            </div>

            <h1 className={bannerStyles.heading}>
              Fresh <span className={bannerStyles.headingItalic}>Groceries</span>
              <br /> Delivered to Your Doorstep
            </h1>
            <p className={bannerStyles.paragraph}>
              Discover the freshest produce, top-quality meats, and pantry essentials—all delivered within 30 minutes.
            </p>

            {/* Search form */}
            <form onSubmit={handleSubmit} className={bannerStyles.form}>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search for fruits, vegetables, dairy, meat..."
                className={bannerStyles.input}
                aria-label="Search for groceries"
              />
              <button type="submit" className={bannerStyles.searchButton} aria-label="Search">
                <FiSearch className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </form>

            <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4'>
              {features.map((f, i) => (
                <div key={i} className={bannerStyles.featureItem}>
                  <div className='text-teal-600 mb-1'>{f.icon}</div>
                  <span className={bannerStyles.featureText}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* right image */}
          <div className='relative flex justify-center'>
            <div className={bannerStyles.imageContainer}>
              <div className={bannerStyles.imageInner}>
                <img src={BannerFood} alt="banner image" className='object-cover w-full h-full' />
              </div>
            </div>
            <div className="hidden sm:block absolute -top-4 -right-4 w-20 h-20 rounded-full bg-mint-200 opacity-20"></div>
            <div className="hidden md:block absolute -bottom-4 -left-4 w-28 h-28 rounded-full bg-teal-100 opacity-20"></div>
            <div className="hidden lg:block absolute top-1/4 -left-6 w-20 h-20 rounded-full bg-seafoam-100 opacity-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerHome;