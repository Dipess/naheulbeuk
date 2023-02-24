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
import { registerHandlebarsHelpers } from './documents/helpers.mjs';


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
    //formula: "@abilities.cou.value + @abilities.cou.bonus + @abilities.cou.bonus_man",
    formula: "@attributes.init.total",
    decimals: 0
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

  // Register Handlebars Helpers
	registerHandlebarsHelpers();
  
  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */

//Fonction pas terrible à améliorer à l'occasion
function rollItemMacro(itemName,param) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Tu ne possédes pas l'objet `+itemName+``);

  //Macro pour un sort
  if (item.type == "sort") {
    if (param==1) {
      let d = new Dialog({
        title: item.name,
        content: `
        <label style="font-size: 15px;">Que souhaitez vous faire ?</label>
        <br/>
        `,
        buttons: {
          one: {
            label: "Voir le sort",
            callback: (html) => {
              if (item.system.equipe==true){
                item.sheet.render(true,{editable:false});
              } else {
                item.sheet.render(true)
              }            
            }
          },
          two: {
            label: "Lancer le sort",
            callback: (html) => {
              callbackSort(actor,item)
            }
          }
        }
      });
      d.render(true);
    } else {
      callbackSort(actor,item)
    }

  //Macro pour les objets de type arme avec parade possible et sans épreuve custom
  } else if (item.type == "arme" && item.system.epreuvecustom == false && ((item.system.formula != "-" && item.system.formula != "") || (item.system.prd != "-" && item.system.prd != ""))) {
    if (param==1) {
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
              if (item.system.equipe==true){
                item.sheet.render(true,{editable:false});
              } else {
                item.sheet.render(true)
              }            
            }
          },
          two: {
            label: "Utiliser l'objet",
            callback: (html) => {
              callbackArme(actor,item)
            }
          }
        }
      });
      d.render(true);
    } else {
      callbackArme(actor,item)
    }

  //Macro pour les objets de type arme avec parade possible et avec épreuve custom
  } else if (item.type == "arme" && item.system.epreuvecustom == true && item.system.formula != "-" && item.system.formula != "" && item.system.prd != "-" && item.system.prd != "" ) {
    if (param==1) {
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
              if (item.system.equipe==true){
                item.sheet.render(true,{editable:false});
              } else {
                item.sheet.render(true)
              }
            }
          },
          two: {
            label: "Utiliser l'objet",
            callback: (html) => {
              callbackArme(actor,item)
            }
          },
          three: {
            label: "Épreuve(s) custom",
            callback: (html) => {
              callbackCustom(actor,item)
            }
          },
        }
      });
      d.render(true);
    } else {
      let d = new Dialog({
        title: item.name,
        content: `
        <label style="font-size: 15px;">Que souhaitez vous faire ?</label>
        <br/>
        `,
        buttons: {
          one: {
            label: "Utiliser l'objet",
            callback: (html) => {
              callbackArme(actor,item)
            }
          },
          two: {
            label: "Épreuve(s) custom",
            callback: (html) => {
              callbackCustom(actor,item)
            }
          },
        }
      });
      d.render(true);
    }

  //Macro pour une autre arme (sans dégâts donc) avec une épreuve custom (comme une arme à feu)
  } else if (item.type == "arme" && item.system.epreuvecustom == true) {
    if (param==1) {
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
              if (item.system.equipe==true){
                item.sheet.render(true,{editable:false});
              } else {
                item.sheet.render(true)
              }            
            }
          },
          two: {
            label: "Épreuve(s)",
            callback: (html) => {
              callbackCustom(actor,item)
            }
          },
        }
      });
      d.render(true);
    } else {
      callbackCustom(actor,item)
    }

  //Dans tous les autres cas on affiche la fiche de l'objet
  } else {
    if (item.system.equipe==true){
      item.sheet.render(true,{editable:false});
    } else {
      item.sheet.render(true)
    }    }
}

//Actions pour un sort drag and drop dans la barre de macro
function callbackSort(actor,item) {
  if (item.system.epreuvecustom == true) {
    var dataset = { "actor": actor, "dice1": item.system.jet1, "name1": item.system.name1, "diff1": item.system.epreuve1, "dice2": item.system.jet2, "name2": item.system.name2, "diff2": item.system.epreuve2, "dice3": item.system.jet3, "name3": item.system.name3, "diff3": item.system.epreuve3, "dice4": item.system.jet4, "name4": item.system.name4, "diff4": item.system.epreuve4, "dice5": item.system.jet5, "name5": item.system.name5, "diff5": item.system.epreuve5 };
    game.naheulbeuk.macros.onRollCustom(actor,item,dataset)
  } else {
    if (item.system.degat == "" || item.system.degat == "-") {
      var dataset = { "actor": actor, "dice1": "d20", "name1": "Epreuve", "diff1": item.system.epreuve, "dice2": "", "name2": "", "diff2": "", "dice3": "", "name3": "", "diff3": "", "dice4": "", "name4": "", "diff4": "", "dice5": "", "name5": "", "diff5": "" };
    } else {
      var dataset = { "actor": actor, "dice1": "d20", "name1": "Epreuve", "diff1": item.system.epreuve, "dice2": item.system.degat, "name2": "Dégâts", "diff2": "", "dice3": "", "name3": "", "diff3": "", "dice4": "", "name4": "", "diff4": "", "dice5": "", "name5": "", "diff5": "" };
    }
    game.naheulbeuk.macros.onRollCustom(actor,item,dataset)
  }
}

//Actions pour une arme drag and drop dans la barre de macro
function callbackArme(actor,item) {
  console.log(item)
  if (item.system.equipe == false) {
    return ui.notifications.warn(`L'objet `+item.name+` n'est pas équipé`);
  } else {
    if (item.system.prd == "-") {
      var prd = "";
      var prdname = "";
    } else {
      var prd = "@prd+" + item.system.prd;
      var prdname = "Parade";
    }

    var attaque_cac = "";
    var attaque_distance = "";
    var attname_cac = "";
    var attname_distance = "";
    var degat_cac = "";
    var degat_distance = "";
    var degatname_cac = "";
    var degatname_distance = "";
    if (item.system.formula != "-" && item.system.formula != "") {
      if (item.system.arme_cac == true) { 
        attname_cac = "Attaque au contact";
        attaque_cac = "@att+" + item.system.att;
        degatname_cac = "Dégâts au contact";
        degat_cac = item.system.formula + "+" + item.system.degat_arme_cac + "+@degat-contact+@bonusfo";
      }
      if (item.system.arme_distance == true) { 
        attname_distance = "Attaque à distance";
        attaque_distance = "@att-distance+" + item.system.att_arme_jet;
        degatname_distance = "Dégâts à distance";
        degat_distance = item.system.formula + "+" + item.system.degat_arme_jet + "+@degat-distance+@bonusfo";
      }
    }

    var dataset = { "actor": actor, "dice1": "d20", "name1": attname_cac, "diff1": attaque_cac, "dice2": degat_cac, "name2": degatname_cac, "diff2": "", "dice3": "d20", "name3": attname_distance, "diff3": attaque_distance, "dice4": degat_distance, "name4": degatname_distance, "diff4": "", "dice5": "d20", "name5": prdname, "diff5": prd };
    game.naheulbeuk.macros.onRollCustom(actor,item,dataset)
  }
}

//Actions pour une arme avec des jets custom
function callbackCustom(actor,item) {
  if (item.system.equipe == false) {
    return ui.notifications.warn(`L'objet `+item.name+` n'est pas équipé`);
  }
  var dataset = { "actor": actor, "dice1": item.system.jet1, "name1": item.system.name1, "diff1": item.system.epreuve1, "dice2": item.system.jet2, "name2": item.system.name2, "diff2": item.system.epreuve2, "dice3": item.system.jet3, "name3": item.system.name3, "diff3": item.system.epreuve3, "dice4": item.system.jet4, "name4": item.system.name4, "diff4": item.system.epreuve4, "dice5": item.system.jet5, "name5": item.system.name5, "diff5": item.system.epreuve5 };
  game.naheulbeuk.macros.onRollCustom(actor,item,dataset)
}