"""Voice-over takes, synthesised offline with Piper (voice fr-siwis-medium from
https://github.com/rhasspy/piper/releases/tag/v0.0.2). Writes public/vo/NN.wav.
Run: PIPER_MODEL=/path/fr-siwis-medium.onnx python3 scripts/voiceover.py
"""
import os, subprocess, wave
MODEL = os.environ.get('PIPER_MODEL', 'fr-siwis-medium.onnx')
LINES = [
 ("01", "Une agence. Deux semaines. Trois mille euros. Et si une phrase suffisait ?", 0.9),
 ("02", "Avec Growthity, vos pubs Méta sont créées, et publiées en deux minutes.", 0.9),
 ("03", "Vous décrivez votre produit, en une phrase. Growthity écrit le script, choisit l'actrice, et tourne la vidéo. Résultat : une vraie vidéo UGC, sous-titrée, prête à publier. En deux minutes.", 1.0),
 ("04", "Plus de cinq cents acteurs IA, avec des voix françaises naturelles. Il y a forcément le vôtre.", 0.92),
 ("05", "Vidéo, image, carrousel. Tous les formats Méta, depuis le même brief.", 0.95),
 ("06", "Besoin d'inspiration ? Growthity analyse les pubs qui gagnent dans votre marché, et s'en inspire pour vous.", 0.92),
 ("07", "Un clic, et votre campagne est en ligne sur Facebook et Instagram.", 1.0),
 ("08", "Votre prochaine campagne Méta est à une phrase. Growthity. Commencez gratuitement.", 1.05),
]
for n, text, ls in LINES:
    out = f'public/vo/{n}.wav'
    subprocess.run(['python3','-m','piper','-m', MODEL,'-f',out,'--length-scale',str(ls),'--sentence-silence','0.25'], input=text.encode(), check=True, capture_output=True)
    w = wave.open(out); print(n, round(w.getnframes()/w.getframerate(),2))
