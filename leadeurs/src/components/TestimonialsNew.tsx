import { motion } from "framer-motion";
import { Star, Quote, ExternalLink } from "lucide-react";
import TextReveal from "@/components/TextReveal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const testimonials = [
  {
    name: "Thomas R.",
    role: "Gérant — Société d'installation solaire",
    content: "On reçoit des leads photovoltaïque exclusifs chaque jour. Le taux de conversion est bien au-dessus de ce qu'on avait avant avec d'autres fournisseurs. Ça a changé notre business.",
    rating: 5,
  },
  {
    name: "Nadia K.",
    role: "Directrice commerciale — Rénovation énergétique",
    content: "Le CRM développé par Leadeurs est exactement ce qu'il nous fallait. Plus besoin de jongler entre 5 outils. Tout est centralisé, automatisé, et adapté à notre process.",
    rating: 5,
  },
  {
    name: "Marc D.",
    role: "Fondateur — Agence immobilière",
    content: "Des leads qualifiés, un CRM sur-mesure, et un accompagnement au top. En 3 mois, on a doublé notre nombre de rendez-vous commerciaux. Je recommande à 100%.",
    rating: 5,
  },
];

const TestimonialCard = ({ testimonial, idx }: { testimonial: typeof testimonials[0]; idx: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: idx * 0.1 }}
    className="card-premium p-7 md:p-8 relative h-full"
  >
    <Quote className="w-8 h-8 text-primary/15 absolute top-6 right-6" />

    <div className="flex gap-0.5 mb-5">
      {[...Array(testimonial.rating)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
      ))}
    </div>

    <p className="text-foreground/90 leading-relaxed mb-6 text-[15px]">
      "{testimonial.content}"
    </p>

    <div className="flex items-center gap-3 pt-4 border-t border-border/50">
      <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
        <span className="text-primary font-bold text-sm">{testimonial.name[0]}</span>
      </div>
      <div>
        <div className="font-semibold text-sm">{testimonial.name}</div>
        <div className="text-xs text-muted-foreground">{testimonial.role}</div>
      </div>
    </div>
  </motion.div>
);

const TestimonialsNew = () => {
  return (
    <section className="section-padding relative overflow-hidden bg-section-alt">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary text-sm font-medium uppercase tracking-widest inline-block mb-4"
          >
            Témoignages
          </motion.span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6">
            <TextReveal as="span">Ils nous font</TextReveal>{" "}
            <span className="gradient-text"><TextReveal as="span" delay={0.25}>confiance</TextReveal></span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Des professionnels qui utilisent nos leads et nos CRM au quotidien.
          </p>
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial, idx) => (
                <CarouselItem key={idx} className="pl-4 basis-[85%]">
                  <TestimonialCard testimonial={testimonial} idx={idx} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-2 mt-6">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, idx) => (
            <TestimonialCard key={idx} testimonial={testimonial} idx={idx} />
          ))}
        </div>

        {/* Trustpilot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex justify-center"
        >
          <a
            href="https://fr.trustpilot.com/review/leadeurs.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 px-6 py-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-foreground font-bold text-sm">Trustpilot</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-5 h-5 bg-[#00B67A] flex items-center justify-center">
                    <Star className="w-3 h-3 fill-white text-white" />
                  </div>
                ))}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">Voir nos avis</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsNew;
