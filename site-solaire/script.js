(function () {
  "use strict";

  // URL qui reçoit les leads (webhook Zapier/Make, Google Apps Script, votre API…).
  // Laisser vide pour tester : le lead est affiché dans la console.
  var FORM_ENDPOINT = "";

  var form = document.getElementById("leadForm");
  var step1 = document.getElementById("step1");
  var step2 = document.getElementById("step2");
  var done = document.getElementById("done");
  var stepNum = document.getElementById("stepNum");
  var stepTitle = document.getElementById("stepTitle");
  var stepBar = document.getElementById("stepBar");
  var nonProprio = document.getElementById("nonProprio");
  var submitBtn = document.getElementById("submitBtn");

  // ---- Validation ----
  // Numéros français : 0X XX XX XX XX ou +33 / 0033 X XX XX XX XX (X de 1 à 9)
  function normalizePhone(v) {
    var s = v.replace(/[\s.\-()]/g, "");
    if (/^\+33/.test(s)) s = "0" + s.slice(3);
    else if (/^0033/.test(s)) s = "0" + s.slice(4);
    return s;
  }
  function isFrenchPhone(v) {
    return /^0[1-9]\d{8}$/.test(normalizePhone(v));
  }
  function formatPhone(v) {
    return normalizePhone(v).replace(/(\d{2})(?=\d)/g, "$1 ");
  }

  var rules = {
    nom: function (v) {
      v = v.trim();
      if (!v) return "Veuillez indiquer votre nom complet.";
      if (v.length < 3 || !/\s/.test(v)) return "Indiquez votre prénom et votre nom.";
      return "";
    },
    telephone: function (v) {
      if (!v.trim()) return "Veuillez indiquer votre numéro de téléphone.";
      if (!isFrenchPhone(v)) return "Numéro invalide. Format attendu : 06 12 34 56 78 ou +33 6 12 34 56 78.";
      return "";
    },
    email: function (v) {
      return v.trim() ? "" : "Veuillez indiquer votre adresse e-mail.";
    },
    cp: function (v) {
      v = v.trim();
      if (!v) return "Veuillez indiquer votre code postal.";
      if (!/^\d{4,5}$/.test(v)) return "Le code postal doit contenir 4 ou 5 chiffres.";
      return "";
    }
  };

  function setError(id, msg) {
    var input = document.getElementById(id);
    var err = document.getElementById("err-" + id);
    err.textContent = msg;
    if (input && input.type !== "checkbox") {
      input.classList.toggle("is-invalid", !!msg);
      input.classList.toggle("is-valid", !msg && input.value.trim() !== "");
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      input.setAttribute("aria-describedby", "err-" + id);
    }
    return !msg;
  }

  function validateField(id) {
    return setError(id, rules[id](document.getElementById(id).value));
  }

  // Code postal : chiffres uniquement
  var cp = document.getElementById("cp");
  cp.addEventListener("input", function () {
    cp.value = cp.value.replace(/\D/g, "").slice(0, 5);
  });

  var tel = document.getElementById("telephone");
  tel.addEventListener("blur", function () {
    if (isFrenchPhone(tel.value)) tel.value = formatPhone(tel.value);
  });

  Object.keys(rules).forEach(function (id) {
    var input = document.getElementById(id);
    input.addEventListener("blur", function () { if (input.value) validateField(id); });
    input.addEventListener("input", function () {
      if (input.classList.contains("is-invalid")) validateField(id);
    });
  });

  // ---- Étapes ----
  function showStep(n) {
    step1.hidden = n !== 1;
    step2.hidden = n !== 2;
    done.hidden = n !== 3;
    stepNum.textContent = Math.min(n, 2);
    stepTitle.textContent = n === 1 ? "Votre logement" : n === 2 ? "Vos coordonnées" : "Demande envoyée";
    stepBar.style.width = n === 1 ? "50%" : "100%";
    var card = document.getElementById("eligibilite");
    if (card.getBoundingClientRect().top < 0) card.scrollIntoView({ block: "start" });
  }

  function owner() {
    var c = form.querySelector('input[name="proprietaire"]:checked');
    return c ? c.value : "";
  }

  form.querySelectorAll('input[name="proprietaire"]').forEach(function (r) {
    r.addEventListener("change", function () {
      setError("proprietaire", "");
      nonProprio.hidden = owner() !== "non";
      if (owner() === "oui") showStep(2);
    });
  });

  document.getElementById("toStep2").addEventListener("click", function () {
    var o = owner();
    if (!o) return setError("proprietaire", "Veuillez répondre à la question.");
    if (o === "non") { nonProprio.hidden = false; return; }
    showStep(2);
    document.getElementById("nom").focus();
  });

  document.getElementById("back").addEventListener("click", function () { showStep(1); });

  // ---- Envoi ----
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true, first = null;
    Object.keys(rules).forEach(function (id) {
      if (!validateField(id)) { ok = false; first = first || document.getElementById(id); }
    });
    var rgpd = document.getElementById("rgpd");
    if (!setError("rgpd", rgpd.checked ? "" : "Votre accord est nécessaire pour être recontacté(e).")) {
      ok = false; first = first || rgpd;
    }
    if (!ok) { first.focus(); return; }

    var lead = {
      proprietaire: owner(),
      nom: document.getElementById("nom").value.trim(),
      telephone: formatPhone(tel.value),
      email: document.getElementById("email").value.trim(),
      code_postal: cp.value.trim(),
      consentement: true,
      date: new Date().toISOString(),
      page: location.href
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Envoi en cours…";

    var send = FORM_ENDPOINT
      ? fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lead)
        }).then(function (r) { if (!r.ok) throw new Error(r.status); })
      : Promise.resolve(console.log("Lead (aucun FORM_ENDPOINT configuré) :", lead));

    send.then(function () {
      showStep(3);
      done.focus();
    }).catch(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = "Recevoir mon étude gratuite";
      setError("rgpd", "L'envoi a échoué. Merci de réessayer dans quelques instants.");
    });
  });
})();
