
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getPollinationsUrl } from '../services/geminiService';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'book' | 'article';
  author?: string;
  publishedTime?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  image = 'https://iabooks.com.br/assets/logo.svg', 
  type = 'website',
  author = 'iabooks Community',
  publishedTime
}) => {
  const location = useLocation();
  const url = `https://iabooks.com.br/#${location.pathname}`;

  // Social Networks (WhatsApp, LinkedIn, Twitter) cannot display Base64 images.
  // If the cover is Base64 (Google Generated), we generate a dynamic Pollinations URL 
  // as a proxy for the metadata image, so the link preview still looks good.
  const displayImage = image?.startsWith('data:') 
    ? getPollinationsUrl(`Book cover for ${title} about ${description.substring(0, 50)}`, 1200, 630) 
    : image;

  useEffect(() => {
    // 1. Update Title
    document.title = `${title} | iabooks`;

    // 2. Helper to update meta tags
    const setMeta = (name: string, content: string, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Update Standard Meta
    setMeta('description', description);
    setMeta('author', author);

    // 4. Update Open Graph (Facebook/LinkedIn)
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:image', displayImage, 'property');
    setMeta('og:url', url, 'property');
    setMeta('og:type', type, 'property');

    // 5. Update Twitter
    setMeta('twitter:title', title, 'property');
    setMeta('twitter:description', description, 'property');
    setMeta('twitter:image', displayImage, 'property');

    // 6. JSON-LD Structured Data Injection
    const scriptId = 'json-ld-structured-data';
    const oldScript = document.getElementById(scriptId);
    
    if (oldScript) {
        oldScript.remove(); // Remove old data
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';

    const baseSchema = {
        "@context": "https://schema.org",
        "@type": type === 'book' ? "Book" : "WebSite",
        "name": title,
        "url": url,
        "description": description,
        "image": displayImage,
        "author": {
            "@type": "Person",
            "name": author
        },
        "publisher": {
            "@type": "Organization",
            "name": "iabooks",
            "logo": {
                "@type": "ImageObject",
                "url": "https://iabooks.com.br/assets/logo.svg"
            }
        }
    };
    
    if (type === 'book' && publishedTime) {
        Object.assign(baseSchema, {
            "datePublished": new Date(publishedTime).toISOString(),
            "inLanguage": "pt-BR"
        });
    }

    script.textContent = JSON.stringify(baseSchema);
    document.head.appendChild(script);

  }, [title, description, displayImage, url, type, author]);

  return null;
};

export default SEO;
