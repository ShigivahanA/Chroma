import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, path = '/', type = 'website' }) => {
  const siteName = 'Chroma';
  const baseUrl = 'https://usechroma.vercel.app';
  const fullUrl = `${baseUrl}${path}`;
  const fullTitle = title ? `${title} — ${siteName}` : `${siteName} — Color Palette Generator & Curated Gallery`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={siteName} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};

export default SEO;
