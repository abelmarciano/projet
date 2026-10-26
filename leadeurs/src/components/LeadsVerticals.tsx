import { motion } from "framer-motion";
import { MessageCircle, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import iconGoogleAds from "@/assets/leads/icon-google-ads.png";
import { useState, useRef, useCallback } from "react";

import iconSolar from "@/assets/leads/icon-solar.png";
import iconIsolation from "@/assets/leads/icon-isolation.png";
import iconIsolationPro from "@/assets/leads/icon-isolation-pro.png";
import iconPac from "@/assets/leads/icon-pac.png";
import iconLed from "@/assets/leads/icon-led.png";
import iconLedExt from "@/assets/leads/icon-led-ext.png";
import iconDouche from "@/assets/leads/icon-douche.png";
import iconReno from "@/assets/leads/icon-reno.png";

interface LeadItem {
  icon: string;
  name: string;
  price: string;
  color: string;
  popular?: boolean;
}

const allLeads: LeadItem[] = [
  { icon: iconSolar, name: "Panneaux Photovoltaïques", price: "31€", color: "from-amber-500/15 to-orange-500/15", popular: true },
  { icon: iconIsolation, name: "Isolation Extérieure (ITE)", price: "29€", color: "from-emerald-500/15 to-teal-500/15" },
  { icon: iconPac, name: "Pompe à Chaleur à 1€", price: "35€", color: "from-blue-500/15 to-cyan-500/15" },
  { icon: iconIsolationPro, name: "Isolation Pro", price: "26€", color: "from-emerald-500/15 to-teal-500/15" },
  { icon: iconReno, name: "Réno d'Ampleur", price: "35€", color: "from-cyan-500/15 to-blue-500/15" },
  { icon: iconDouche, name: "Douches Seniors", price: "13€", color: "from-sky-500/15 to-blue-500/15" },
  { icon: iconLed, name: "Led Intérieur", price: "26€", color: "from-yellow-500/15 to-amber-500/15" },
  { icon: iconLedExt, name: "Led Extérieur", price: "20€", color: "from-green-500/15 to-emerald-500/15" },
];

const CARDS_PER_PAGE = 3;
const totalPages = Math.ceil(allLeads.length / CARDS_PER_PAGE);

const LeadCard = ({ item, idx }: { item: LeadItem; idx: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: idx * 0.05 }}
    className="group relative bg-card rounded-2xl border border-border/50 hover:border-primary/40 overflow-visible transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1.5 min-w-[260px] w-[260px] sm:w-auto sm:min-w-0 flex-shrink-0 sm:flex-shrink"
  >
    {item.popular && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-orange-100 border border-orange-300 text-orange-900 text-[10px] font-bold uppercase tracking-wider shadow-sm whitespace-nowrap">
        🔥 Populaire
      </div>
    )}
    <div className="flex flex-col items-center justify-center p-6 md:p-6 lg:p-8 text-center">
      <div className={`w-20 h-20 md:w-16 md:h-16 lg:w-20 lg:h-20 mx-auto rounded-2xl bg-gradient-to-br ${item.color} p-2 mb-4 group-hover:scale-110 transition-transform duration-500`}>
        <img
          src={item.icon}
          alt={item.name}
          className="w-full h-full object-contain drop-shadow-lg"
          loading="lazy"
          width={512}
          height={512}
        />
      </div>
      <h4 className="text-lg md:text-base lg:text-lg font-semibold text-foreground leading-tight min-h-[2.5rem] flex items-center justify-center">
        {item.name}
      </h4>
    </div>
  </motion.div>
);

const LeadsVerticals = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dotIndex, setDotIndex] = useState(0);
  const [desktopPage, setDesktopPage] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = 260 + 16;
    const index = Math.round(scrollLeft / cardWidth);
    setDotIndex(Math.min(index, allLeads.length - 1));
  };

  const goTo = useCallback((page: number) => {
    setDesktopPage(Math.max(0, Math.min(page, totalPages - 1)));
  }, []);

  const visibleDesktop = allLeads.slice(desktopPage * CARDS_PER_PAGE, desktopPage * CARDS_PER_PAGE + CARDS_PER_PAGE);

  return (
    <section className="section-padding relative overflow-hidden bg-section-alt">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/[0.02] rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-10 md:mb-14"
        >
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-card border border-primary/20 shadow-sm">
              <img src={iconGoogleAds} alt="Google Ads" className="w-8 h-8 object-contain" width={512} height={512} />
              <span className="text-sm font-semibold text-foreground">Expert Google Ads</span>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-5">
            Des leads qualifiés dans <span className="gradient-text">votre secteur</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Prospects exclusifs, vérifiés et prêts à acheter.
          </p>
        </motion.div>



        {/* Mobile Carousel */}
        <div className="sm:hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-6 -mx-4 px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {allLeads.map((item, idx) => (
              <div key={item.name} className="snap-center">
                <LeadCard item={item} idx={idx} />
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-3">
            {allLeads.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === dotIndex ? "bg-primary w-6" : "bg-primary/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Carousel */}
        <div className="hidden sm:block max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-5">
            {visibleDesktop.map((item, idx) => (
              <LeadCard key={item.name + desktopPage} item={item} idx={idx} />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => goTo(desktopPage - 1)}
              disabled={desktopPage === 0}
              className="w-10 h-10 rounded-full border border-border/50 bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    idx === desktopPage ? "bg-primary w-7" : "bg-primary/20 hover:bg-primary/40"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => goTo(desktopPage + 1)}
              disabled={desktopPage === totalPages - 1}
              className="w-10 h-10 rounded-full border border-border/50 bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>



        {/* Sur-Mesure Block */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto mt-10 md:mt-14"
        >
          <div className="relative bg-card rounded-2xl border border-purple-500/20 overflow-hidden p-6 md:p-10">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-primary rounded-t-2xl" />
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/15 to-pink-500/15 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-8 h-8 text-purple-500" />
              </div>
              <div className="text-center md:text-left flex-1">
                <h4 className="text-lg font-heading font-bold text-foreground mb-1">Sur-Mesure</h4>
                <p className="text-muted-foreground text-sm">
                  Parlez-nous de votre activité et on crée un canal de leads adapté à votre métier. Immobilier, assurance, formation, automobile…
                </p>
              </div>
              <a
                href="https://wa.me/33782170781?text=Bonjour%2C%20je%20souhaite%20des%20leads%20sur-mesure%20pour%20mon%20activit%C3%A9."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-[#25D366]/20 flex-shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                Contactez-nous
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LeadsVerticals;
