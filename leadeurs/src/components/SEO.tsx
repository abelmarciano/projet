import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: object;
}

const SEO = ({
  title,
  description,
  keywords,
  canonical,
  ogImage = "https://leadeurs.fr/og-image.jpg",
  ogType = "website",
  structuredData
}: SEOProps) => {
  const siteName = "Leadeurs";
  const fullTitle = `${title} | ${siteName}`;
  const baseUrl = "https://leadeurs.fr";

  return (
    <Helmet>
      {/* Base Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="Leadeurs" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={`${baseUrl}${canonical}`} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      {canonical && <meta property="og:url" content={`${baseUrl}${canonical}`} />}
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Additional SEO */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="geo.region" content="FR" />
      <meta name="geo.placename" content="France" />
      <meta name="language" content="French" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

// Données structurées de l'organisation
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Leadeurs",
  "description": "Agence digitale spécialisée dans la création de sites web sur-mesure, CRM, génération de leads BtoC et publicité digitale.",
  "url": "https://leadeurs.fr",
  "logo": "https://leadeurs.fr/logo.png",
  "sameAs": [
    "https://www.linkedin.com/company/leadeurs",
    "https://www.instagram.com/leadeurs"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "sales",
    "availableLanguage": "French"
  },
  "areaServed": {
    "@type": "Country",
    "name": "France"
  }
};

// Données structurées pour les services
export const createServiceSchema = (
  name: string,
  description: string,
  url: string
) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": name,
  "description": description,
  "provider": {
    "@type": "Organization",
    "name": "Leadeurs",
    "url": "https://leadeurs.fr"
  },
  "url": `https://leadeurs.fr${url}`,
  "areaServed": {
    "@type": "Country",
    "name": "France"
  }
});

// FAQ Schema
export const createFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// Breadcrumb Schema
export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": `https://leadeurs.fr${item.url}`
  }))
});

export default SEO;
