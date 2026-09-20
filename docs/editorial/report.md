# Production puzzle editorial report

> Structural checks do not prove semantic uniqueness. Human editorial review is required.

TOTAL PUZZLES: 17
Approved playable: 0
Approved-release readiness: NOT READY

## Locale coverage

| Locale | Present | Approved | Missing positions |
| --- | ---: | ---: | --- |
| FR | 15 | 0 | 12–20, 25–100 |
| EN | 1 | 0 | 2–100 |
| ES | 1 | 0 | 2–100 |

## Release difficulty profile (per locale)

- Positions 1–10: difficulty 1 (10 levels)
- Positions 11–35: difficulty 2 (25 levels)
- Positions 36–60: difficulty 3 (25 levels)
- Positions 61–80: difficulty 4 (20 levels)
- Positions 81–100: difficulty 5 (20 levels)

## Counts by status

- draft: 17
- structurally_valid: 0
- editorial_review: 0
- approved: 0
- rejected: 0

## Counts by difficulty

- Difficulty 1: 12
- Difficulty 2: 5
- Difficulty 3: 0
- Difficulty 4: 0
- Difficulty 5: 0

## Structural errors

None.

## Equivalence coverage

- sample-familiar-categories: en, es; missing: fr. sample-en-001 (original); sample-es-001 (adapted-equivalent → sample-en-001 revision 1)
- concept-fr-maison-recre-cuisine-coiffure: fr; missing: en, es. puzzle-fr-003 (original)
- concept-fr-mois-planetes-metaux: fr; missing: en, es. puzzle-fr-002 (original)
- concept-fr-voiture-mer-patisserie-raquette: fr; missing: en, es. puzzle-fr-011 (original)
- concept-fr-enseignes-jardin-portebonheur: fr; missing: en, es. puzzle-fr-001 (original)
- concept-fr-arbre-bureau-musique-visage: fr; missing: en, es. puzzle-fr-012 (original)
- concept-fr-coques-verts-glaces-gemmes: fr; missing: en, es. puzzle-fr-005 (original)
- concept-fr-de-nuit-meubles-vetements-oiseaux: fr; missing: en, es. puzzle-fr-013 (original)
- concept-fr-coup-de-main-meteo-livre: fr; missing: en, es. puzzle-fr-008 (original)
- concept-fr-noir-commerces-ciel-contenants: fr; missing: en, es. puzzle-fr-010 (original)
- concept-fr-objets-a-dents: fr; missing: en, es. puzzle-fr-014 (original)
- concept-fr-rouge-poissons-tri-sols: fr; missing: en, es. puzzle-fr-015 (original)
- concept-fr-animaux-caches: fr; missing: en, es. puzzle-fr-009 (original)
- concept-fr-porte-devises-imprimes: fr; missing: en, es. puzzle-fr-004 (original)
- concept-fr-tennis-vetement-escalier-vaisselle: fr; missing: en, es. puzzle-fr-006 (original)
- concept-fr-de-mer-articulations-ferme-noyau: fr; missing: en, es. puzzle-fr-007 (original)

## Release blockers

- FR: missing approved positions 1–100
- EN: missing approved positions 1–100
- ES: missing approved positions 1–100

See the JSON report for the complete machine-readable error list.

## Individual puzzles

### sample-en-001

Locale: en · Position: 1 · Difficulty: 1 · Revision: 1

Status: **draft** · Approval: not current

Review: none · not reviewed · Approved revision: none

Concept: sample-familiar-categories · original · Source: none revision —

Visible cards:

| 1 | 2 | 3 | 4 |
| --- | --- | --- | --- |
| ROSE | TULIP | IRIS | LILY |
| PARIS | LYON | NICE | LILLE |
| PIANO | VIOLIN | FLUTE | DRUM |
| CIRCLE | SQUARE | TRIANGLE | RECTANGLE |

Intended groups:

- **Flowers**: ROSE · TULIP · IRIS · LILY
  - Intended reason: Flowers
  - Explanation: Sample intended category: Flowers.
- **French cities**: PARIS · LYON · NICE · LILLE
  - Intended reason: French cities
  - Explanation: Sample intended category: French cities.
- **Musical instruments**: PIANO · VIOLIN · FLUTE · DRUM
  - Intended reason: Musical instruments
  - Explanation: Sample intended category: Musical instruments.
- **Geometric shapes**: CIRCLE · SQUARE · TRIANGLE · RECTANGLE
  - Intended reason: Geometric shapes
  - Explanation: Sample intended category: Geometric shapes.

Rationale: SAMPLE DRAFT ONLY. Copied from a development fixture to demonstrate the pipeline; not an editorially approved production puzzle.

Intended reason: Four familiar category memberships. Reviewer must verify the intended partition and the stated cross-locale relationship.

Known decoys: Names may also refer to people, places or brands. Review cross-group alternative readings.

Ambiguity notes: Not yet reviewed. Check every item for competing category membership and verify language-specific familiarity. The equivalence classification is provisional.

Hints:

- pair / g0: ROSE + TULIP
- category / g0: They bloom
- pair / g1: PARIS + LYON
- category / g1: Places in France
- pair / g2: PIANO + VIOLIN
- category / g2: They make music
- pair / g3: CIRCLE + SQUARE
- category / g3: Think geometry

### sample-es-001

Locale: es · Position: 1 · Difficulty: 1 · Revision: 1

Status: **draft** · Approval: not current

Review: none · not reviewed · Approved revision: none

Concept: sample-familiar-categories · adapted-equivalent · Source: sample-en-001 revision 1

Visible cards:

| 1 | 2 | 3 | 4 |
| --- | --- | --- | --- |
| ROSA | TULIPÁN | IRIS | LIRIO |
| PARÍS | LYON | NIZA | LILLE |
| PIANO | VIOLÍN | FLAUTA | TAMBOR |
| CÍRCULO | CUADRADO | TRIÁNGULO | RECTÁNGULO |

Intended groups:

- **Flores**: ROSA · TULIPÁN · IRIS · LIRIO
  - Intended reason: Flores
  - Explanation: Sample intended category: Flores.
- **Ciudades francesas**: PARÍS · LYON · NIZA · LILLE
  - Intended reason: Ciudades francesas
  - Explanation: Sample intended category: Ciudades francesas.
- **Instrumentos musicales**: PIANO · VIOLÍN · FLAUTA · TAMBOR
  - Intended reason: Instrumentos musicales
  - Explanation: Sample intended category: Instrumentos musicales.
- **Figuras geométricas**: CÍRCULO · CUADRADO · TRIÁNGULO · RECTÁNGULO
  - Intended reason: Figuras geométricas
  - Explanation: Sample intended category: Figuras geométricas.

Rationale: SAMPLE DRAFT ONLY. Copied from a development fixture to demonstrate the pipeline; not an editorially approved production puzzle.

Intended reason: Four familiar category memberships. Reviewer must verify the intended partition and the stated cross-locale relationship.

Known decoys: Names may also refer to people, places or brands. Review cross-group alternative readings.

Ambiguity notes: Not yet reviewed. Check every item for competing category membership and verify language-specific familiarity. The equivalence classification is provisional.

Hints:

- pair / g0: ROSA + TULIPÁN
- category / g0: Florecen
- pair / g1: PARÍS + LYON
- category / g1: Lugares de Francia
- pair / g2: PIANO + VIOLÍN
- category / g2: Producen música
- pair / g3: CÍRCULO + CUADRADO
- category / g3: Piensa en geometría

### puzzle-fr-003

Locale: fr · Position: 1 · Difficulty: 1 · Revision: 1

Status: **draft** · Approval: not current

Review: none · not reviewed · Approved revision: none

Concept: concept-fr-maison-recre-cuisine-coiffure · original · Source: none revision —

Visible cards:

| 1 | 2 | 3 | 4 |
| --- | --- | --- | --- |
| Fouet | Grenier | Tresse | Marelle |
| Véranda | Passoire | Queue de cheval | Élastique |
| Cave | Louche | Cache-cache | Chignon |
| Salon | Corde à sauter | Spatule | Couettes |

Intended groups:

- **Pièces et espaces d'une maison**: Grenier · Véranda · Cave · Salon
  - Intended reason: Salon est placé ici alors qu'il évoque aussi le salon de coiffure : c'est l'un des deux seuls points de friction du niveau d'ouverture.
  - Explanation: Grenier, Véranda, Cave et Salon sont des parties d'une habitation.
- **Jeux de cour de récréation**: Marelle · Élastique · Cache-cache · Corde à sauter
  - Intended reason: Élastique désigne ici le jeu, pas l'attache-cheveux : c'est le pivot volontairement unique du puzzle.
  - Explanation: Marelle, Élastique, Cache-cache et Corde à sauter se jouent dans une cour d'école.
- **Ustensiles de cuisine**: Fouet · Passoire · Louche · Spatule
  - Intended reason: Groupe sans aucune ambiguïté : il donne au joueur une première victoire immédiate et lui apprend la mécanique du jeu.
  - Explanation: Fouet, Passoire, Louche et Spatule servent à cuisiner.
- **Coiffures**: Tresse · Queue de cheval · Chignon · Couettes
  - Intended reason: Groupe complet sans Élastique, ce qui rend le leurre principal inoffensif pour la partition.
  - Explanation: Tresse, Queue de cheval, Chignon et Couettes sont des façons de coiffer les cheveux.

Rationale: Niveau d'ouverture du jeu. Un groupe totalement transparent (ustensiles) apprend la mécanique, puis deux cartes seulement (Élastique, Salon) enseignent l'idée centrale du jeu : un mot peut appartenir à plusieurs univers, mais un seul groupe a besoin de lui. Vocabulaire de l'enfance, aucun terme technique, aucune expression régionale.

Intended reason: Quatre univers domestiques distincts. L'interférence est volontairement concentrée sur deux cartes au lieu d'être répartie, pour que le premier niveau enseigne le principe sans le noyer.

Known decoys: Élastique : attache-cheveux, donc lecture « coiffures » — le groupe des coiffures est pourtant complet.; Salon : salon de coiffure, second aimant vers le même groupe.; Fouet : instrument à claquer, lecture non culinaire possible.; Passoire : familier pour un gardien de but ; Corde à sauter : matériel de sport.; Queue de cheval : renvoie à l'animal, ce qui peut suggérer une catégorie animalière inexistante.

Ambiguity notes: Correction éditoriale avant import : Frange a été remplacée par Couettes, car la frange d'un rideau ou d'un tapis constituait un troisième vecteur d'interférence vers la maison, de trop pour un niveau d'ouverture. Couettes introduit en revanche un homonyme (la couette de lit) : je l'ai jugé inoffensif parce qu'aucun groupe « literie » n'existe et qu'aucune autre carte ne pourrait le rejoindre, mais un relecteur doit confirmer ce choix. Les deux leurres restants pointent vers le même groupe (Coiffures), ce qui peut produire deux hésitations successives plutôt qu'un seul déclic : à mesurer en playtest sur des joueurs débutants.

Hints:

- category / g3: Accrochés au-dessus du plan de travail, ils servent à remuer, égoutter ou servir.
- pair / g2: Marelle + Cache-cache
- pair / g1: Grenier + Cave
- category / g4: On les fait le matin, devant un miroir, avec une brosse.

### puzzle-fr-002

Locale: fr · Position: 2 · Difficulty: 1 · Revision: 1

Status: **draft** · Approval: not current

Review: none · not reviewed · Approved revision: none

Concept: concept-fr-mois-planetes-metaux · original · Source: none revision —

Visible cards:

| 1 | 2 | 3 | 4 |
| --- | --- | --- | --- |
| Chronomètre | Mars | Cuivre | Vénus |
| Août | Thermomètre | Plomb | Saturne |
| Janvier | Étain | Balance | Mercure |
| Avril | Fer | Jupiter | Règle |

Intended groups:

- **Mois de l'année**: Mars · Août · Janvier · Avril
  - Intended reason: Catégorie immédiatement lisible qui sert de porte d'entrée, à condition d'accepter que Mars y soit retenu.
  - Explanation: Janvier, Mars, Avril et Août sont des mois du calendrier.
- **Planètes du système solaire**: Vénus · Saturne · Mercure · Jupiter
  - Intended reason: Groupe construit sans Mars, de sorte que la planète la plus évidente est justement celle qui appartient aux mois.
  - Explanation: Mercure, Vénus, Jupiter et Saturne tournent autour du Soleil.
- **Métaux**: Cuivre · Plomb · Étain · Fer
  - Intended reason: Contrepoids à Mercure, seul métal liquide, qui est ici une planète.
  - Explanation: Cuivre, Plomb, Étain et Fer sont des métaux.
- **Instruments de mesure**: Chronomètre · Thermomètre · Balance · Règle
  - Intended reason: Catégorie fonctionnelle désormais homogène : les quatre objets affichent une grandeur chiffrée, sans cas particulier que le libellé aurait à rattraper.
  - Explanation: Chronomètre, Thermomètre, Balance et Règle donnent chacun une mesure chiffrée : un temps, une température, un poids, une longueur.

Rationale: Deuxième niveau : le puzzle repose sur deux doubles sens très connus (Mars, Mercure) et un troisième plus discret (Balance). Les quatre catégories sont scolaires et universelles ; la difficulté vient uniquement du placement de trois cartes, pas d'un savoir rare.

Intended reason: Trois catégories de connaissance générale partagent deux homonymes célèbres, et une quatrième catégorie fonctionnelle récupère Balance et Thermomètre, eux-mêmes attirés par le zodiaque et par le mercure.

Known decoys: Mars : planète — c'est ici un mois ; la série des planètes est complète sans lui.; Mercure : métal (le seul liquide) — c'est ici une planète ; la série des métaux est complète sans lui.; Thermomètre : contient traditionnellement du mercure, ce qui renforce le leurre précédent.; Balance : signe du zodiaque, donc lecture astrologique proche des planètes.; Vénus, Jupiter, Saturne : dieux romains ; lecture mythologique possible mais incomplète.; Fer : « fer à repasser » ; Règle : « règle du jeu ».; Chronomètre : évoque le sport et le temps qui passe, mais ni les mois, ni les planètes, ni les métaux ne peuvent l'accueillir.

Ambiguity notes: Correction éditoriale avant import : Boussole a été remplacée par Chronomètre. Une boussole indique une direction et non une valeur chiffrée, ce qui obligeait l'explication et l'indice à rattraper le libellé « Instruments de mesure » ; les quatre cartes actuelles mesurent toutes une grandeur chiffrée et le libellé devient exact sans réserve. Vérification faite sur le reste de la grille : Chronomètre n'entre en relation avec aucun autre groupe. Le rapprochement le plus plausible serait « le temps » avec les mois, mais les mois forment une liste fermée de quatre noms de calendrier quand un chronomètre mesure des secondes : aucun cinquième candidat, aucune catégorie parasite. Piste alternative à surveiller en playtest : « astrologie » (Balance + Mars + Vénus + Jupiter) reste séduisante, mais elle casse simultanément les mois et les instruments et ne laisse aucune quatrième carte aux métaux. Étain reste le métal le moins évocateur pour un jeune public ; s'il gêne, le remplacer par Zinc après vérification des collisions.

Hints:

- pair / g1: Janvier + Août
- category / g3: Quatre matières que l'on extrait d'une mine et que l'on peut faire fondre.
- pair / g2: Jupiter + Saturne
- category / g4: Quatre objets que l'on consulte pour obtenir un chiffre : un temps, une température, un poids, une longueur.

### puzzle-fr-011

Locale: fr · Position: 3 · Difficulty: 1 · Revision: 1

Status: **draft** · Approval: not current

Review: none · not reviewed · Approved revision: none

Concept: concept-fr-voiture-mer-patisserie-raquette · original · Source: none revision —

Visible cards:

| 1 | 2 | 3 | 4 |
| --- | --- | --- | --- |
| Croissant | Volant | Mouette | Badminton |
| Phare | Millefeuille | Squash | Dune |
| Coffre | Éclair | Plage | Tennis |
| Pare-brise | Coquillage | Brioche | Ping-pong |

Intended groups:

- **Parties d'une voiture**: Volant · Phare · Coffre · Pare-brise
  - Intended reason: Deux de ses cartes sont aimantées ailleurs (Phare par le bord de mer, Volant par le badminton), ce qui crée l'interférence sans jamais compléter un autre groupe.
  - Explanation: Volant, Phare, Coffre et Pare-brise composent une voiture.
- **Bord de mer**: Mouette · Dune · Plage · Coquillage
  - Intended reason: Groupe complet sans Phare, alors que le phare est l'image maritime la plus évidente de la grille.
  - Explanation: Mouette, Dune, Plage et Coquillage appartiennent au paysage du littoral.
- **Pâtisseries et viennoiseries**: Croissant · Millefeuille · Éclair · Brioche
  - Intended reason: Groupe d'ancrage, sans concurrent possible dans la grille : il donne au joueur son point de départ.
  - Explanation: Croissant, Millefeuille, Éclair et Brioche s'achètent chez le boulanger-pâtissier.
- **Sports de raquette**: Badminton · Squash · Tennis · Ping-pong
  - Intended reason: Le badminton se joue avec un volant, ce qui attire l'œil vers la carte Volant sans que celle-ci puisse rejoindre une liste de sports.
  - Explanation: Badminton, Squash, Tennis et Ping-pong se jouent avec une raquette.

Rationale: Troisième niveau, volontairement limpide : quatre univers très éloignés et deux clins d'œil seulement (Phare, Volant). Les quatre sports de raquette sont universels en francophonie et aucune carte n'est technique. Le joueur consolide ce qu'il a appris au niveau 1 sans nouvelle mécanique.

Intended reason: Quatre catégories concrètes et visuelles ; l'interférence vient de deux mots de la voiture qui évoquent fortement deux autres groupes, jamais d'un mot qui pourrait réellement y entrer.

Known decoys: Phare : le phare du littoral, donc lecture « bord de mer » — le bord de mer est pourtant complet.; Volant : le volant de badminton, lecture sportive — mais le groupe des sports ne contient que des sports.; Coffre : coffre à jouets, coffre-fort, coffre d'un pirate.; Éclair : éclair d'orage et fermeture éclair ; aucune de ces lectures n'a de groupe d'accueil.; Croissant : croissant de lune ; Plage : plage horaire ; Dune : nom propre connu, écarté comme lecture.; Ping-pong : « faire du ping-pong » au sens figuré.

Ambiguity notes: Point à vérifier : Volant et Badminton figurent dans la même grille, ce qui peut donner l'impression fugace qu'ils vont ensemble ; c'est voulu, mais le groupe des sports est homogène (quatre noms de sports) alors que Volant est un objet, ce qui doit suffire à trancher. L'indice de catégorie du groupe 4 mentionne explicitement le volant pour désamorcer l'hésitation. Terminologie : « ping-pong » est préféré à « tennis de table » car plus courant à l'oral partout en francophonie ; « squash » est un emprunt, mais sans équivalent français usuel. Aucune expression régionale identifiée ; « pain au chocolat / chocolatine / couque au chocolat » a été délibérément évité pour cette raison.

Hints:

- pair / g2: Mouette + Coquillage
- category / g1: Quatre parties d'une même machine à quatre roues.
- pair / g3: Croissant + Brioche
- category / g4: On y frappe une balle — ou un volant — par-dessus un filet ou contre un mur.

### puzzle-fr-001

Locale: fr · Position: 4 · Difficulty: 1 · Revision: 1

Status: **draft** · Approval: not current

Review: none · not reviewed · Approved revision: none

Concept: concept-fr-enseignes-jardin-portebonheur · original · Source: none revision —

Visible cards:

| 1 | 2 | 3 | 4 |
| --- | --- | --- | --- |
| Coccinelle | Foie | Trèfle | Arrosoir |
| Pique | Patte de lapin | Rate | Râteau |
| Cœur | Étoile filante | Sécateur | Rein |
| Carreau | Bêche | Fer à cheval | Poumon |

Intended groups:

- **Enseignes d'un jeu de cartes**: Trèfle · Pique · Cœur · Carreau
  - Intended reason: Ensemble fermé et exhaustif : puisqu'il n'existe que ces quatre enseignes, le joueur qui reconnaît deux d'entre elles peut déduire les deux autres avec certitude. C'est ce caractère fermé qui rend le double piège équitable.
  - Explanation: Cœur, Carreau, Trèfle et Pique sont les quatre enseignes du jeu de cartes français.
- **Organes du corps humain**: Foie · Rate · Rein · Poumon
  - Intended reason: Groupe volontairement composé d'organes qui ne sont pas le cœur : il est déjà complet à quatre, donc Cœur ne peut pas y entrer.
  - Explanation: Foie, Rate, Rein et Poumon sont des organes internes.
- **Outils de jardinage**: Arrosoir · Râteau · Sécateur · Bêche
  - Intended reason: Groupe sans ambiguïté qui sert d'appui : le joueur le résout en premier et gagne de l'information sur le reste de la grille.
  - Explanation: Arrosoir, Râteau, Sécateur et Bêche se rangent dans la cabane de jardin.
- **Porte-bonheur**: Coccinelle · Patte de lapin · Étoile filante · Fer à cheval
  - Intended reason: Groupe complet à quatre sans le trèfle, exactement comme les organes le sont sans le cœur : les deux pièges du puzzle suivent la même règle, ce qui les rend lisibles ensemble.
  - Explanation: Coccinelle, Patte de lapin, Étoile filante et Fer à cheval sont des symboles de chance.

Rationale: Quatrième niveau : première grille à deux pièges simultanés (Cœur, Trèfle), mais tous deux fonctionnent selon la même règle — le groupe convoité est déjà complet — si bien que comprendre l'un donne la clé de l'autre. L'indice sur les organes (« aucune ne bat ») et l'indice de paire sur les enseignes rendent la déduction accessible dès ce niveau.

Intended reason: Deux séries fermées (enseignes, porte-bonheur) face à deux séries d'objets concrets. Trois cartes d'enseignes ont un second sens qui pointe vers un autre groupe ; aucune ne peut y entrer, car chaque groupe d'accueil est déjà complet.

Known decoys: Cœur : organe — mais Foie, Rate, Rein et Poumon occupent déjà les quatre places.; Trèfle : trèfle à quatre feuilles, donc porte-bonheur — mais ce groupe est complet lui aussi.; Pique et Râteau : Pique peut passer pour un outil pointu de jardin ; Râteau est le seul vrai outil des deux.; Carreau : vitre, donc lecture « maison ».; Fer à cheval, Coccinelle, Patte de lapin : trois références animales dans le même groupe, qui peuvent suggérer une catégorie animalière inexistante.; Rate : homographe du verbe rater.

Ambiguity notes: Correction éditoriale avant import, en réponse à la remarque sur l'équité de Cœur et Trèfle. Rien n'a changé dans les cartes ; deux choses ont changé dans l'aide au joueur. (1) L'indice de paire du groupe 4 donne désormais Fer à cheval + Étoile filante, deux cartes non animales, pour éviter que le joueur enferme ce groupe dans une lecture « animaux ». (2) L'indice de catégorie des organes précise « dont aucune ne bat », ce qui exclut explicitement le cœur sans nommer le groupe des cartes. Le puzzle reste néanmoins celui du lot qui dépend le plus des indices : un relecteur doit décider si l'équité tient encore lorsque le joueur refuse d'ouvrir les indices. Si la réponse est non, l'alternative est de reculer ce puzzle en position 6 ou 7.

Hints:

- category / g3: On les sort de la remise au retour du printemps.
- pair / g4: Fer à cheval + Étoile filante
- pair / g1: Carreau + Pique
- category / g2: Quatre choses que l'on a à l'intérieur du corps, et dont aucune ne bat.

### puzzle-fr-012

Locale: fr · Position: 5 · Difficulty: 1 · Revision: 1

Status: **draft** · Approval: not current

Review: none · not reviewed · Approved revision: none

Concept: concept-fr-arbre-bureau-musique-visage · original · Source: none revision —

Visible cards:

| 1 | 2 | 3 | 4 |
| --- | --- | --- | --- |
| Trombone | Racine | Menton | Trompette |
| Feuille | Gomme | Nez | Violon |
| Branche | Agrafeuse | Joue | Tambour |
| Tronc | Classeur | Front | Accordéon |

Intended groups:

- **Parties d'un arbre**: Racine · Feuille · Branche · Tronc
  - Intended reason: Groupe dont chaque carte a un second sens courant (racine carrée, feuille de papier, branche d'une famille, tronc du corps), mais un seul de ces sens a un groupe d'accueil dans la grille.
  - Explanation: Racine, Feuille, Branche et Tronc composent un arbre.
- **Fournitures de bureau**: Trombone · Gomme · Agrafeuse · Classeur
  - Intended reason: Groupe complet sans Feuille, alors que la feuille de papier est l'objet de bureau le plus évident de tous : c'est le leurre principal.
  - Explanation: Trombone, Gomme, Agrafeuse et Classeur se rangent dans un tiroir de bureau.
- **Instruments de musique**: Trompette · Violon · Tambour · Accordéon
  - Intended reason: Groupe complet sans Trombone, qui est ici un objet de bureau : leurre symétrique du précédent.
  - Explanation: Trompette, Violon, Tambour et Accordéon sont des instruments de musique.
- **Parties du visage**: Menton · Nez · Joue · Front
  - Intended reason: Le libellé « visage » et non « corps » exclut Tronc, qui reste ainsi disponible pour l'arbre.
  - Explanation: Menton, Nez, Joue et Front sont des parties du visage.

Rationale: Cinquième niveau : même mécanique qu'aux niveaux précédents mais avec deux échanges croisés au lieu d'un (Feuille vers le bureau, Trombone vers la musique). Toutes les cartes relèvent du vocabulaire de l'école primaire, et les deux leurres se répondent, ce qui donne au joueur un raisonnement à faire plutôt qu'une simple reconnaissance.

Intended reason: Deux groupes concrets (arbre, visage) et deux groupes d'objets (bureau, musique) échangent deux cartes en sens inverse : Feuille appartient à l'arbre mais évoque le bureau, Trombone appartient au bureau mais évoque la musique. Le reste de la grille est sans ambiguïté, ce qui maintient la difficulté 1.

Known decoys: Feuille : feuille de papier, donc lecture « bureau » — le bureau est pourtant complet.; Trombone : instrument à coulisse, donc lecture « musique » — la musique est pourtant complète.; Joue : forme du verbe jouer, ce qui la rapproche visuellement des instruments.; Tronc : partie du corps humain — mais le quatrième groupe ne retient que le visage.; Racine : racine carrée ; Branche : branche d'un métier ou d'une famille.; Gomme : chewing-gum en Belgique et au Québec ; Front : front de mer, front militaire.

Ambiguity notes: Deux points pour le relecteur. (1) Le groupe 4 doit rester « parties du visage » : s'il devenait « parties du corps », Tronc y entrerait et le puzzle aurait deux solutions. Le libellé est donc porteur, mais il n'est pas artificiel — menton, nez, joue et front forment un ensemble naturel, et aucun n'est ailleurs dans le corps. (2) Joue est la carte la plus délicate à lire hors contexte à cause du verbe ; si le playtest montre une gêne, la remplacer par Sourcil, qui n'a pas d'homographe. Vérifié : aucune autre carte de la grille ne peut appartenir à deux groupes de la grille.

Hints:

- pair / g1: Racine + Branche
- category / g2: On les trouve dans un tiroir de bureau, à côté des stylos.
- pair / g3: Trompette + Tambour
- category / g4: Quatre endroits que l'on voit dans un miroir, au-dessus du cou.

### puzzle-fr-005

Locale: fr · Position: 6 · Difficulty: 1 · Revision: 1

Status: **draft** · Approval: not current

Review: none · not reviewed · Approved revision: none

Concept: concept-fr-coques-verts-glaces-gemmes · original · Source: none revision —

Visible cards:

| 1 | 2 | 3 | 4 |
| --- | --- | --- | --- |
| Pistache | Rubis | Noix | Vanille |
| Émeraude | Pécan | Caramel | Ambre |
| Sapin | Chocolat | Saphir | Noisette |
| Olive | Fraise | Diamant | Cajou |

Intended groups:

- **Fruits à coque**: Noix · Pécan · Noisette · Cajou
  - Intended reason: Groupe défini par la catégorie alimentaire courante — ce que l'on achète sous le nom de fruits à coque ou de fruits secs — et non par une classification botanique, qui n'est pas ce que le joueur mobilise.
  - Explanation: Noix, Pécan, Noisette et Cajou se vendent et se consomment comme fruits à coque, au rayon des fruits secs.
- **Nuances de vert**: Pistache · Émeraude · Sapin · Olive
  - Intended reason: Sapin est la carte d'ancrage : elle ne se mange pas et n'est pas une gemme, donc elle signale sans ambiguïté que le groupe parle de couleurs, ce qui évite que le libellé fasse tout le travail à lui seul.
  - Explanation: Vert pistache, vert émeraude, vert sapin et vert olive.
- **Parfums de glace**: Vanille · Caramel · Chocolat · Fraise
  - Intended reason: Série choisie sans Pistache, alors que la pistache est l'un des parfums les plus emblématiques : c'est le leurre le plus fort de la grille.
  - Explanation: Vanille, Caramel, Chocolat et Fraise sont des parfums de glace classiques.
- **Gemmes**: Rubis · Ambre · Saphir · Diamant
  - Intended reason: Le libellé « gemmes » plutôt que « pierres précieuses » est ici le terme exact, puisque l'ambre est une résine fossile et non une pierre.
  - Explanation: Rubis, Ambre, Saphir et Diamant sont des gemmes.

Rationale: Sixième niveau : le joueur voit d'abord des aliments partout, puis comprend qu'un groupe entier parle de couleurs. Une seule mécanique nouvelle, et une carte (Sapin) est placée là pour la rendre découvrable sans indice. Vocabulaire courant, aucune connaissance spécialisée.

Intended reason: Le pivot est le groupe des verts, qui prélève un fruit sec (pistache), un aliment (olive) et une gemme (émeraude), et les réunit autour d'une carte non comestible (sapin) qui révèle le critère. Les trois autres groupes sont construits en excluant précisément ces cartes.

Known decoys: Pistache : à la fois fruit sec et parfum de glace très courant — les deux groupes sont pourtant complets sans elle.; Émeraude : gemme évidente, retenue ici par la couleur.; Noisette : parfum de glace tout à fait courant et nom de couleur (brun) — elle reste avec les noix.; Olive : aliment, donc lecture alimentaire de la grille.; Ambre et Caramel : également des noms de couleur, mais aucun des deux n'est vert.; Sapin : seule carte de la grille qui ne se mange ni ne se porte en bijou.

Ambiguity notes: Correction éditoriale avant import, sur trois points signalés. (1) Cacahuète a été retirée : c'est une légumineuse, pas une noix, et la classer ainsi était une erreur factuelle. Le groupe est désormais Noix / Pécan / Noisette / Cajou : quatre produits que l'on trouve côte à côte au rayon des fruits secs, sous l'étiquette « fruits à coque ». Il repose sur cette catégorie d'usage alimentaire et n'avance aucune thèse botanique. (2) Topaze a été remplacée par Ambre et le libellé est passé à « Gemmes », terme qui couvre correctement une résine fossile. (3) Citron a été retiré des parfums de glace car « vert citron » est une nuance attestée, ce qui en faisait un cinquième candidat au groupe des verts ; Caramel le remplace. Faiblesse résiduelle assumée : Noisette est un parfum de glace très répandu, donc un cinquième candidat apparent au groupe 3. La permutation ne se referme pas — si Noisette passait aux glaces, il faudrait donner Pistache aux noix et le groupe des verts tomberait à trois sans remplaçant — mais c'est le point à tester en priorité. Pécan et Cajou sont familiers en rayon ; à confirmer auprès d'un relecteur québécois, où « pacane » est la forme usuelle.

Hints:

- pair / g2: Sapin + Olive
- category / g1: On les vend en sachet, au rayon des fruits secs, et il faut souvent les casser.
- pair / g4: Rubis + Saphir
- category / g3: Ce que l'on choisit au comptoir du glacier.

### puzzle-fr-013

Locale: fr · Position: 7 · Difficulty: 1 · Revision: 1

Status: **draft** · Approval: not current

Review: none · not reviewed · Approved revision: none

Concept: concept-fr-de-nuit-meubles-vetements-oiseaux · original · Source: none revision —

Visible cards:

| 1 | 2 | 3 | 4 |
| --- | --- | --- | --- |
| Moineau | Train | Veste | Commode |
| Oiseau | Hirondelle | Jupe | Armoire |
| Chemise | Merle | Chaussettes | Canapé |
| Table | Pigeon | Pantalon | Chaise |

Intended groups:

- **Se complètent par « de nuit »**: Train · Oiseau · Chemise · Table
  - Intended reason: Premier groupe purement lexical de la progression : trois de ses quatre cartes sont le membre le plus évident d'un autre groupe de la grille, et la quatrième (Train) n'est disputée par personne et sert d'entrée.
  - Explanation: Train de nuit, oiseau de nuit, chemise de nuit, table de nuit.
- **Meubles**: Commode · Armoire · Canapé · Chaise
  - Intended reason: Groupe complet sans Table, alors que la table est le meuble le plus évident de tous.
  - Explanation: Commode, Armoire, Canapé et Chaise sont des meubles.
- **Vêtements**: Veste · Jupe · Chaussettes · Pantalon
  - Intended reason: Groupe complet sans Chemise, pour la même raison.
  - Explanation: Veste, Jupe, Chaussettes et Pantalon sont des vêtements.
- **Oiseaux**: Moineau · Hirondelle · Merle · Pigeon
  - Intended reason: Groupe complet sans Oiseau : la carte générique ne peut pas rejoindre quatre espèces précises, ce qui aide le joueur à comprendre la règle du niveau.
  - Explanation: Moineau, Hirondelle, Merle et Pigeon sont des oiseaux communs.

Rationale: Septième niveau : introduction de la relation lexicale, avec le procédé le plus simple possible — deux mots ajoutés à la fin. Les quatre expressions sont d'usage quotidien et les trois autres groupes sont élémentaires. La carte Oiseau, qui ne peut pas rejoindre quatre espèces nommées, donne au joueur un raisonnement immédiat pour comprendre ce qui se passe.

Intended reason: Un groupe formé non par le sens des mots mais par ce qu'on peut leur ajouter. Chaque carte du groupe lexical est aimantée par un groupe thématique déjà complet ; la dissymétrie entre « oiseau » et quatre espèces précises est l'indice interne qui met le joueur sur la voie.

Known decoys: Oiseau : attiré par les quatre espèces — mais une catégorie qui contient déjà moineau, hirondelle, merle et pigeon n'a pas de place pour le mot générique.; Chemise : vêtement évident — le groupe des vêtements est pourtant complet.; Table : meuble évident — le groupe des meubles est pourtant complet.; Canapé : le canapé apéritif ; Commode : l'adjectif ; Pigeon : la dupe.; Veste : « prendre une veste » ; Train : train de vie, train d'atterrissage.

Ambiguity notes: Point régional à trancher : « table de nuit » est courante en Belgique et dans le nord de la France, mais « table de chevet » domine ailleurs et « table de nuit » est peu employée au Québec. L'expression reste comprise partout, et c'est la seule des quatre qui pose la question — train, chemise et oiseau de nuit sont universels. Si le relecteur juge le risque trop élevé, remplacer Table par Garde (garde de nuit) et compléter les meubles par Table, ce qui inverse le piège sans le supprimer. Vérifié : aucune carte des groupes 2, 3 et 4 ne se complète naturellement par « de nuit » (« veste de nuit », « chaise de nuit » ne sont pas des expressions).

Hints:

- pair / g1: Train + Table
- category / g4: Quatre espèces que l'on peut voir depuis une fenêtre, en ville comme à la campagne.
- pair / g3: Jupe + Chaussettes
- category / g2: Ce qu'un déménageur porte à deux.

### puzzle-fr-008

Locale: fr · Position: 8 · Difficulty: 1 · Revision: 1

Status: **draft** · Approval: not current

Review: none · not reviewed · Approved revision: none

Concept: concept-fr-coup-de-main-meteo-livre · original · Source: none revision —

Visible cards:

| 1 | 2 | 3 | 4 |
| --- | --- | --- | --- |
| Index | Orage | Foudre | Chapitre |
| Paume | Brume | Barre | Préface |
| Majeur | Tempête | Fil | Annexe |
| Auriculaire | Grêle | Pouce | Sommaire |

Intended groups:

- **Se placent après « coup de »**: Foudre · Barre · Fil · Pouce
  - Intended reason: Quatre expressions figées du quotidien dont aucune ne désigne un coup réel : cette unité de registre rend le groupe satisfaisant une fois trouvé.
  - Explanation: Coup de foudre, coup de barre, coup de fil, coup de pouce.
- **Parties de la main**: Index · Paume · Majeur · Auriculaire
  - Intended reason: Le groupe est « parties de la main » et non « doigts » : c'est la présence de Paume qui interdit la fausse solution des quatre doigts.
  - Explanation: Index, Paume, Majeur et Auriculaire font partie de la main.
- **Phénomènes météo**: Orage · Brume · Tempête · Grêle
  - Intended reason: Série complète sans Foudre, alors que la foudre est le phénomène le plus spectaculaire de la liste.
  - Explanation: Orage, Brume, Tempête et Grêle sont des phénomènes météorologiques.
- **Parties d'un livre**: Chapitre · Préface · Annexe · Sommaire
  - Intended reason: Série complète sans Index, alors que l'index est une partie de livre aussi banale que le sommaire.
  - Explanation: Chapitre, Préface, Annexe et Sommaire composent un ouvrage.

Rationale: Huitième niveau : le piège central est la fausse évidence des quatre doigts, qui laisse Paume sans place et force le joueur à relire toute la grille. Les expressions en « coup de » sont d'usage quotidien, la météo et le livre sont universels : la difficulté est entièrement structurelle, jamais lexicale.

Intended reason: La grille propose une fausse solution presque irrésistible (Pouce, Index, Majeur, Auriculaire) et laisse une carte orpheline pour signaler l'erreur. Les deux autres groupes concrets fournissent chacun un leurre supplémentaire vers le groupe lexical.

Known decoys: Pouce + Index + Majeur + Auriculaire : les quatre doigts, groupe apparent presque irrésistible ; il laisse Paume sans place.; Foudre : phénomène météo évident — la météo est pourtant complète.; Index : partie d'un livre évidente — le livre est pourtant complet.; Barre : barre de fer, barre du tribunal, barre chocolatée ; Fil : fil conducteur, fil d'un récit.; Grêle : également un adjectif (une voix grêle).; Annexe et Sommaire : vocabulaire administratif, lecture « document » plus large que « livre ».

Ambiguity notes: Correction éditoriale avant import : contenu inchangé, l'indice de catégorie sur le groupe 2 est conservé tel quel, conformément à la relecture. C'est lui qui maintient l'équité en difficulté 1 : sans lui, le piège des quatre doigts reste auto-corrigeant (Paume n'a nulle part où aller) mais peut bloquer longtemps. Réserve régionale maintenue : « coup de barre » est très courant en France, en Belgique et en Suisse, moins au Québec. Les trois autres expressions sont universelles. Si le catalogue doit viser le Québec en priorité, la substitution la moins coûteuse est « coup de soleil » — mais Soleil deviendrait alors un second candidat apparent au groupe météo, ce qui alourdirait la grille.

Hints:

- pair / g1: Foudre + Barre
- category / g4: Quatre parties d'un même objet que l'on feuillette.
- pair / g3: Grêle + Orage
- category / g2: Ce groupe ne contient pas que des doigts.

### puzzle-fr-010

Locale: fr · Position: 9 · Difficulty: 1 · Revision: 1

Status: **draft** · Approval: not current

Review: none · not reviewed · Approved revision: none

Concept: concept-fr-noir-commerces-ciel-contenants · original · Source: none revision —

Visible cards:

| 1 | 2 | 3 | 4 |
| --- | --- | --- | --- |
| Flacon | Trou | Épicerie | Comète |
| Boîte | Bidon | Galaxie | Kiosque |
| Humour | Bocal | Étoile | Boulangerie |
| Marché | Nébuleuse | Coffret | Boutique |

Intended groups:

- **Se complètent par « noir »**: Trou · Boîte · Humour · Marché
  - Intended reason: Quatre expressions figées appartenant à quatre domaines différents — astronomie, aviation, registre comique, économie — ce qui empêche de deviner le lien par le thème.
  - Explanation: Trou noir, boîte noire, humour noir, marché noir.
- **Commerces de proximité**: Épicerie · Kiosque · Boulangerie · Boutique
  - Intended reason: Série complète sans Marché, alors que le marché est le lieu d'achat le plus évident de la grille.
  - Explanation: Épicerie, Kiosque, Boulangerie et Boutique sont des commerces de quartier.
- **Objets du ciel nocturne**: Comète · Galaxie · Étoile · Nébuleuse
  - Intended reason: Série complète sans Trou, alors que « trou noir » est l'objet astronomique le plus célèbre du grand public.
  - Explanation: Comète, Galaxie, Étoile et Nébuleuse s'observent dans le ciel.
- **Contenants**: Flacon · Bidon · Bocal · Coffret
  - Intended reason: Série complète sans Boîte, le contenant par excellence : troisième leurre construit sur le même principe.
  - Explanation: Flacon, Bidon, Bocal et Coffret servent à contenir.

Rationale: Neuvième niveau : trois des quatre cartes du groupe lexical sont chacune le meilleur représentant apparent d'un autre groupe, et seule Humour n'est disputée par personne — c'est par elle que le joueur doit deviner l'adjectif commun. Toutes les expressions sont courantes ; la difficulté vient entièrement de l'interprétation.

Intended reason: Un groupe lexical formé par l'ajout d'un seul adjectif prélève le représentant le plus typique de chacun des trois groupes thématiques. Humour est la porte d'entrée voulue.

Known decoys: Trou : trou noir, donc attiré par l'astronomie (qui est complète).; Boîte : contenant évident (le groupe des contenants est complet) et aussi boîte de nuit.; Marché : lieu d'achat évident (le groupe des commerces est complet).; Kiosque : kiosque à musique ou kiosque de jardin, pas seulement un point de vente.; Étoile : étoile d'un hôtel, étoile filante ; Comète : « tirer des plans sur la comète ».; Bidon : également l'adjectif familier « bidon », sans groupe d'accueil.

Ambiguity notes: Correction éditoriale avant import, en réponse à la solution parasite « courses » (Marché + Caisse + Panier + Boîte). Panier et Caisse ont tous deux été retirés : Panier était explicitement visé, mais laisser Caisse aurait maintenu deux cartes évoquant l'achat, donc une lecture « courses » encore à trois cartes. Flacon et Bidon les remplacent ; ni l'un ni l'autre n'évoque le commerce, et la lecture parasite tombe à deux cartes (Marché + Boîte), ce qui la rend inoffensive. Coût de la correction : le groupe des contenants est devenu plus homogène — quatre récipients fermés — donc un peu plus facile à repérer, ce qui affaiblit légèrement le puzzle. Je considère l'échange favorable, mais c'est un arbitrage à valider. Aucune des quatre expressions en « noir » n'est régionale.

Hints:

- pair / g1: Humour + Marché
- category / g3: Il faut lever les yeux la nuit, loin des lampadaires, pour les voir.
- pair / g4: Bocal + Coffret
- category / g2: Des endroits où l'on pousse la porte pour acheter quelque chose.

### puzzle-fr-014

Locale: fr · Position: 10 · Difficulty: 1 · Revision: 1

Status: **draft** · Approval: not current

Review: none · not reviewed · Approved revision: none

Concept: concept-fr-objets-a-dents · original · Source: none revision —

Visible cards:

| 1 | 2 | 3 | 4 |
| --- | --- | --- | --- |
| Savon | Peigne | Marteau | Assiette |
| Fourchette | Rasoir | Clé à molette | Verre |
| Scie | Shampoing | Tournevis | Serviette |
| Fermeture éclair | Brosse à dents | Perceuse | Cuillère |

Intended groups:

- **Objets qui ont des dents**: Peigne · Fourchette · Scie · Fermeture éclair
  - Intended reason: Critère physique et vérifiable, pas une association d'idées : chacun de ces objets a bien une partie appelée « dent » en français courant.
  - Explanation: Les dents d'un peigne, d'une fourchette, d'une scie et d'une fermeture éclair : dans les quatre cas, « dent » est le mot exact pour désigner leurs pointes.
- **Sur une table dressée**: Assiette · Verre · Serviette · Cuillère
  - Intended reason: Groupe complet sans Fourchette, alors que la fourchette est le couvert manquant le plus visible du monde : c'est le leurre principal.
  - Explanation: Assiette, Verre, Serviette et Cuillère se posent sur une table mise.
- **Outils de bricolage**: Marteau · Clé à molette · Tournevis · Perceuse
  - Intended reason: Groupe complet sans Scie, l'outil le plus emblématique de tous : leurre symétrique du précédent.
  - Explanation: Marteau, Clé à molette, Tournevis et Perceuse dorment dans la caisse à outils.
- **Trousse de toilette**: Savon · Rasoir · Shampoing · Brosse à dents
  - Intended reason: Brosse à dents contient le mot « dents » sans avoir de dents : c'est le piège de lecture qui distingue ce niveau des précédents.
  - Explanation: Savon, Rasoir, Shampoing et Brosse à dents se rangent dans une trousse de toilette.

Rationale: Dixième niveau, le plus exigeant de la série en difficulté 1 : le critère de regroupement n'est plus un thème mais une propriété physique commune, et une carte (Brosse à dents) contient littéralement le mot-clé sans appartenir au groupe. Le vocabulaire reste entièrement domestique, et deux groupes classiques presque complets donnent au joueur de quoi démarrer. Prépare la difficulté 2 sans changer de nature.

Intended reason: Trois catégories d'objets du quotidien sont amputées de leur membre le plus typique (fourchette, scie, peigne) ; ces trois cartes, plus une quatrième non disputée (fermeture éclair), se rejoignent sur une propriété matérielle. Brosse à dents fait écran en attirant l'attention sur le bon mot au mauvais endroit.

Known decoys: Brosse à dents : contient le mot « dents » mais possède des poils, pas des dents — piège de lecture central.; Fourchette : couvert évident, donc lecture « table » — la table est pourtant complète.; Scie : outil évident, donc lecture « bricolage » — le bricolage est pourtant complet.; Peigne : objet de toilette évident, donc lecture « trousse de toilette » — elle est pourtant complète.; Serviette : serviette de toilette autant que serviette de table, donc second aimant vers le groupe 4.; Clé à molette : sa molette est striée, mais on ne parle jamais de ses dents ; elle ne peut donc pas rejoindre le premier groupe. Verre : matériau autant qu'objet.

Ambiguity notes: Correction éditoriale avant import : Pince a été remplacée par Clé à molette. On parle des mors ou des becs d'une pince, mais les pinces crantées pouvaient faire hésiter un joueur bricoleur sur la présence de « dents » ; une clé à molette n'a qu'une molette striée, jamais de dents, et le critère du premier groupe redevient net. Vérifications faites sur la nouvelle carte : Clé à molette n'a sa place ni sur une table dressée ni dans une trousse de toilette, et le mot « clé » n'a aucun autre point d'accroche dans cette grille — aucune relation nouvelle n'est créée. Réserve maintenue : Serviette tire vers deux groupes à la fois, la table et la toilette, tous deux complets ; c'est un leurre supplémentaire non prévu au départ, acceptable à ce niveau mais qui augmente la charge. Vérifié également : aucune autre carte de la grille n'a de partie appelée « dent » en français courant, et le premier groupe reçoit deux indices — une paire et une catégorie — parce que c'est le mécanisme le plus abstrait du lot.

Hints:

- pair / g1: Scie + Fermeture éclair
- category / g3: Ils dorment dans la caisse à outils, au garage.
- pair / g2: Assiette + Cuillère
- category / g1: Quatre objets qui accrochent ou entament grâce à une rangée de pointes — et le mot pour désigner ces pointes est le même pour les quatre.

### puzzle-fr-015

Locale: fr · Position: 11 · Difficulty: 2 · Revision: 2

Status: **draft** · Approval: not current

Review: none · not reviewed · Approved revision: none

Concept: concept-fr-rouge-poissons-tri-sols · original · Source: none revision —

Visible cards:

| 1 | 2 | 3 | 4 |
| --- | --- | --- | --- |
| Parquet | Poisson | Papier | Saumon |
| Carton | Moquette | Thon | Verre |
| Fil | Sardine | Carrelage | Métal |
| Tapis | Truite | Linoléum | Plastique |

Intended groups:

- **Se complètent par « rouge »**: Poisson · Carton · Fil · Tapis
  - Intended reason: Quatre expressions issues de quatre mondes différents — l'aquarium, le football, le récit, la cérémonie — ce qui interdit de deviner le groupe par le thème.
  - Explanation: Poisson rouge, carton rouge, fil rouge, tapis rouge.
- **Poissons**: Saumon · Thon · Sardine · Truite
  - Intended reason: Groupe complet sans la carte Poisson : le mot générique ne peut pas rejoindre quatre espèces nommées.
  - Explanation: Saumon, Thon, Sardine et Truite sont des poissons.
- **Matières que l'on trie**: Papier · Verre · Métal · Plastique
  - Intended reason: Groupe complet sans Carton, pourtant la matière la plus associée au tri : leurre le plus fort de la grille.
  - Explanation: Papier, Verre, Métal et Plastique sont les matières du tri sélectif.
- **Revêtements de sol**: Parquet · Moquette · Carrelage · Linoléum
  - Intended reason: Groupe complet sans Tapis, qui est l'objet posé sur le sol et non le revêtement : la distinction est nette, ce qui rend le leurre honnête.
  - Explanation: Parquet, Moquette, Carrelage et Linoléum recouvrent un sol.

Rationale: Candidat de réserve pour la fin de la première dizaine ou le début de la seconde : même architecture que le niveau 9 (un adjectif de couleur qui complète quatre expressions) mais avec des leurres plus francs et une carte libre, Fil. À ne pas placer juste à côté du puzzle « noir », dont il reprend la mécanique.

Intended reason: Un groupe lexical fondé sur un adjectif unique prélève la carte la plus typique de deux groupes thématiques (Carton pour le tri, Tapis pour les sols) et le mot générique d'un troisième (Poisson). Fil, non disputé, est la porte d'entrée.

Known decoys: Carton : matière du tri par excellence — le groupe du tri est pourtant complet.; Tapis : posé au sol, donc lecture « revêtements » — mais un tapis se pose sur un revêtement, il n'en est pas un.; Poisson : attiré par les quatre espèces, comme le mot « oiseau » dans un autre niveau.; Sardine : la sardine de tente ; Thon : registre familier péjoratif, à surveiller.; Verre : objet autant que matière ; Parquet : le parquet d'un tribunal.; Papier : papier peint, donc légère attraction vers les revêtements.

Ambiguity notes: Deux réserves. (1) Ce puzzle reprend la mécanique du niveau 9 ; s'il est retenu, le placer au moins trois positions plus loin, sinon la surprise est éventée. (2) Lino a été remplacé par la forme pleine Linoléum : légèrement plus formelle, mais univoque et lisible dans toute la francophonie, là où l'abréviation familière pouvait surprendre à l'écrit. Béton reste l'alternative si la carte s'avère trop longue à l'affichage. Point vérifié : aucune carte des groupes 2, 3 et 4 ne se complète par « rouge » de façon figée (« papier rouge », « moquette rouge » ne sont pas des expressions). Thon est à relire pour son usage familier insultant : le contexte du groupe est clairement culinaire, mais c'est un mot que je signale plutôt que de le laisser passer.

Hints:

- pair / g1: Fil + Tapis
- category / g2: On les achète chez le poissonnier, frais ou en boîte.
- pair / g4: Parquet + Carrelage
- category / g3: Ce que l'on sépare avant de sortir les poubelles.

### puzzle-fr-009

Locale: fr · Position: 21 · Difficulty: 2 · Revision: 1

Status: **draft** · Approval: not current

Review: none · not reviewed · Approved revision: none

Concept: concept-fr-animaux-caches · original · Source: none revision —

Visible cards:

| 1 | 2 | 3 | 4 |
| --- | --- | --- | --- |
| Jamais | Achat | Trésor | Colère |
| Toujours | Souvent | Sabre | Peur |
| Pirate | Parfois | Île | Surprise |
| Joie | Rarement | Crochet | Tristesse |

Intended groups:

- **Un animal se cache dans le mot**: Achat · Toujours · Pirate · Joie
  - Intended reason: Les quatre animaux apparaissent en lettres consécutives, sans accent ni césure : le critère est vérifiable à l'œil, ce qui rend le groupe défendable malgré son caractère lexical.
  - Explanation: aCHAT cache chat, tOURS dans toujours cache ours, piRATe cache rat, JOIe cache oie.
- **Émotions**: Colère · Peur · Surprise · Tristesse
  - Intended reason: Groupe complet sans Joie, alors que la joie est l'émotion la plus évidente de toutes : premier leurre.
  - Explanation: Colère, Peur, Surprise et Tristesse sont des émotions.
- **Adverbes de fréquence**: Jamais · Souvent · Parfois · Rarement
  - Intended reason: Groupe complet sans Toujours, qui en est pourtant l'extrémité naturelle : deuxième leurre, construit sur le même principe.
  - Explanation: Jamais, Souvent, Parfois et Rarement répondent à la question « à quelle fréquence ? ».
- **Univers des pirates**: Trésor · Sabre · Île · Crochet
  - Intended reason: Groupe complet sans la carte Pirate elle-même : troisième leurre, et le plus frontal des trois.
  - Explanation: Trésor, Sabre, Île et Crochet composent l'imagerie des pirates.

Rationale: Puzzle reclassé en difficulté 2 : le critère de regroupement est orthographique et non sémantique, ce qui suppose que le joueur a déjà rencontré des mécaniques lexicales dans les vingt premiers niveaux. La grille elle-même n'utilise que du vocabulaire élémentaire, et chaque carte du groupe caché est le membre le plus évident d'un autre groupe, ce qui rend la structure très lisible une fois le procédé compris.

Intended reason: Trois groupes thématiques amputés de leur représentant le plus typique (Joie, Toujours, Pirate) plus une carte libre (Achat) ; ces quatre mots ne partagent aucun sens, seulement quatre animaux dissimulés en lettres consécutives.

Known decoys: Joie : l'émotion la plus évidente — les émotions sont pourtant complètes.; Toujours : adverbe de fréquence par excellence — les adverbes sont pourtant complets.; Pirate : mot-thème du groupe 4 — l'univers des pirates est pourtant complet sans lui.; Achat : seule carte non disputée, donc porte d'entrée du procédé.; Jamais : peut être lu comme le contraire de Toujours et attirer une lecture « couple d'opposés ».

Ambiguity notes: Correction éditoriale avant import : le puzzle a été entièrement reconstruit et déplacé hors des dix premières positions. La version précédente reposait sur des découpages douteux (velours, mouchoir), ce qui rendait le critère invérifiable ; les quatre mots retenus ici contiennent chat, ours, rat et oie en lettres strictement consécutives, sans accent intercalé. Contrôle effectué sur les douze autres cartes : aucune ne contient d'animal en lettres consécutives — à refaire intégralement à la moindre substitution de carte, sous peine de créer un cinquième candidat. Risque résiduel : un joueur peut croire à une règle plus large (« un mot caché », et non « un animal caché ») ; l'indice de catégorie dit « animal » pour fermer cette porte. Réserve de fond : ce type de puzzle ne fonctionne qu'en français écrit et ne pourra pas être transposé tel quel en anglais ou en espagnol — il faudra un locale-replacement et non un équivalent.

Hints:

- pair / g1: Toujours + Joie
- category / g1: Oubliez le sens de ces mots et regardez leurs lettres : un animal s'y cache.
- pair / g4: Trésor + Sabre
- category / g3: Quatre mots qui répondent à la question « à quelle fréquence ? ».

### puzzle-fr-004

Locale: fr · Position: 22 · Difficulty: 2 · Revision: 1

Status: **draft** · Approval: not current

Review: none · not reviewed · Approved revision: none

Concept: concept-fr-porte-devises-imprimes · original · Source: none revision —

Visible cards:

| 1 | 2 | 3 | 4 |
| --- | --- | --- | --- |
| Manteau | Euro | Almanach | Gants |
| Monnaie | Atlas | Livre | Bonnet |
| Clés | Roman | Yen | Écharpe |
| Bonheur | Magazine | Dollar | Pull |

Intended groups:

- **Se placent après « porte- »**: Manteau · Monnaie · Clés · Bonheur
  - Intended reason: Groupe de construction lexicale : trois de ses quatre cartes appartiennent aussi, en apparence, à l'une des trois autres catégories.
  - Explanation: Porte-manteau, porte-monnaie, porte-clés, porte-bonheur.
- **Vêtements d'hiver**: Gants · Bonnet · Écharpe · Pull
  - Intended reason: Série complète sans Manteau, alors que Manteau en est le représentant le plus évident.
  - Explanation: Gants, Bonnet, Écharpe et Pull protègent du froid.
- **Monnaies du monde**: Euro · Livre · Yen · Dollar
  - Intended reason: Livre y est une devise et non un objet imprimé, ce qui met sous tension le groupe des publications.
  - Explanation: Euro, Livre, Yen et Dollar sont des devises.
- **Publications imprimées**: Almanach · Atlas · Roman · Magazine
  - Intended reason: Groupe défini par le support imprimé plutôt que par le mot « livre », afin que Livre puisse rester dans les devises.
  - Explanation: Almanach, Atlas, Roman et Magazine se lisent et s'impriment.

Rationale: Concept conservé mais sorti des dix premières positions et classé en difficulté 2 : trois leurres forts simultanés (Manteau, Monnaie, Livre) font une charge trop lourde pour l'apprentissage, et parfaitement calibrée une fois le joueur rodé.

Intended reason: Un groupe lexical (« porte- ») pille délibérément les trois groupes thématiques ; Bonheur est la seule carte non disputée et sert d'entrée dans le procédé.

Known decoys: Manteau : vêtement d'hiver évident — mais les vêtements sont déjà quatre.; Monnaie : champ lexical des devises — mais les devises sont déjà quatre.; Livre : objet imprimé évident — c'est ici la devise britannique.; Magazine : « porte-magazines » et « porte-revues » sont des meubles courants, ce qui en fait le cinquième candidat résiduel du groupe lexical.; Bonnet : proximité sonore avec Bonheur, confusion possible en lecture rapide.; Atlas : chaîne de montagnes et vertèbre cervicale ; Roman : style architectural et prénom.

Ambiguity notes: Correction éditoriale avant import : Journal a été remplacé par Almanach pour supprimer porte-journaux comme cinquième candidat. Vérification faite sur la nouvelle carte : porte-almanach n'est pas une expression attestée — almanach s'emploie seul et ne forme aucun composé en porte- — donc la substitution atteint son but. Elle ne règle en revanche pas tout, et je le signale plutôt que de le taire : porte-magazines et porte-revues sont des meubles courants, si bien que Magazine reste un cinquième candidat résiduel au groupe lexical. La consigne de cette passe portait sur Journal seulement, je n'ai donc pas touché à Magazine, mais c'est le premier point à trancher en relecture ; Dictionnaire serait la substitution la plus propre. Autre point : Almanach est un mot légèrement vieilli, acceptable en difficulté 2 auprès d'un joueur rodé, mais qui aurait été trop lourd dans les dix premiers niveaux.

Hints:

- pair / g1: Clés + Bonheur
- category / g3: On les échange dans un bureau de change.
- pair / g4: Almanach + Roman
- category / g2: Ce que l'on enfile en plus quand la température descend.

### puzzle-fr-006

Locale: fr · Position: 23 · Difficulty: 2 · Revision: 1

Status: **draft** · Approval: not current

Review: none · not reviewed · Approved revision: none

Concept: concept-fr-tennis-vetement-escalier-vaisselle · original · Source: none revision —

Visible cards:

| 1 | 2 | 3 | 4 |
| --- | --- | --- | --- |
| Bouton | Marche | Revers | Carafe |
| Palier | Col | Smash | Assiette |
| Doublure | Contremarche | Volée | Soucoupe |
| Poche | Rampe | Service | Saladier |

Intended groups:

- **Coups au tennis**: Revers · Smash · Volée · Service
  - Intended reason: Quatre coups réellement frappés au tennis. Depuis le retrait de Manche, aucune autre carte de la grille n'est un terme de tennis : le groupe ne dépend plus de la finesse de son libellé pour tenir.
  - Explanation: Revers, Smash, Volée et Service sont des coups frappés au tennis.
- **Parties d'un vêtement**: Bouton · Col · Doublure · Poche
  - Intended reason: Série complète sans Revers, alors que le revers d'une veste est la première association d'un joueur francophone.
  - Explanation: Bouton, Col, Doublure et Poche composent une veste.
- **Éléments d'un escalier**: Marche · Palier · Contremarche · Rampe
  - Intended reason: Série complète sans Volée, bien qu'une volée de marches soit exactement cela.
  - Explanation: Marche, Palier, Contremarche et Rampe forment un escalier.
- **Vaisselle**: Carafe · Assiette · Soucoupe · Saladier
  - Intended reason: Série complète sans Service, alors qu'un service de table est un ensemble de vaisselle.
  - Explanation: Carafe, Assiette, Soucoupe et Saladier se posent sur une table.

Rationale: Concept conservé en difficulté 2. Manche, qui était un terme de tennis parfaitement légitime, a été retiré : il reste Contremarche, mot relativement technique, et trois homonymes croisés qui conviennent à un joueur déjà entraîné. La position n'a pas été modifiée dans cette passe, mais le puzzle est devenu sensiblement plus accessible et mériterait d'être réexaminé pour la fin de la difficulté 1.

Intended reason: Un groupe « coups au tennis » dont trois cartes sur quatre sont les homonymes exacts des trois autres champs lexicaux. Le joueur voit d'abord trois catégories domestiques presque complètes, puis comprend que les intrus forment ensemble le quatrième groupe.

Known decoys: Bouton : bouton d'un appareil, bouton de fleur, bouton sur la peau — aucune de ces lectures n'a de groupe d'accueil dans la grille.; Revers : revers de veste — le groupe vêtement est pourtant complet.; Volée : volée de marches — le groupe escalier est pourtant complet.; Service : service de table — le groupe vaisselle est pourtant complet.; Col : col de montagne ; Poche : poche au billard ; Rampe : rampe de lancement.; Doublure : doublure au cinéma ; Soucoupe : soucoupe volante.

Ambiguity notes: Correction éditoriale avant import : Manche a été remplacé par Bouton. « Gagner une manche » en faisait un terme de tennis légitime, et la partition ne tenait que si le joueur lisait le premier groupe comme « coups frappés » : le libellé ne porte plus cette charge. Vérifications faites sur la nouvelle carte : Bouton n'a aucun rapport avec le tennis, l'escalier ou la vaisselle, et ses autres sens — bouton d'appareil, de fleur, sur la peau — n'ont pas de groupe d'accueil ici. La proximité graphique gênante entre Manche et Marche disparaît du même coup. Réserves maintenues : Contremarche reste le mot le plus technique de la grille, déductible à côté de Marche mais c'est l'une des raisons du classement en difficulté 2 ; Smash est un anglicisme d'usage courant en français, « amorti » serait l'alternative si l'on veut éviter l'emprunt. Le libellé complet « Coups au tennis » doit rester affiché à la résolution.

Hints:

- pair / g1: Revers + Smash
- category / g3: On les monte et on les descend plusieurs fois par jour.
- pair / g4: Soucoupe + Carafe
- category / g2: Regardez de quoi est faite une veste, à l'extérieur comme à l'intérieur.

### puzzle-fr-007

Locale: fr · Position: 24 · Difficulty: 2 · Revision: 1

Status: **draft** · Approval: not current

Review: none · not reviewed · Approved revision: none

Concept: concept-fr-de-mer-articulations-ferme-noyau · original · Source: none revision —

Visible cards:

| 1 | 2 | 3 | 4 |
| --- | --- | --- | --- |
| Pêche | Loup | Genou | Vache |
| Fruits | Prune | Cheville | Cochon |
| Mal | Coude | Mouton | Cerise |
| Bras | Épaule | Poule | Abricot |

Intended groups:

- **Se complètent par « de mer »**: Loup · Fruits · Mal · Bras
  - Intended reason: Quatre expressions figées et courantes, chacune d'un registre différent — animal, cuisine, malaise, géographie — ce qui empêche de deviner le groupe par un thème.
  - Explanation: Loup de mer, fruits de mer, mal de mer, bras de mer.
- **Articulations du corps**: Genou · Cheville · Coude · Épaule
  - Intended reason: Le critère « articulation » exclut Bras, qui est un membre : c'est ce qui rend le placement de Bras défendable.
  - Explanation: Genou, Cheville, Coude et Épaule sont des articulations.
- **Animaux de la ferme**: Vache · Cochon · Mouton · Poule
  - Intended reason: Série complète sans Loup, le seul animal non domestique de la grille.
  - Explanation: Vache, Cochon, Mouton et Poule vivent à la ferme.
- **Fruits à noyau**: Pêche · Prune · Cerise · Abricot
  - Intended reason: Le critère « à noyau » est vérifiable et exclut la carte Fruits, qui n'est pas un fruit mais la moitié d'une expression.
  - Explanation: Pêche, Prune, Cerise et Abricot contiennent un noyau.

Rationale: Concept conservé en difficulté 2. Cheval a été retiré, ce qui supprime « cheval de mer » comme cinquième candidat au groupe lexical ; il reste trois leurres croisés et une mécanique d'expressions complétées, charge adaptée à un joueur déjà rodé. La position n'a pas été modifiée dans cette passe.

Intended reason: Quatre mots courants forment un groupe uniquement par ce qu'on peut leur ajouter ; chacun est par ailleurs un membre plausible de l'un des trois autres groupes.

Known decoys: Cochon : « cochon d'Inde » est la seule association vivante du mot ; aucun composé en « de mer » ne vient à l'esprit aujourd'hui.; Loup : animal, attiré par la ferme (qui est pourtant complète).; Fruits : attiré par les fruits à noyau (qui sont pourtant quatre).; Bras : partie du corps, attiré par les articulations (mais le bras n'est pas une articulation).; Pêche : la pêche en mer, leurre en sens inverse.; Mouton : les moutons désignent aussi l'écume des vagues ; Poule : « poule mouillée » ; Prune : au sens d'amende.

Ambiguity notes: Correction éditoriale avant import : Cheval a été remplacé par Cochon, ce qui supprime le cinquième candidat que constituait « cheval de mer », nom attesté de l'hippocampe. Point que je signale plutôt que de le taire : « cochon de mer » a désigné le marsouin en français ancien. L'expression est sortie de l'usage et n'est plus comprise comme telle par un locuteur d'aujourd'hui ; je la juge sans effet sur le jeu, mais un relecteur doit en décider en connaissance de cause. Les quatre expressions du groupe lexical — loup, fruits, mal et bras de mer — restent d'usage courant dans toute la francophonie. Je ne prétends pas que la solution soit sémantiquement unique ; je prétends qu'aucune répartition alternative ne se referme sur quatre groupes de quatre.

Hints:

- pair / g1: Mal + Fruits
- category / g2: Quatre endroits du corps qui plient.
- pair / g4: Cerise + Abricot
- category / g3: On les trouve derrière la barrière, au pré ou dans la basse-cour.

