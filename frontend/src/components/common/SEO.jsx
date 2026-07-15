import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url, type = 'website' }) => {
  const siteName = 'The Trav Story';
  const defaultTitle = "The Trav Story | India's First AI-Powered Unified Travel Platform";
  const defaultDescription = "Discover The Trav Story, India's first AI-powered unified travel platform. Compare flights, generate persona-driven AI itineraries, and manage bookings.";
  
  const seo = {
    title: title ? `${title} | ${siteName}` : defaultTitle,
    description: description || defaultDescription,
    image: image || '/vite.svg',
    url: url ? `https://thetravstory.com${url}` : 'https://thetravstory.com/',
  };

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph / Facebook tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={siteName} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      
      {/* Canonical Link */}
      <link rel="canonical" href={seo.url} />
    </Helmet>
  );
};

export default SEO;
