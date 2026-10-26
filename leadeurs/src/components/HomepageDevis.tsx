import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";

const HomepageDevis = () => {
  return (
    <section id="devis" className="section-dark section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220_12%_9%)] via-[hsl(220_14%_13%)] to-[hsl(225_16%_10%)]" />
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/[0.06] rounded-full blur-[200px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/[0.03] rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-7"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm font-medium">Demande de devis</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white leading-tight">
              Recevez vos <span className="gradient-text">leads</span>
              <br />dès demain
            </h2>
            <p className="text-lg text-white/45 leading-relaxed">
              Remplissez le formulaire, un conseiller vous contacte sous 24h
              pour définir vos critères et lancer la campagne.
            </p>

            <div className="space-y-4 pt-2">
              {[
                "Leads exclusifs — pas de revente",
                "Livraison en temps réel",
                "Sans engagement — payez au lead",
                "Accompagnement personnalisé",
              ].map((item, idx) => (
                <motion.div
                  key={item}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + idx * 0.1 }}
                >
                  <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-white/70 text-sm font-medium">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl md:rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8 sm:p-10 md:p-12 text-center relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/[0.06] rounded-full blur-[80px]" />

            <div className="relative space-y-6">
              <div className="w-20 h-20 rounded-full bg-[#25D366]/15 flex items-center justify-center mx-auto">
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#25D366] fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>

              <div>
                <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-3">Contactez-nous directement</h3>
                <p className="text-white/50 text-sm md:text-base">Un conseiller vous répond en quelques minutes sur WhatsApp.</p>
              </div>

              <a
                href="https://wa.me/33782170781?text=Bonjour%2C%20je%20souhaite%20recevoir%20des%20leads%20qualifi%C3%A9s.%20Pouvez-vous%20me%20recontacter%20%3F"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-base transition-all duration-300 shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/40 hover:scale-105"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Discuter sur WhatsApp
              </a>

              <p className="text-[11px] text-white/30 font-medium tracking-wide">
                Réponse sous 24h • Sans engagement • 100% gratuit
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomepageDevis;
