import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Comment fonctionne l'achat de leads ?",
    answer: "Vous choisissez votre secteur (photovoltaïque, isolation, PAC…), on définit ensemble vos critères de qualification, et vous recevez des leads exclusifs en temps réel. Chaque lead est vérifié : numéro valide, intention confirmée, critères respectés. Vous ne payez que les leads conformes.",
  },
  {
    question: "Les leads sont-ils exclusifs ?",
    answer: "Oui, 100%. Chaque lead est envoyé à un seul client. Pas de revente, pas de partage. C'est notre garantie qualité : vous êtes le seul à contacter le prospect.",
  },
  {
    question: "Qu'est-ce qu'un CRM sur-mesure ?",
    answer: "C'est un outil de gestion client développé spécifiquement pour votre activité. Contrairement aux CRM génériques (Hubspot, Salesforce), le vôtre est pensé pour vos process, votre pipeline et votre équipe. Rien de superflu, tout ce dont vous avez besoin.",
  },
  {
    question: "Combien de temps pour avoir mon CRM ?",
    answer: "En moyenne 4 à 8 semaines selon la complexité. On travaille en itérations courtes avec des validations régulières, pour que vous ayez un outil opérationnel rapidement. Le support est inclus après livraison.",
  },
  {
    question: "Quel volume de leads pouvez-vous fournir ?",
    answer: "Cela dépend de votre secteur et de votre zone géographique. On génère en moyenne 50 000+ leads par an tous secteurs confondus. On définit ensemble un volume adapté à votre capacité de traitement et votre budget.",
  },
  {
    question: "Comment vous contacter ?",
    answer: "Directement via notre page contact pour réserver un appel de 30 minutes. On discute de votre besoin (leads, CRM ou les deux) et on vous propose une solution adaptée. Réponse garantie sous 24h.",
  },
];

const FAQNew = () => {
  return (
    <section className="section-dark section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220_12%_10%)] via-[hsl(220_14%_14%)] to-[hsl(220_12%_10%)]" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/[0.05] rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-widest">FAQ</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mt-4 mb-6 text-white">
            Questions <span className="gradient-text">fréquentes</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Tout ce que vous devez savoir sur nos leads et nos CRM.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="px-6 rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left font-heading font-semibold hover:text-primary hover:no-underline py-5 text-[15px] text-white">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQNew;
