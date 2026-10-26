import { motion } from "framer-motion";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LeadsVerticals from "@/components/LeadsVerticals";
import HowItWorks from "@/components/HowItWorks";
import Guarantees from "@/components/Guarantees";
import HomepageDevis from "@/components/HomepageDevis";
import CRMShowcase from "@/components/CRMShowcase";
import PortfolioPreview from "@/components/PortfolioPreview";
import TestimonialsNew from "@/components/TestimonialsNew";
import FAQNew from "@/components/FAQNew";
import CTANew from "@/components/CTANew";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import CurtainReveal from "@/components/CurtainReveal";
import SEO, { organizationSchema } from "@/components/SEO";
import CursorGlow from "@/components/CursorGlow";
import ScrollProgress from "@/components/ScrollProgress";

const Index = () => {
  const homeStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema,
      {
        "@type": "WebPage",
        "@id": "https://leadeurs.fr/#webpage",
        "url": "https://leadeurs.fr",
        "name": "Leadeurs | Vente de Leads Qualifiés & CRM Sur-Mesure",
        "description": "Leadeurs vend des leads qualifiés B2C/B2B et développe des CRM personnalisés.",
        "isPartOf": { "@id": "https://leadeurs.fr/#website" },
        "about": { "@id": "https://leadeurs.fr/#organization" },
        "inLanguage": "fr-FR"
      }
    ]
  };

  return (
    <CurtainReveal>
      {(animationReady) => (
        <>
          <CursorGlow />
          <ScrollProgress />
          <SEO
            title="Achat de Leads Qualifiés & CRM Sur-Mesure | Leadeurs"
            description="Achetez des leads qualifiés et exclusifs : photovoltaïque, isolation, PAC, LED. Livraison en temps réel + CRM personnalisé. Demandez votre devis gratuit."
            keywords="achat leads, vente leads qualifiés, leads exclusifs, CRM sur-mesure, leads photovoltaïque, leads isolation, leads PAC, agence leads"
            canonical="/"
            structuredData={homeStructuredData}
          />
          <motion.div
            className="min-h-screen bg-background relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Header />
            <main>
              <Hero animationReady={animationReady} />
              <LeadsVerticals />
              <HowItWorks />
              <Guarantees />
              <HomepageDevis />
              <CRMShowcase />
              <PortfolioPreview />
              <TestimonialsNew />
              <FAQNew />
              <CTANew />
            </main>
            <Footer />
            <ScrollToTop />
          </motion.div>
        </>
      )}
    </CurtainReveal>
  );
};

export default Index;
