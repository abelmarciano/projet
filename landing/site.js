(function(){
  var REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches,SPEED=.6;
  document.documentElement.classList.add('js');
  var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var cap=function(s){return s.charAt(0).toUpperCase()+s.slice(1)};
  var CHECK='<svg viewBox="0 0 24 24" fill="none"><path d="m5 12 5 5L20 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var LOGO='<svg viewBox="0 0 24 24" fill="none"><path d="M2 17 8.5 10.5 13.5 15.5 22 7M16 7h6v6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CUR='<svg viewBox="0 0 24 24"><path d="M4 2l15 9-6.5 1.5L16 20l-3 1.5-3.5-7.5L4 18Z" fill="#0F172A" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  function vid(src,attrs){return '<video data-src="media/'+src+'.mp4" poster="media/'+src+'.poster.webp" autoplay muted loop playsinline preload="none"'+(attrs||'')+'></video>'}
  function initialsLogo(name,col){var t=name.split(/\s+/).filter(function(w){return w.length>2||w===name}).slice(0,2).map(function(w){return w.charAt(0)}).join('').toUpperCase()||name.charAt(0);
    return '<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="'+(col||'#334155')+'"/><text x="16" y="20.5" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="700" fill="#fff">'+t+'</text></svg>'}
  function fmtN(n){return Math.round(n).toLocaleString('fr-FR')}

  /* ---------- demo runner: plays when visible, pauses off-screen, restartable ---------- */
  /* Demo runner. Each demo is first rendered instantly in its finished state (so a visitor
     scrolling past already sees the result), held for a few seconds once on screen, then
     replayed as an animation in a loop. Pauses off-screen, restartable. */
  var HOLD=3500;
  function demo(el,play,opts){
    if(!el)return{restart:function(){}};
    opts=opts||{};
    var vis=false,gen=0;
    function mkWait(g,instant){var f=function(ms){return new Promise(function(res,rej){
      if(g!==gen)return rej(0);
      if(instant||REDUCE)return res();
      setTimeout(function chk(){if(g!==gen)return rej(0);if(vis&&!document.hidden)res();else setTimeout(chk,200)},(ms||0)*SPEED);
    })};f.instant=!!instant;return f}
    function untilVisible(g){return new Promise(function(res,rej){(function chk(){if(g!==gen)return rej(0);if(vis&&!document.hidden)res();else setTimeout(chk,200)})()})}
    async function run(first){
      var g=gen;
      try{
        if(first&&opts.fromStart){if(REDUCE){await play(mkWait(g,true));return}await untilVisible(g)}
        else if(first){await play(mkWait(g,true));if(REDUCE)return;await untilVisible(g);await new Promise(function(r){setTimeout(r,HOLD)});await untilVisible(g)}
        do{await play(mkWait(g,false))}while(!REDUCE&&g===gen);
      }catch(e){}
    }
    if('IntersectionObserver' in window){new IntersectionObserver(function(es){vis=es[0].isIntersecting},{rootMargin:'0px 0px 10% 0px'}).observe(el)}else vis=true;
    run(true);
    return{restart:function(){gen++;run(false)}};
  }
  async function typeInto(node,text,w,speed){
    if(REDUCE||w.instant){node.textContent=text;return}
    node.textContent='';node.classList.add('typed-caret');
    for(var i=1;i<=text.length;i++){node.textContent=text.slice(0,i);await w(speed||26)}
    node.classList.remove('typed-caret');
  }
  function countTo(node,to,ms,fmt){
    fmt=fmt||fmtN;if(REDUCE){node.textContent=fmt(to);return}
    var t0=performance.now(),from=0;
    (function f(t){var k=Math.min(1,(t-t0)/ms),e=1-Math.pow(1-k,3);node.textContent=fmt(from+(to-from)*e);if(k<1)requestAnimationFrame(f)})(t0);
  }
  function cursor(box){var c=document.createElement('div');c.className='cursor';c.innerHTML=CUR;box.appendChild(c);return c}
  async function moveTo(c,box,target,w){
    var b=box.getBoundingClientRect(),r=target.getBoundingClientRect();
    c.classList.add('on');c.style.transform='translate('+(r.left-b.left+r.width*.55)+'px,'+(r.top-b.top+r.height*.55)+'px)';
    await w(750);
  }
  async function click(c,target,w){c.classList.add('press');target.classList.add('press-fx');await w(160);c.classList.remove('press');target.classList.remove('press-fx');await w(120)}

  /* ---------- hero wall + models ---------- */
  function lazyVid(src){return '<video data-src="media/'+src+'.mp4" poster="media/'+src+'.poster.webp" muted loop playsinline preload="none"></video>'}
  var R1=['real-14','ugc-femme','real-42','ugc-homme','real-19','ugc-solaire','real-40','real-05'],R2=['real-12','ugc-scierie','real-04-hd','ugc-pac-awa','real-06','bougie-916'],R3=['img-bougie','real-42','img-sneakers','real-05','img-macbook','real-14'];
  var rows={
    a:R1.map(function(n,i){return '<div class="tile'+(i===2?' live':'')+'">'+lazyVid(n)+'</div>'}),
    b:R2.map(function(n,i){return '<div class="tile'+(i===3?' live':'')+'">'+lazyVid(n)+'</div>'}),
    c:R3.map(function(n){return n.indexOf('img-')===0?'<div class="tile sq"><img src="media/'+n+'.webp" alt=""></div>':'<div class="tile">'+lazyVid(n)+'</div>'})
  };
  $$('[data-row]').forEach(function(r){var one=rows[r.dataset.row].join(''),h=one;while(h.split('class="tile').length-1<14)h+=one;r.innerHTML=h+h});
  var MODELS=[["Veo 3.1", "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"], ["Sora 2", "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"], ["Kling 3.0", "M18.315 12.264c2.33 0 4.218 1.88 4.218 4.2V19.8c0 2.32-1.888 4.2-4.218 4.2h-6.202a4.218 4.218 0 0 1-4.023-2.938l-3.676 1.833a2.04 2.04 0 0 1-2.731-.903 2.015 2.015 0 0 1-.216-.907v-5.94a2.03 2.03 0 0 1 2.035-2.024 2.044 2.044 0 0 1 .919.218l3.673 1.85a4.218 4.218 0 0 1 4.02-2.925zm-.062 2.162h-6.078c-1.153 0-2.09.921-2.108 2.065v3.247c0 1.148.925 2.081 2.073 2.1h6.113c1.153 0 2.09-.922 2.109-2.065v-3.247a2.104 2.104 0 0 0-2.074-2.1zM4.18 15.72a.554.554 0 0 0-.555.542v3.734a.556.556 0 0 0 .798.496l.01-.004 3.463-1.756V17.51l-3.467-1.73a.557.557 0 0 0-.249-.06zM9.28 0a5.667 5.667 0 0 1 4.98 2.965 4.921 4.921 0 0 1 3.36-1.317c2.714 0 4.913 2.177 4.913 4.863 0 2.686-2.2 4.863-4.912 4.863a4.921 4.921 0 0 1-3.996-2.034 5.651 5.651 0 0 1-4.345 2.034c-3.131 0-5.67-2.546-5.67-5.687C3.61 2.546 6.149 0 9.28 0Zm8.34 3.926c-1.441 0-2.61 1.157-2.61 2.585s1.169 2.585 2.61 2.585c1.443 0 2.612-1.157 2.612-2.585s-1.169-2.585-2.611-2.585zM9.28 2.287a3.395 3.395 0 0 0-3.39 3.4c0 1.877 1.518 3.4 3.39 3.4a3.395 3.395 0 0 0 3.39-3.4c0-1.878-1.518-3.4-3.39-3.4z"], ["Seedance 2.5", "M19.8772 1.4685L24 2.5326v18.9426l-4.1228 1.0563V1.4685zm-13.3481 9.428l4.115 1.0641v8.9786l-4.115 1.0642v-11.107zM0 2.572l4.115 1.0642v16.7354L0 21.428V2.572zm17.4553 5.6205v11.107l-4.1228-1.0642V9.2568l4.1228-1.0642z"], ["Nano Banana 2", "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"], ["Gemini 3", "M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81"], ["Wan 2.5", "M3.996 4.517h5.291L8.01 6.324 4.153 7.506a1.668 1.668 0 0 0-1.165 1.601v5.786a1.668 1.668 0 0 0 1.165 1.6l3.857 1.183 1.277 1.807H3.996A3.996 3.996 0 0 1 0 15.487V8.513a3.996 3.996 0 0 1 3.996-3.996m16.008 0h-5.291l1.277 1.807 3.857 1.182c.715.227 1.17.889 1.165 1.601v5.786a1.668 1.668 0 0 1-1.165 1.6l-3.857 1.183-1.277 1.807h5.291A3.996 3.996 0 0 0 24 15.487V8.513a3.996 3.996 0 0 0-3.996-3.996m-4.007 8.345H8.002v-1.804h7.995Z"], ["Hailuo 2.3", "M11.43 3.92a.86.86 0 1 0-1.718 0v14.236a1.999 1.999 0 0 1-3.997 0V9.022a.86.86 0 1 0-1.718 0v3.87a1.999 1.999 0 0 1-3.997 0V11.49a.57.57 0 0 1 1.139 0v1.404a.86.86 0 0 0 1.719 0V9.022a1.999 1.999 0 0 1 3.997 0v9.134a.86.86 0 0 0 1.719 0V3.92a1.998 1.998 0 1 1 3.996 0v11.788a.57.57 0 1 1-1.139 0zm10.572 3.105a2 2 0 0 0-1.999 1.997v7.63a.86.86 0 0 1-1.718 0V3.923a1.999 1.999 0 0 0-3.997 0v16.16a.86.86 0 0 1-1.719 0V18.08a.57.57 0 1 0-1.138 0v2a1.998 1.998 0 0 0 3.996 0V3.92a.86.86 0 0 1 1.719 0v12.73a1.999 1.999 0 0 0 3.996 0V9.023a.86.86 0 1 1 1.72 0v6.686a.57.57 0 0 0 1.138 0V9.022a2 2 0 0 0-1.998-1.997"], ["ElevenLabs v3", "M4.6035 0v24h4.9317V0zm9.8613 0v24h4.9317V0z"], ["GPT-5.1", "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"]];
  var mh=MODELS.map(function(m){return '<span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+m[1]+'"/></svg>'+m[0]+'</span>'}).join('');
  if($('#models'))$('#models').innerHTML=mh+mh;

  /* ---------- 1. chat demo ---------- */
  /* a page can bring its own scenarios (solution pages) through window.GROWTHITY_SCEN */
  var SCEN=window.GROWTHITY_SCEN||[
    {credits:9340,steps:[
      {u:"Je vends un sérum vitamine C sur ma boutique Shopify. Je veux une vidéo qui fait vraie cliente, pas une pub."},
      {a:"Je pars sur un témoignage UGC face caméra, angle avant / après, zéro discours commercial. J'ai importé ton produit depuis ta boutique :",card:{t:'prod',img:'img-serum-pack',name:'Sérum Vitamine C · 30 ml',sub:'Importé depuis Shopify · 9 photos'}},
      {a:"Voici 3 créatrices crédibles en skincare :",card:{t:'picks',list:[['lena-serum','Léna'],['real-14','Inès'],['real-42','Camille']],pick:0}},
      {u:"Léna, elle fait vraie utilisatrice. Accroche avant / après."},
      {a:"Génération en cours : vidéo 9:16, Léna tient ton sérum face caméra.",card:{t:'gen',cost:300}},
      {a:"Voilà ta vidéo avec Léna, et le visuel produit :",card:{t:'res',video:'lena-serum',words:['3 semaines,','<em>zéro</em>','fond de teint'],img:'img-serum'}},
      {u:"Publie sur Meta : France, femmes 22-40 ans, intérêts skincare et beauté, 30 € par jour."},
      {a:"C'est parti. Voici ta campagne et l'aperçu de la pub :",card:{t:'meta',aud:['France','Femmes 22–40 ans','Skincare · Beauté','30 € / jour','Ventes'],brand:'Éclat Skin',site:'eclat-skin.fr',logo:'eclat',video:'lena-serum',text:"3 semaines, zéro fond de teint. Ma peau n'a jamais été aussi nette, je vous montre ma routine 🍊",headline:'Sérum Vitamine C · 30 ml',cta:'Acheter',m:[['Impressions',18400],['Clics',512],['Ventes',34]]}}
    ]},
    {credits:22610,steps:[
      {u:"Je veux des leads pour mon cabinet de recrutement. Cible les DRH et fondateurs de PME en France."},
      {a:"Une vidéo UGC au ton confiant et pro, plus un visuel 4:5. Voici 3 profils corporate :",card:{t:'picks',list:[['ugc-homme','Marc'],['real-14','Clara'],['real-40','Emma']],pick:0}},
      {u:"Marc, parfait."},
      {a:"Je génère la vidéo et le visuel avec l'accroche « Recruter sans y passer vos nuits ».",card:{t:'gen',cost:280}},
      {a:"Tes créas sont prêtes :",card:{t:'res',video:'ugc-homme',words:['Recruter','sans y passer','<em>vos nuits</em>'],img:'ugc-homme.poster.webp',ovl:'Recruter sans y passer vos nuits',ovlSub:'Cabinet RH · PME'}},
      {u:"Publie sur Meta : France entière, DRH et dirigeants de PME, 30 à 55 ans, 40 € par jour."},
      {a:"Campagne de leads créée, avec un formulaire Meta. Aperçu :",card:{t:'meta',aud:['France entière','30–55 ans','DRH · Dirigeants PME','40 € / jour','Leads'],brand:'Talento RH',site:'talento-rh.fr',logo:'talento',video:'ugc-homme',text:"Vous passez vos soirées à trier des CV ? On s'occupe de vos recrutements de A à Z.",headline:'Recruter sans y passer vos nuits',cta:"S'inscrire",m:[['Impressions',11950],['Clics',264],['Leads',17]]}}
    ]},
    {credits:4820,steps:[
      {u:"Je fabrique des cuisines en bois sur mesure à Nantes. Je veux des demandes de devis."},
      {a:"Parfait : une vidéo UGC tournée à l'atelier, pour montrer le savoir-faire. Voici 3 profils qui collent :",card:{t:'picks',list:[['ugc-scierie','Sofia'],['actor-thomas','Thomas'],['actor-claire','Claire']],pick:0}},
      {u:"Sofia, c'est parfait."},
      {a:"Je lance la génération : vidéo 9:16, sous-titres inclus.",card:{t:'gen',cost:280}},
      {a:"Ta vidéo est prête :",card:{t:'res',video:'ugc-scierie',words:['Votre cuisine','<em>sur mesure</em>','fabriquée','à Nantes']}},
      {u:"Publie sur Meta : 40 km autour de Nantes, propriétaires 30-60 ans, 25 € par jour."},
      {a:"Campagne locale créée. Voici l'aperçu de ta pub :",card:{t:'meta',aud:['Nantes + 40 km','30–60 ans','Propriétaires','25 € / jour','Devis'],brand:'Atelier Bois Nantais',site:'atelierboisnantais.fr',logo:'nord',video:'ugc-scierie',text:"Votre cuisine sur mesure, fabriquée dans notre atelier à Nantes. Devis gratuit en 48 h.",headline:'Cuisines en bois sur mesure',cta:'Demander un devis',m:[['Impressions',9860],['Clics',284],['Devis',14]]}}
    ]}
  ];
  if($('#chatdemo'))(function(){
  var thread=$('#thread'),cin=$('#cin'),comp=$('#composer'),creditsEl=$('#credits');
  /* data-start on #chatdemo picks the opening scenario (solution pages open on their own sector) */
  var scenBtns=$$('.scen button'),cur=Math.min(SCEN.length-1,+($('#chatdemo').dataset.start||0)),timers=[];
  function scrollEnd(){thread.scrollTop=thread.scrollHeight}
  function add(html,cls){var d=document.createElement('div');d.className=cls;d.innerHTML=html;thread.appendChild(d);scrollEnd();return d}
  function aiWrap(inner){return '<div class="av">'+LOGO+'</div><div class="stack">'+inner+'</div>'}
  async function card(c,box,w){
    var n=document.createElement('div');box.appendChild(n);
    if(c.t==='picks'){
      n.className='cardx pop';n.innerHTML='<div class="picks">'+c.list.map(function(p){return '<div class="pick">'+vid(p[0])+'<span>'+p[1]+'</span></div>'}).join('')+'</div>';
      scrollEnd();await w(1300);var ps=$$('.pick',n);ps.forEach(function(p,i){p.classList.add(i===c.pick?'sel':'dim')});await w(500);
    }else if(c.t==='gen'){
      n.className='cardx gen pop';n.innerHTML='<div class="t"><span>Génération en cours</span><b>0 %</b></div><div class="bar"><i></i></div><ul><li>Script</li><li>Voix</li><li>Tournage</li><li>Sous-titres</li></ul>';
      scrollEnd();var b=$('.bar i',n),t=$('.t b',n),li=$$('li',n);
      for(var p=0;p<=100;p+=5){b.style.width=p+'%';t.textContent=p+' %';li.forEach(function(l,i){if(p>=(i+1)*24)l.classList.add('done')});await w(70)}
      t.textContent=c.cost+' crédits';
      var left=parseInt(creditsEl.textContent.replace(/\s/g,''),10)-c.cost;creditsEl.textContent=fmtN(left);
      await w(300);
    }else if(c.t==='res'){
      n.className='pop';n.innerHTML='<div class="res"><div class="vid">'+vid(c.video)+'<span class="lbl">9:16</span><div class="cap-k"></div></div>'+(c.img?'<div class="img"><img src="media/'+(c.img.indexOf('.')>0?c.img:c.img+'.webp')+'" alt="">'+(c.ovl?'<div class="ovl">'+c.ovl+'<small>'+(c.ovlSub||'')+'</small></div>':'')+'<span class="lbl">4:5</span></div>':'')+'</div><div class="acts" style="margin-top:8px"><span class="chip">Modifier</span><span class="chip">Déclinaisons</span><span class="chip pri">Publier</span></div>';
      scrollEnd();var ck=$('.cap-k',n),k=0,words=c.words.filter(Boolean);
      ck.innerHTML=words[0];
      timers.push(setInterval(function(){k=(k+1)%words.length;ck.innerHTML=words[k]},650));
      await w(1800);
    }else if(c.t==='prod'){
      n.className='cardx prod pop';n.innerHTML='<img src="media/'+c.img+'.webp" alt=""><div><b>'+c.name+'</b><small>'+c.sub+'</small></div><span class="chip ok" style="margin-left:auto">Importé</span>';
      scrollEnd();await w(900);
    }else if(c.t==='meta'){
      n.className='metac';
      n.innerHTML='<div class="aud">'+c.aud.map(function(x,i){return '<span class="chip'+(i===c.aud.length-1?' pri':'')+'">'+x+'</span>'}).join('')+'</div>'+
        '<div class="cardx sendm"><div class="t"><span>Envoi à Meta Ads…</span><b>0 %</b></div><div class="bar"><i></i></div></div>';
      var chips=$$('.aud .chip',n);chips.forEach(function(x){x.style.opacity='0'});scrollEnd();
      for(var ci=0;ci<chips.length;ci++){chips[ci].style.opacity='';chips[ci].classList.add('pop');await w(160)}
      var sb=$('.sendm .bar i',n),sp=$('.sendm b',n);
      for(var pp=0;pp<=100;pp+=10){sb.style.width=pp+'%';sp.textContent=pp+' %';await w(60)}
      $('.sendm',n).remove();
      var row=document.createElement('div');row.className='metarow pop';
      var site=c.site||(c.brand.toLowerCase().normalize('NFD').replace(/[^a-z]/g,'')+'.fr');
      row.innerHTML='<div class="fbp"><div class="hd"><i>'+((typeof LOGOS!=='undefined'&&LOGOS[c.logo])||initialsLogo(c.brand,c.color))+'</i><div><b>'+c.brand+'</b><small>Sponsorisé · <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm4.9 6.3h-2.1a11 11 0 0 0-.9-3.9 5.6 5.6 0 0 1 3 3.9ZM8 2.5c.6.8 1.2 2.5 1.4 4.8H6.6C6.8 5 7.4 3.3 8 2.5Zm-1.9.9a11 11 0 0 0-.9 3.9H3.1a5.6 5.6 0 0 1 3-3.9ZM3.1 8.7h2.1c.1 1.4.4 2.8.9 3.9a5.6 5.6 0 0 1-3-3.9ZM8 13.5c-.6-.8-1.2-2.5-1.4-4.8h2.8C9.2 11 8.6 12.7 8 13.5Zm1.9-.9c.5-1.1.8-2.5.9-3.9h2.1a5.6 5.6 0 0 1-3 3.9Z"/></svg></small></div><span class="dots3">···</span></div>'+
        '<div class="tx">'+c.text+'</div><div class="md">'+vid(c.video)+'</div>'+
        '<div class="ft"><div><small>'+site.toUpperCase()+'</small><b>'+c.headline+'</b></div><span>'+c.cta+'</span></div>'+
        '<div class="rc"><span class="re"><i class="lk">👍</i><i class="ht">❤</i>1,2 k</span><span>48 commentaires · 12 partages</span></div>'+
        '<div class="rx"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M7 11v9H4v-9Zm0 0 4-8a2 2 0 0 1 2 2v4h5a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 16.8 20H7"/></svg>J\'aime</span><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.3A8.5 8.5 0 1 1 21 12Z"/></svg>Commenter</span><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M15 5l6 6-6 6M21 11H10a6 6 0 0 0-6 6v2"/></svg>Partager</span></div></div>'+
        '<div class="mside"><span class="chip ok">● En ligne sur Meta</span><span class="chip meta">Facebook · Instagram</span>'+c.m.map(function(m){return '<div class="met">'+m[0]+'<b>0</b></div>'}).join('')+'<span class="nofee" style="margin:0">0 % de commission sur le budget</span></div>';
      n.appendChild(row);scrollEnd();
      $$('.mside .met b',row).forEach(function(b,i){countTo(b,c.m[i][1],2000)});
      await w(2200);
    }else if(c.t==='pub'){
      n.className='cardx pubd pop';n.innerHTML='<div class="top"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.19 2.24.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z"/></svg>Publiée sur Meta Ads<span class="chip ok" style="margin-left:auto">● En ligne</span></div><div class="mets">'+c.m.map(function(m){return '<div class="met">'+m[0]+'<b>0</b></div>'}).join('')+'</div>';
      scrollEnd();$$('.met b',n).forEach(function(b,i){countTo(b,c.m[i][1],2200)});await w(2200);
    }else if(c.t==='vars'){
      n.className='cardx vars pop';n.innerHTML=c.hooks.map(function(h){return '<div class="var"><div class="r"><span>'+h[0]+'</span><b>—</b></div><div class="bar"><i></i></div></div>'}).join('');
      scrollEnd();var vs=$$('.var',n);
      for(var i=0;i<vs.length;i++){await w(450);$('.bar i',vs[i]).style.width=(c.hooks[i][1]/5*100)+'%';$('b',vs[i]).textContent=c.hooks[i][1].toFixed(1).replace('.',',')+' % CTR'}
      await w(600);vs[0].classList.add('win');$('b',vs[0]).textContent='Gagnante · '+$('b',vs[0]).textContent;await w(500);
    }else if(c.t==='leads'){
      n.className='leads';
      for(var j=0;j<c.list.length;j++){var l=c.list[j],d=document.createElement('div');d.className='lead pop';d.innerHTML='<span class="ini">'+l[0]+'</span><div><b>'+l[1]+'</b><small>'+l[2]+'</small></div><span class="chip ok">Nouveau lead</span>';n.appendChild(d);scrollEnd();await w(800)}
    }
    scrollEnd();
  }
  async function playChat(w){
    var s=SCEN[cur];timers.forEach(clearInterval);timers=[];thread.innerHTML='';
    creditsEl.textContent=fmtN(s.credits);
    cin.innerHTML='<span class="ph">Décrivez votre pub…</span>';
    var pg=$('.pg i',scenBtns[cur]);pg.style.transition='none';pg.style.width='0';
    var total=s.steps.length;
    for(var i=0;i<total;i++){
      var st=s.steps[i];
      pg.style.transition='width .4s';pg.style.width=((i+1)/total*100)+'%';
      if(st.u&&i===0){
        add('<div class="b">'+st.u+'</div>','msg me pop');
      }else if(st.u){
        await w(400);comp.classList.add('focus');
        var span=document.createElement('span');cin.innerHTML='';cin.appendChild(span);
        await typeInto(span,st.u,w,12);await w(250);
        $('.send',comp).style.transform='scale(.85)';await w(150);$('.send',comp).style.transform='';
        comp.classList.remove('focus');cin.innerHTML='<span class="ph">Décrivez votre pub…</span>';
        add('<div class="b">'+st.u+'</div>','msg me pop');
      }else{
        var typing=add('<div class="av">'+LOGO+'</div><div class="dots"><i></i><i></i><i></i></div>','msg ai fadein');
        await w(600);
        typing.className='msg ai pop';typing.innerHTML=aiWrap('<div class="b">'+st.a+'</div>');
        scrollEnd();
        if(st.card){await w(300);await card(st.card,$('.stack',typing),w)}
      }
      await w(700);
    }
    await w(7000);
    if(!REDUCE&&!w.instant){cur=(cur+1)%SCEN.length;selectTab(cur)}
  }
  function selectTab(i){scenBtns.forEach(function(b,j){b.setAttribute('aria-selected',i===j)})}
  selectTab(cur);creditsEl.textContent=fmtN(SCEN[cur].credits);
  var chatRun=demo($('#chatdemo'),playChat,{fromStart:true});
  /* render the opening message right away so the window is never empty before the chat starts */
  add('<div class="b">'+SCEN[cur].steps[0].u+'</div>','msg me');
  scenBtns.forEach(function(b,i){b.addEventListener('click',function(){cur=i;selectTab(i);chatRun.restart()})});
  })();

  /* ---------- 2. formats ---------- */
  var fbox=$('#fmtdemo');
  demo(fbox,async function(w){
    var sks=$$('.sk',fbox),go=$('#fgo'),br=$('#fbrief'),c=fbox._c||(fbox._c=cursor(fbox));
    sks.forEach(function(s){s.style.opacity='1';$('span',s).textContent='En attente'});
    await typeInto(br,'Parfum de lessive fleur de coton. Ton naturel, à la maison.',w,30);
    await moveTo(c,fbox,go,w);await click(c,go,w);c.classList.remove('on');
    for(var p=0;p<=100;p+=10){sks.forEach(function(s,i){var v=Math.max(0,Math.min(100,p-i*15));$('span',s).textContent='Rendu '+v+' %'});await w(120)}
    for(var i=0;i<sks.length;i++){$('span',sks[i]).textContent='Prêt';await w(220);sks[i].style.opacity='0'}
    var car=$('#fcar'),im=$('#fcarimg'),tx=$('#fcartxt'),ds=$$('.dts i',car);
    var SL=[['lessive-bottle','Fleur de coton'],['lessive-linge','Doux pendant 3 semaines'],['lessive-sourire','Testé et adopté']];
    for(var k=1;k<=6;k++){await w(1300);var sl=SL[k%3];im.src='media/'+sl[0]+'.webp';tx.textContent=sl[1];tx.classList.remove('fadein');void tx.offsetWidth;tx.classList.add('fadein');ds.forEach(function(d,j){d.classList.toggle('on',j===k%3)})}
    im.src='media/'+SL[0][0]+'.webp';tx.textContent=SL[0][1];ds.forEach(function(d,j){d.classList.toggle('on',j===0)});
    await w(1200);
  });

  /* ---------- editor: playhead follows the real video ---------- */
  var ebox=$('#eddemo'),wave=$('#edwave');
  if(ebox){
  for(var wi=0;wi<46;wi++){var bar=document.createElement('i');bar.style.height=(25+Math.abs(Math.sin(wi*1.7)*Math.cos(wi*.45))*70)+'%';wave.appendChild(bar)}
  (function(){
    var v=$('#edv'),img=$('#edimg'),ph=$('#edph'),caps=$$('#edcaps span'),clips=$$('#edclips span'),tm=$('#edtime'),ec=$('#edcap');
    var words=['Ce gloss','tient <em>vraiment</em>','toute <em>la journée</em>','zéro effet collant'],last=-1;
    function frame(){
      var d=v.duration||8,t=v.currentTime%d,k=t/d,row=$('#edcaps');
      ph.style.left=(row.offsetLeft+k*row.offsetWidth)+'px';var wv=$('#edwave');ph.style.top=row.offsetTop+'px';ph.style.height=(wv.offsetTop+wv.offsetHeight-row.offsetTop)+'px';ph.style.bottom='auto';
      var ci=Math.min(3,Math.floor(k*4));
      if(ci!==last){last=ci;caps.forEach(function(c,i){c.classList.toggle('on',i===ci)});ec.innerHTML=words[ci]}
      var ins=t>=d*3/8&&t<d*5/8;img.classList.toggle('on',ins);clips.forEach(function(c,i){c.classList.toggle('cut',i===(ins?1:t<d*3/8?0:2))});
      tm.textContent='00:0'+Math.floor(t)+' / 00:0'+Math.round(d);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();
  }

  /* advertiser logos (fictional brands) */
  var LOGOS={
    stride:'<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#111"/><path d="M6 20c6 1 14-3 20-10-3 7-9 12-17 13-3 0-4-2-3-3Z" fill="#fff"/></svg>',
    kaia:'<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#F6D5DF"/><text x="16" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="17" font-style="italic" fill="#9B2C55">K</text></svg>',
    eclat:'<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#F4E6D4"/><circle cx="16" cy="16" r="7" fill="#F29A2E"/><text x="16" y="19.5" text-anchor="middle" font-family="Georgia,serif" font-size="10" font-weight="700" fill="#fff">É</text></svg>',
    figue:'<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#3B2A22"/><text x="16" y="21" text-anchor="middle" font-family="Georgia,serif" font-size="12" fill="#E9D8C4" letter-spacing=".5">AF</text></svg>',
    nova:'<svg viewBox="0 0 32 32"><defs><linearGradient id="nv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2563EB"/><stop offset="1" stop-color="#06B6D4"/></linearGradient></defs><rect width="32" height="32" fill="url(#nv)"/><path d="M16 6l2.4 7.6L26 16l-7.6 2.4L16 26l-2.4-7.6L6 16l7.6-2.4Z" fill="#fff"/></svg>',
    coach:'<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#F97316"/><path d="M9 21V11l7 6 7-6v10" fill="none" stroke="#fff" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    nord:'<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#2F5D3A"/><path d="M16 6l7 10h-4l5 7H8l5-7H9Z" fill="#CFE3C1"/></svg>',
    talento:'<svg viewBox=\"0 0 32 32\"><rect width=\"32\" height=\"32\" fill=\"#1E3A8A\"/><path d=\"M9 10h14v3h-5.5v11h-3V13H9Z\" fill=\"#fff\"/></svg>',
    comptoir:'<svg viewBox=\"0 0 32 32\"><rect width=\"32\" height=\"32\" fill=\"#7C2D12\"/><path d=\"M11 7v8a2 2 0 0 0 2 2v8M9 7v5M13 7v5M21 7c-2 1-3 4-3 7h3v11\" fill=\"none\" stroke=\"#FED7AA\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>',
    lessiva:'<svg viewBox=\"0 0 32 32\"><rect width=\"32\" height=\"32\" fill=\"#DBEAFE\"/><path d=\"M16 7c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11Z\" fill=\"#2563EB\"/></svg>',
    mila:'<svg viewBox=\"0 0 32 32\"><rect width=\"32\" height=\"32\" fill=\"#FCE7F3\"/><text x=\"16\" y=\"21\" text-anchor=\"middle\" font-family=\"Georgia,serif\" font-size=\"14\" fill=\"#9D174D\">M</text></svg>',
    nails:'<svg viewBox=\"0 0 32 32\"><rect width=\"32\" height=\"32\" fill=\"#111\"/><rect x=\"13\" y=\"8\" width=\"6\" height=\"11\" rx=\"3\" fill=\"#F472B6\"/><rect x=\"12\" y=\"18\" width=\"8\" height=\"7\" rx=\"2\" fill=\"#fff\"/></svg>',
    lou:'<svg viewBox=\"0 0 32 32\"><rect width=\"32\" height=\"32\" fill=\"#FEF3C7\"/><path d=\"M8 11h16v11H8Z\" fill=\"none\" stroke=\"#92400E\" stroke-width=\"2\"/><path d=\"m8 11 8 6 8-6\" fill=\"none\" stroke=\"#92400E\" stroke-width=\"2\"/></svg>',
    lait:'<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#E0F2FE"/><path d="M13 7h6v3l2 3v12a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1V13l2-3Z" fill="#fff" stroke="#0369A1" stroke-width="1.6" stroke-linejoin="round"/><path d="M11 17h10v4H11Z" fill="#0369A1"/></svg>',
    cire:'<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#F3E9DC"/><path d="M16 7c2 3 3 5 0 8-3-3-2-5 0-8Z" fill="#C2410C"/><rect x="11" y="16" width="10" height="10" rx="2" fill="#8B5E3C"/></svg>',
    lumi:'<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#EDE7FF"/><circle cx="16" cy="16" r="7" fill="#7C5CFF"/><circle cx="19" cy="13.5" r="6" fill="#EDE7FF"/></svg>',
    volta:'<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#FACC15"/><path d="M18 5 9 18h6l-2 9 10-14h-6Z" fill="#111"/></svg>'
  };
  $$('[data-logo]').forEach(function(e){e.innerHTML=LOGOS[e.dataset.logo]||''});

  /* ---------- 3. spy: Meta Ad Library + placement previews ---------- */
  var ICON_FB='<svg viewBox="0 0 24 24" fill="#0866FF"><path d="M12 2a10 10 0 0 0-1.6 19.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.5 2.9h-2.3v7A10 10 0 0 0 12 2Z"/></svg>';
  var ICON_IG='<svg viewBox="0 0 24 24" fill="none" stroke="#E1306C" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="#E1306C"/></svg>';
  var ICO={heart:'<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><path d="M12 21s-7-4.5-9.3-9A5.2 5.2 0 0 1 12 6.3 5.2 5.2 0 0 1 21.3 12C19 16.5 12 21 12 21Z"/></svg>',com:'<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.3A8.5 8.5 0 1 1 21 12Z"/></svg>',send:'<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linejoin="round"><path d="M22 3 9.2 10.1M22 3l-7 19-3.8-8.9L2 9.4Z"/></svg>',save:'<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V3h14Z"/></svg>'};
  var ADS=[
    {logo:'stride',name:'Stride',media:'img-sneakers',days:54,win:1,site:'stride.fr',cta:'Acheter',text:'Les sneakers qui tiennent toute la journée. Livraison offerte dès 60 €.'},
    {logo:'kaia',name:'Douce Peau',media:'ugc-solaire',days:38,win:1,site:'doucepeau.fr',cta:'Acheter',text:"J'ai arrêté le fond de teint en 3 semaines, voilà ma routine."},
    {logo:'lou',name:'Papeterie Lou',media:'real-19',days:12,site:'papeterielou.fr',cta:'Acheter',text:'Des cartes écrites à la main pour toutes les occasions.'},
    {logo:'nova',name:'Nova Tech',media:'img-macbook',days:41,win:1,site:'novatech.fr',cta:'En savoir plus',text:'Le portable le plus fin de sa catégorie. Jusqu\'à 20 h d\'autonomie.'},
    {logo:'nails',name:'Avis Boost',media:'real-40',days:7,site:'avisboost.fr',cta:'Essayer',text:'Multipliez vos avis Google avec une simple roue à QR code.'},
    {logo:'volta',name:'Volta Solaire',media:'real-12',days:63,win:1,site:'volta-solaire.fr',cta:'Demander un devis',text:'Je pensais qu\'un carport solaire coûtait trop cher…'},
    {logo:'nord',name:'Maison Verte',media:'ugc-pac-awa',days:5,site:'maisonverte.fr',cta:'En savoir plus',text:'Votre jardin entretenu toute l\'année, sans y penser.'},
    {logo:'mila',name:'Mila Coaching',media:'real-14',days:19,site:'milacoaching.fr',cta:"S'inscrire",text:'Trois séances pour reprendre confiance à l\'oral.'}
  ];
  function since(d){var t=new Date(2026,9,8);t.setDate(t.getDate()-d);return t.toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})}
  function mediaHTML(m){return m.indexOf('img-')===0?'<img src="media/'+m+'.webp" alt="">':vid(m)}
  var lib=$('#ads');
  if(lib)(function(){
  lib.innerHTML=ADS.map(function(a,i){return '<div class="lc'+(a.win?'" data-win="1':'')+'" data-i="'+i+'">'+
    '<div class="lc-top"><div class="lc-st"><i></i>Active<small>ID : '+(1148203947+i*7919)+'</small><em class="lc-win">Gagnant probable</em></div><div class="lc-d">Depuis le '+since(a.days)+' · '+ICON_FB+ICON_IG+'</div></div>'+
    '<div class="lc-adv"><span class="avt" data-logo="'+a.logo+'"></span><div><b>'+a.name+'</b><small>Sponsorisé</small></div></div>'+
    '<div class="lc-tx">'+a.text+'</div><div class="lc-m">'+mediaHTML(a.media)+'</div>'+
    '<div class="lc-cta"><span>'+a.site+'</span><b>'+a.cta+'</b></div></div>'}).join('');
  $$('[data-logo]',lib).forEach(function(e){e.innerHTML=LOGOS[e.dataset.logo]||''});
  var pscreen=$('#pscreen'),ptabs=$$('#ptabs span');
  function place(a,mode){
    var L=LOGOS[a.logo]||'';
    ptabs.forEach(function(t,i){t.classList.toggle('on',i===mode)});
    if(mode===0){pscreen.innerHTML='<div class="ig-bar">Instagram<span>'+ICO.heart+ICO.send+'</span></div><div class="ig-hd"><span class="avt">'+L+'</span><div><b>'+a.name.toLowerCase().replace(/\s/g,'')+'</b><small>Sponsorisé</small></div><span class="dots3">···</span></div><div class="ig-md">'+mediaHTML(a.media)+'</div><div class="ig-cta">'+a.cta+'<span>›</span></div><div class="ig-ic">'+ICO.heart+ICO.com+ICO.send+'<span class="sv">'+ICO.save+'</span></div><div class="ig-likes">'+(1200+a.days*41).toLocaleString('fr-FR')+' J\'aime</div><div class="ig-cap"><b>'+a.name.toLowerCase().replace(/\s/g,'')+'</b> '+a.text+'</div>'}
    else if(mode===1){pscreen.innerHTML='<div class="st-v">'+mediaHTML(a.media)+'</div><div class="st-top"><div class="st-prog"><i><b></b></i><i><b></b></i><i><b></b></i></div><div class="st-who"><span class="avt">'+L+'</span><b>'+a.name+'</b><small>Sponsorisé</small></div></div><div class="st-txt">'+a.text+'</div><div class="st-cta">⌃<span>'+a.cta+'</span></div>';var pb=$$('.st-prog b',pscreen);pb[0].style.width='100%';}
    else{pscreen.innerHTML='<div class="fb-bar">facebook<span style="font-size:14px;color:#1C1E21">⌕</span></div><div class="fb-hd"><span class="avt">'+L+'</span><div><b>'+a.name+'</b><small>Sponsorisé · 🌐</small></div><span class="dots3" style="margin-left:auto">···</span></div><div class="fb-tx">'+a.text+'</div><div class="fb-md">'+mediaHTML(a.media)+'</div><div class="fb-cta"><div><small>'+a.site+'</small><b>'+a.name+'</b></div><span>'+a.cta+'</span></div><div class="fb-rx"><span>J\'aime</span><span>Commenter</span><span>Partager</span></div>'}
  }
  place(ADS[1],0);
  var sbox=$('#spydemo');
  demo(sbox,async function(w){
    var cards=$$('.lc',lib),scan=$('#scan'),q=$('#sq'),btn=$('#inspire'),toast=$('#spytoast'),wc=$('#wcount'),c=sbox._c||(sbox._c=cursor(sbox));
    var sst=$('#sstat');cards.forEach(function(a){a.classList.remove('win','lose','sel','pop');a.style.opacity='0'});toast.classList.remove('on');wc.textContent='0';sst.className='chip';sst.textContent='Recherche…';
    await typeInto(q,'vidéo UGC face caméra',w,30);sst.className='chip pri';sst.textContent='Analyse de 1 284 pubs actives…';
    for(var i=0;i<cards.length;i++){if(cards[i].offsetParent===null)continue;cards[i].style.opacity='';cards[i].classList.add('pop');await w(70)}
    await w(300);
    var wrap=lib.parentNode,gw=wrap.offsetWidth;scan.style.opacity='1';
    for(var x=0;x<=30;x++){scan.style.left=(x/30*gw)+'px';await w(25)}
    scan.style.opacity='0';
    var n=0;for(var j=0;j<cards.length;j++){if(cards[j].dataset.win){cards[j].classList.add('win');n++;wc.textContent=n;await w(260)}else cards[j].classList.add('lose')}
    sst.className='chip ok';sst.textContent='● '+n+' gagnantes trouvées';
    var picks=[1,5,0];
    for(var k=0;k<picks.length;k++){
      var card=cards[picks[k]];if(!card||card.offsetParent===null)continue;
      await moveTo(c,sbox,card,w);await click(c,card,w);cards.forEach(function(x){x.classList.remove('sel')});card.classList.add('sel');
      for(var m=0;m<3;m++){place(ADS[picks[k]],m);await w(1500)}
    }
    await moveTo(c,sbox,btn,w);await click(c,btn,w);c.classList.remove('on');
    toast.classList.add('on');await w(4500);toast.classList.remove('on');cards.forEach(function(a){a.classList.remove('pop')});
    place(ADS[1],0);await w(400);
  });
  })();

  /* ---------- 4. batch ---------- */
  var bbox=$('#batchdemo');
  demo(bbox,async function(w){
    var url=$('#burl'),ut=$('#burlt'),go=$('#bgo'),cr=$$('#crawl div'),brand=$('#brand'),ang=$$('#bangles .chip'),figs=$$('#bgrid figure'),cnt=$('#bcount'),stt=$('#bstatus'),c=bbox._c||(bbox._c=cursor(bbox));
    cr.forEach(function(d){d.style.opacity='0'});brand.style.opacity='0';ang.forEach(function(a){a.style.opacity='0'});figs.forEach(function(f){f.classList.add('empty','shimmer')});cnt.textContent='0';stt.className='chip';stt.textContent='En attente';
    url.classList.add('focus');await typeInto(ut,'atelier-figue.fr',w,55);
    await moveTo(c,bbox,go,w);await click(c,go,w);c.classList.remove('on');url.classList.remove('focus');
    stt.textContent='Analyse du site…';
    for(var i=0;i<cr.length;i++){cr[i].style.opacity='1';cr[i].classList.add('pop');await w(260)}
    brand.style.opacity='1';brand.classList.add('pop');await w(700);
    stt.textContent='Plan de créas…';
    for(var a=0;a<ang.length;a++){ang[a].style.opacity='1';ang[a].classList.add('pop');await w(220)}
    stt.textContent='Production…';
    for(var f=0;f<figs.length;f++){await w(320);figs[f].classList.remove('empty','shimmer');figs[f].classList.add('pop');countTo(cnt,(f+1)*4,300)}
    await w(400);stt.className='chip ok';stt.textContent='● Lot prêt à publier';
    await w(5500);cr.forEach(function(d){d.classList.remove('pop')});brand.classList.remove('pop');ang.forEach(function(a){a.classList.remove('pop')});figs.forEach(function(f){f.classList.remove('pop')});
  });

  /* ---------- 6. publish ---------- */
  var pbox=$('#pubdemo');
  demo(pbox,async function(w){
    var objs=$$('[data-o]',pbox),zsel=$('#zsel'),zin=$('#zin'),zdrop=$('#zdrop'),reach=$('#reach'),rbar=$('#reachbar'),sl=$('#slider'),bud=$('#bud'),btn=$('#pbtn'),bl=$('#pbl'),m=[$('#m1'),$('#m2'),$('#m3')],c=pbox._c||(pbox._c=cursor(pbox));
    objs.forEach(function(o){o.className='chip'});$$('.zchip',zsel).slice(1).forEach(function(z){z.remove()});zin.textContent='';reach.textContent='1,2 M personnes';rbar.style.width='30%';
    $('i',sl).style.width='15%';$('b',sl).style.left='15%';bud.textContent='10 €';btn.classList.remove('done');bl.textContent='Publier sur Meta';m.forEach(function(x){x.textContent='0'});
    await w(400);await moveTo(c,pbox,objs[2],w);await click(c,objs[2],w);objs[2].className='chip pri';
    var Q=[['Lyon',[['69','Rhône','Auvergne-Rhône-Alpes'],['⌖','Lyon + 20 km','Rayon']],'2,1 M personnes',55],['Lille',[['59','Nord','Hauts-de-France'],['⌖','Lille + 15 km','Rayon']],'2,9 M personnes',78]];
    for(var q=0;q<Q.length;q++){
      await moveTo(c,pbox,zsel,w);zsel.classList.add('focus');
      await typeInto(zin,Q[q][0],w,90);
      zdrop.innerHTML=Q[q][1].map(function(o){return '<div><b>'+o[0]+'</b>'+o[1]+'<small>'+o[2]+'</small></div>'}).join('');zdrop.classList.add('on');
      var first=$('div',zdrop);await w(300);await moveTo(c,pbox,first,w);first.classList.add('hl');await click(c,first,w);
      zdrop.classList.remove('on');zin.textContent='';
      var o=Q[q][1][0],chip=document.createElement('span');chip.className='zchip pop';chip.innerHTML=o[0]+' · '+o[1]+'<i>×</i>';zsel.insertBefore(chip,zin);
      reach.textContent=Q[q][2];rbar.style.width=Q[q][3]+'%';zsel.classList.remove('focus');await w(300);
    }
    await moveTo(c,pbox,$('b',sl),w);
    $('i',sl).style.width='45%';$('b',sl).style.left='45%';
    var b0=performance.now();(function tick(t){var k=Math.min(1,(t-b0)/900);bud.textContent=Math.round(10+20*k)+' €';if(k<1&&!REDUCE)requestAnimationFrame(tick);else bud.textContent='30 €'})(b0);
    var r=sl.getBoundingClientRect(),bx=pbox.getBoundingClientRect();c.style.transform='translate('+(r.left-bx.left+r.width*.45)+'px,'+(r.top-bx.top)+'px)';
    await w(1000);
    await moveTo(c,pbox,btn,w);await click(c,btn,w);c.classList.remove('on');
    bl.textContent='Publication…';await w(1100);btn.classList.add('done');bl.textContent='En ligne sur Meta ✓';
    countTo(m[0],18240,1600);countTo(m[1],512,1600);countTo(m[2],64,1600);
    await w(6500);
  });

  /* ---------- 7. performance: leads first ---------- */
  var perf=$('#perfdemo'),pbody=$('#perfdemo .perf');
  demo(perf,async function(w){
    var q=$('#pq'),a=$('#pa'),line=$('#pline'),area=$('#parea'),dot=$('#pdot'),reco=document.createElement('div'),b=$('.b',a),kp=$$('.kpi',a),chart=$('.chart',a);
    $$('.extra',pbody).forEach(function(x){x.remove()});pbody.scrollTop=0;
    [a,reco,chart].concat(kp).forEach(function(x){x.style.opacity='0'});q.style.opacity='0';line.style.transition='none';line.style.strokeDashoffset='1';area.style.opacity='0';dot.style.opacity='0';
    await w(500);q.style.opacity='';q.classList.add('pop');await w(700);
    a.style.opacity='';b.innerHTML='<span class="dots" style="padding:0;background:none"><i></i><i></i><i></i></span>';await w(900);
    b.textContent="Très bonne semaine : 142 leads, dont la moitié grâce à la vidéo UGC de Léa.";
    for(var i=0;i<kp.length;i++){kp[i].style.opacity='';kp[i].classList.add('pop');await w(250)}
    countTo($('#k1'),142,900);
    countTo($('#k2'),8.3,900,function(v){return v.toFixed(2).replace('.',',')+' €'});
    countTo($('#k3'),1178,900,function(v){return fmtN(v)+' €'});
    chart.style.opacity='';chart.classList.add('pop');await w(200);
    line.style.transition='stroke-dashoffset 1.6s ease';line.style.strokeDashoffset='0';area.style.transition='opacity 1s .6s';area.style.opacity='1';
    await w(1600);dot.style.opacity='1';await w(300);reco.style.opacity='';reco.classList.add('pop');
    await w(1600);
    var q2=document.createElement('div');q2.className='msg me pop extra';q2.innerHTML='<div class="b">Montre-moi les leads.</div>';pbody.appendChild(q2);pbody.scrollTop=pbody.scrollHeight;
    await w(700);
    var a2=document.createElement('div');a2.className='msg ai fadein extra';a2.innerHTML='<div class="av">'+LOGO+'</div><div class="dots"><i></i><i></i><i></i></div>';pbody.appendChild(a2);pbody.scrollTop=pbody.scrollHeight;
    await w(800);
    a2.className='msg ai pop extra';a2.style.maxWidth='100%';a2.innerHTML='<div class="av">'+LOGO+'</div><div class="stack" style="flex:1"><div class="b">Voici les derniers leads, avec la pub qui les a apportés :</div><div class="leads"></div></div>';
    var list=$('.leads',a2),L=[['CM','Camille M.','camille.m@… · 06 •• •• 41 12','ugc-femme','UGC Léa'],['TR','Thomas R.','thomas.r@… · 07 •• •• 18 90','img-bougie','Carrousel'],['NB','Nadia B.','nadia.b@… · 06 •• •• 73 05','ugc-femme','UGC Léa'],['LP','Lucas P.','lucas.p@… · 06 •• •• 22 67','bougie-916','Vidéo produit']];
    for(var j=0;j<L.length;j++){var l=L[j],d=document.createElement('div');d.className='lead pop';
      var thumb=l[3].indexOf('img-')===0?'media/'+l[3]+'.webp':'media/'+l[3]+'.poster.webp';
      d.innerHTML='<span class="ini">'+l[0]+'</span><div><b>'+l[1]+'</b><small>'+l[2]+'</small></div><span class="src"><img src="'+thumb+'" alt="">'+l[4]+'</span>';
      list.appendChild(d);pbody.scrollTop=pbody.scrollHeight;await w(650)}
    await w(6500);[q,chart,reco].concat(kp).forEach(function(x){x.classList.remove('pop')});
  });

  /* ---------- media buyer ---------- */
  function spark(svg){
    var v=svg.dataset.s.split(',').map(Number),vb=svg.viewBox.baseVal,W=vb.width,H=vb.height,mn=Math.min.apply(0,v),mx=Math.max.apply(0,v),r=(mx-mn)||1;
    var pts=v.map(function(x,i){return (i/(v.length-1)*W).toFixed(1)+','+(H-2-(x-mn)/r*(H-4)).toFixed(1)}).join(' ');
    var bad=svg.dataset.good==='bad',col=bad?'var(--bad)':'var(--ok)';
    svg.innerHTML='<polyline points="'+pts+'" fill="none" stroke="'+col+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0" style="transition:stroke-dashoffset 1s ease"/>';
  }
  $$('#mbdemo svg[data-s]').forEach(spark);
  var mbox=$('#mbdemo');
  demo(mbox,async function(w){
    var ks=$$('#mkpis .mk'),head=$('#mbhead'),sg=$$('#sugs .sug'),cr=$$('#creas .crea'),bud=$('#mbbudget'),toast=$('#mbtoast'),freq=$('#freq'),fb=$('#freqbar'),c=mbox._c||(mbox._c=cursor(mbox));
    var full=head.dataset.t||(head.dataset.t=head.textContent);
    ks.forEach(function(k){k.style.opacity='0'});sg.forEach(function(x){x.style.opacity='0';x.classList.remove('done','pop')});cr.forEach(function(x){x.style.opacity='0';x.classList.remove('pop')});
    head.textContent='';toast.classList.remove('on');fb.style.width='20%';freq.textContent='1,0';
    $$('#mbdemo polyline').forEach(function(p){p.style.transition='none';p.style.strokeDashoffset='1'});
    for(var i=0;i<ks.length;i++){ks[i].style.opacity='';ks[i].classList.add('pop');var b=$('b',ks[i]),v=parseFloat(b.dataset.v),f=b.dataset.f;
      countTo(b,v,900,f==='eur'?function(x){return fmtN(x)+' €'}:f==='eur2'?function(x){return x.toFixed(2).replace('.',',')+' €'}:f==='x'?function(x){return x.toFixed(1).replace('.',',')+'×'}:undefined);
      var pl=$('polyline',ks[i]);void pl.offsetWidth;pl.style.transition='stroke-dashoffset 1s ease';pl.style.strokeDashoffset='0';await w(160)}
    for(var j=0;j<cr.length;j++){cr[j].style.opacity='';cr[j].classList.add('pop');var p2=$('polyline',cr[j]);void p2.offsetWidth;p2.style.transition='stroke-dashoffset 1s ease';p2.style.strokeDashoffset='0';await w(160)}
    countTo(freq,4.8,1200,function(x){return x.toFixed(1).replace('.',',')});fb.style.transition='width 1.2s ease';fb.style.width='80%';
    await typeInto(head,full,w,14);
    for(var k=0;k<sg.length;k++){await w(350);sg[k].style.opacity='';sg[k].classList.add('pop')}
    await w(900);await moveTo(c,mbox,bud,w);await click(c,bud,w);c.classList.remove('on');
    toast.classList.add('on');sg[0].classList.add('done');await w(4500);toast.classList.remove('on');
    await w(3000);
  });

  /* ---------- mini demos ---------- */
  demo($('#m-tpl'),async function(w){
    var opts=$$('#m-tpl .opts div'),big=$('#m-tpl .big img'),nm=$('#tpln');
    for(var i=0;i<opts.length;i++){
      opts.forEach(function(o,j){o.classList.toggle('on',i===j)});
      var src=$('img',opts[i]);big.src=src.src;big.style.filter=src.style.filter||'';big.style.transform='scale(1.08)';
      nm.textContent='Style '+$('span',opts[i]).textContent;await w(80);big.style.transform='scale(1)';await w(1300);
    }
  });
  (function(){
    var items=[['img-sneakers','q','Mode'],['real-14','t','Beauté'],['img-macbook','q','Tech'],['real-04','t','Food'],['img-bougie','q','Maison'],['ugc-solaire','t','Beauté'],['real-40','t','Tech'],['ugc-homme','t','Mode'],['real-19','t','Maison']];
    var cols=$('#icols');if(!cols)return;
    for(var c=0;c<3;c++){var col=document.createElement('div');col.className='icol';var h='';
      for(var r=0;r<3;r++){var it=items[(c*3+r)%items.length];h+='<div class="icard '+it[1]+'" data-cat="'+it[2]+'">'+(it[1]==='t'?vid(it[0]):'<img src="media/'+it[0]+'.webp" alt="">')+'</div>'}
      col.innerHTML=h+h;cols.appendChild(col)}
  })();
  demo($('#m-insp'),async function(w){
    var ch=$$('#ichips .chip'),sv=$('#isave'),cards=$$('#icols .icard');
    for(var i=0;i<ch.length;i++){
      ch.forEach(function(c,j){c.className='chip'+(j===i?' dark':'')});
      var cat=ch[i].textContent;cards.forEach(function(c){c.style.opacity=(i===0||c.dataset.cat===cat)?'1':'.25'});
      if(i===2||i===4){var vis=cards.filter(function(c){return c.style.opacity==='1'});var pick=vis[1];if(pick){var h=document.createElement('i');h.textContent='♥';h.className='pop';pick.appendChild(h);sv.classList.add('on');await w(1300);sv.classList.remove('on');h.remove()}}
      await w(1300);
    }
  });
  demo($('#m-leads'),async function(w){
    var box=$('#lvl'),rows=[['lead','JM','Julie M.','Formulaire Meta · il y a 1 min'],['sale','','Vente attribuée · UGC Léa','+64 €'],['lead','KB','Karim B.','Formulaire Meta · il y a 3 min'],['sale','','Vente attribuée · Carrousel bougie','+32 €']];
    box.innerHTML='';
    for(var i=0;i<rows.length;i++){var r=rows[i],d=document.createElement('div');
      if(r[0]==='lead'){d.className='lead pop';d.innerHTML='<span class="ini">'+r[1]+'</span><div><b>'+r[2]+'</b><small>'+r[3]+'</small></div><span class="chip ok">Nouveau</span>'}
      else{d.className='sale pop';d.innerHTML=CHECK.replace('<svg','<svg width="16" height="16"')+r[2]+'<b>'+r[3]+'</b>'}
      box.appendChild(d);await w(900)}
    await w(2500);
  });
  demo($('#m-clone'),async function(w){
    var scan=$('#m-clone .scan'),out=$('#m-clone .out video'),lab=$('#m-clone .out span');
    out.style.opacity='0';lab.textContent='Création…';scan.style.transition='none';scan.style.top='-30%';
    await w(300);scan.style.transition='top 1.6s ease-in-out';scan.style.top='100%';await w(1700);
    out.style.opacity='1';lab.textContent='Acteur prêt';await w(3200);
  });
  demo($('#m-fold'),async function(w){
    var box=$('#m-fold .fold'),fly=$('#fly'),th=$$('#m-fold .th img'),li=$$('#m-fold li'),plan=[[0,1],[3,2],[4,0],[2,3]];
    for(var i=0;i<plan.length;i++){
      var src=th[plan[i][0]],dst=li[plan[i][1]],b=box.getBoundingClientRect(),s=src.getBoundingClientRect(),d=dst.getBoundingClientRect();
      fly.src=src.src;fly.style.transition='none';fly.style.transform='translate('+(s.left-b.left)+'px,'+(s.top-b.top)+'px)';fly.style.opacity='1';src.style.opacity='.25';
      await w(250);fly.style.transition='';fly.style.transform='translate('+(d.left-b.left+d.width-50)+'px,'+(d.top-b.top-10)+'px) scale(.6)';
      await w(700);fly.style.opacity='0';dst.classList.add('hot');var cnt=$('b',dst);cnt.textContent=parseInt(cnt.textContent,10)+1;src.style.opacity='';
      await w(700);dst.classList.remove('hot');
    }
  });
  demo($('#m-team'),async function(w){
    var bs=$$('#m-team .bsw'),nv=$('#newav'),msg=$('#teammsg'),names=[['Léo','Leadeurs'],['Inès','Peakture'],['Hugo','Nova Coffee']];
    for(var i=0;i<bs.length;i++){
      bs.forEach(function(b,j){b.classList.toggle('on',i===j)});
      nv.style.transform='scale(0)';await w(300);nv.style.transition='transform .4s cubic-bezier(.2,1.4,.4,1)';nv.style.transform='scale(1)';nv.textContent=names[i][0].slice(0,2).toUpperCase();
      msg.textContent=names[i][0]+' a rejoint '+names[i][1]+' · Éditeur';await w(1700);
    }
  });

  /* before / after */
  demo($('#vs'),async function(w){
    var xs=$$('#vs .without li'),ys=$$('#vs .with li');
    xs.forEach(function(x){x.classList.remove('x')});ys.forEach(function(y){y.classList.remove('in')});
    await w(300);
    for(var i=0;i<xs.length;i++){xs[i].classList.add('x');await w(260);ys[i].classList.add('in');await w(260)}
    await w(999999);
  });

  /* reveal */
  var rv=$$('.rv');
  if('IntersectionObserver' in window && !REDUCE){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px 10% 0px'});
    rv.forEach(function(e){if(e.getBoundingClientRect().top<innerHeight)e.classList.add('in');else io.observe(e)});
  }else rv.forEach(function(e){e.classList.add('in')});
  if(REDUCE)$$('#vs .with li').forEach(function(y){y.classList.add('in')});

  /* Video playback that survives mobile autoplay rules: every video is explicitly muted and inline
     (iOS needs the property, not just the attribute), only on-screen videos play, and any play() the
     browser refused (Low Power Mode, data saver) is retried on the first touch or scroll. */
  var onScreen=new Set(),refused=new Set();
  function prime(v){v.addEventListener('error',function(){if(v.dataset.src&&String(v.src).indexOf('blob:')===0){blobs.delete(v.dataset.src);v.src=v.dataset.src;tryPlay(v)}});v.muted=true;v.defaultMuted=true;v.playsInline=true;v.setAttribute('muted','');v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');v.loop=true}
  function tryPlay(v){var p=v.play();if(p&&p.catch)p.then(function(){refused.delete(v)}).catch(function(){refused.add(v)})}
  function retry(){onScreen.forEach(function(v){if(v.paused)tryPlay(v)})}
  ['touchstart','pointerdown','scroll','keydown'].forEach(function(ev){addEventListener(ev,function(){if(refused.size||onScreen.size)retry()},{passive:true})});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)retry()});
  /* Load each clip as a blob first: iOS Safari only plays MP4 from servers that answer byte-range
     requests, a blob URL sidesteps that. Falls back to the direct URL if fetching fails. */
  var blobs=new Map(),pending=new Map();
  function setSrc(v,u){if(!onScreen.has(v))return;v.src=u;tryPlay(v)}
  function loadSrc(v){
    var url=v.dataset.src;
    if(blobs.has(url))return setSrc(v,blobs.get(url));
    if(!window.fetch||!window.URL||!URL.createObjectURL)return setSrc(v,url);
    if(!pending.has(url))pending.set(url,fetch(url).then(function(r){if(!r.ok)throw 0;return r.blob()}).then(function(b){var u=URL.createObjectURL(new Blob([b],{type:'video/mp4'}));blobs.set(url,u);return u}).catch(function(){return url}));
    pending.get(url).then(function(u){setSrc(v,u)});
  }
  var seen=new WeakSet(),vo=null;
  if('IntersectionObserver' in window){
    vo=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;if(e.isIntersecting){onScreen.add(v);if(v.dataset.src&&!v.getAttribute('src'))loadSrc(v);else tryPlay(v)}else{onScreen.delete(v);v.pause();if(v.dataset.src&&v.getAttribute('src')){v.removeAttribute('src');v.load()}}})},{rootMargin:'100px'});
  }
  function watch(){$$('video').forEach(function(v){if(seen.has(v))return;seen.add(v);prime(v);if(vo)vo.observe(v);else tryPlay(v)})}
  watch();new MutationObserver(watch).observe(document.body,{childList:true,subtree:true});
})();

/* Mega menu (desktop: hover or click opens one panel, Escape or outside click closes) and mobile sheet. */
(function(){
  var bar=document.querySelector('.nav .bar');if(!bar)return;
  var mega=bar.querySelector('.mega'),btns=[].slice.call(bar.querySelectorAll('.nl')),panels=mega?[].slice.call(mega.querySelectorAll('.mpanel')):[],t=0;
  var hover=matchMedia('(hover:hover) and (pointer:fine)').matches;
  function open(id){clearTimeout(t);btns.forEach(function(b){b.setAttribute('aria-expanded',b.dataset.p===id)});panels.forEach(function(p){p.classList.toggle('on',p.id==='mp-'+id)});mega.classList.add('on')}
  function close(){btns.forEach(function(b){b.setAttribute('aria-expanded','false')});mega.classList.remove('on')}
  function later(){clearTimeout(t);t=setTimeout(close,160)}
  btns.forEach(function(b){
    b.addEventListener('click',function(){b.getAttribute('aria-expanded')==='true'&&mega.classList.contains('on')?close():open(b.dataset.p)});
    if(hover){b.addEventListener('mouseenter',function(){open(b.dataset.p)});b.addEventListener('mouseleave',later)}
  });
  if(mega&&hover){mega.addEventListener('mouseenter',function(){clearTimeout(t)});mega.addEventListener('mouseleave',later)}
  document.addEventListener('click',function(e){if(!bar.contains(e.target))close()});
  var burger=bar.querySelector('.burger'),sheet=bar.querySelector('.mnav');
  function sheetOpen(on){if(!sheet)return;sheet.classList.toggle('on',on);burger.setAttribute('aria-expanded',on);document.body.classList.toggle('menu-open',on)}
  if(burger)burger.addEventListener('click',function(){sheetOpen(!sheet.classList.contains('on'))});
  document.addEventListener('click',function(e){if(sheet&&sheet.classList.contains('on')&&!bar.contains(e.target))sheetOpen(false)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){close();sheetOpen(false)}});
  addEventListener('resize',function(){if(innerWidth>1000)sheetOpen(false)});
})();

/* Actor gallery filters (Acteurs UGC page). */
(function(){
  var f=document.getElementById('afil');if(!f)return;
  var bs=[].slice.call(f.querySelectorAll('button')),ts=[].slice.call(document.querySelectorAll('#agal .atile'));
  bs.forEach(function(b){b.addEventListener('click',function(){
    bs.forEach(function(x){x.classList.toggle('on',x===b)});
    var k=b.dataset.k;ts.forEach(function(t){t.classList.toggle('off',k!=='all'&&(' '+t.dataset.k+' ').indexOf(' '+k+' ')<0)});
  })});
})();
