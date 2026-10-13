/*
 * Guide « Créer ton compte publicitaire Meta » : données du guide.
 * Copie exacte de la maquette validée (landing/design/guide-meta/guide-meta.html).
 * Les textes et écrans sont des chaînes HTML STATIQUES écrites ici (aucune donnée utilisateur),
 * rendues avec dangerouslySetInnerHTML dans GuideMeta.tsx.
 */

export type GuideStep = {
  t: string;               // titre
  k: string;               // libellé court (barre d'étapes)
  time: string;
  why: string;             // une phrase (HTML)
  need?: string[];
  do: [string, string][];  // [action, précision] (HTML)
  alert?: ["warn" | "tip", string];
  more?: string[];
  links?: [string, string][];
  faq?: [string, string][];
  url: string;             // adresse affichée sur la capture
  scr: "flow" | "twofa" | "bm" | "page" | "insta" | "adacc" | "pay" | "pixel" | "growthity";
  opt?: boolean;
  final?: boolean;
};

/* Lien cliquable dans une instruction */
const L = (t: string, u: string) =>`<a class="lk" href="${u}" target="_blank" rel="noopener">${t}</a>`;
const U={
  fb:"https://www.facebook.com/", fbNew:"https://www.facebook.com/r.php", bs:"https://business.facebook.com/",
  sec:"https://accountscenter.facebook.com/password_and_security", tfa:"https://accountscenter.facebook.com/password_and_security/two_factor",
  bm:"https://business.facebook.com/overview", info:"https://business.facebook.com/settings/info",
  pages:"https://business.facebook.com/settings/pages", pageNew:"https://www.facebook.com/pages/create",
  ig:"https://business.facebook.com/settings/instagram-account-v2s", igPro:"https://help.instagram.com/502981923235522",
  ads:"https://business.facebook.com/settings/ad-accounts", am:"https://adsmanager.facebook.com/", aq:"https://www.facebook.com/accountquality",
  pay:"https://business.facebook.com/billing_hub/payment_settings", payAct:"https://business.facebook.com/billing_hub/payment_activity",
  ev:"https://business.facebook.com/events_manager2", shop:"https://apps.shopify.com/facebook"
};
/* Mots de Meta : définition au survol, plutôt qu'un lexique à part */
const DEF: Record<string, string> = {
  "portefeuille business":"Le dossier de ton entreprise chez Meta (ex-Business Manager). Il range ta Page, tes comptes pub et tes paiements.",
  "Page":"La vitrine de ton entreprise sur Facebook. Tes pubs sont publiées en son nom.",
  "compte publicitaire":"Là où tes pubs sont créées et facturées. Un seul suffit.",
  "double authentification":"Un code envoyé sur ton téléphone en plus du mot de passe.",
  "pixel":"Un petit code sur ton site qui dit à Meta qui a visité ou acheté. Meta l'appelle aussi « jeu de données »."
};
export const term = (h: string) => Object.entries(DEF).reduce((s, [k, d]) =>s.replace(`<b>${k}</b>`,`<span class="term" tabindex="0" data-def="${d}">${k}</span>`),h);

/* Une étape : une phrase, des actions, au plus une alerte. Le reste va dans « Besoin d'aide ? ». */
export const STEPS: GuideStep[] = [
  { t:"Avant de commencer", k:"Avant", time:"2 min",
    why:"Meta demande 4 éléments qui s'emboîtent : ton profil Facebook, un <b>portefeuille business</b>, une <b>Page</b> et un <b>compte publicitaire</b>. Tu les crées une fois, puis tu les connectes à Growthity.",
    need:["ton compte Facebook","un e-mail pro","une carte ou PayPal","ton logo"],
    do:[[`Vérifie que tu arrives à te connecter sur ${L("facebook.com",U.fb)}.`,`Pas de compte ? ${L("Crée-le ici",U.fbNew)}, avec ton vrai nom.`],["Garde ce guide ouvert à côté de Meta.","Ta progression est gardée sur cet appareil."]],
    more:["Ton profil Facebook personnel reste privé : tes clients ne le voient jamais. Il sert seulement à prouver qui gère l'entreprise."],
    links:[["Meta Business Suite",U.bs]],
    faq:[["Je dois vraiment avoir un profil Facebook ?","Oui. Meta n'autorise pas la pub sans profil personnel, mais tes pubs sont publiées au nom de ta Page."],["Je peux utiliser le compte d'un salarié ?","Mieux vaut le tien : le propriétaire du portefeuille doit rester dans l'entreprise."]],
    url:"business.facebook.com", scr:"flow" },
  { t:"Sécuriser ton compte Facebook", k:"Sécurité", time:"3 min",
    why:"La <b>double authentification</b> est obligatoire pour gérer une entreprise chez Meta, et elle protège ton compte pub.",
    need:["ton téléphone"],
    do:[[`Ouvre ${L("Mot de passe et sécurité",U.sec)}.`,""],[`Clique sur ${L("Authentification à deux facteurs",U.tfa)} et choisis ton compte Facebook.`,""],["Choisis <b>Application d'authentification</b> (ou SMS) et suis les instructions.","Note bien les codes de récupération."]],
    alert:["warn","Utilise ton <b>vrai nom</b> sur ton profil : un faux nom peut faire bloquer ton compte pub."],
    more:["Applications gratuites conseillées : Google Authenticator ou Microsoft Authenticator."],
    faq:[["Je ne reçois pas le code par SMS","Attends 2 minutes et redemande-le, ou choisis l'application : elle marche même sans réseau."],["J'ai changé de téléphone","Connecte-toi avec un code de récupération, puis réactive la double authentification."]],
    url:"accountscenter.facebook.com/password_and_security", scr:"twofa" },
  { t:"Créer ton portefeuille business", k:"Portefeuille", time:"4 min",
    why:"Le <b>portefeuille business</b> est le dossier de ton entreprise chez Meta : ta Page et tes pubs restent à toi, même si un prestataire part.",
    need:["le nom de ton entreprise","ton e-mail pro"],
    do:[[`Va sur ${L("business.facebook.com",U.bm)} et clique sur <b>Créer un compte</b>.`,""],["Saisis le <b>nom de ton entreprise</b>, ton nom et ton <b>e-mail pro</b>.",""],["Clique sur <b>Envoyer</b> et valide l'e-mail de confirmation.","Regarde aussi dans les indésirables."]],
    alert:["warn","Crée <b>un seul</b> portefeuille : en créer plusieurs d'affilée est un signal suspect pour Meta."],
    links:[["Informations sur l'entreprise",U.info]],
    faq:[["Meta dit que je ne peux pas créer de portefeuille","Ton profil est peut-être trop récent, ou un portefeuille existe déjà à ton nom : ouvre business.facebook.com pour vérifier."],["Je n'ai pas reçu l'e-mail","Regarde dans les indésirables, puis vérifie l'adresse dans Informations sur l'entreprise."]],
    url:"business.facebook.com/overview", scr:"bm" },
  { t:"Créer ta Page Facebook", k:"Page", time:"5 min",
    why:"Tes pubs sont publiées au nom de ta <b>Page</b> : c'est son nom et son logo qu'on voit au-dessus de la pub.",
    need:["ton logo carré","une photo de couverture"],
    do:[[`Ouvre ${L("Paramètres › Comptes › Pages",U.pages)}.`,""],["Clique sur <b>+ Ajouter</b>.",""],["Choisis <b>Créer une Page</b>, ou <b>Ajouter une Page</b> si tu en as déjà une.","Nom, catégorie, logo et couverture."]],
    more:["Publie 2 ou 3 posts sur la Page avant ta première pub : une Page vide fait moins sérieux."],
    links:[["Créer une Page depuis Facebook",U.pageNew]],
    faq:[["Ma Page existe mais je ne peux pas l'ajouter","Il faut en être administrateur : choisis « Demander l'accès à une Page »."],["Quelle catégorie choisir ?","Celle qui décrit le mieux ton activité. Tu pourras la changer."]],
    url:"business.facebook.com/settings/pages", scr:"page" },
  { t:"Relier ton Instagram", k:"Instagram", time:"3 min", opt:true,
    why:"Tes pubs afficheront ton nom et ta photo Instagram. Sans ça, elles passent quand même sur Instagram, au nom de ta Page.",
    need:["un compte Instagram pro"],
    do:[[`Ouvre ${L("Comptes › Comptes Instagram",U.ig)}.`,""],["Clique sur <b>+ Ajouter</b> et connecte-toi à Instagram.",`Ton compte doit être ${L("professionnel",U.igPro)}.`]],
    faq:[["Instagram refuse la connexion","Vérifie que tu arrives à te connecter dans l'app Instagram, puis réessaie depuis un ordinateur."]],
    url:"business.facebook.com/settings/instagram-account-v2s", scr:"insta" },
  { t:"Créer ton compte publicitaire", k:"Compte pub", time:"4 min",
    why:"Le <b>compte publicitaire</b> contient tes campagnes et tes dépenses : c'est lui que Growthity utilise pour publier.",
    need:["le nom de ton entreprise"],
    do:[[`Ouvre ${L("Comptes › Comptes publicitaires",U.ads)}, puis <b>+ Ajouter</b> › <b>Créer un compte publicitaire</b>.`,""],["Nomme-le simplement, ex. « Atelier Sauge – Pubs ».",""],["Choisis <b>Europe/Paris</b> et <b>EUR – Euro</b>, puis <b>Suivant</b>.","À l'écran suivant : « Mon entreprise » et contrôle total pour toi."]],
    alert:["warn","Le <b>fuseau horaire et la devise ne pourront plus être changés</b>. Vérifie avant de valider."],
    links:[["Gestionnaire de publicités",U.am],["Qualité du compte",U.aq]],
    faq:[["Je me suis trompé de devise ou de fuseau","Crée un nouveau compte publicitaire avec les bons réglages et n'utilise plus l'ancien."],["Mon compte pub est désactivé",`Ouvre ${L("Qualité du compte",U.aq)} et demande un examen.`]],
    url:"business.facebook.com/settings/ad-accounts", scr:"adacc" },
  { t:"Ajouter un moyen de paiement", k:"Paiement", time:"3 min",
    why:"Meta prélève uniquement ce que tes pubs ont dépensé. Le budget par jour, c'est toi qui le fixes dans Growthity.",
    need:["ta carte ou PayPal","ton n° de TVA s'il y en a un"],
    do:[[`Ouvre ${L("Paramètres de paiement",U.pay)}.`,""],["Clique sur <b>Ajouter un moyen de paiement</b>.","Une autorisation de quelques centimes peut apparaître, puis s'annule."],["Renseigne ton adresse et ton <b>numéro de TVA</b>.","Avec un n° de TVA intracommunautaire, pas de TVA française sur les factures Meta."]],
    alert:["warn","Si un paiement échoue, toutes tes pubs s'arrêtent : choisis une carte avec un plafond suffisant."],
    more:["Au début, Meta prélève à de petits seuils (par exemple 25 €), qui augmentent quand tes paiements passent bien."],
    links:[["Activité et factures",U.payAct]],
    faq:[["Ma carte est refusée","Vérifie que les paiements en ligne et à l'étranger sont activés (Meta facture depuis l'Irlande), ou essaie une autre carte."],["Où trouver mes factures ?",`Dans ${L("Activité et factures",U.payAct)}, en PDF.`]],
    url:"business.facebook.com/billing_hub/payment_settings", scr:"pay" },
  { t:"Installer le pixel sur ton site", k:"Pixel", time:"5 min", opt:true,
    why:"Le <b>pixel</b> dit à Meta qui a visité ton site ou acheté, pour relancer tes visiteurs et mesurer tes ventes.",
    need:["l'accès à ton site"],
    do:[[`Ouvre le ${L("Gestionnaire d'événements",U.ev)} › <b>Connecter des sources de données</b>.`,""],["Choisis <b>Web</b>, donne un nom, puis l'installation <b>via ta plateforme</b>.","Pas de code à copier."],["Le statut passe à <b>Actif</b> après une visite sur ton site.",""]],
    alert:["tip",`Sur Shopify : installe l'appli ${L("Facebook & Instagram",U.shop)}, tout est automatique.`],
    faq:[["Le statut reste « Inactif »","Ouvre ton site dans un autre onglet, attends quelques minutes et actualise."],["Une agence a déjà installé un pixel","Pas de doublon : demande-lui de partager son pixel avec ton portefeuille."]],
    url:"business.facebook.com/events_manager2", scr:"pixel" },
  { t:"Connecter Meta à Growthity", k:"Growthity", time:"2 min", final:true,
    why:"Tu autorises Growthity à publier tes pubs et à lire tes résultats. Tu peux retirer l'accès quand tu veux.",
    do:[["Dans Growthity, ouvre <b>Connexion</b>.",""],["Clique sur <b>Continuer avec Facebook</b>.",""],["Coche ton portefeuille, ta Page et ton compte publicitaire, puis valide.",""]],
    more:["Tes premières pubs passent par la vérification de Meta : quelques minutes, parfois jusqu'à 24 h pour un nouveau compte."],
    faq:[["Je ne vois pas mon compte publicitaire","Déconnecte puis reconnecte Meta et coche bien tous les éléments."],["Comment retirer l'accès ?","Dans Growthity › Connexion › Déconnecter."]],
    url:"app.growthity.ai/connexions", scr:"growthity" }
];

/* ---------- Écrans Meta reproduits (data-c = numéro de l'action) ---------- */
const C = (n: number) =>`c" data-c="${n}`;
const mside = (on: string, items: string[]) =>`<div class="mside"><div class="h">Paramètres</div>${items.map(x=>`<span class="${x===on?"on":""}">${x}</span>`).join("")}</div>`;
const SET=["Utilisateurs","Pages","Comptes publicitaires","Comptes Instagram","Moyens de paiement","Sources de données","Sécurité"];
const mtop = (t: string) =>`<div class="mtop"><span class="mlogo"></span><b>${t}</b><span class="acct">Atelier Sauge <i></i></span></div>`;
export const SCREENS: Record<GuideStep["scr"], () => string> = {
  flow:()=>`${mtop("Comment tout s'emboîte")}<div class="mbody full"><div class="mpane">
    <div class="mrow"><span class="av">Toi</span><div><b>Ton profil Facebook</b><small>Privé : il prouve qui gère l'entreprise</small></div></div>
    <div style="height:14px;width:2px;background:var(--m-line);margin-left:25px"></div>
    <div class="mrow" style="border-color:var(--m-blue)"><span class="av" style="background:var(--m-blue);color:#fff">PB</span><div><b>Portefeuille business</b><small>Le dossier de ton entreprise</small></div></div>
    <div style="height:14px;width:2px;background:var(--m-line);margin-left:25px"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
      <div class="mrow"><span class="av">P</span><div><b>Page</b><small>Ta vitrine</small></div></div>
      <div class="mrow"><span class="av ig">IG</span><div><b>Instagram</b><small>Facultatif</small></div></div>
      <div class="mrow"><span class="av">€</span><div><b>Compte pub</b><small>+ paiement</small></div></div></div>
    <div style="height:14px;width:2px;background:var(--m-line);margin-left:25px"></div>
    <div class="mrow" style="border-color:var(--gx-accent)"><span class="av" style="background:var(--gx-grad);color:#fff">G</span><div><b>Growthity</b><small>Crée et publie tes pubs pour toi</small></div></div>
  </div></div>`,
  twofa:()=>`${mtop("Espace comptes")}<div class="mbody"><div class="mside"><div class="h">Espace comptes</div><span>Profils</span><span>Expérience connectée</span><span class="on">Mot de passe et sécurité</span><span>Informations personnelles</span><span>Vos informations</span></div>
    <div class="mpane"><div class="mcard"><h5>Mot de passe et sécurité</h5><p class="s">Connexion et récupération</p>
      <div class="mrow"><span class="av">🔑</span><div>Changer le mot de passe</div></div>
      <div class="mrow mring ${C(1)}"><span class="av">🛡</span><div><b>Authentification à deux facteurs</b><small>Désactivée</small></div><span class="mtag off">Désactivée</span></div>
      <div class="mrow"><span class="av">⌁</span><div>Où vous êtes connecté(e)</div></div></div>
      <div class="menu"><span class="${C(2)}" style="background:var(--m-blue-soft)">Facebook<small>Camille Martin</small></span><span>Instagram<small>@atelier.sauge</small></span></div>
      <div class="mb ${C(3)}">Application d'authentification</div></div></div>`,
  bm:()=>`${mtop("Meta for Business")}<div class="mbody full"><div class="mpane" style="align-items:center">
    <div class="mcard" style="width:min(100%,380px)"><h5>Créer un portefeuille business</h5><p class="s">Gère ta Page, tes publicités et ton équipe au même endroit.</p>
      <div class="mf"><label class="${C(2)}">Nom de l'entreprise</label><div class="in mring">Atelier Sauge</div><span class="hint">Le nom officiel de ton entreprise</span></div>
      <div class="mf"><label>Ton prénom et ton nom</label><div class="in">Camille Martin</div></div>
      <div class="mf"><label>Adresse e-mail professionnelle</label><div class="in mring">contact@ateliersauge.fr</div></div>
      <div class="mb ${C(3)}">Envoyer</div></div>
    <div class="mb sec ${C(1)}" style="align-self:center">Créer un compte</div></div></div>`,
  page:()=>`${mtop("Paramètres de l'entreprise")}<div class="mbody">${mside("Pages",SET).replace('<span class="on">Pages</span>','<span class="on '+C(1)+'">Pages</span>')}
    <div class="mpane"><div class="mtabs"><span class="on">Pages</span><span>Demandes</span></div>
      <div style="display:flex;align-items:center;gap:8px"><b style="font-size:15px">Pages</b><span class="mb ${C(2)}" style="margin-left:auto">+ Ajouter</span></div>
      <div class="menu" style="margin-left:auto"><span>Ajouter une Page<small>Tu en as déjà une</small></span><span>Demander l'accès à une Page<small>Elle appartient à quelqu'un d'autre</small></span><span class="mring ${C(3)}" style="background:var(--m-blue-soft)">Créer une Page<small>Nouvelle vitrine pour ton entreprise</small></span></div>
      <div class="mrow"><span class="av">?</span><div>Aucune Page pour l'instant<small>Ajoute ou crée ta Page</small></div></div></div></div>`,
  insta:()=>`${mtop("Paramètres de l'entreprise")}<div class="mbody">${mside("Comptes Instagram",SET).replace('<span class="on">Comptes Instagram</span>','<span class="on '+C(1)+'">Comptes Instagram</span>')}
    <div class="mpane"><div style="display:flex;align-items:center;gap:8px"><b style="font-size:15px">Comptes Instagram</b><span class="mb ${C(2)}" style="margin-left:auto">+ Ajouter</span></div>
      <div class="mrow"><span class="av ig">IG</span><div><b>@atelier.sauge</b><small>Compte professionnel</small></div><span class="mtag">Relié</span></div>
      <div class="mcard"><h5>Ce que ça change</h5><p class="s" style="margin:0">Tes pubs affichent ton nom et ta photo Instagram, et les gens peuvent aller sur ton profil.</p></div></div></div>`,
  adacc:()=>`${mtop("Paramètres de l'entreprise")}<div class="mbody">${mside("Comptes publicitaires",SET).replace('<span class="on">Comptes publicitaires</span>','<span class="on '+C(1)+'">Comptes publicitaires</span>')}
    <div class="mpane"><div class="mcard"><h5>Créer un compte publicitaire</h5>
      <div class="mf"><label class="${C(2)}">Nom du compte publicitaire</label><div class="in mring">Atelier Sauge – Pubs</div></div>
      <div class="mf"><label class="${C(3)}">Fuseau horaire</label><div class="in dd mring">(GMT+01:00) Europe/Paris</div><span class="hint">Ne pourra pas être modifié</span></div>
      <div class="mf"><label>Devise</label><div class="in dd mring">EUR – Euro</div><span class="hint">Ne pourra pas être modifiée</span></div>
      <div class="mf"><label>Moyen de paiement</label><div class="in dd" style="color:var(--m-sub)">Ajouter plus tard</div></div>
      <div style="display:flex;gap:8px;justify-content:flex-end"><span class="mb sec">Annuler</span><span class="mb">Suivant</span></div></div></div></div>`,
  pay:()=>`${mtop("Facturation et paiements")}<div class="mbody"><div class="mside"><div class="h">Facturation</div><span>Activité</span><span class="on ${C(1)}">Paramètres de paiement</span><span>Factures</span></div>
    <div class="mpane"><div class="mcard"><h5>Moyens de paiement</h5><p class="s">Compte : Atelier Sauge – Pubs</p>
      <div class="mrow"><span class="av">💳</span><div>Aucun moyen de paiement<small>Tes pubs ne peuvent pas être diffusées</small></div><span class="mtag off">À ajouter</span></div>
      <div class="mb ${C(2)}">Ajouter un moyen de paiement</div></div>
      <div class="mcard"><h5>Informations sur l'entreprise</h5>
        <div class="mf"><label>Adresse</label><div class="in">8 rue des Lilas, 33000 Bordeaux</div></div>
        <div class="mf"><label class="${C(3)}">Numéro de TVA</label><div class="in mring">FR12 345678901</div></div></div>
      <div class="mrow"><span class="av">€</span><div>Seuil de facturation<small>Prélèvement à chaque seuil atteint</small></div><b>25,00 €</b></div></div></div>`,
  pixel:()=>`${mtop("Gestionnaire d'événements")}<div class="mbody"><div class="mside"><div class="h">Événements</div><span class="on">Sources de données</span><span>Événements personnalisés</span><span>Paramètres</span></div>
    <div class="mpane"><div style="display:flex;align-items:center"><b style="font-size:15px">Sources de données</b><span class="mb ${C(1)}" style="margin-left:auto">+ Connecter des sources de données</span></div>
      <div class="mcard"><h5>Sélectionne une source</h5>
        <div class="mrow mring ${C(2)}"><span class="av">🌐</span><div><b>Web</b><small>Mesure les visites et achats sur ton site</small></div></div>
        <div class="mrow"><span class="av">📱</span><div>Application</div></div><div class="mrow"><span class="av">🏬</span><div>Hors ligne</div></div></div>
      <div class="mrow ${C(3)}"><span class="av">◉</span><div><b>Pixel Atelier Sauge</b><small>Dernière activité il y a 2 min</small></div><span class="mtag">Actif</span></div></div></div>`,
  growthity:()=>`<div class="gm-app"><div class="gside"><b>growthity.ai</b><span>Accueil</span><span>Chat</span><span>Créations</span><span>Campagnes</span><span>Résultats</span><span class="on ${C(1)}">Connexion</span></div>
    <div class="mpane" style="font-family:var(--gx-ui)"><b style="font-family:var(--gx-display);font-size:20px">Connexion</b>
      <div class="mcard" style="border-color:var(--gx-line);border-radius:14px"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span class="av" style="width:36px;height:36px;border-radius:9px;background:#0866FF;color:#fff;display:grid;place-items:center;font-weight:700">f</span><div style="flex:1;min-width:110px"><b style="white-space:nowrap">Meta Ads</b><small style="display:block;color:var(--gx-dim)">Facebook &amp; Instagram</small></div><span class="mtag off">Non connecté</span></div>
        <span class="mb ${C(2)}" style="background:#0866FF">Continuer avec Facebook</span></div>
      <div class="menu ${C(3)}" style="width:100%;max-width:330px"><span>☑ Portefeuille : <b>Atelier Sauge</b></span><span>☑ Page : <b>Atelier Sauge</b></span><span>☑ Compte pub : <b>Atelier Sauge – Pubs</b></span></div></div></div>`
};
