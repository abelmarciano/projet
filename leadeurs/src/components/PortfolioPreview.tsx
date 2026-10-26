import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { TextRevealWords, TextRevealBlur } from "@/components/ui/text-reveal";

// Images
import crmCommercial from "@/assets/portfolio/crm-commercial.png";
import crmRecrutement from "@/assets/portfolio/crm-recrutement.png";
import crmLogistique from "@/assets/portfolio/crm-logistique.png";
import leadsCampagnes from "@/assets/portfolio/leads-campagnes.png";
import landingLed from "@/assets/portfolio/landing-led.png";
import siteLocationLuxe from "@/assets/portfolio/site-location-luxe.png";
import siteFormation from "@/assets/portfolio/site-formation.png";
import leadsSolaire from "@/assets/portfolio/leads-solaire.png";
import campagneLed from "@/assets/portfolio/campagne-led.png";
import campagneSolaire from "@/assets/portfolio/campagne-solaire.png";
import campagneBeaute from "@/assets/portfolio/campagne-beaute.png";
import campagneSeniors from "@/assets/portfolio/campagne-seniors.png";

const projects = [
  {
    title: "CRM Leads, Rendez-vous...",
    category: "CRM sur-mesure",
    description: "CRM commercial complet pour la gestion des leads et rendez-vous dans le secteur solaire.",
    image: crmCommercial,
    gradient: "bg-gradient-to-br from-blue-600/20 to-purple-600/20",
  },
  {
    title: "Campagnes Éclairage LED",
    category: "Ads & Visuels",
    description: "Gestion des campagnes Meta Ads avec création de visuels vidéo pour le secteur LED.",
    image: campagneLed,
    gradient: "bg-gradient-to-br from-yellow-600/20 to-amber-600/20",
  },
  {
    title: "CRM Publicitaire + Automatisations",
    category: "Dashboard & CRM",
    description: "Dashboard publicitaire avec automatisations et suivi des campagnes en temps réel.",
    image: leadsCampagnes,
    gradient: "bg-gradient-to-br from-amber-600/20 to-orange-600/20",
  },
  {
    title: "Campagnes Panneaux Solaires",
    category: "Ads & Visuels",
    description: "Stratégie d'acquisition multi-créatives avec vidéos UGC pour le secteur solaire.",
    image: campagneSolaire,
    gradient: "bg-gradient-to-br from-emerald-600/20 to-teal-600/20",
  },
  {
    title: "Site Web + CRM Led",
    category: "Site + CRM",
    description: "Landing page professionnelle avec CRM intégré pour le secteur de l'éclairage LED.",
    image: landingLed,
    gradient: "bg-gradient-to-br from-green-600/20 to-teal-600/20",
  },
  {
    title: "Campagnes Institut Beauté",
    category: "Ads & Visuels",
    description: "Création de contenus UGC et campagnes Meta pour un institut d'épilation laser.",
    image: campagneBeaute,
    gradient: "bg-gradient-to-br from-pink-600/20 to-rose-600/20",
  },
  {
    title: "Site Web Location Voiture Luxe",
    category: "Site sur-mesure",
    description: "Site premium pour la location de véhicules de luxe avec réservation en ligne.",
    image: siteLocationLuxe,
    gradient: "bg-gradient-to-br from-rose-600/20 to-pink-600/20",
  },
  {
    title: "Campagnes Douches Seniors",
    category: "Ads & Visuels",
    description: "Stratégie publicitaire B2C avec visuels et vidéos pour le marché des seniors.",
    image: campagneSeniors,
    gradient: "bg-gradient-to-br from-sky-600/20 to-blue-600/20",
  },
  {
    title: "Site Web + CRM Solaire",
    category: "Site + CRM",
    description: "Plateforme complète de génération de leads pour le secteur des énergies renouvelables.",
    image: leadsSolaire,
    gradient: "bg-gradient-to-br from-emerald-600/20 to-cyan-600/20",
  },
  {
    title: "CRM Recrutement",
    category: "CRM sur-mesure",
    description: "Système de gestion des candidatures et suivi du processus de recrutement.",
    image: crmRecrutement,
    gradient: "bg-gradient-to-br from-violet-600/20 to-indigo-600/20",
  },
  {
    title: "CRM Logistique",
    category: "CRM sur-mesure",
    description: "Plateforme de gestion logistique avec suivi des livraisons en temps réel.",
    image: crmLogistique,
    gradient: "bg-gradient-to-br from-sky-600/20 to-blue-600/20",
  },
  {
    title: "Site Formation Pro",
    category: "Site sur-mesure",
    description: "Plateforme de formation en ligne avec espace membre et suivi des progressions.",
    image: siteFormation,
    gradient: "bg-gradient-to-br from-fuchsia-600/20 to-purple-600/20",
  },
];

const ProjectCard = ({ project, idx }: { project: typeof projects[0]; idx: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: idx * 0.1 }}
    className="group h-full"
  >
    <div className="card-glow overflow-hidden h-full rounded-2xl">
      {/* Image with gradient background */}
      <div className={`aspect-[4/3] relative overflow-hidden ${project.gradient}`}>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <img
            src={project.image}
            alt={project.title}
            loading="lazy"
            className="w-full h-full object-contain rounded-lg shadow-lg transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <span className="text-xs font-medium text-primary uppercase tracking-wider mb-3 block">
          {project.category}
        </span>
        <h3 className="text-xl font-heading font-semibold mb-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <p className="text-muted-foreground text-sm">
          {project.description}
        </p>
      </div>
    </div>
  </motion.div>
);

const PortfolioPreview = () => {
  return (
    <section className="section-dark section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/[0.08] rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary text-sm font-medium uppercase tracking-widest inline-block"
            >
              Réalisations
            </motion.span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mt-4 mb-4">
              <TextRevealWords>Des projets qui</TextRevealWords>{" "}
              <span className="gradient-text">
                <TextRevealWords delay={0.3}>performent</TextRevealWords>
              </span>
            </h2>
            <TextRevealBlur delay={0.5}>
              <p className="text-muted-foreground text-lg">
                Découvrez comment nous avons aidé nos clients à transformer leur présence digitale
                en véritable machine à générer du business.
              </p>
            </TextRevealBlur>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <Button asChild variant="outline" className="hover-glow border-primary/30 w-fit">
              <Link to="/portfolio" className="flex items-center gap-2">
                Voir tout le portfolio
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Mobile Carousel - 1 item */}
        <div className="md:hidden px-2">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4 py-4">
              {projects.map((project, idx) => (
                <CarouselItem key={project.title} className="pl-4 basis-[85%]">
                  <ProjectCard project={project} idx={idx} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-2 mt-4">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>
        </div>

        {/* Desktop Carousel - 3 items */}
        <div className="hidden md:block">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-6">
              {projects.map((project, idx) => (
                <CarouselItem key={project.title} className="pl-6 md:basis-1/2 lg:basis-1/3">
                  <ProjectCard project={project} idx={idx} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-2 mt-8">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default PortfolioPreview;
