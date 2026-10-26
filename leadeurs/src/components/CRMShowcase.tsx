import { motion } from "framer-motion";
import { ArrowRight, Database, Zap, BarChart3, Mail, Cog, Users, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import TextReveal from "@/components/TextReveal";

const features = [
  { icon: Users, title: "Gestion des contacts", desc: "Pipeline visuel adapté à votre cycle de vente" },
  { icon: Zap, title: "Automatisations", desc: "Relances auto, notifications, workflows sur-mesure" },
  { icon: Mail, title: "Emails & SMS", desc: "Séquences intégrées pour nurturing et relance" },
  { icon: BarChart3, title: "Analytics", desc: "Tableaux de bord temps réel sur vos KPIs" },
  { icon: Cog, title: "Intégrations", desc: "Connecté à vos outils : Calendly, Stripe, API…" },
  { icon: Smartphone, title: "Mobile-first", desc: "Accédez à votre CRM partout, tout le temps" },
];

const CRMShowcase = () => {
  return (
    <section className="section-padding relative overflow-hidden bg-section-alt">
      <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] rounded-full blur-[200px] bg-accent/[0.04]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 relative z-10">

        {/* Transition text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-16 h-0.5 bg-gradient-to-r from-accent to-blue-500 mx-auto mb-8 origin-center"
          />

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-3">
            Et ce n'est pas tout…
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground">
            <TextReveal as="span">Pour convertir vos leads,</TextReveal> <br className="hidden md:block" />
            <span className="text-accent"><TextReveal as="span" delay={0.4}>il vous faut le bon CRM.</TextReveal></span>
          </h2>
        </motion.div>

        {/* CRM Content */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium uppercase tracking-widest mb-4 border border-accent/20">
                CRM Sur-Mesure
              </span>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold mb-4 text-foreground">
                Votre CRM, <span className="text-accent">votre façon</span> de travailler
              </h3>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Fini Hubspot, Salesforce et leurs 200 fonctionnalités inutiles.
                On développe <strong className="text-foreground font-semibold">votre</strong> outil — celui qui colle parfaitement
                à votre métier, vos process et votre équipe.
              </p>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-accent/30 hover:shadow-sm transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 border border-accent/20">
                      <Icon className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{f.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent hover:bg-accent/90 text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 group"
              >
                Demander un devis CRM
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Dashboard mockup — dark card on light bg */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl border border-border/60 bg-[hsl(220_14%_12%)] overflow-hidden shadow-2xl shadow-black/10">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.03]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                  <div className="w-3 h-3 rounded-full bg-green-400/70" />
                </div>
                <div className="flex-1 mx-3">
                  <div className="bg-white/[0.06] rounded-md px-3 py-1.5 text-xs text-white/30 font-mono">
                    votre-entreprise.leadeurs.app
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-5 md:p-6 space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "24", label: "Nouveaux", color: "text-accent" },
                    { value: "18", label: "En cours", color: "text-amber-400" },
                    { value: "42", label: "Convertis", color: "text-emerald-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 md:p-4">
                      <div className={`text-2xl md:text-3xl font-heading font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-white/30 mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Pipeline */}
                <div className="space-y-2">
                  <div className="text-xs text-white/30 uppercase tracking-wider font-medium">Pipeline récent</div>
                  {[
                    { name: "Sophie Laurent", company: "SolarTech", status: "Qualifié", statusColor: "bg-emerald-400" },
                    { name: "Marc Dubois", company: "IsoPlus", status: "RDV planifié", statusColor: "bg-amber-400" },
                    { name: "Julie Martin", company: "HeatPump Co", status: "Devis envoyé", statusColor: "bg-accent" },
                  ].map((lead) => (
                    <div key={lead.name} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-xs font-bold text-white/60">
                          {lead.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white/80">{lead.name}</div>
                          <div className="text-xs text-white/30">{lead.company}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${lead.statusColor}`} />
                        <span className="text-xs text-white/40">{lead.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating glow behind */}
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-accent/5 blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CRMShowcase;
