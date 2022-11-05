// Import document classes.
import { NaheulbeukActor } from "./documents/actor.mjs";
import { NaheulbeukItem } from "./documents/item.mjs";
// Import sheet classes.
import { NaheulbeukActorSheet } from "./sheets/actor-sheet.mjs";
import { NaheulbeukItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { NAHEULBEUK } from "./helpers/config.mjs";

//PCH
import { Macros } from "./documents/macro.mjs";


/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */


Hooks.once('init', async function () {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.

  game.naheulbeuk = {
    NaheulbeukActor,
    NaheulbeukItem,
    rollItemMacro,
    macros: Macros
  };

  // Add custom constants for configuration.
  CONFIG.NAHEULBEUK = NAHEULBEUK;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "@abilities.cou.value + @abilities.cou.bonus",
    decimals: 2
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = NaheulbeukActor;
  CONFIG.Item.documentClass = NaheulbeukItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("naheulbeuk", NaheulbeukActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("naheulbeuk", NaheulbeukItemSheet, { makeDefault: true });

  Hooks.on("hotbarDrop", (bar, data, slot) => {
    if (["Item"].includes(data.type)) {
      Macros.createMacro(data, slot);
      return false;
    }
  })

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function () {
  var outStr = '';
  for (var arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

//PCH - opération mathématique
Handlebars.registerHelper("math", function (lvalue, operator, rvalue, options) {
  lvalue = parseFloat(lvalue);
  rvalue = parseFloat(rvalue);
  return {
    "+": lvalue + rvalue,
    "-": lvalue - rvalue,
    "*": (lvalue * 100) * (rvalue * 100) / 10000,
    "/": Math.ceil(lvalue / rvalue),
    ":": lvalue / rvalue,
    "%": lvalue % rvalue
  }[operator];
});
//PCH - opération mathématique arrondi
Handlebars.registerHelper("arrondi", function (lvalue) {
  lvalue = parseFloat(lvalue);
  var value = Math.ceil(lvalue * 100) / 100
  return value
});

//PCH - opération mathématique arrondi le plus proche
Handlebars.registerHelper("arrondiProche", function (lvalue) {
  lvalue = parseFloat(lvalue);
  var value = Math.round(lvalue * 1000) / 1000
  console.log(lvalue)
  return value
});

//PCH - égalité
Handlebars.registerHelper('equals', function (val1, val2) {
  var val1 = val1;
  var val2 = val2;
  if (val1 == "false") { val1 = false };
  if (val1 == "true") { val1 = true };
  if (val2 == "false") { val2 = false };
  if (val2 == "true") { val2 = true };
  return val1 == val2;
});

//PCH - premier character
Handlebars.registerHelper('first', function (val1) {
  var val1 = val1;
  return val1.slice(0, 1);
});

//PCH - sans premier character
Handlebars.registerHelper('first2', function (val1) {
  var val1 = val1;
  return val1.slice(1, val1.length);
});

//PCH - pas égalité
Handlebars.registerHelper('equalsnot', function (val1, val2) {
  var val1 = val1;
  var val2 = val2;
  if (val1 == "false") { val1 = false };
  if (val1 == "true") { val1 = true };
  if (val2 == "false") { val2 = false };
  if (val2 == "true") { val2 = true };
  return val1 != val2;
});

//PCH - égalité avec OU
Handlebars.registerHelper('equalsor', function (val1, val2, val3, val4) {
  var val1 = val1;
  var val2 = val2;
  var val3 = val3;
  var val4 = val4;
  var result = false;
  if (val1 == "false") { val1 = false };
  if (val1 == "true") { val1 = true };
  if (val2 == "false") { val2 = false };
  if (val2 == "true") { val2 = true };
  if (val3 == "false") { val3 = false };
  if (val3 == "true") { val3 = true };
  if (val4 == "false") { val4 = false };
  if (val4 == "true") { val4 = true };
  if (val1 == val2 || val3 == val4) { result = true }
  return result;
});

//PCH - égalité avec ET
Handlebars.registerHelper('equalsand', function (val1, val2, val3, val4) {
  var val1 = val1;
  var val2 = val2;
  var val3 = val3;
  var val4 = val4;
  var result = false;
  if (val1 == "false") { val1 = false };
  if (val1 == "true") { val1 = true };
  if (val2 == "false") { val2 = false };
  if (val2 == "true") { val2 = true };
  if (val3 == "false") { val3 = false };
  if (val3 == "true") { val3 = true };
  if (val4 == "false") { val4 = false };
  if (val4 == "true") { val4 = true };
  if (val1 == val2 && val3 == val4) { result = true }
  return result;
});

//PCH - a un bonus (item)
Handlebars.registerHelper('bonus', function (val1, val2, val3, val4, val5, val6, val7, val8, val9, val10, val11, val12) {
  if ((val1 == 0) && (val2 == 0) && (val3 == 0) && (val4 == 0) && (val5 == 0) && (val6 == 0) && (val7 == 0) && (val8 == 0) && (val9 == 0) && (val9 == 0) && (val10 == 0) && (val11 == 0) && (val12 == "")) {
    return true
  } else {
    return false
  }
});

//PCH - déplacement
Handlebars.registerHelper('deplacement', function (val1, val2, val3, val4) {
  var calc = val1 + val2 - val3;
  var calc1 = 0;
  var calc2 = 0;
  if (calc <= 1) {
    calc1 = 8;
    calc2 = 12;
  } else if (calc == 2) {
    calc1 = 6;
    calc2 = 10;
  } else if (calc <= 4) {
    calc1 = 4;
    calc2 = 8;
  } else if (calc == 5) {
    calc1 = 4;
    calc2 = 6;
  } else if (calc == 6) {
    calc1 = 3;
    calc2 = 4;
  } else if (calc == 7) {
    calc1 = 2;
    calc2 = 3;
  } else if (calc > 7) {
    calc1 = 1;
    calc2 = 2;
  }
  calc1 = Math.max(0, Math.ceil(calc1 + (calc1 * val4 / 100)))
  calc2 = Math.max(0, Math.ceil(calc2 + (calc2 * val4 / 100)))
  calc = "(" + calc1 + "m/" + calc2 + "m)"
  return calc;
});
//PCH - log
Handlebars.registerHelper("log", function (value) {
  console.log(value)
});

//PCH - sauvegarder l'acteur dans une variable pour être lû dans les boucles for
if (typeof actor_data != 'object') { var actor_data };
Handlebars.registerHelper("save_actor", function (actor) {
  actor_data = actor
});
//PCH - lire l'acteur dans la variable précédente
Handlebars.registerHelper("read_actor", function (value) {
  var actor_details = "actor_data.data.root.actor.system" + value
  actor_details = eval(actor_details)
  if (actor_details.toString().substring(0, 1) != "-" && /^[0-9]/.test(actor_details)) { actor_details = "+" + actor_details }
  if (actor_details == "+0") {
    return
  } else {
    return actor_details
  }
});

Handlebars.registerHelper("ingeniositeMalus", function (difficulte,malus) {
  var actor_ad = actor_data.data.root.actor.system.abilities.ad.value+actor_data.data.root.actor.system.abilities.ad.bonus
  var actor_int = actor_data.data.root.actor.system.abilities.int.value+actor_data.data.root.actor.system.abilities.int.bonus
  var actor_ingeniosite = Math.ceil((parseInt(actor_ad)+parseInt(actor_int))/2)
  var actor_diff = actor_ingeniosite - difficulte
  if (Math.sign(actor_diff)==-1){
    actor_ingeniosite=actor_ingeniosite+actor_diff
  }
  if (malus.substring(0,1)=="-"){
    actor_ingeniosite=actor_ingeniosite+parseInt(malus)
  } else {
    actor_ingeniosite = 0
  }
  return actor_ingeniosite
});

Handlebars.registerHelper("ingeniosite", function (difficulte) {
  var actor_ad = actor_data.data.root.actor.system.abilities.ad.value+actor_data.data.root.actor.system.abilities.ad.bonus
  var actor_int = actor_data.data.root.actor.system.abilities.int.value+actor_data.data.root.actor.system.abilities.int.bonus
  var actor_ingeniosite = Math.ceil((parseInt(actor_ad)+parseInt(actor_int))/2)
  var actor_diff = actor_ingeniosite - difficulte
  actor_ingeniosite=actor_ingeniosite+actor_diff
  return actor_ingeniosite
});

//PCH - lire l'acteur dans la variable précédente
Handlebars.registerHelper("read_items_actor", function (value) {
  let compteur = 0
  for (let itemActor of actor_data.data.root.actor.items){
    if (itemActor.system.stockage!=undefined){
      let arme_armure_pas_equipe = true
      if ((itemActor.type=="arme" || itemActor.type=="armure") && itemActor.system.equipe==true){arme_armure_pas_equipe=false}
      if (arme_armure_pas_equipe && value=="sac" && itemActor.system.stockage=="sac") {compteur++}
      if (arme_armure_pas_equipe && value=="nosac" && itemActor.system.stockage=="nosac") {compteur++}
      if (arme_armure_pas_equipe && value=="bourse" && itemActor.system.stockage=="bourse") {compteur++}
      if (arme_armure_pas_equipe && value=="divers" && itemActor.system.stockage=="sac" && (itemActor.type=="sac" || itemActor.system.categorie=="Divers" || itemActor.system.categorie=="")) {compteur++}
      if (arme_armure_pas_equipe && value=="livres" && itemActor.system.stockage=="sac" && itemActor.system.categorie=="Livres") {compteur++}
      if (arme_armure_pas_equipe && value=="potions" && itemActor.system.stockage=="sac" && itemActor.system.categorie=="Potions") {compteur++}
      if (arme_armure_pas_equipe && value=="ingredients" && itemActor.system.stockage=="sac" && itemActor.system.categorie=="Ingrédients") {compteur++}
      if (arme_armure_pas_equipe && value=="armes" && itemActor.system.stockage=="sac" && itemActor.system.categorie=="Armes") {compteur++}
      if (arme_armure_pas_equipe && value=="armures" && itemActor.system.stockage=="sac" && itemActor.system.categorie=="Armures") {compteur++}
      if (arme_armure_pas_equipe && value=="nourritures" && itemActor.system.stockage=="sac" && itemActor.system.categorie=="Nourritures") {compteur++}
      if (arme_armure_pas_equipe && value=="richesses" && itemActor.system.stockage=="sac" && itemActor.system.categorie=="Richesses") {compteur++}
      if (arme_armure_pas_equipe && value=="perso" && itemActor.system.stockage=="sac" && itemActor.system.categorie=="Objets personnels") {compteur++}
      if (arme_armure_pas_equipe && value=="montures" && itemActor.system.stockage=="sac" && itemActor.system.categorie=="Montures") {compteur++}
    }
  }
  return compteur
});

Handlebars.registerHelper("poidconteneur", function (item) {
  var poid = item.system.poidconteneur
  for (let itemFind of item.system.items){
    poid = poid + itemFind.system.weight*itemFind.system.quantity
  }
  return poid
});


/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName,param) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

  if (param==1){
    //Macro pour un sort
    if (item.type == "sort") {
      let d = new Dialog({
        title: item.name,
        content: `
        <label style="font-size: 15px;">Que souhaitez vous faire ?</label>
        <br/>
        `,
        buttons: {
          one: {
            label: "Voir l'objet",
            callback: (html) => {
              item.sheet.render(true);
            }
          },
          two: {
            label: "Utiliser l'objet",
            callback: (html) => {
              if (item.data.data.epreuvecustom == true) {
                var dataset = { "actor": actor, "dice1": item.data.data.jet1, "name1": item.data.data.name1, "diff1": item.data.data.epreuve1, "dice2": item.data.data.jet2, "name2": item.data.data.name2, "diff2": item.data.data.epreuve2, "dice3": item.data.data.jet3, "name3": item.data.data.name3, "diff3": item.data.data.epreuve3, "dice4": item.data.data.jet4, "name4": item.data.data.name4, "diff4": item.data.data.epreuve4, "dice5": item.data.data.jet5, "name5": item.data.data.name5, "diff5": item.data.data.epreuve5 };
                var currentTarget = { "dataset": dataset };
                var event = { "currentTarget": currentTarget };
                onRollCustomSpell(event)
              } else {
                if (item.data.data.degat == "") {
                  var dataset = { "actor": actor, "dice1": "d20", "name1": "Epreuve", "diff1": item.data.data.epreuve, "dice2": "", "name2": "", "diff2": "", "dice3": "", "name3": "", "diff3": "", "dice4": "", "name4": "", "diff4": "", "dice5": "", "name5": "", "diff5": "" };
                } else {
                  var dataset = { "actor": actor, "dice1": "d20", "name1": "Epreuve", "diff1": item.data.data.epreuve, "dice2": item.data.data.degat, "name2": "Dégâts", "diff2": "", "dice3": "", "name3": "", "diff3": "", "dice4": "", "name4": "", "diff4": "", "dice5": "", "name5": "", "diff5": "" };
                }
                var currentTarget = { "dataset": dataset };
                var event = { "currentTarget": currentTarget };
                onRollCustomSpell(event)
              }
            }
          }
        }
      });
      d.render(true);

    //Macro pour une arme ou un bouclier (ignore les flèches et autre projectile/combustibles) sans épreuve custom
    } else if (item.type == "arme" && item.data.data.formula + item.data.data.prd != "-" && item.data.data.formula + item.data.data.prd != "--" && item.data.data.epreuvecustom == false) {
      let d = new Dialog({
        title: item.name,
        content: `
        <label style="font-size: 15px;">Que souhaitez vous faire ?</label>
        <br/>
        `,
        buttons: {
          one: {
            label: "Voir l'objet",
            callback: (html) => {
              item.sheet.render(true);
            }
          },
          two: {
            label: "Utiliser l'objet",
            callback: (html) => {
              if (item.data.data.equipe == false || item.data.data.enmain == false) {
                return ui.notifications.warn(`L'objet ${itemName} n'est pas équipé`);
              } else {
                if (item.data.data.prd == "-") {
                  var prd = "";
                  var prdname = "";
                } else {
                  var prd = "@prd+" + item.data.data.prd;
                  var prdname = "Parade";
                }
                if (item.data.data.formula == "-" || item.data.data.formula == "") {
                  var attaque = "";
                  var attname = "";
                  var degat = "";
                  var degatname = "";
                } else {
                  var attname = "Attaque";
                  var degatname = "Dégâts";
                  if (item.data.data.lancerarme != "-") { var attaque = "@att-distance" } else { var attaque = "@att+" + item.data.data.att }
                  var degat = item.data.data.formula;
                  if ((actor.data.data.abilities.fo.value + actor.data.data.abilities.fo.bonus) > 12) {
                    degat = degat + "+" + Math.max(0, (actor.data.data.abilities.fo.value + actor.data.data.abilities.fo.bonus) - 12)
                  };
                  if ((actor.data.data.abilities.fo.value + actor.data.data.abilities.fo.bonus) < 9) {
                    degat = degat + "-1"
                  };
                  if (item.data.data.lancerarme != "-" && actor.data.data.attributes.lancerarme.degat != 0) {
                    degat = degat + actor.data.data.attributes.lancerarme.degat
                  };
                }

                var dataset = { "actor": actor, "dice1": "d20", "name1": attname, "diff1": attaque, "dice2": degat, "name2": degatname, "diff2": "", "dice3": "d20", "name3": prdname, "diff3": prd, "dice4": "", "name4": "", "diff4": "", "dice5": "", "name5": "", "diff5": "" };
                var currentTarget = { "dataset": dataset };
                var event = { "currentTarget": currentTarget };
                onRollCustomSpell(event)
              }
            }
          }
        }
      });
      d.render(true);
    //Macro pour une arme ou un bouclier (ignore les flèches et autre projectile/combustibles) avec épreuve custom
    } else if (item.type == "arme" && item.data.data.formula + item.data.data.prd != "-" && item.data.data.formula + item.data.data.prd != "--" && item.data.data.epreuvecustom == true) {
      let d = new Dialog({
        title: item.name,
        content: `
        <label style="font-size: 15px;">Que souhaitez vous faire ?</label>
        <br/>
        `,
        buttons: {
          one: {
            label: "Voir l'objet",
            callback: (html) => {
              item.sheet.render(true);
            }
          },
          two: {
            label: "Utiliser l'objet",
            callback: (html) => {
              if (item.data.data.equipe == false || item.data.data.enmain == false) {
                return ui.notifications.warn(`L'objet ${itemName} n'est pas équipé`);
              } else {
                if (item.data.data.prd == "-") {
                  var prd = "";
                  var prdname = "";
                } else {
                  var prd = "@prd+" + item.data.data.prd;
                  var prdname = "Parade";
                }
                if (item.data.data.formula == "-" || item.data.data.formula == "") {
                  var attaque = "";
                  var attname = "";
                  var degat = "";
                  var degatname = "";
                } else {
                  var attname = "Attaque";
                  var degatname = "Dégâts";
                  if (item.data.data.lancerarme != "-") { var attaque = "@att-distance" } else { var attaque = "@att+" + item.data.data.att }
                  var degat = item.data.data.formula;
                  if ((actor.data.data.abilities.fo.value + actor.data.data.abilities.fo.bonus) > 12) {
                    degat = degat + "+" + Math.max(0, (actor.data.data.abilities.fo.value + actor.data.data.abilities.fo.bonus) - 12)
                  };
                  if ((actor.data.data.abilities.fo.value + actor.data.data.abilities.fo.bonus) < 9) {
                    degat = degat + "-1"
                  };
                  if (item.data.data.lancerarme != "-" && actor.data.data.attributes.lancerarme.degat != 0) {
                    degat = degat + actor.data.data.attributes.lancerarme.degat
                  };
                }

                var dataset = { "actor": actor, "dice1": "d20", "name1": attname, "diff1": attaque, "dice2": degat, "name2": degatname, "diff2": "", "dice3": "d20", "name3": prdname, "diff3": prd, "dice4": "", "name4": "", "diff4": "", "dice5": "", "name5": "", "diff5": "" };
                var currentTarget = { "dataset": dataset };
                var event = { "currentTarget": currentTarget };
                onRollCustomSpell(event)
              }
            }
          },
          three: {
            label: "Épreuve(s) custom",
            callback: (html) => {
              if (item.data.data.equipe == false || item.data.data.enmain == false) {
                return ui.notifications.warn(`L'objet ${itemName} n'est pas équipé`);
              }
              var dataset = { "actor": actor, "dice1": item.data.data.jet1, "name1": item.data.data.name1, "diff1": item.data.data.epreuve1, "dice2": item.data.data.jet2, "name2": item.data.data.name2, "diff2": item.data.data.epreuve2, "dice3": item.data.data.jet3, "name3": item.data.data.name3, "diff3": item.data.data.epreuve3, "dice4": item.data.data.jet4, "name4": item.data.data.name4, "diff4": item.data.data.epreuve4, "dice5": item.data.data.jet5, "name5": item.data.data.name5, "diff5": item.data.data.epreuve5 };
              var currentTarget = { "dataset": dataset };
              var event = { "currentTarget": currentTarget };
              onRollCustomSpell(event)
            }
          },
        }
      });
      d.render(true);
    //Macro pour une autre arme (sans dégâts donc) avec une épreuve custom (comme une arme à feu)
    } else if (item.type == "arme" && item.data.data.epreuvecustom == true) {
      let d = new Dialog({
        title: item.name,
        content: `
        <label style="font-size: 15px;">Que souhaitez vous faire ?</label>
        <br/>
        `,
        buttons: {
          one: {
            label: "Voir l'objet",
            callback: (html) => {
              item.sheet.render(true);
            }
          },
          three: {
            label: "Épreuve(s)",
            callback: (html) => {
              if (item.data.data.equipe == false || item.data.data.enmain == false) {
                return ui.notifications.warn(`L'objet ${itemName} n'est pas équipé`);
              }
              var dataset = { "actor": actor, "dice1": item.data.data.jet1, "name1": item.data.data.name1, "diff1": item.data.data.epreuve1, "dice2": item.data.data.jet2, "name2": item.data.data.name2, "diff2": item.data.data.epreuve2, "dice3": item.data.data.jet3, "name3": item.data.data.name3, "diff3": item.data.data.epreuve3, "dice4": item.data.data.jet4, "name4": item.data.data.name4, "diff4": item.data.data.epreuve4, "dice5": item.data.data.jet5, "name5": item.data.data.name5, "diff5": item.data.data.epreuve5, "dice6": item.data.data.jet6, "name6": item.data.data.name6, "diff6": item.data.data.epreuve6, "dice7": item.data.data.jet7, "name7": item.data.data.name7, "diff7": item.data.data.epreuve7 };
              var currentTarget = { "dataset": dataset };
              var event = { "currentTarget": currentTarget };
              onRollCustomSpell(event)
            }
          },
        }
      });
      d.render(true);
    //Macro pour un coup spécial - désactivé pour le moment
    /*} else if (item.type == "coup" && ((item.data.data.epreuve != "" && item.data.data.bourrepif == false) || item.data.data.bourrepif == true)) {
      let d = new Dialog({
        title: item.name,
        content: `
        <label style="font-size: 15px;">Que souhaitez vous faire ?</label>
        <br/>
        `,
        buttons: {
          one: {
            label: "Voir l'objet",
            callback: (html) => {
              item.sheet.render(true);
            }
          },
          two: {
            label: "Utiliser l'objet",
            callback: (html) => {
              if (item.data.data.bourrepif == false) {
                var name1 = "";
                var name2 = "";
                var diff1 = "";
                var dice1 = "";
                var dice2 = "";
                if (item.data.data.epreuve.substring(0, 1) != "*") {
                  name1 = "Epreuve"
                  diff1 = item.data.data.epreuve
                  dice1 = "d20"
                }
                if (item.data.data.degat.substring(0, 1) != "*") {
                  name2 = "Dégâts"
                  dice2 = item.data.data.degat
                }
                var dataset = { "actor": actor, "dice1": dice1, "name1": name1, "diff1": diff1, "dice2": dice2, "name2": name2, "diff2": "", "dice3": "", "name3": "", "diff3": "", "dice4": "", "name4": "", "diff4": "", "dice5": "", "name5": "", "diff5": "" };
                var currentTarget = { "dataset": dataset };
                var event = { "currentTarget": currentTarget };
                onRollCustomSpell(event)
              } else {
                var name1 = "";
                var name2 = "";
                var name3 = "";
                var diff1 = "";
                var diff3 = "";
                var dice1 = "";
                var dice2 = "";
                var dice3 = "";
                if (item.data.data.epreuve != "" && item.data.data.epreuve != "-") {
                  name1 = "Epreuve d'attaque";
                  diff1 = item.data.data.epreuve;
                  dice1 = "d20";
                }
                if (item.data.data.degat != "" && item.data.data.degat != "-") {
                  name2 = "Dégâts";
                  dice2 = item.data.data.degat;
                }
                if (item.data.data.attaque != "" && item.data.data.attaque != "-") {
                  name3 = "Epreuve spéciale";
                  diff3 = item.data.data.attaque;
                  dice3 = "d20";
                }
                var dataset = { "actor": actor, "dice1": dice1, "name1": name1, "diff1": diff1, "dice2": dice2, "name2": name2, "diff2": "", "dice3": dice3, "name3": name3, "diff3": diff3, "dice4": "", "name4": "", "diff4": "", "dice5": "", "name5": "", "diff5": "" };
                var currentTarget = { "dataset": dataset };
                var event = { "currentTarget": currentTarget };
                onRollCustomSpell(event)
              }
            }
          }
        }
      });
      d.render(true);*/
    } else {
      item.sheet.render(true);
    }
  }

  if (param==0){
    //sort
    if (item.type == "sort") {
      if (item.data.data.epreuvecustom == true) {
        var dataset = { "actor": actor, "dice1": item.data.data.jet1, "name1": item.data.data.name1, "diff1": item.data.data.epreuve1, "dice2": item.data.data.jet2, "name2": item.data.data.name2, "diff2": item.data.data.epreuve2, "dice3": item.data.data.jet3, "name3": item.data.data.name3, "diff3": item.data.data.epreuve3, "dice4": item.data.data.jet4, "name4": item.data.data.name4, "diff4": item.data.data.epreuve4, "dice5": item.data.data.jet5, "name5": item.data.data.name5, "diff5": item.data.data.epreuve5 };
        var currentTarget = { "dataset": dataset };
        var event = { "currentTarget": currentTarget };
        onRollCustomSpell(event)
      } else {
        if (item.data.data.degat == "") {
          var dataset = { "actor": actor, "dice1": "d20", "name1": "Epreuve", "diff1": item.data.data.epreuve, "dice2": "", "name2": "", "diff2": "", "dice3": "", "name3": "", "diff3": "", "dice4": "", "name4": "", "diff4": "", "dice5": "", "name5": "", "diff5": "" };
        } else {
          var dataset = { "actor": actor, "dice1": "d20", "name1": "Epreuve", "diff1": item.data.data.epreuve, "dice2": item.data.data.degat, "name2": "Dégâts", "diff2": "", "dice3": "", "name3": "", "diff3": "", "dice4": "", "name4": "", "diff4": "", "dice5": "", "name5": "", "diff5": "" };
        }
        var currentTarget = { "dataset": dataset };
        var event = { "currentTarget": currentTarget };
        onRollCustomSpell(event)
      }
    //arme sans épreuve custom
    } else if (item.type == "arme" && item.data.data.formula + item.data.data.prd != "-" && item.data.data.formula + item.data.data.prd != "--" && item.data.data.epreuvecustom == false) {
        if (item.data.data.equipe == false || item.data.data.enmain == false) {
          return ui.notifications.warn(`L'objet ${itemName} n'est pas équipé`);
        } else {
          if (item.data.data.prd == "-") {
            var prd = "";
            var prdname = "";
          } else {
            var prd = "@prd+" + item.data.data.prd;
            var prdname = "Parade";
          }
          if (item.data.data.formula == "-" || item.data.data.formula == "") {
            var attaque = "";
            var attname = "";
            var degat = "";
            var degatname = "";
          } else {
            var attname = "Attaque";
            var degatname = "Dégâts";
            if (item.data.data.lancerarme != "-") { var attaque = "@att-distance" } else { var attaque = "@att+" + item.data.data.att }
            var degat = item.data.data.formula;
            if ((actor.data.data.abilities.fo.value + actor.data.data.abilities.fo.bonus) > 12) {
              degat = degat + "+" + Math.max(0, (actor.data.data.abilities.fo.value + actor.data.data.abilities.fo.bonus) - 12)
            };
            if ((actor.data.data.abilities.fo.value + actor.data.data.abilities.fo.bonus) < 9) {
              degat = degat + "-1"
            };
            if (item.data.data.lancerarme != "-" && actor.data.data.attributes.lancerarme.degat != 0) {
              degat = degat + actor.data.data.attributes.lancerarme.degat
            };
          }

          var dataset = { "actor": actor, "dice1": "d20", "name1": attname, "diff1": attaque, "dice2": degat, "name2": degatname, "diff2": "", "dice3": "d20", "name3": prdname, "diff3": prd, "dice4": "", "name4": "", "diff4": "", "dice5": "", "name5": "", "diff5": "" };
          var currentTarget = { "dataset": dataset };
          var event = { "currentTarget": currentTarget };
          onRollCustomSpell(event)
        }
    //arme avec épreuve custom
    } else if (item.type == "arme" && item.data.data.formula + item.data.data.prd != "-" && item.data.data.formula + item.data.data.prd != "--" && item.data.data.epreuvecustom == true) {
      let d = new Dialog({
        title: item.name,
        content: `
        <label style="font-size: 15px;">Que souhaitez vous faire ?</label>
        <br/>
        `,
        buttons: {
          two: {
            label: "Utiliser l'objet",
            callback: (html) => {
              if (item.data.data.equipe == false || item.data.data.enmain == false) {
                return ui.notifications.warn(`L'objet ${itemName} n'est pas équipé`);
              } else {
                if (item.data.data.prd == "-") {
                  var prd = "";
                  var prdname = "";
                } else {
                  var prd = "@prd+" + item.data.data.prd;
                  var prdname = "Parade";
                }
                if (item.data.data.formula == "-" || item.data.data.formula == "") {
                  var attaque = "";
                  var attname = "";
                  var degat = "";
                  var degatname = "";
                } else {
                  var attname = "Attaque";
                  var degatname = "Dégâts";
                  if (item.data.data.lancerarme != "-") { var attaque = "@att-distance" } else { var attaque = "@att+" + item.data.data.att }
                  var degat = item.data.data.formula;
                  if ((actor.data.data.abilities.fo.value + actor.data.data.abilities.fo.bonus) > 12) {
                    degat = degat + "+" + Math.max(0, (actor.data.data.abilities.fo.value + actor.data.data.abilities.fo.bonus) - 12)
                  };
                  if ((actor.data.data.abilities.fo.value + actor.data.data.abilities.fo.bonus) < 9) {
                    degat = degat + "-1"
                  };
                  if (item.data.data.lancerarme != "-" && actor.data.data.attributes.lancerarme.degat != 0) {
                    degat = degat + actor.data.data.attributes.lancerarme.degat
                  };
                }

                var dataset = { "actor": actor, "dice1": "d20", "name1": attname, "diff1": attaque, "dice2": degat, "name2": degatname, "diff2": "", "dice3": "d20", "name3": prdname, "diff3": prd, "dice4": "", "name4": "", "diff4": "", "dice5": "", "name5": "", "diff5": "" };
                var currentTarget = { "dataset": dataset };
                var event = { "currentTarget": currentTarget };
                onRollCustomSpell(event)
              }
            }
          },
          three: {
            label: "Épreuve(s) custom",
            callback: (html) => {
              if (item.data.data.equipe == false || item.data.data.enmain == false) {
                return ui.notifications.warn(`L'objet ${itemName} n'est pas équipé`);
              }
              var dataset = { "actor": actor, "dice1": item.data.data.jet1, "name1": item.data.data.name1, "diff1": item.data.data.epreuve1, "dice2": item.data.data.jet2, "name2": item.data.data.name2, "diff2": item.data.data.epreuve2, "dice3": item.data.data.jet3, "name3": item.data.data.name3, "diff3": item.data.data.epreuve3, "dice4": item.data.data.jet4, "name4": item.data.data.name4, "diff4": item.data.data.epreuve4, "dice5": item.data.data.jet5, "name5": item.data.data.name5, "diff5": item.data.data.epreuve5 };
              var currentTarget = { "dataset": dataset };
              var event = { "currentTarget": currentTarget };
              onRollCustomSpell(event)
            }
          },
        }
      });
      d.render(true);
    //arme sans dégâts, juste avec épreuve custom
    } else if (item.type == "arme" && item.data.data.epreuvecustom == true) {
        if (item.data.data.equipe == false || item.data.data.enmain == false) {
          return ui.notifications.warn(`L'objet ${itemName} n'est pas équipé`);
        }
        var dataset = { "actor": actor, "dice1": item.data.data.jet1, "name1": item.data.data.name1, "diff1": item.data.data.epreuve1, "dice2": item.data.data.jet2, "name2": item.data.data.name2, "diff2": item.data.data.epreuve2, "dice3": item.data.data.jet3, "name3": item.data.data.name3, "diff3": item.data.data.epreuve3, "dice4": item.data.data.jet4, "name4": item.data.data.name4, "diff4": item.data.data.epreuve4, "dice5": item.data.data.jet5, "name5": item.data.data.name5, "diff5": item.data.data.epreuve5, "dice6": item.data.data.jet6, "name6": item.data.data.name6, "diff6": item.data.data.epreuve6, "dice7": item.data.data.jet7, "name7": item.data.data.name7, "diff7": item.data.data.epreuve7 };
        var currentTarget = { "dataset": dataset };
        var event = { "currentTarget": currentTarget };
        onRollCustomSpell(event)
    //coup spécial, désactivé pour le moment
    /*
    } else if (item.type == "coup" && ((item.data.data.epreuve != "" && item.data.data.bourrepif == false) || item.data.data.bourrepif == true)) {
        if (item.data.data.bourrepif == false) {
          var name1 = "";
          var name2 = "";
          var diff1 = "";
          var dice1 = "";
          var dice2 = "";
          if (item.data.data.epreuve.substring(0, 1) != "*") {
            name1 = "Epreuve"
            diff1 = item.data.data.epreuve
            dice1 = "d20"
          }
          if (item.data.data.degat.substring(0, 1) != "*") {
            name2 = "Dégâts"
            dice2 = item.data.data.degat
          }
          var dataset = { "actor": actor, "dice1": dice1, "name1": name1, "diff1": diff1, "dice2": dice2, "name2": name2, "diff2": "", "dice3": "", "name3": "", "diff3": "", "dice4": "", "name4": "", "diff4": "", "dice5": "", "name5": "", "diff5": "" };
          var currentTarget = { "dataset": dataset };
          var event = { "currentTarget": currentTarget };
          onRollCustomSpell(event)
        } else {
          var name1 = "";
          var name2 = "";
          var name3 = "";
          var diff1 = "";
          var diff3 = "";
          var dice1 = "";
          var dice2 = "";
          var dice3 = "";
          if (item.data.data.epreuve != "" && item.data.data.epreuve != "-") {
            name1 = "Epreuve d'attaque";
            diff1 = item.data.data.epreuve;
            dice1 = "d20";
          }
          if (item.data.data.degat != "" && item.data.data.degat != "-") {
            name2 = "Dégâts";
            dice2 = item.data.data.degat;
          }
          if (item.data.data.attaque != "" && item.data.data.attaque != "-") {
            name3 = "Epreuve spéciale";
            diff3 = item.data.data.attaque;
            dice3 = "d20";
          }
          var dataset = { "actor": actor, "dice1": dice1, "name1": name1, "diff1": diff1, "dice2": dice2, "name2": name2, "diff2": "", "dice3": dice3, "name3": name3, "diff3": diff3, "dice4": "", "name4": "", "diff4": "", "dice5": "", "name5": "", "diff5": "" };
          var currentTarget = { "dataset": dataset };
          var event = { "currentTarget": currentTarget };
          onRollCustomSpell(event)
        }*/
    } else {
      item.sheet.render(true);
    }
  }
}

//*PCH roll custom avec formulaire pour les sorts 
async function onRollCustomSpell(event) {
  const element = event.currentTarget;
  const dataset = element.dataset;
  var dice1 = "";
  var dice2 = "";
  var dice3 = "";
  var dice4 = "";
  var dice5 = "";
  var dice6 = "";
  var dice7 = "";
  var name1 = "";
  var name2 = "";
  var name3 = "";
  var name4 = "";
  var name5 = "";
  var name6 = "";
  var name7 = "";
  var diff1 = "";
  var diff2 = "";
  var diff3 = "";
  var diff4 = "";
  var diff5 = "";
  var diff6 = "";
  var diff7 = "";
  if (dataset.dice1!=undefined) {dice1 = dataset.dice1;}
  if (dataset.dice2!=undefined) {dice2 = dataset.dice2;}
  if (dataset.dice3!=undefined) {dice3 = dataset.dice3;}
  if (dataset.dice4!=undefined) {dice4 = dataset.dice4;}
  if (dataset.dice5!=undefined) {dice5 = dataset.dice5;}
  if (dataset.dice6!=undefined) {dice6 = dataset.dice6;}
  if (dataset.dice7!=undefined) {dice7 = dataset.dice7;}
  if (dataset.name1!=undefined) {name1 = dataset.name1;}
  if (dataset.name2!=undefined) {name2 = dataset.name2;}
  if (dataset.name3!=undefined) {name3 = dataset.name3;}
  if (dataset.name4!=undefined) {name4 = dataset.name4;}
  if (dataset.name5!=undefined) {name5 = dataset.name5;}
  if (dataset.name6!=undefined) {name6 = dataset.name6;}
  if (dataset.name7!=undefined) {name7 = dataset.name7;}
  if (dataset.diff1!=undefined) {diff1 = dataset.diff1;}
  if (dataset.diff2!=undefined) {diff2 = dataset.diff2;}
  if (dataset.diff3!=undefined) {diff3 = dataset.diff3;}
  if (dataset.diff4!=undefined) {diff4 = dataset.diff4;}
  if (dataset.diff5!=undefined) {diff5 = dataset.diff5;}
  if (dataset.diff6!=undefined) {diff6 = dataset.diff6;}
  if (dataset.diff7!=undefined) {diff7 = dataset.diff7;}

  const actorCible = dataset.actor

  dice1 = dice1.replace(/ /g, "");
  dice2 = dice2.replace(/ /g, "");
  dice3 = dice3.replace(/ /g, "");
  dice4 = dice4.replace(/ /g, "");
  dice5 = dice5.replace(/ /g, "");
  dice6 = dice6.replace(/ /g, "");
  dice7 = dice7.replace(/ /g, "");
  diff1 = diff1.replace(/ /g, "");
  diff2 = diff2.replace(/ /g, "");
  diff3 = diff3.replace(/ /g, "");
  diff4 = diff4.replace(/ /g, "");
  diff5 = diff5.replace(/ /g, "");
  diff6 = diff6.replace(/ /g, "");
  diff7 = diff7.replace(/ /g, "");

  var content = `
  <em style="font-size: 15px;">Raccourcis :</em>
  <br/>
  <em style="font-size: 15px;">@cou @int @cha @ad @fo @att @prd @lvl @pr @prm @esq @rm @mphy @mpsy @att-distance @bonusint</em>
  <hr>
  `
  if (name1 != "") {
    content = content + `
    <div style="display: flex;">
      <label style="font-size: 15px; flex:1;">`+ name1 + `</label>
      <div style="flex:0.1;"></div>
      <label style="font-size: 15px; flex:1;">Difficulté</label>
      <div style="flex:0.1;"></div>
    </div>
    <div style="display: flex;">
      <input style="font-size: 15px; flex:1;" type="text" name="inputFormule1" value="`+ dice1 + `">
      <div style="flex:0.1;"></div>
      <input style="font-size: 15px; flex:1;" type="text" name="inputDiff1" value=`+ diff1 + `></li>
      <div style="flex:0.1;"></div>
    </div>
    <br/>
    `
  }
  if (name2 != "") {
    content = content + `
    <div style="display: flex;">
      <label style="font-size: 15px; flex:1;">`+ name2 + `</label>
      <div style="flex:0.1;"></div>
      <label style="font-size: 15px; flex:1;">Difficulté</label>
      <div style="flex:0.1;"></div>
    </div>
    <div style="display: flex;">
      <input style="font-size: 15px; flex:1;" type="text" name="inputFormule2" value="`+ dice2 + `">
      <div style="flex:0.1;"></div>
      <input style="font-size: 15px; flex:1;" type="text" name="inputDiff2" value=`+ diff2 + `></li>
      <div style="flex:0.1;"></div>
    </div>
    <br/>
    `
  }
  if (name3 != "") {
    content = content + `
    <div style="display: flex;">
      <label style="font-size: 15px; flex:1;">`+ name3 + `</label>
      <div style="flex:0.1;"></div>
      <label style="font-size: 15px; flex:1;">Difficulté</label>
      <div style="flex:0.1;"></div>
    </div>
    <div style="display: flex;">
      <input style="font-size: 15px; flex:1;" type="text" name="inputFormule3" value="`+ dice3 + `">
      <div style="flex:0.1;"></div>
      <input style="font-size: 15px; flex:1;" type="text" name="inputDiff3" value=`+ diff3 + `></li>
      <div style="flex:0.1;"></div>
    </div>
    <br/>
    `
  }
  if (name4 != "") {
    content = content + `
    <div style="display: flex;">
      <label style="font-size: 15px; flex:1;">`+ name4 + `</label>
      <div style="flex:0.1;"></div>
      <label style="font-size: 15px; flex:1;">Difficulté</label>
      <div style="flex:0.1;"></div>
    </div>
    <div style="display: flex;">
      <input style="font-size: 15px; flex:1;" type="text" name="inputFormule4" value="`+ dice4 + `">
      <div style="flex:0.1;"></div>
      <input style="font-size: 15px; flex:1;" type="text" name="inputDiff4" value=`+ diff4 + `></li>
      <div style="flex:0.1;"></div>
    </div>
    <br/>
    `
  }
  if (name5 != "") {
    content = content + `
    <div style="display: flex;">
      <label style="font-size: 15px; flex:1;">`+ name5 + `</label>
      <div style="flex:0.1;"></div>
      <label style="font-size: 15px; flex:1;">Difficulté</label>
      <div style="flex:0.1;"></div>
    </div>
    <div style="display: flex;">
      <input style="font-size: 15px; flex:1;" type="text" name="inputFormule5" value="`+ dice5 + `">
      <div style="flex:0.1;"></div>
      <input style="font-size: 15px; flex:1;" type="text" name="inputDiff5" value=`+ diff5 + `></li>
      <div style="flex:0.1;"></div>
    </div>
    <br/>
    `
  }
  if (name6 != "") {
    content = content + `
    <div style="display: flex;">
      <label style="font-size: 15px; flex:1;">`+ name6 + `</label>
      <div style="flex:0.1;"></div>
      <label style="font-size: 15px; flex:1;">Difficulté</label>
      <div style="flex:0.1;"></div>
    </div>
    <div style="display: flex;">
      <input style="font-size: 15px; flex:1;" type="text" name="inputFormule6" value="`+ dice6 + `">
      <div style="flex:0.1;"></div>
      <input style="font-size: 15px; flex:1;" type="text" name="inputDiff6" value=`+ diff6 + `></li>
      <div style="flex:0.1;"></div>
    </div>
    <br/>
    `
  }
  if (name7 != "") {
    content = content + `
    <div style="display: flex;">
      <label style="font-size: 15px; flex:1;">`+ name7 + `</label>
      <div style="flex:0.1;"></div>
      <label style="font-size: 15px; flex:1;">Difficulté</label>
      <div style="flex:0.1;"></div>
    </div>
    <div style="display: flex;">
      <input style="font-size: 15px; flex:1;" type="text" name="inputFormule7" value="`+ dice7 + `">
      <div style="flex:0.1;"></div>
      <input style="font-size: 15px; flex:1;" type="text" name="inputDiff7" value=`+ diff7 + `></li>
      <div style="flex:0.1;"></div>
    </div>
    <br/><br/>
    `
  }
  var buttons = []
  var one = {
    label: '<span style="font-size: 12px;">'+name1+'</span>',
    callback: (html) => {
      let dice = html.find('input[name="inputFormule1"').val();
      let diff = html.find('input[name="inputDiff1"').val();
      const rollMessageTpl = 'systems/naheulbeuk/templates/chat/skill-roll.hbs';
      //dice=game.naheulbeuk.macros.replaceAttr(dice,this.actor);
      //diff=game.naheulbeuk.macros.replaceAttr(diff,this.actor);
      if (dice.substr(0, 6) == "cible:" || diff.substr(0, 6) == "cible:") {
        if (game.naheulbeuk.macros.getSpeakersTarget() == null) { return }
      }
      if (dice.substr(0, 6) == "cible:") {
        dice = game.naheulbeuk.macros.replaceAttr(dice, game.naheulbeuk.macros.getSpeakersTarget());
      } else {
        dice = game.naheulbeuk.macros.replaceAttr(dice, actorCible);
      }
      if (diff.substr(0, 6) == "cible:") {
        diff = game.naheulbeuk.macros.replaceAttr(diff, game.naheulbeuk.macros.getSpeakersTarget());
      } else {
        diff = game.naheulbeuk.macros.replaceAttr(diff, actorCible);
      }
      if (dice != "") {
        let r = new Roll(dice);
        //await r.roll({"async": true});
        r.roll({ "async": true }).then(r => {
          var result = 0;
          var tplData = {};
          var reussite = "Réussite !   ";
          if (diff == "") {
            tplData = {
              diff: "",
              name: name1 
            }
            renderTemplate(rollMessageTpl, tplData).then(msgFlavor => {
              r.toMessage({
                user: game.user.id,
                flavor: msgFlavor,
                speaker: ChatMessage.getSpeaker({ actor: actorCible })
              });
            });
          } else {
            diff = new Roll(diff);
            diff.roll({ "async": true }).then(diff => {
              result = Math.abs(diff.total - r.total);
              if (r.total > diff.total) { reussite = "Echec !   " };
              tplData = {
                diff: reussite + " - Difficulté : " + diff.total + " - Ecart : " + result,
                name: name1 
              };
              renderTemplate(rollMessageTpl, tplData).then(msgFlavor => {
                r.toMessage({
                  user: game.user.id,
                  flavor: msgFlavor,
                  speaker: ChatMessage.getSpeaker({ actor: actorCible })
                });
              });
            });
          };
        });
      }
      return false;
    }
  }
  var two = {
    label: '<span style="font-size: 12px;">'+name2+'</span>',
    callback: (html) => {
      let dice = html.find('input[name="inputFormule2"').val();
      let diff = html.find('input[name="inputDiff2"').val();
      const rollMessageTpl = 'systems/naheulbeuk/templates/chat/skill-roll.hbs';
      //dice=game.naheulbeuk.macros.replaceAttr(dice,actorCible);
      //diff=game.naheulbeuk.macros.replaceAttr(diff,actorCible);
      if (dice.substr(0, 6) == "cible:" || diff.substr(0, 6) == "cible:") {
        if (game.naheulbeuk.macros.getSpeakersTarget() == null) { return }
      }
      if (dice.substr(0, 6) == "cible:") {
        dice = game.naheulbeuk.macros.replaceAttr(dice, game.naheulbeuk.macros.getSpeakersTarget());
      } else {
        dice = game.naheulbeuk.macros.replaceAttr(dice, actorCible);
      }
      if (diff.substr(0, 6) == "cible:") {
        diff = game.naheulbeuk.macros.replaceAttr(diff, game.naheulbeuk.macros.getSpeakersTarget());
      } else {
        diff = game.naheulbeuk.macros.replaceAttr(diff, actorCible);
      }
      if (dice != "") {
        let r = new Roll(dice);
        //await r.roll({"async": true});
        r.roll({ "async": true }).then(r => {
          var result = 0;
          var tplData = {};
          var reussite = "Réussite !   ";
          if (diff == "") {
            tplData = {
              diff: "",
              name: name2 
            }
            renderTemplate(rollMessageTpl, tplData).then(msgFlavor => {
              r.toMessage({
                user: game.user.id,
                flavor: msgFlavor,
                speaker: ChatMessage.getSpeaker({ actor: actorCible })
              });
            });
          } else {
            diff = new Roll(diff);
            diff.roll({ "async": true }).then(diff => {
              result = Math.abs(diff.total - r.total);
              if (r.total > diff.total) { reussite = "Echec !   " };
              tplData = {
                diff: reussite + " - Difficulté : " + diff.total + " - Ecart : " + result,
                name: name2 
              };
              renderTemplate(rollMessageTpl, tplData).then(msgFlavor => {
                r.toMessage({
                  user: game.user.id,
                  flavor: msgFlavor,
                  speaker: ChatMessage.getSpeaker({ actor: actorCible })
                });
              });
            });
          };
        });
      }
      return false;
    }
  }
  var three = {
    label: '<span style="font-size: 12px;">'+name3+'</span>',
    callback: (html) => {
      let dice = html.find('input[name="inputFormule3"').val();
      let diff = html.find('input[name="inputDiff3"').val();
      const rollMessageTpl = 'systems/naheulbeuk/templates/chat/skill-roll.hbs';
      //dice=game.naheulbeuk.macros.replaceAttr(dice,actorCible);
      //diff=game.naheulbeuk.macros.replaceAttr(diff,actorCible);
      if (dice.substr(0, 6) == "cible:" || diff.substr(0, 6) == "cible:") {
        if (game.naheulbeuk.macros.getSpeakersTarget() == null) { return }
      }
      if (dice.substr(0, 6) == "cible:") {
        dice = game.naheulbeuk.macros.replaceAttr(dice, game.naheulbeuk.macros.getSpeakersTarget());
      } else {
        dice = game.naheulbeuk.macros.replaceAttr(dice, actorCible);
      }
      if (diff.substr(0, 6) == "cible:") {
        diff = game.naheulbeuk.macros.replaceAttr(diff, game.naheulbeuk.macros.getSpeakersTarget());
      } else {
        diff = game.naheulbeuk.macros.replaceAttr(diff, actorCible);
      }
      if (dice != "") {
        let r = new Roll(dice);
        //await r.roll({"async": true});
        r.roll({ "async": true }).then(r => {
          var result = 0;
          var tplData = {};
          var reussite = "Réussite !   ";
          if (diff == "") {
            tplData = {
              diff: "",
              name: name3 
            }
            renderTemplate(rollMessageTpl, tplData).then(msgFlavor => {
              r.toMessage({
                user: game.user.id,
                flavor: msgFlavor,
                speaker: ChatMessage.getSpeaker({ actor: actorCible })
              });
            });
          } else {
            diff = new Roll(diff);
            diff.roll({ "async": true }).then(diff => {
              result = Math.abs(diff.total - r.total);
              if (r.total > diff.total) { reussite = "Echec !   " };
              tplData = {
                diff: reussite + " - Difficulté : " + diff.total + " - Ecart : " + result,
                name: name3 
              };
              renderTemplate(rollMessageTpl, tplData).then(msgFlavor => {
                r.toMessage({
                  user: game.user.id,
                  flavor: msgFlavor,
                  speaker: ChatMessage.getSpeaker({ actor: actorCible })
                });
              });
            });
          };
        });
      }
      return false;
    }
  }
  var four = {
    label: '<span style="font-size: 12px;">'+name4+'</span>',
    callback: (html) => {
      let dice = html.find('input[name="inputFormule4"').val();
      let diff = html.find('input[name="inputDiff4"').val();
      const rollMessageTpl = 'systems/naheulbeuk/templates/chat/skill-roll.hbs';
      //dice=game.naheulbeuk.macros.replaceAttr(dice,actorCible);
      //diff=game.naheulbeuk.macros.replaceAttr(diff,actorCible);
      if (dice.substr(0, 6) == "cible:" || diff.substr(0, 6) == "cible:") {
        if (game.naheulbeuk.macros.getSpeakersTarget() == null) { return }
      }
      if (dice.substr(0, 6) == "cible:") {
        dice = game.naheulbeuk.macros.replaceAttr(dice, game.naheulbeuk.macros.getSpeakersTarget());
      } else {
        dice = game.naheulbeuk.macros.replaceAttr(dice, actorCible);
      }
      if (diff.substr(0, 6) == "cible:") {
        diff = game.naheulbeuk.macros.replaceAttr(diff, game.naheulbeuk.macros.getSpeakersTarget());
      } else {
        diff = game.naheulbeuk.macros.replaceAttr(diff, actorCible);
      }
      if (dice != "") {
        let r = new Roll(dice);
        //await r.roll({"async": true});
        r.roll({ "async": true }).then(r => {
          var result = 0;
          var tplData = {};
          var reussite = "Réussite !   ";
          if (diff == "") {
            tplData = {
              diff: "",
              name: name4 
            }
            renderTemplate(rollMessageTpl, tplData).then(msgFlavor => {
              r.toMessage({
                user: game.user.id,
                flavor: msgFlavor,
                speaker: ChatMessage.getSpeaker({ actor: actorCible })
              });
            });
          } else {
            diff = new Roll(diff);
            diff.roll({ "async": true }).then(diff => {
              result = Math.abs(diff.total - r.total);
              if (r.total > diff.total) { reussite = "Echec !   " };
              tplData = {
                diff: reussite + " - Difficulté : " + diff.total + " - Ecart : " + result,
                name: name4 
              };
              renderTemplate(rollMessageTpl, tplData).then(msgFlavor => {
                r.toMessage({
                  user: game.user.id,
                  flavor: msgFlavor,
                  speaker: ChatMessage.getSpeaker({ actor: actorCible })
                });
              });
            });
          };
        });
      }
      return false;
    }
  }
  var five = {
    label: '<span style="font-size: 12px;">'+name5+'</span>',
    callback: (html) => {
      let dice = html.find('input[name="inputFormule5"').val();
      let diff = html.find('input[name="inputDiff5"').val();
      const rollMessageTpl = 'systems/naheulbeuk/templates/chat/skill-roll.hbs';
      //dice=game.naheulbeuk.macros.replaceAttr(dice,actorCible);
      //diff=game.naheulbeuk.macros.replaceAttr(diff,actorCible);
      if (dice.substr(0, 6) == "cible:" || diff.substr(0, 6) == "cible:") {
        if (game.naheulbeuk.macros.getSpeakersTarget() == null) { return }
      }
      if (dice.substr(0, 6) == "cible:") {
        dice = game.naheulbeuk.macros.replaceAttr(dice, game.naheulbeuk.macros.getSpeakersTarget());
      } else {
        dice = game.naheulbeuk.macros.replaceAttr(dice, actorCible);
      }
      if (diff.substr(0, 6) == "cible:") {
        diff = game.naheulbeuk.macros.replaceAttr(diff, game.naheulbeuk.macros.getSpeakersTarget());
      } else {
        diff = game.naheulbeuk.macros.replaceAttr(diff, actorCible);
      }
      if (dice != "") {
        let r = new Roll(dice);
        //await r.roll({"async": true});
        r.roll({ "async": true }).then(r => {
          var result = 0;
          var tplData = {};
          var reussite = "Réussite !   ";
          if (diff == "") {
            tplData = {
              diff: "",
              name: name5 
            }
            renderTemplate(rollMessageTpl, tplData).then(msgFlavor => {
              r.toMessage({
                user: game.user.id,
                flavor: msgFlavor,
                speaker: ChatMessage.getSpeaker({ actor: actorCible })
              });
            });
          } else {
            diff = new Roll(diff);
            diff.roll({ "async": true }).then(diff => {
              result = Math.abs(diff.total - r.total);
              if (r.total > diff.total) { reussite = "Echec !   " };
              tplData = {
                diff: reussite + " - Difficulté : " + diff.total + " - Ecart : " + result,
                name: name5 
              };
              renderTemplate(rollMessageTpl, tplData).then(msgFlavor => {
                r.toMessage({
                  user: game.user.id,
                  flavor: msgFlavor,
                  speaker: ChatMessage.getSpeaker({ actor: actorCible })
                });
              });
            });
          };
        });
      }
      return false;
    }
  }
  var six = {
    label: '<span style="font-size: 12px;">'+name6+'</span>',
    callback: (html) => {
      let dice = html.find('input[name="inputFormule6"').val();
      let diff = html.find('input[name="inputDiff6"').val();
      const rollMessageTpl = 'systems/naheulbeuk/templates/chat/skill-roll.hbs';
      //dice=game.naheulbeuk.macros.replaceAttr(dice,actorCible);
      //diff=game.naheulbeuk.macros.replaceAttr(diff,actorCible);
      if (dice.substr(0, 6) == "cible:" || diff.substr(0, 6) == "cible:") {
        if (game.naheulbeuk.macros.getSpeakersTarget() == null) { return }
      }
      if (dice.substr(0, 6) == "cible:") {
        dice = game.naheulbeuk.macros.replaceAttr(dice, game.naheulbeuk.macros.getSpeakersTarget());
      } else {
        dice = game.naheulbeuk.macros.replaceAttr(dice, actorCible);
      }
      if (diff.substr(0, 6) == "cible:") {
        diff = game.naheulbeuk.macros.replaceAttr(diff, game.naheulbeuk.macros.getSpeakersTarget());
      } else {
        diff = game.naheulbeuk.macros.replaceAttr(diff, actorCible);
      }
      if (dice != "") {
        let r = new Roll(dice);
        //await r.roll({"async": true});
        r.roll({ "async": true }).then(r => {
          var result = 0;
          var tplData = {};
          var reussite = "Réussite !   ";
          if (diff == "") {
            tplData = {
              diff: "",
              name: name6 
            }
            renderTemplate(rollMessageTpl, tplData).then(msgFlavor => {
              r.toMessage({
                user: game.user.id,
                flavor: msgFlavor,
                speaker: ChatMessage.getSpeaker({ actor: actorCible })
              });
            });
          } else {
            diff = new Roll(diff);
            diff.roll({ "async": true }).then(diff => {
              result = Math.abs(diff.total - r.total);
              if (r.total > diff.total) { reussite = "Echec !   " };
              tplData = {
                diff: reussite + " - Difficulté : " + diff.total + " - Ecart : " + result,
                name: name6 
              };
              renderTemplate(rollMessageTpl, tplData).then(msgFlavor => {
                r.toMessage({
                  user: game.user.id,
                  flavor: msgFlavor,
                  speaker: ChatMessage.getSpeaker({ actor: actorCible })
                });
              });
            });
          };
        });
      }
      return false;
    }
  }
  var seven = {
    label: '<span style="font-size: 12px;">'+name7+'</span>',
    callback: (html) => {
      let dice = html.find('input[name="inputFormule5"').val();
      let diff = html.find('input[name="inputDiff5"').val();
      const rollMessageTpl = 'systems/naheulbeuk/templates/chat/skill-roll.hbs';
      //dice=game.naheulbeuk.macros.replaceAttr(dice,actorCible);
      //diff=game.naheulbeuk.macros.replaceAttr(diff,actorCible);
      if (dice.substr(0, 6) == "cible:" || diff.substr(0, 6) == "cible:") {
        if (game.naheulbeuk.macros.getSpeakersTarget() == null) { return }
      }
      if (dice.substr(0, 6) == "cible:") {
        dice = game.naheulbeuk.macros.replaceAttr(dice, game.naheulbeuk.macros.getSpeakersTarget());
      } else {
        dice = game.naheulbeuk.macros.replaceAttr(dice, actorCible);
      }
      if (diff.substr(0, 6) == "cible:") {
        diff = game.naheulbeuk.macros.replaceAttr(diff, game.naheulbeuk.macros.getSpeakersTarget());
      } else {
        diff = game.naheulbeuk.macros.replaceAttr(diff, actorCible);
      }
      if (dice != "") {
        let r = new Roll(dice);
        //await r.roll({"async": true});
        r.roll({ "async": true }).then(r => {
          var result = 0;
          var tplData = {};
          var reussite = "Réussite !   ";
          if (diff == "") {
            tplData = {
              diff: "",
              name: name7 
            }
            renderTemplate(rollMessageTpl, tplData).then(msgFlavor => {
              r.toMessage({
                user: game.user.id,
                flavor: msgFlavor,
                speaker: ChatMessage.getSpeaker({ actor: actorCible })
              });
            });
          } else {
            diff = new Roll(diff);
            diff.roll({ "async": true }).then(diff => {
              result = Math.abs(diff.total - r.total);
              if (r.total > diff.total) { reussite = "Echec !   " };
              tplData = {
                diff: reussite + " - Difficulté : " + diff.total + " - Ecart : " + result,
                name: name7 
              };
              renderTemplate(rollMessageTpl, tplData).then(msgFlavor => {
                r.toMessage({
                  user: game.user.id,
                  flavor: msgFlavor,
                  speaker: ChatMessage.getSpeaker({ actor: actorCible })
                });
              });
            });
          };
        });
      }
      return false;
    }
  }
  if (name1 != "") { buttons.push(one) }
  if (name2 != "") { buttons.push(two) }
  if (name3 != "") { buttons.push(three) }
  if (name4 != "") { buttons.push(four) }
  if (name5 != "") { buttons.push(five) }
  if (name6 != "") { buttons.push(six) }
  if (name7 != "") { buttons.push(seven) }
  const myDialogOptions = {
    width: 700
  };
  let d = new CustomDialog({
    title: "Avancé",
    content: content,
    buttons: buttons
  }, myDialogOptions);
  d.render(true);
}

export class CustomDialog extends Dialog {
  submit(button) {
    try {
      if (button.callback && button.callback(this.options.jQuery ? this.element : this.element[0]) !== false) this.close();
    } catch (err) {
      ui.notifications.error(err);
      throw new Error(err);
    }
  }
}