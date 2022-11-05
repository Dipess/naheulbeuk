import { all_items_search } from "./items.gen.mjs";
export class Macros {
  /**
   * @name customRoll
   * @description
   * 
   * @returns 
   */

  //Fonction pour permettre un jet custom
  static customRoll = function (dice, diff) {
    if (game.naheulbeuk.macros.getSpeakersActor() == null) { return }
    const actorSource = game.naheulbeuk.macros.getSpeakersActor()
    dice = dice.replace(/ /g, "");
    diff = diff.replace(/ /g, "");
    let d = new Dialog({
      title: "Lancer custom",
      content: `
        <em style="font-size: 15px;">Raccourcis :</em>
        <br/>
        <em style="font-size: 15px;">@cou @int @cha @ad @fo @att @prd @lvl @pr @prm @esq @rm @mphy @mpsy @att-distance @bonusint</em>
        <hr>
        <label style="font-size: 15px;">Formule :</label>
        <input style="font-size: 15px;" type="text" name="inputFormule" value="`+ dice + `">
        <br/><br/>
        <label style="font-size: 15px;">Difficulté :</label>
        <input style="font-size: 15px;" type="text" name="inputDiff" value="`+ diff + `"></li>
        <br/><br/>
        `,
      buttons: {
        one: {
          label: "Lancer custom",
          callback: (html) => {
            let dice = html.find('input[name="inputFormule"').val();
            let diff = html.find('input[name="inputDiff"').val();
            const rollMessageTpl = 'systems/naheulbeuk/templates/chat/skill-roll.hbs';
            if (dice.substr(0, 6) == "cible:" || diff.substr(0, 6) == "cible:") {
              if (game.naheulbeuk.macros.getSpeakersTarget() == null) { return }
            }
            if (dice.substr(0, 6) == "cible:") {
              dice = game.naheulbeuk.macros.replaceAttr(dice, game.naheulbeuk.macros.getSpeakersTarget());
            } else {
              dice = game.naheulbeuk.macros.replaceAttr(dice, actorSource);
            }
            if (diff.substr(0, 6) == "cible:") {
              diff = game.naheulbeuk.macros.replaceAttr(diff, game.naheulbeuk.macros.getSpeakersTarget());
            } else {
              diff = game.naheulbeuk.macros.replaceAttr(diff, actorSource);
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
                    name: "Lancer custom"
                  }
                  renderTemplate(rollMessageTpl, tplData).then(msgFlavor => {
                    r.toMessage({
                      user: game.user.id,
                      flavor: msgFlavor,
                      speaker: ChatMessage.getSpeaker({ actor: actorSource })
                    });
                  });
                } else {
                  diff = new Roll(diff);
                  diff.roll({ "async": true }).then(diff => {
                    result = Math.abs(diff.total - r.total);
                    if (r.total > diff.total) { reussite = "Echec !   " };
                    tplData = {
                      diff: reussite + " - Difficulté : " + diff.total + " - Ecart : " + result,
                      name: "Lancer custom"
                    };
                    renderTemplate(rollMessageTpl, tplData).then(msgFlavor => {
                      r.toMessage({
                        user: game.user.id,
                        flavor: msgFlavor,
                        speaker: ChatMessage.getSpeaker({ actor: actorSource })
                      });
                    });
                  });
                };
              });
            }
          }
        }
      }
    });
    d.render(true);
  }

  // remplace @lvl @ad... ds un string
  static replaceAttr = function (expr, actor) {
    var expr = expr
    if (actor.type == "character") {
      const ad = actor.system.abilities.ad.value + actor.system.abilities.ad.bonus;
      const lancer = actor.system.attributes.lancerarme.value + actor.system.attributes.lancerarme.bonus + ad;
      const bonusint = Math.max(0, (actor.system.abilities.int.value + actor.system.abilities.int.bonus) - 12)
      var lancerdegat = actor.system.attributes.lancerarme.degat
      if (lancerdegat == "") { lancerdegat = 0 }
      expr = expr.replace(/@att-distance/g, lancer);
      expr = expr.replace(/@bonusint/g, bonusint);
      expr = expr.replace(/@degat-distance/g, lancerdegat);
    }

    const pr = actor.system.attributes.pr.value + actor.system.attributes.pr.bonus + actor.system.attributes.pr.bonusSsEncombrement + actor.system.attributes.pr.trucdemauviette;
    var malusmvtpr
    if (pr > 7) {
      malusmvtpr = 20
    } else if (pr > 6) {
      malusmvtpr = 6
    } else if (pr > 5){
      malusmvtpr = 5
    } else if (pr > 4){
      malusmvtpr = 4
    } else if (pr > 2){
      malusmvtpr = 2
    } else {
      malusmvtpr = 0
    }
    const prm = actor.system.attributes.prm.value + actor.system.attributes.prm.bonus;
    const cou = actor.system.abilities.cou.value + actor.system.abilities.cou.bonus;
    const int = actor.system.abilities.int.value + actor.system.abilities.int.bonus;
    const cha = actor.system.abilities.cha.value + actor.system.abilities.cha.bonus;
    const ad = actor.system.abilities.ad.value + actor.system.abilities.ad.bonus;
    const fo = actor.system.abilities.fo.value + actor.system.abilities.fo.bonus;
    const att = actor.system.abilities.att.value + actor.system.abilities.att.bonus;
    const prd = actor.system.abilities.prd.value + actor.system.abilities.prd.bonus;
    const mphy = actor.system.attributes.mphy.value;
    const mpsy = actor.system.attributes.mpsy.value;
    const rm = actor.system.attributes.rm.value + actor.system.attributes.rm.bonus;
    var esq = actor.system.attributes.esq.value + actor.system.attributes.esq.bonus;

    if (actor.type == "npc") { esq = esq + actor.system.abilities.ad.bonus }
    
    const lvl = actor.system.attributes.level.value;

    var bonusfo = "";
    if ((actor.system.abilities.fo.value + actor.system.abilities.fo.bonus) > 12) {
      bonusfo = "+" + (actor.system.abilities.fo.value + actor.system.abilities.fo.bonus - 12)
    };
    if ((actor.system.abilities.fo.value + actor.system.abilities.fo.bonus) < 9) {
      bonusfo = "-1"
    };

    let flagTirerCorrectement = 5
    for (let actoritem of actor.items) {
      if (actoritem.name == "TIRER CORRECTEMENT") {
        flagTirerCorrectement = 1
      }
    }
    expr = expr.replace(/@malus-mvt-pr/g, malusmvtpr);
    expr = expr.replace(/épreuve:/g, "");
    expr = expr.replace(/@armefeu/g, flagTirerCorrectement);
    expr = expr.replace(/cible:/g, "");
    expr = expr.replace(/@prm/g, prm);
    expr = expr.replace(/@cou/g, cou);
    expr = expr.replace(/@int/g, int);
    expr = expr.replace(/@cha/g, cha);
    expr = expr.replace(/@ad/g, ad);
    expr = expr.replace(/@fo/g, fo);
    expr = expr.replace(/@att/g, att);
    expr = expr.replace(/@prd/g, prd);
    expr = expr.replace(/@mphy/g, mphy);
    expr = expr.replace(/@mpsy/g, mpsy);
    expr = expr.replace(/@rm/g, rm);
    expr = expr.replace(/@esq/g, esq);
    expr = expr.replace(/@pr/g, pr);
    expr = expr.replace(/@bonusfo/g, bonusfo);
    expr = expr.replace(/@lvl/g, lvl);
    expr = expr.replace(/ /g, "");
    expr = expr.replace(/\+\-/g, "-");
    expr = expr.replace(/\-\+/g, "-");
    expr = expr.replace(/\-\-/g, "+");
    expr = expr.replace(/\+\+/g, "+");
    if (expr.substring(expr.length - 2, expr.length) == "+0") { expr = expr.substring(0, expr.length - 2) }
    if (expr.substring(expr.length - 1, expr.length) == "+") { expr = expr.substring(0, expr.length - 1) }
    return expr;
  }

  //Récupérer le token cible
  static getSpeakersTarget = function () {
    let targets = ([...game.user.targets].length > 0) ? [...game.user.targets] : canvas.tokens.children.filter(t => t._controlled);
    if (targets.length == 0 || targets.length > 1) {
      ui.notifications.error("Choisissez un token cible (unique)");
      return null;
    }
    return targets[0].actor;
  }

  //Récupérer le token acteur
  static getSpeakersActor = function () {
    // Vérifie qu'un seul token est sélectionné
    const tokens = canvas.tokens.controlled;
    if (tokens.length > 1) {
      ui.notifications.error("Choisissez un unique token source")
      return null;
    }
    const speaker = ChatMessage.getSpeaker();
    let actor;
    // Si un token est sélectionné, le prendre comme acteur cible
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    // Sinon prendre l'acteur par défaut pour l'utilisateur courrant
    if (!actor) actor = game.actors.get(speaker.actor);
    if (actor === undefined) {
      ui.notifications.error("Choisissez un token source")
      return null;
    } else {
      return actor;
    }
  }

  //Chercher un compendium
  static compendiumSearch = function () {
    var compendiums = [];
    game.packs.forEach(elem => {
      if (elem.metadata.packageName == "naheulbeuk") {
        compendiums.push(elem.metadata.label)
      }
    })
    let d = new Dialog({
      title: "Rechercher un compendium du système Naheulbeuk",
      content: `
      <form>
        <label>Taper le nom du compendium à ouvrir <em>(entrée pour faire la recherche)</em></label>
        <input type="text" name="q" id="q" value="" label="Nom du compendium" />
        <br/><br/>
        <button name"r" id="r" type="button">Chercher</button>
        <hr>
        <div id="result"></div>
      </form>
      `,
      buttons: {
      }
    });
    d.render(true);
    $(document).ready(function () {
      $("[id=r]").click(function () {
        var val = $("[id=q]").val().toLowerCase();
        var res = $("[id=result]");
        res[0].innerHTML = '';
        let list = '';
        var terms = [];
        if (val != '') {
          var reg = new RegExp(val)
          terms = compendiums.filter(function (term) {
            var termlc = term.toLowerCase();
            return termlc.match(reg);
          });
        }
        for (let i = 0; i < terms.length; i++) {
          list += '<li class="afficher" data-comp="' + terms[i] + '"><a>' + terms[i] + '</a></li>';
        }
        res[0].innerHTML = '<ul>' + list + '</ul>';
        $("[class=afficher]").click(ev => {
          game.packs.find(p => p.metadata.label === ev.currentTarget.dataset.comp).render(true)
        });
        document.getElementById("app-" + d.appId).style.height = "auto"
      });
    });
  }

  //Chercher une rencontre (liste)
  static async rencontre() {
    var message = "";
    var monstres = []
    const promise = []
    const compendium = game.packs.find(p => p.metadata.label === "Bestiaire");
    for (let c of compendium.index) {
      promise.push(compendium.getDocument(c._id));
    }
    await Promise.all(promise).then(actors => {
      for (let actor of actors) {
        monstres.push(actor)
      }
    })
    let monstresClasses = []
    while (monstres.length != 0) {
      var i = 0
      var j = 0
      var minxp = monstres[0]
      for (let monstre of monstres) {
        if (monstre.system.attributes.xp.value < minxp.system.attributes.xp.value) {
          minxp = monstre
          j = i
        }
        i++
      }
      monstresClasses.push(minxp)
      monstres.splice(j, 1)
    }
    monstres = monstresClasses
    let d = new Dialog({
      title: "Rencontre",
      content: `
      <form>
        <a class="afficher">Ouvrir le compendium</a>
        <br/>
        <a class="relance">Relancer la sélection aléatoire</a>
        <br/>
        <a class="jet">Lancer de dés</a>
        <br/>
        <hr>
        <label>Trait</label>
        <select name="a" id="a" style="margin-bottom: 5px;">
          <option value=""></option>
          <option value="Bizarre +">Bizarre +</option>
          <option value="Bizarre ++">Bizarre ++</option>
          <option value="Bizarre +++">Bizarre +++</option>
          <option value="Bulldozer +">Bulldozer +</option>
          <option value="Bulldozer ++">Bulldozer ++</option>
          <option value="Bulldozer +++">Bulldozer +++</option>
          <option value="Critique +">Critique +</option>
          <option value="Critique ++">Critique ++</option>
          <option value="Critique +++">Critique +++</option>
          <option value="Mâchoire +">Mâchoire +</option>
          <option value="Mâchoire ++">Mâchoire ++</option>
          <option value="Mâchoire +++">Mâchoire +++</option>
          <option value="Mise à terre +">Mise à terre +</option>
          <option value="Mise à terre ++">Mise à terre ++</option>
          <option value="Mise à terre +++">Mise à terre +++</option>
          <option value="Puissant +">Puissant +</option>
          <option value="Puissant ++">Puissant ++</option>
          <option value="Puissant +++">Puissant +++</option>
          <option value="Rapide +">Rapide +</option>
          <option value="Rapide ++">Rapide ++</option>
          <option value="Rapide +++">Rapide +++</option>
          <option value="Terrifiant +">Terrifiant +</option>
          <option value="Terrifiant ++">Terrifiant ++</option>
          <option value="Terrifiant +++">Terrifiant +++</option>
          <option value="Violent +">Violent +</option>
          <option value="Violent ++">Violent ++</option>
          <option value="Violent +++">Violent +++</option>
          <option value="Agile">Agile</option>
          <option value="Bulldozer volant">Bulldozer volant</option>
          <option value="Immunité">Immunité</option>
          <option value="Légende">Légende</option>
          <option value="Malin">Malin</option>
          <option value="Mort">Mort</option>
          <option value="Nuée">Nuée</option>
          <option value="Paisible">Paisible</option>
          <option value="Surnaturel">Surnaturel</option>
          <option value="Volant">Volant</option>
        </select>
        <br/>
        <label>Répartition géographique</label>
        <select name="b" id="b" style="margin-bottom: 5px;">
          <option value=""></option>
          <option value="Archipel Papoutouh">Archipel Papoutouh</option>
          <option value="Arnn">Arnn</option>
          <option value="Banquise">Banquise</option>
          <option value="Cimes de Kuylinia">Cimes de Kuylinia</option>
          <option value="Côte de Sk'ka">Côte de Sk'ka</option>
          <option value="Fernol et Galzanie">Fernol et Galzanie</option>
          <option value="Forêt maudite de l'Ouest">Forêt maudite de l'Ouest</option>
          <option value="Haute mer">Haute mer</option>
          <option value="Jungles de la péninsule">Jungles de la péninsule</option>
          <option value="Marais gelés">Marais gelés</option>
          <option value="Montagnes du Nord">Montagnes du Nord</option>
          <option value="Monts de l'Est">Monts de l'Est</option>
          <option value="Pays de Nugh">Pays de Nugh</option>
          <option value="Plaine centrale">Plaine centrale</option>
          <option value="Plaine de Sakourvit">Plaine de Sakourvit</option>
          <option value="Plaines de Fangh et Caladie">Plaines de Fangh et Caladie</option>
          <option value="Plaines de l'Ouest">Plaines de l'Ouest</option>
          <option value="Plaines gelées du Nord">Plaines gelées du Nord</option>
          <option value="Pointe sud du Birmilistan">Pointe sud du Birmilistan</option>
          <option value="Rivages de la mer d'Embarh">Rivages de la mer d'Embarh</option>
          <option value="Rivages de la mer Sidralnée">Rivages de la mer Sidralnée</option>
          <option value="Steppes du Srölnagud">Steppes du Srölnagud</option>
          <option value="Uzgueg et Gnaal">Uzgueg et Gnaal</option>
          <option value="Vallée du Birmilistan">Vallée du Birmilistan</option>
        </select>
        <br/>
        <label>Catégorie</label>
        <select name="c" id="c">
          <option value=""></option>
          <option value="Animaux">Animaux</option>
          <option value="Végétaux">Végétaux</option>
          <option value="Fanghiens">Fanghiens</option>
          <option value="Pirates Mauves">Pirates Mauves</option>
          <option value="Birmilistanais">Birmilistanais</option>
          <option value="Sauvages du Froid">Sauvages du Froid</option>
          <option value="Skuulnards">Skuulnards</option>
          <option value="Vrognards">Vrognards</option>
          <option value="Humanoïdes">Humanoïdes</option>
          <option value="Monstres et créatures">Monstres et créatures</option>
          <option value="Opposants légendaires">Opposants légendaires</option>
        </select>
        <hr>
        <div id="result"></div>
      </form>
      `,
      buttons: {
      }
    });
    d.render(true);
    $(document).ready(function () {
      $("[class=afficher]").click(ev => {
        game.packs.find(p => p.metadata.label === "Bestiaire").render(true)
      });
      $("[id=a]").change(function () {
        var trait = $("[id=a]").val();
        var geo = $("[id=b]").val();
        var categorie = $("[id=c]").val();
        let list = '';
        var res = $("[id=result]");
        var count = 0;
        res[0].innerHTML = '';
        monstres.forEach(monstre => {
          let flagTrait = false;
          let flagGeo = false;
          let flagCategorie = false;
          monstre.items.forEach(item => {
            if (item.name == trait || trait == "") { flagTrait = true }
            if (item.name == geo || geo == "") { flagGeo = true }
          })
          if (monstre.system.attributes.categorie == categorie || categorie == "") { flagCategorie = true }
          if (flagCategorie && flagGeo && flagTrait) {
            count++;
            list += '<li style="padding-bottom: 5px;display: flex;align-items: center;">' + count + '&nbsp;<img src=' + monstre.img + ' style="width:30px;height:30px;">&nbsp;<a class="entity-link content-link" draggable="true" data-uuid="Compendium.naheulbeuk.bestiaire' + '.' + monstre._id + '" data-pack="naheulbeuk.bestiaire" data-id=' + monstre._id + '><i class="fas fa-suitcase"></i>&nbsp;' + monstre.name + '</a>&nbsp;' + monstre.system.attributes.xp.value + ' XP</li>';
          }
          //}
        });
        if (count > 0) {
          count = 1 + Math.floor(Math.random() * count);
          message = 'Sélection aléatoire :&nbsp;' + count;
        } else {
          message = 'Aucun résultat'
        }
        res[0].innerHTML = message + '<ul>' + list + '</ul>';
        document.getElementById("app-" + d.appId).style.height = "auto"
      });
      $("[id=b]").change(function () {
        var trait = $("[id=a]").val();
        var geo = $("[id=b]").val();
        var categorie = $("[id=c]").val();
        let list = '';
        var res = $("[id=result]");
        var count = 0;
        res[0].innerHTML = '';
        monstres.forEach(monstre => {
          let flagTrait = false;
          let flagGeo = false;
          let flagCategorie = false;
          monstre.items.forEach(item => {
            if (item.name == trait || trait == "") { flagTrait = true }
            if (item.name == geo || geo == "") { flagGeo = true }
          })
          if (monstre.system.attributes.categorie == categorie || categorie == "") { flagCategorie = true }
          if (flagCategorie && flagGeo && flagTrait) {
            count++;
            list += '<li style="padding-bottom: 5px;display: flex;align-items: center;">' + count + '&nbsp;<img src=' + monstre.img + ' style="width:30px;height:30px;">&nbsp;<a class="entity-link content-link" draggable="true"data-uuid="Compendium.naheulbeuk.bestiaire' + '.' + monstre._id + '"  data-pack="naheulbeuk.bestiaire" data-id=' + monstre._id + '><i class="fas fa-suitcase"></i>&nbsp;' + monstre.name + '</a>&nbsp;' + monstre.system.attributes.xp.value + ' XP</li>';
          }
          //}
        });
        if (count > 0) {
          count = 1 + Math.floor(Math.random() * count);
          message = 'Sélection aléatoire :&nbsp;' + count;
        } else {
          message = 'Aucun résultat'
        }
        res[0].innerHTML = message + '<ul>' + list + '</ul>';
        document.getElementById("app-" + d.appId).style.height = "auto"
      });
      $("[id=c]").change(function () {
        var trait = $("[id=a]").val();
        var geo = $("[id=b]").val();
        var categorie = $("[id=c]").val();
        let list = '';
        var res = $("[id=result]");
        var count = 0;
        res[0].innerHTML = '';
        monstres.forEach(monstre => {
          let flagTrait = false;
          let flagGeo = false;
          let flagCategorie = false;
          monstre.items.forEach(item => {
            if (item.name == trait || trait == "") { flagTrait = true }
            if (item.name == geo || geo == "") { flagGeo = true }
          })
          if (monstre.system.attributes.categorie == categorie || categorie == "") { flagCategorie = true }
          if (flagCategorie && flagGeo && flagTrait) {
            count++;
            list += '<li style="padding-bottom: 5px;display: flex;align-items: center;">' + count + '&nbsp;<img src=' + monstre.img + ' style="width:30px;height:30px;">&nbsp;<a class="entity-link content-link" draggable="true" data-uuid="Compendium.naheulbeuk.bestiaire' + '.' + monstre._id + '" data-pack="naheulbeuk.bestiaire" data-id=' + monstre._id + '><i class="fas fa-suitcase"></i>&nbsp;' + monstre.name + '</a>&nbsp;' + monstre.system.attributes.xp.value + ' XP</li>';
          }
          //}
        });
        if (count > 0) {
          count = 1 + Math.floor(Math.random() * count);
          message = 'Sélection aléatoire :&nbsp;' + count;
        } else {
          message = 'Aucun résultat'
        }
        res[0].innerHTML = message + '<ul>' + list + '</ul>';
        document.getElementById("app-" + d.appId).style.height = "auto"
      });
      $("[class=relance]").click(ev => {
        var trait = $("[id=a]").val();
        var geo = $("[id=b]").val();
        var categorie = $("[id=c]").val();
        let list = '';
        var res = $("[id=result]");
        var count = 0;
        res[0].innerHTML = '';
        monstres.forEach(monstre => {
          let flagTrait = false;
          let flagGeo = false;
          let flagCategorie = false;
          monstre.items.forEach(item => {
            if (item.name == trait || trait == "") { flagTrait = true }
            if (item.name == geo || geo == "") { flagGeo = true }
          })
          if (monstre.system.attributes.categorie == categorie || categorie == "") { flagCategorie = true }
          if (flagCategorie && flagGeo && flagTrait) {
            count++;
            list += '<li style="padding-bottom: 5px;display: flex;align-items: center;">' + count + '&nbsp;<img src=' + monstre.img + ' style="width:30px;height:30px;">&nbsp;<a class="entity-link content-link" draggable="true" data-uuid="Compendium.naheulbeuk.bestiaire' + '.' + monstre._id + '" data-pack="naheulbeuk.bestiaire" data-id=' + monstre._id + '><i class="fas fa-suitcase"></i>&nbsp;' + monstre.name + '</a>&nbsp;' + monstre.system.attributes.xp.value + ' XP</li>';
          }
          //}
        });
        if (count > 0) {
          count = 1 + Math.floor(Math.random() * count);
          message = 'Sélection aléatoire :&nbsp;' + count;
        } else {
          message = 'Aucun résultat'
        }
        res[0].innerHTML = message + '<ul>' + list + '</ul>';
        document.getElementById("app-" + d.appId).style.height = "auto"
      });
      $("[class=jet]").click(ev => {
        let e = new Dialog({
          title: "Lancer custom",
          content: `
          <label style="font-size: 15px;">Formule :</label>
          <input style="font-size: 15px;" type="text" name="inputFormule" value="d20">
          <br/><br/>
          <label style="font-size: 15px;">Difficulté :</label>
          <input style="font-size: 15px;" type="text" name="inputDiff" value=""></li>
          <br/><br/>
          `,
          buttons: {
            one: {
              label: "Lancer custom",
              callback: (html) => {
                let dice = html.find('input[name="inputFormule"').val();
                let diff = html.find('input[name="inputDiff"').val();
                const rollMessageTpl = 'systems/naheulbeuk/templates/chat/skill-roll.hbs';
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
                        name: "Lancer custom"
                      }
                      renderTemplate(rollMessageTpl, tplData).then(msgFlavor => {
                        r.toMessage({
                          user: game.user.id,
                          flavor: msgFlavor,
                        });
                      });
                    } else {
                      diff = new Roll(diff);
                      diff.roll({ "async": true }).then(diff => {
                        result = Math.abs(diff.total - r.total);
                        if (r.total > diff.total) { reussite = "Echec !   " };
                        tplData = {
                          diff: reussite + " - Difficulté : " + diff.total + " - Ecart : " + result,
                          name: "Lancer custom"
                        };
                        renderTemplate(rollMessageTpl, tplData).then(msgFlavor => {
                          r.toMessage({
                            user: game.user.id,
                            flavor: msgFlavor,
                          });
                        });
                      });
                    };
                  });
                }
              }
            }
          }
        });
        e.render(true);
      });
    });
  }

  //Chercher un élément aléatoire d'un compendium
  static async compendiumAlea() {
    var compendiums = [];
    game.packs.forEach(elem => {
      if (elem.metadata.packageName == "naheulbeuk") {
        compendiums.push(elem.metadata.label)
      }
    })

    let d = new Dialog({
      title: "Rechercher un compendium du système Naheulbeuk",
      content: `
      <form>
        <label>Taper le nom du compendium à ouvrir <em>(entrée pour faire la recherche)</em></label>
        <input type="text" name="q" id="q" value="" label="Nom du compendium" />
        <br/><br/>
        <button name"r" id="r" type="button">Chercher</button>
        <hr>
        <div id="result"></div>
      </form>
      `,
      buttons: {
      }
    });
    d.render(true);
    $(document).ready(function () {
      $("[id=r]").click(function () {
        var val = $("[id=q]").val().toLowerCase();
        var res = $("[id=result]");
        res[0].innerHTML = '';
        let list = '';
        var terms = [];
        if (val != '') {
          var reg = new RegExp(val)
          terms = compendiums.filter(function (term) {
            var termlc = term.toLowerCase();
            return termlc.match(reg);
          });
        }
        for (let i = 0; i < terms.length; i++) {
          list += '<li class="afficher" data-comp="' + terms[i] + '"><a>' + terms[i] + '</a></li>';
        }
        res[0].innerHTML = '<ul>' + list + '</ul>';
        $("[class=afficher]").click(ev => {
          var compendium = game.packs.find(p => p.metadata.label === ev.currentTarget.dataset.comp);
          var alea = 1 + Math.floor(Math.random() * compendium.index.size);
          res[0].innerHTML = '<a class="entity-link content-link" draggable="true" data-uuid="Compendium.naheulbeuk.' + compendium.metadata.name + '.' + compendium.index.contents[alea]._id + '" data-pack="naheulbeuk.' + compendium.metadata.name + '" data-id=' + compendium.index.contents[alea]._id + '><i class="fas fa-suitcase"></i>&nbsp;' + compendium.index.contents[alea].name + '</a>';
        });
        document.getElementById("app-" + d.appId).style.height = "auto"
      });
    });
  }

  //Chercher une rencontre (générateur) étape 1
  static async listrencontreprep() {
    //---------------------------
    let list = '';
    let i = 1;
    let j = 1;
    let levelFinal = [];
    let zoneFinal = [];
    let traitFinal = [];
    let typeFinal = [];
    let consnom = '';
    let listfamille = '';

    let d = new Dialog({
      title: "Rencontre",
      content: `
      <form>
        Choisissez l'XP de votre rencontre.<br/>
        Ordre de grandeur :<br/>
        - 4 aventuriers de niveau 1 -> 1-20 XP<br/>
        - 4 aventuriers de niveau 2 -> 20-40 XP<br/>
        - 4 aventuriers de niveau 3 -> 40-60 XP<br/>
        - 4 aventuriers de niveau 5 -> 80-100 XP<br/>
        - 4 aventuriers de niveau 10 -> 180-200 XP<br/>
        - 4 aventuriers de niveau 15 -> 280-300 XP<br/>
        <hr>
        <em>Remarque : s'il n'y a pas de résultat, la macro essayera de trouver une rencontre jusqu'à +/- 10 d'xp par rapport à la valeur choisie</em>
        <hr>
        Les rencontres 2,3,n seront de la même famille que la 1 : <input type="checkbox" id="consnom" name="consnom"><br/>
        Lister toutes les rencontres de la même famille que la première : <input type="checkbox" id="listfamille" name="listfamille"><hr>
        <div style="display:flex;text-align: center;">
          <div style="flex:2">Plage d'XP</div>
          <div style="flex:1">Zones</div>
          <div style="flex:1">Traits</div>
          <div style="flex:1">Types</div>
          <div style="flex:0.4"></div>
        </div>
        <div style="display:flex">
          <input name="a1" id="a1" type="text" value=1>
          <input name="b1" id="b1" type="text" value=20>
          <input name="c1" id="c1" type="text" value="" class="zone">
          <input name="d1" id="d1" type="text" value="" class="trait">
          <input name="e1" id="e1" type="text" value="" class="type">
        </div>
        <div id="result"></div>
        <hr>
        <a class="afficher"><strong>Ajouter une rencontre</strong></a><br/>
        <a class="afficherd6"><strong>Ajouter 1d6 rencontres</strong></a><br/>
        <br/>
      </form>
      `,
      buttons: {
        one: {
          label: "Valider",
          callback: (html) => {
            while (j != (i + 1)) {
              levelFinal.push([html.find('input[name="a' + j + '"]').val(), html.find('input[name="b' + j + '"]').val()])
              zoneFinal.push([html.find('input[name="c' + j + '"]').val()])
              traitFinal.push([html.find('input[name="d' + j + '"]').val()])
              typeFinal.push([html.find('input[name="e' + j + '"]').val()])
              j = j + 1
            }
            consnom = document.getElementById("consnom").checked
            listfamille = document.getElementById("listfamille").checked
            game.naheulbeuk.macros.listrencontre(monstres, levelFinal, zoneFinal, traitFinal, typeFinal, consnom, listfamille)
          }
        }
      }
    });
    var monstres = []
    const promise = []
    const compendium = game.packs.find(p => p.metadata.label === "Bestiaire");
    for (let c of compendium.index) {
      promise.push(compendium.getDocument(c._id));
    }
    await Promise.all(promise).then(actors => {
      for (let actor of actors) {
        monstres.push(actor)
      }
    })
    d.render(true);

    $(document).ready(function () {
      $("[class=afficher]").click(ev => {
        i = i + 1
        var res = $("[id=result]");
        let xpmin = []
        let xpmax = []
        let zone = []
        let trait = []
        if (i != 2) {
          for (let z = 2; z < i; z++) {
            xpmin.push(document.getElementById("a" + z).value)
            xpmax.push(document.getElementById("b" + z).value)
            trait.push(document.getElementById("c" + z).value)
            zone.push(document.getElementById("d" + z).value)
          }
        }
        res[0].innerHTML = '';
        list += `
        <div class="test" style="display:flex">
          <input name="a`+ i + `" id="a` + i + `" type="text" value=` + $("[name=a1]")[0].value + `>
          <input name="b`+ i + `" id="b` + i + `" type="text" value=` + $("[name=b1]")[0].value + `>
          <input class="zoneAd" name="c`+ i + `" id="c` + i + `" type="text" value="` + $("[name=c1]")[0].value + `">
          <input class="traitAd"name="d`+ i + `" id="d` + i + `" type="text" value="` + $("[name=d1]")[0].value + `">
          <input class="typeAd"name="e`+ i + `" id="e` + i + `" type="text" value="` + $("[name=e1]")[0].value + `">
        </div>
        `
        res[0].innerHTML = res[0].innerHTML + list;
        if (i != 2) {
          for (let z = 2; z < i; z++) {
            document.getElementById("a" + z).value = xpmin[z - 2]
            document.getElementById("b" + z).value = xpmax[z - 2]
            document.getElementById("c" + z).value = trait[z - 2]
            document.getElementById("d" + z).value = zone[z - 2]
          }
        }
        document.getElementById("app-" + d.appId).style.height = "auto"
        $("[class=traitAd]").click(ev => {
          let e = new Dialog({
            title: "Rencontre",
            content: `
            <input type="checkbox" id="zone1" name="Bizarre +"><label>Bizarre +</label><hr>
            <input type="checkbox" id="zone2" name="Bizarre ++"><label>Bizarre ++</label><hr>
            <input type="checkbox" id="zone3" name="Bizarre +++"><label>Bizarre +++</label><hr>
            <input type="checkbox" id="zone4" name="Bulldozer +"><label>Bulldozer +</label><hr>
            <input type="checkbox" id="zone5" name="Bulldozer ++"><label>Bulldozer ++</label><hr>
            <input type="checkbox" id="zone6" name="Bulldozer +++"><label>Bulldozer +++</label><hr>
            <input type="checkbox" id="zone7" name="Critique +"><label>Critique +</label><hr>
            <input type="checkbox" id="zone8" name="Critique ++"><label>Critique ++</label><hr>
            <input type="checkbox" id="zone9" name="Critique +++"><label>Critique +++</label><hr>
            <input type="checkbox" id="zone10" name="Mâchoire +"><label>Mâchoire +</label><hr>
            <input type="checkbox" id="zone11" name="Mâchoire ++"><label>Mâchoire ++</label><hr>
            <input type="checkbox" id="zone12" name="Mâchoire +++"><label>Mâchoire +++</label><hr>
            <input type="checkbox" id="zone13" name="Mise à terre +"><label>Mise à terre +</label><hr>
            <input type="checkbox" id="zone14" name="Mise à terre ++"><label>Mise à terre ++</label><hr>
            <input type="checkbox" id="zone15" name="Mise à terre +++"><label>Mise à terre +++</label><hr>
            <input type="checkbox" id="zone16" name="Puissant +"><label>Puissant +</label><hr>
            <input type="checkbox" id="zone17" name="Puissant ++"><label>Puissant ++</label><hr>
            <input type="checkbox" id="zone18" name="Puissant +++"><label>Puissant +++</label><hr>
            <input type="checkbox" id="zone19" name="Rapide +"><label>Rapide +</label><hr>
            <input type="checkbox" id="zone20" name="Rapide ++"><label>Rapide ++</label><hr>
            <input type="checkbox" id="zone21" name="Rapide +++"><label>Rapide +++</label><hr>
            <input type="checkbox" id="zone22" name="Terrifiant +"><label>Terrifiant +</label><hr>
            <input type="checkbox" id="zone23" name="Terrifiant ++"><label>Terrifiant ++</label><hr>
            <input type="checkbox" id="zone24" name="Terrifiant +++"><label>Terrifiant +++</label><hr>
            <input type="checkbox" id="zone25" name="Violent +"><label>Violent +</label><hr>
            <input type="checkbox" id="zone26" name="Violent ++"><label>Violent ++</label><hr>
            <input type="checkbox" id="zone27" name="Violent +++"><label>Violent +++</label><hr>
            <input type="checkbox" id="zone28" name="Agile"><label>Agile</label><hr>
            <input type="checkbox" id="zone29" name="Bulldozer volant"><label>Bulldozer volant</label><hr>
            <input type="checkbox" id="zone30" name="Immunité"><label>Immunité</label><hr>
            <input type="checkbox" id="zone31" name="Légende"><label>Légende</label><hr>
            <input type="checkbox" id="zone32" name="Malin"><label>Malin</label><hr>
            <input type="checkbox" id="zone33" name="Mort"><label>Mort</label><hr>
            <input type="checkbox" id="zone34" name="Nuée"><label>Nuée</label><hr>
            <input type="checkbox" id="zone35" name="Paisible"><label>Paisible</label><hr>
            <input type="checkbox" id="zone36" name="Surnaturel"><label>Surnaturel</label><hr>
            <input type="checkbox" id="zone37" name="Volant"><label>Volant</label><hr>
            <button class="validation" type="button">Ok</button>
            `,
            buttons: {
            }
          });
          e.render(true);
          $(document).ready(function () {
            document.getElementById("app-" + d.appId).style.height = "auto"
            $("[class=validation]").click(ev2 => {
              let id_ev = ev.currentTarget.id
              let variable = []
              for (let env = 1; env < 38; env++) {
                if (document.getElementById("zone" + env).checked) {
                  variable.push(document.getElementById("zone" + env).name)
                }
              }
              document.getElementById(id_ev).value = variable
              e.close()
            })
          })
        })
        $("[class=zoneAd]").click(ev => {
          let e = new Dialog({
            title: "Rencontre",
            content: `
            <input type="checkbox" id="zone1" name="Archipel Papoutouh"><label>Archipel Papoutouh</label><hr>
            <input type="checkbox" id="zone2" name="Arnn"><label>Arnn</label><hr>
            <input type="checkbox" id="zone3" name="Banquise"><label>Banquise</label><hr>
            <input type="checkbox" id="zone4" name="Cimes de Kuylinia"><label>Cimes de Kuylinia</label><hr>
            <input type="checkbox" id="zone5" name="Côte de Sk'ka"><label>Côte de Sk'ka</label><hr>
            <input type="checkbox" id="zone6" name="Fernol et Galzanie"><label>Fernol et Galzanie</label><hr>
            <input type="checkbox" id="zone7" name="Forêt maudite de l'Ouest"><label>Forêt maudite de l'Ouest</label><hr>
            <input type="checkbox" id="zone8" name="Haute mer"><label>Haute mer</label><hr>
            <input type="checkbox" id="zone9" name="Jungles de la péninsule"><label>Jungles de la péninsule</label><hr>
            <input type="checkbox" id="zone10" name="Marais gelés"><label>Marais gelés</label><hr>
            <input type="checkbox" id="zone11" name="Montagnes du Nord"><label>Montagnes du Nord</label><hr>
            <input type="checkbox" id="zone12" name="Monts de l'Est"><label>Monts de l'Est</label><hr>
            <input type="checkbox" id="zone13" name="Pays de Nugh"><label>Pays de Nugh</label><hr>
            <input type="checkbox" id="zone14" name="Plaine centrale"><label>Plaine centrale</label><hr>
            <input type="checkbox" id="zone15" name="Plaine de Sakourvit"><label>Plaine de Sakourvit</label><hr>
            <input type="checkbox" id="zone16" name="Plaines de Fangh et Caladie"><label>Plaines de Fangh et Caladie</label><hr>
            <input type="checkbox" id="zone17" name="Plaines de l'Ouest"><label>Plaines de l'Ouest</label><hr>
            <input type="checkbox" id="zone18" name="Plaines gelées du Nord"><label>Plaines gelées du Nord</label><hr>
            <input type="checkbox" id="zone19" name="Pointe sud du Birmilistan"><label>Pointe sud du Birmilistan</label><hr>
            <input type="checkbox" id="zone20" name="Rivages de la mer d'Embarh"><label>Rivages de la mer d'Embarh</label><hr>
            <input type="checkbox" id="zone21" name="Rivages de la mer Sidralnée"><label>Rivages de la mer Sidralnée</label><hr>
            <input type="checkbox" id="zone22" name="Steppes du Srölnagud"><label>Steppes du Srölnagud</label><hr>
            <input type="checkbox" id="zone23" name="Uzgueg et Gnaal"><label>Uzgueg et Gnaal</label><hr>
            <input type="checkbox" id="zone24" name="Vallée du Birmilistan"><label>Vallée du Birmilistan</label><hr>
            <button class="validation" type="button">Ok</button>
            `,
            buttons: {
            }
          });
          e.render(true);
          $(document).ready(function () {
            document.getElementById("app-" + d.appId).style.height = "auto"
            $("[class=validation]").click(ev2 => {
              let id_ev = ev.currentTarget.id
              let variable = []
              for (let env = 1; env < 25; env++) {
                if (document.getElementById("zone" + env).checked) {
                  variable.push(document.getElementById("zone" + env).name)
                }
              }
              document.getElementById(id_ev).value = variable
              e.close()
            })
          })
        })
        $("[class=typeAd]").click(ev => {
          let e = new Dialog({
            title: "Rencontre",
            content: `
            <input type="checkbox" id="zone1" name="Animaux"><label>Animaux</label><hr>
            <input type="checkbox" id="zone2" name="Végétaux"><label>Végétaux</label><hr>
            <input type="checkbox" id="zone3" name="Fanghiens"><label>Fanghiens</label><hr>
            <input type="checkbox" id="zone4" name="Pirates Mauves"><label>Pirates Mauves</label><hr>
            <input type="checkbox" id="zone5" name="Birmilistanais"><label>Birmilistanais</label><hr>
            <input type="checkbox" id="zone6" name="Sauvages du Froid"><label>Sauvages du Froid</label><hr>
            <input type="checkbox" id="zone7" name="Skuulnards"><label>Skuulnards</label><hr>
            <input type="checkbox" id="zone8" name="Vrognards"><label>Vrognards</label><hr>
            <input type="checkbox" id="zone9" name="Humanoïdes"><label>Humanoïdes</label><hr>
            <input type="checkbox" id="zone10" name="Monstres et créatures"><label>Monstres et créatures</label><hr>
            <input type="checkbox" id="zone11" name="Opposants légendaires"><label>Opposants légendaires</label><hr>
            <button class="validation" type="button">Ok</button>
            `,
            buttons: {
            }
          });
          e.render(true);
          $(document).ready(function () {
            document.getElementById("app-" + d.appId).style.height = "auto"
            $("[class=validation]").click(ev2 => {
              let id_ev = ev.currentTarget.id
              let variable = []
              for (let env = 1; env < 12; env++) {
                if (document.getElementById("zone" + env).checked) {
                  variable.push(document.getElementById("zone" + env).name)
                }
              }
              document.getElementById(id_ev).value = variable
              e.close()
            })
          })
        })
      })
      $("[class=afficherd6]").click(ev => {
        let alea = Math.floor(Math.random() * 6) + 1
        while (alea != 0) {
          i = i + 1
          var res = $("[id=result]");
          let xpmin = []
          let xpmax = []
          let zone = []
          let trait = []
          if (i != 2) {
            for (let z = 2; z < i; z++) {
              xpmin.push(document.getElementById("a" + z).value)
              xpmax.push(document.getElementById("b" + z).value)
              trait.push(document.getElementById("c" + z).value)
              zone.push(document.getElementById("d" + z).value)
            }
          }
          res[0].innerHTML = '';
          list += `
          <div class="test" style="display:flex">
            <input name="a`+ i + `" id="a` + i + `" type="text" value=` + $("[name=a1]")[0].value + `>
            <input name="b`+ i + `" id="b` + i + `" type="text" value=` + $("[name=b1]")[0].value + `>
            <input class="zoneAd" name="c`+ i + `" id="c` + i + `" type="text" value="` + $("[name=c1]")[0].value + `">
            <input class="traitAd" name="d`+ i + `" id="d` + i + `" type="text" value="` + $("[name=d1]")[0].value + `">
            <input class="typeAd"name="e`+ i + `" id="e` + i + `" type="text" value="` + $("[name=e1]")[0].value + `">
          </div>
          `
          res[0].innerHTML = list;
          if (i != 2) {
            for (let z = 2; z < i; z++) {
              document.getElementById("a" + z).value = xpmin[z - 2]
              document.getElementById("b" + z).value = xpmax[z - 2]
              document.getElementById("c" + z).value = trait[z - 2]
              document.getElementById("d" + z).value = zone[z - 2]
            }
          }
          document.getElementById("app-" + d.appId).style.height = "auto"
          alea = alea - 1;
        }
        $("[class=traitAd]").click(ev => {
          let e = new Dialog({
            title: "Rencontre",
            content: `
            <input type="checkbox" id="zone1" name="Bizarre +"><label>Bizarre +</label><hr>
            <input type="checkbox" id="zone2" name="Bizarre ++"><label>Bizarre ++</label><hr>
            <input type="checkbox" id="zone3" name="Bizarre +++"><label>Bizarre +++</label><hr>
            <input type="checkbox" id="zone4" name="Bulldozer +"><label>Bulldozer +</label><hr>
            <input type="checkbox" id="zone5" name="Bulldozer ++"><label>Bulldozer ++</label><hr>
            <input type="checkbox" id="zone6" name="Bulldozer +++"><label>Bulldozer +++</label><hr>
            <input type="checkbox" id="zone7" name="Critique +"><label>Critique +</label><hr>
            <input type="checkbox" id="zone8" name="Critique ++"><label>Critique ++</label><hr>
            <input type="checkbox" id="zone9" name="Critique +++"><label>Critique +++</label><hr>
            <input type="checkbox" id="zone10" name="Mâchoire +"><label>Mâchoire +</label><hr>
            <input type="checkbox" id="zone11" name="Mâchoire ++"><label>Mâchoire ++</label><hr>
            <input type="checkbox" id="zone12" name="Mâchoire +++"><label>Mâchoire +++</label><hr>
            <input type="checkbox" id="zone13" name="Mise à terre +"><label>Mise à terre +</label><hr>
            <input type="checkbox" id="zone14" name="Mise à terre ++"><label>Mise à terre ++</label><hr>
            <input type="checkbox" id="zone15" name="Mise à terre +++"><label>Mise à terre +++</label><hr>
            <input type="checkbox" id="zone16" name="Puissant +"><label>Puissant +</label><hr>
            <input type="checkbox" id="zone17" name="Puissant ++"><label>Puissant ++</label><hr>
            <input type="checkbox" id="zone18" name="Puissant +++"><label>Puissant +++</label><hr>
            <input type="checkbox" id="zone19" name="Rapide +"><label>Rapide +</label><hr>
            <input type="checkbox" id="zone20" name="Rapide ++"><label>Rapide ++</label><hr>
            <input type="checkbox" id="zone21" name="Rapide +++"><label>Rapide +++</label><hr>
            <input type="checkbox" id="zone22" name="Terrifiant +"><label>Terrifiant +</label><hr>
            <input type="checkbox" id="zone23" name="Terrifiant ++"><label>Terrifiant ++</label><hr>
            <input type="checkbox" id="zone24" name="Terrifiant +++"><label>Terrifiant +++</label><hr>
            <input type="checkbox" id="zone25" name="Violent +"><label>Violent +</label><hr>
            <input type="checkbox" id="zone26" name="Violent ++"><label>Violent ++</label><hr>
            <input type="checkbox" id="zone27" name="Violent +++"><label>Violent +++</label><hr>
            <input type="checkbox" id="zone28" name="Agile"><label>Agile</label><hr>
            <input type="checkbox" id="zone29" name="Bulldozer volant"><label>Bulldozer volant</label><hr>
            <input type="checkbox" id="zone30" name="Immunité"><label>Immunité</label><hr>
            <input type="checkbox" id="zone31" name="Légende"><label>Légende</label><hr>
            <input type="checkbox" id="zone32" name="Malin"><label>Malin</label><hr>
            <input type="checkbox" id="zone33" name="Mort"><label>Mort</label><hr>
            <input type="checkbox" id="zone34" name="Nuée"><label>Nuée</label><hr>
            <input type="checkbox" id="zone35" name="Paisible"><label>Paisible</label><hr>
            <input type="checkbox" id="zone36" name="Surnaturel"><label>Surnaturel</label><hr>
            <input type="checkbox" id="zone37" name="Volant"><label>Volant</label><hr>
            <button class="validation" type="button">Ok</button>
            `,
            buttons: {
            }
          });
          e.render(true);
          $(document).ready(function () {
            document.getElementById("app-" + d.appId).style.height = "auto"
            $("[class=validation]").click(ev2 => {
              let id_ev = ev.currentTarget.id
              let variable = []
              for (let env = 1; env < 38; env++) {
                if (document.getElementById("zone" + env).checked) {
                  variable.push(document.getElementById("zone" + env).name)
                }
              }
              document.getElementById(id_ev).value = variable
              e.close()
            })
          })
        })
        $("[class=zoneAd]").click(ev => {
          let e = new Dialog({
            title: "Rencontre",
            content: `
            <input type="checkbox" id="zone1" name="Archipel Papoutouh"><label>Archipel Papoutouh</label><hr>
            <input type="checkbox" id="zone2" name="Arnn"><label>Arnn</label><hr>
            <input type="checkbox" id="zone3" name="Banquise"><label>Banquise</label><hr>
            <input type="checkbox" id="zone4" name="Cimes de Kuylinia"><label>Cimes de Kuylinia</label><hr>
            <input type="checkbox" id="zone5" name="Côte de Sk'ka"><label>Côte de Sk'ka</label><hr>
            <input type="checkbox" id="zone6" name="Fernol et Galzanie"><label>Fernol et Galzanie</label><hr>
            <input type="checkbox" id="zone7" name="Forêt maudite de l'Ouest"><label>Forêt maudite de l'Ouest</label><hr>
            <input type="checkbox" id="zone8" name="Haute mer"><label>Haute mer</label><hr>
            <input type="checkbox" id="zone9" name="Jungles de la péninsule"><label>Jungles de la péninsule</label><hr>
            <input type="checkbox" id="zone10" name="Marais gelés"><label>Marais gelés</label><hr>
            <input type="checkbox" id="zone11" name="Montagnes du Nord"><label>Montagnes du Nord</label><hr>
            <input type="checkbox" id="zone12" name="Monts de l'Est"><label>Monts de l'Est</label><hr>
            <input type="checkbox" id="zone13" name="Pays de Nugh"><label>Pays de Nugh</label><hr>
            <input type="checkbox" id="zone14" name="Plaine centrale"><label>Plaine centrale</label><hr>
            <input type="checkbox" id="zone15" name="Plaine de Sakourvit"><label>Plaine de Sakourvit</label><hr>
            <input type="checkbox" id="zone16" name="Plaines de Fangh et Caladie"><label>Plaines de Fangh et Caladie</label><hr>
            <input type="checkbox" id="zone17" name="Plaines de l'Ouest"><label>Plaines de l'Ouest</label><hr>
            <input type="checkbox" id="zone18" name="Plaines gelées du Nord"><label>Plaines gelées du Nord</label><hr>
            <input type="checkbox" id="zone19" name="Pointe sud du Birmilistan"><label>Pointe sud du Birmilistan</label><hr>
            <input type="checkbox" id="zone20" name="Rivages de la mer d'Embarh"><label>Rivages de la mer d'Embarh</label><hr>
            <input type="checkbox" id="zone21" name="Rivages de la mer Sidralnée"><label>Rivages de la mer Sidralnée</label><hr>
            <input type="checkbox" id="zone22" name="Steppes du Srölnagud"><label>Steppes du Srölnagud</label><hr>
            <input type="checkbox" id="zone23" name="Uzgueg et Gnaal"><label>Uzgueg et Gnaal</label><hr>
            <input type="checkbox" id="zone24" name="Vallée du Birmilistan"><label>Vallée du Birmilistan</label><hr>
            <button class="validation" type="button">Ok</button>
            `,
            buttons: {
            }
          });
          e.render(true);
          $(document).ready(function () {
            document.getElementById("app-" + d.appId).style.height = "auto"
            $("[class=validation]").click(ev2 => {
              let id_ev = ev.currentTarget.id
              let variable = []
              for (let env = 1; env < 25; env++) {
                if (document.getElementById("zone" + env).checked) {
                  variable.push(document.getElementById("zone" + env).name)
                }
              }
              document.getElementById(id_ev).value = variable
              e.close()
            })
          })
        })
        $("[class=typeAd]").click(ev => {
          let e = new Dialog({
            title: "Rencontre",
            content: `
            <input type="checkbox" id="zone1" name="Animaux"><label>Animaux</label><hr>
            <input type="checkbox" id="zone2" name="Végétaux"><label>Végétaux</label><hr>
            <input type="checkbox" id="zone3" name="Fanghiens"><label>Fanghiens</label><hr>
            <input type="checkbox" id="zone4" name="Pirates Mauves"><label>Pirates Mauves</label><hr>
            <input type="checkbox" id="zone5" name="Birmilistanais"><label>Birmilistanais</label><hr>
            <input type="checkbox" id="zone6" name="Sauvages du Froid"><label>Sauvages du Froid</label><hr>
            <input type="checkbox" id="zone7" name="Skuulnards"><label>Skuulnards</label><hr>
            <input type="checkbox" id="zone8" name="Vrognards"><label>Vrognards</label><hr>
            <input type="checkbox" id="zone9" name="Humanoïdes"><label>Humanoïdes</label><hr>
            <input type="checkbox" id="zone10" name="Monstres et créatures"><label>Monstres et créatures</label><hr>
            <input type="checkbox" id="zone11" name="Opposants légendaires"><label>Opposants légendaires</label><hr>
            <button class="validation" type="button">Ok</button>
            `,
            buttons: {
            }
          });
          e.render(true);
          $(document).ready(function () {
            document.getElementById("app-" + d.appId).style.height = "auto"
            $("[class=validation]").click(ev2 => {
              let id_ev = ev.currentTarget.id
              let variable = []
              for (let env = 1; env < 12; env++) {
                if (document.getElementById("zone" + env).checked) {
                  variable.push(document.getElementById("zone" + env).name)
                }
              }
              document.getElementById(id_ev).value = variable
              e.close()
            })
          })
        })
      })

      $("[class=zone]").click(ev => {
        let e = new Dialog({
          title: "Rencontre",
          content: `
          <input type="checkbox" id="zone1" name="Archipel Papoutouh"><label>Archipel Papoutouh</label><hr>
          <input type="checkbox" id="zone2" name="Arnn"><label>Arnn</label><hr>
          <input type="checkbox" id="zone3" name="Banquise"><label>Banquise</label><hr>
          <input type="checkbox" id="zone4" name="Cimes de Kuylinia"><label>Cimes de Kuylinia</label><hr>
          <input type="checkbox" id="zone5" name="Côte de Sk'ka"><label>Côte de Sk'ka</label><hr>
          <input type="checkbox" id="zone6" name="Fernol et Galzanie"><label>Fernol et Galzanie</label><hr>
          <input type="checkbox" id="zone7" name="Forêt maudite de l'Ouest"><label>Forêt maudite de l'Ouest</label><hr>
          <input type="checkbox" id="zone8" name="Haute mer"><label>Haute mer</label><hr>
          <input type="checkbox" id="zone9" name="Jungles de la péninsule"><label>Jungles de la péninsule</label><hr>
          <input type="checkbox" id="zone10" name="Marais gelés"><label>Marais gelés</label><hr>
          <input type="checkbox" id="zone11" name="Montagnes du Nord"><label>Montagnes du Nord</label><hr>
          <input type="checkbox" id="zone12" name="Monts de l'Est"><label>Monts de l'Est</label><hr>
          <input type="checkbox" id="zone13" name="Pays de Nugh"><label>Pays de Nugh</label><hr>
          <input type="checkbox" id="zone14" name="Plaine centrale"><label>Plaine centrale</label><hr>
          <input type="checkbox" id="zone15" name="Plaine de Sakourvit"><label>Plaine de Sakourvit</label><hr>
          <input type="checkbox" id="zone16" name="Plaines de Fangh et Caladie"><label>Plaines de Fangh et Caladie</label><hr>
          <input type="checkbox" id="zone17" name="Plaines de l'Ouest"><label>Plaines de l'Ouest</label><hr>
          <input type="checkbox" id="zone18" name="Plaines gelées du Nord"><label>Plaines gelées du Nord</label><hr>
          <input type="checkbox" id="zone19" name="Pointe sud du Birmilistan"><label>Pointe sud du Birmilistan</label><hr>
          <input type="checkbox" id="zone20" name="Rivages de la mer d'Embarh"><label>Rivages de la mer d'Embarh</label><hr>
          <input type="checkbox" id="zone21" name="Rivages de la mer Sidralnée"><label>Rivages de la mer Sidralnée</label><hr>
          <input type="checkbox" id="zone22" name="Steppes du Srölnagud"><label>Steppes du Srölnagud</label><hr>
          <input type="checkbox" id="zone23" name="Uzgueg et Gnaal"><label>Uzgueg et Gnaal</label><hr>
          <input type="checkbox" id="zone24" name="Vallée du Birmilistan"><label>Vallée du Birmilistan</label><hr>
          <button class="validation" type="button">Ok</button>
          `,
          buttons: {
          }
        });
        e.render(true);
        $(document).ready(function () {
          document.getElementById("app-" + d.appId).style.height = "auto"
          $("[class=validation]").click(ev2 => {
            let id_ev = ev.currentTarget.id
            let variable = []
            for (let env = 1; env < 25; env++) {
              if (document.getElementById("zone" + env).checked) {
                variable.push(document.getElementById("zone" + env).name)
              }
            }
            document.getElementById(id_ev).value = variable
            e.close()
          })
        })
      })
      $("[class=trait]").click(ev => {
        let e = new Dialog({
          title: "Rencontre",
          content: `
          <input type="checkbox" id="zone1" name="Bizarre +"><label>Bizarre +</label><hr>
          <input type="checkbox" id="zone2" name="Bizarre ++"><label>Bizarre ++</label><hr>
          <input type="checkbox" id="zone3" name="Bizarre +++"><label>Bizarre +++</label><hr>
          <input type="checkbox" id="zone4" name="Bulldozer +"><label>Bulldozer +</label><hr>
          <input type="checkbox" id="zone5" name="Bulldozer ++"><label>Bulldozer ++</label><hr>
          <input type="checkbox" id="zone6" name="Bulldozer +++"><label>Bulldozer +++</label><hr>
          <input type="checkbox" id="zone7" name="Critique +"><label>Critique +</label><hr>
          <input type="checkbox" id="zone8" name="Critique ++"><label>Critique ++</label><hr>
          <input type="checkbox" id="zone9" name="Critique +++"><label>Critique +++</label><hr>
          <input type="checkbox" id="zone10" name="Mâchoire +"><label>Mâchoire +</label><hr>
          <input type="checkbox" id="zone11" name="Mâchoire ++"><label>Mâchoire ++</label><hr>
          <input type="checkbox" id="zone12" name="Mâchoire +++"><label>Mâchoire +++</label><hr>
          <input type="checkbox" id="zone13" name="Mise à terre +"><label>Mise à terre +</label><hr>
          <input type="checkbox" id="zone14" name="Mise à terre ++"><label>Mise à terre ++</label><hr>
          <input type="checkbox" id="zone15" name="Mise à terre +++"><label>Mise à terre +++</label><hr>
          <input type="checkbox" id="zone16" name="Puissant +"><label>Puissant +</label><hr>
          <input type="checkbox" id="zone17" name="Puissant ++"><label>Puissant ++</label><hr>
          <input type="checkbox" id="zone18" name="Puissant +++"><label>Puissant +++</label><hr>
          <input type="checkbox" id="zone19" name="Rapide +"><label>Rapide +</label><hr>
          <input type="checkbox" id="zone20" name="Rapide ++"><label>Rapide ++</label><hr>
          <input type="checkbox" id="zone21" name="Rapide +++"><label>Rapide +++</label><hr>
          <input type="checkbox" id="zone22" name="Terrifiant +"><label>Terrifiant +</label><hr>
          <input type="checkbox" id="zone23" name="Terrifiant ++"><label>Terrifiant ++</label><hr>
          <input type="checkbox" id="zone24" name="Terrifiant +++"><label>Terrifiant +++</label><hr>
          <input type="checkbox" id="zone25" name="Violent +"><label>Violent +</label><hr>
          <input type="checkbox" id="zone26" name="Violent ++"><label>Violent ++</label><hr>
          <input type="checkbox" id="zone27" name="Violent +++"><label>Violent +++</label><hr>
          <input type="checkbox" id="zone28" name="Agile"><label>Agile</label><hr>
          <input type="checkbox" id="zone29" name="Bulldozer volant"><label>Bulldozer volant</label><hr>
          <input type="checkbox" id="zone30" name="Immunité"><label>Immunité</label><hr>
          <input type="checkbox" id="zone31" name="Légende"><label>Légende</label><hr>
          <input type="checkbox" id="zone32" name="Malin"><label>Malin</label><hr>
          <input type="checkbox" id="zone33" name="Mort"><label>Mort</label><hr>
          <input type="checkbox" id="zone34" name="Nuée"><label>Nuée</label><hr>
          <input type="checkbox" id="zone35" name="Paisible"><label>Paisible</label><hr>
          <input type="checkbox" id="zone36" name="Surnaturel"><label>Surnaturel</label><hr>
          <input type="checkbox" id="zone37" name="Volant"><label>Volant</label><hr>
          <button class="validation" type="button">Ok</button>
          `,
          buttons: {
          }
        });
        e.render(true);
        $(document).ready(function () {
          document.getElementById("app-" + d.appId).style.height = "auto"
          $("[class=validation]").click(ev2 => {
            let id_ev = ev.currentTarget.id
            let variable = []
            for (let env = 1; env < 38; env++) {
              if (document.getElementById("zone" + env).checked) {
                variable.push(document.getElementById("zone" + env).name)
              }
            }
            document.getElementById(id_ev).value = variable
            e.close()
          })
        })
      })
      $("[class=type]").click(ev => {
        let e = new Dialog({
          title: "Rencontre",
          content: `
          <input type="checkbox" id="zone1" name="Animaux"><label>Animaux</label><hr>
          <input type="checkbox" id="zone2" name="Végétaux"><label>Végétaux</label><hr>
          <input type="checkbox" id="zone3" name="Fanghiens"><label>Fanghiens</label><hr>
          <input type="checkbox" id="zone4" name="Pirates Mauves"><label>Pirates Mauves</label><hr>
          <input type="checkbox" id="zone5" name="Birmilistanais"><label>Birmilistanais</label><hr>
          <input type="checkbox" id="zone6" name="Sauvages du Froid"><label>Sauvages du Froid</label><hr>
          <input type="checkbox" id="zone7" name="Skuulnards"><label>Skuulnards</label><hr>
          <input type="checkbox" id="zone8" name="Vrognards"><label>Vrognards</label><hr>
          <input type="checkbox" id="zone9" name="Humanoïdes"><label>Humanoïdes</label><hr>
          <input type="checkbox" id="zone10" name="Monstres et créatures"><label>Monstres et créatures</label><hr>
          <input type="checkbox" id="zone11" name="Opposants légendaires"><label>Opposants légendaires</label><hr>
          <button class="validation" type="button">Ok</button>
          `,
          buttons: {
          }
        });
        e.render(true);
        $(document).ready(function () {
          document.getElementById("app-" + d.appId).style.height = "auto"
          $("[class=validation]").click(ev2 => {
            let id_ev = ev.currentTarget.id
            let variable = []
            for (let env = 1; env < 12; env++) {
              if (document.getElementById("zone" + env).checked) {
                variable.push(document.getElementById("zone" + env).name)
              }
            }
            document.getElementById(id_ev).value = variable
            e.close()
          })
        })
      })
    })
    //-------------------------
  }

  //Chercher une rencontre (générateur) étape 2
  static async listrencontre(monstres, level, zone, trait, type, consnom, listfamille) {
    var rencontresN = []
    var rencontresM = []
    var monstres = monstres
    var list = ''
    let i = 0
    let firstchar = ""
    for (let levelCust of level) {
      var zoneCusts = zone[i][0].split(',')
      if (zoneCusts.length == 1 && zoneCusts[0] == "") { zoneCusts = [] }
      var traitCusts = trait[i][0].split(',')
      if (traitCusts.length == 1 && traitCusts[0] == "") { traitCusts = [] }
      var typeCusts = type[i][0].split(',')
      if (typeCusts.length == 1 && typeCusts[0] == "") { typeCusts = [] }
      var flag1 = 0
      var flag2 = 0
      var flag3 = false
      var rencontres = []
      let xpmax = levelCust[1]
      let xpmin = levelCust[0]
      let flagtest = false
      let compteurtest = 0
      while (!flagtest) {
        xpmax = parseInt(levelCust[1]) + compteurtest
        xpmin = parseInt(levelCust[0]) - compteurtest
        for (let monstre of monstres) {
          flag1 = 0
          flag2 = 0
          flag3 = false
          if (monstre.system.attributes.xp.value <= xpmax && monstre.system.attributes.xp.value >= xpmin) {
            for (let zoneCust of zoneCusts) {
              monstre.items.forEach(item => {
                if (item.name == zoneCust) { flag1++ }
              })
            }
            for (let traitCust of traitCusts) {
              monstre.items.forEach(item => {
                if (item.name == traitCust) { flag2++ }
              })
            }
            for (let typeCust of typeCusts) {
              if (monstre.system.attributes.categorie == typeCust) { flag3 = true }
            }
            if (typeCusts.length == 0) { flag3 = true }
          }
          if (flag1 == zoneCusts.length && flag2 == traitCusts.length && flag3 == true) {
            if (consnom == true && firstchar != "") {
              if (monstre.name.split("|")[0].replace(/ /g, '') == firstchar) {
                rencontres.push(monstre)
              }
            } else {
              rencontres.push(monstre)
            }
          }
        }
        compteurtest++
        if (compteurtest == 11) { flagtest = true }
        if (rencontres.length != 0) { flagtest = true }
      }
      if (rencontres.length == 0) {
        rencontresN.push("vide")
      } else {
        let alea = Math.floor(Math.random() * rencontres.length)
        let aleamonstre = rencontres[alea]
        if (consnom == true && firstchar == "") {
          firstchar = aleamonstre.name.split("|")[0].replace(/ /g, '')
        }
        rencontresN.push(aleamonstre)
      }
      if (rencontresN.length == 1 && rencontresM.length == 0) {
        if (rencontresN[0] == "vide") {
          consnom = false;
          listfamille = false;
        }
        rencontresM = rencontresN
        rencontresN = []
      }
      i = i + 1
    }
    if (listfamille == true) {
      for (let monstre of monstres) {
        if (monstre.name != rencontresM[0].name && monstre.name.split("|")[0].replace(/ /g, '') == rencontresM[0].name.split("|")[0].replace(/ /g, '')) {
          rencontresM.push(monstre)
        }
      }
    }

    for (let r of rencontresM) {
      if (r == "vide") {
        list += '<li style="padding-bottom: 5px;display: flex;align-items: center;">Pas de résultat</li>';
      } else {
        list += '<li style="padding-bottom: 5px;display: flex;align-items: center;"><img src=' + r.img + ' style="width:60px;height:60px;">&nbsp;<a class="entity-link content-link" draggable="true" data-uuid="Compendium.naheulbeuk.bestiaire' + '.' + r._id + '" data-pack="naheulbeuk.bestiaire" data-id=' + r._id + '><i class="fas fa-suitcase"></i> ' + r.name + '</a>&nbsp;' + r.system.attributes.xp.value + ' XP</li>';
      }
    }
    list += '<hr>'
    for (let r of rencontresN) {
      if (r == "vide") {
        list += '<li style="padding-bottom: 5px;display: flex;align-items: center;">Pas de résultat</li>';
      } else {
        list += '<li style="padding-bottom: 5px;display: flex;align-items: center;"><img src=' + r.img + ' style="width:60px;height:60px;">&nbsp;<a class="entity-link content-link" draggable="true" data-uuid="Compendium.naheulbeuk.bestiaire' + '.' + r._id + '" data-pack="naheulbeuk.bestiaire" data-id=' + r._id + '><i class="fas fa-suitcase"></i> ' + r.name + '</a>&nbsp;' + r.system.attributes.xp.value + ' XP</li>';
      }
    }
    let ul = '<ul>' + list + '</ul>';
    let d = new Dialog({
      title: "Rencontre",
      content: ul,
      buttons: {}
    });
    d.render(true);
  }

  //Outil de recherche/création mag (--> A vérifier)
  static async magic_search() {
    let all = all_items_search;
    var raw_arr = all.split("\n");
    var arr = []
    for (let entry of raw_arr) {
      arr.push(JSON.parse(entry))
    }
    const myDialogOptions = {
      width: 900
    };
    let d = new Dialog({
      title: "Rechercher un objet",
      content: `
      <form>
        <div style="display: flex;align-items: center;">  
          <label style="flex: 1.8">Mots clés ( || pour un OU, && pour un ET )</em></label>
          <input style="flex: 3" type="text" name="q" id="q" value="" label="Nom de l'objet" />
          <label style="flex: 1">&nbsp;&nbsp;Prix min / max</label>
          <input style="flex: 0.4" type="text" name="pomin" id="pomin" value="" label="Prix min" />
          <label style="flex: 0.1">&nbsp;/</label>
          <input style="flex: 0.4" type="text" name="pomax" id="pomax" value="" label="Prix max" />
        </div>
        <hr>
        <div style="align-items: center;">
          <label>Type d'objet (Foundry) --> 2 choix = choix 1 ou choix 2</label><br/>
          <input type="checkbox" id="type1" name="ape"><label>APE</label>
          <input type="checkbox" id="type2" name="arme"><label>Armes/Objets en mains</label>
          <input type="checkbox" id="type3" name="armure"><label>Armure/Objets portés</label>
          <input type="checkbox" id="type4" name="competence"><label>Compétences</label>
          <input type="checkbox" id="type5" name="coup"><label>Coups spéciaux</label>
          <input type="checkbox" id="type6" name="etat"><label>Etats</label>
          <input type="checkbox" id="type7" name="gemme"><label>Gemmes</label>
          <input type="checkbox" id="type8" name="metier"><label>Métiers</label>
          <input type="checkbox" id="type9" name="origine"><label>Origines</label>
          <input type="checkbox" id="type10" name="piege"><label>Pièges</label>
          <input type="checkbox" id="type11" name="recette"><label>Plans d'ingé</label>
          <input type="checkbox" id="type12" name="sac"><label>Sacs/Bourses</label>
          <input type="checkbox" id="type13" name="sort"><label>Sorts</label>
          <input type="checkbox" id="type14" name="truc"><label>Trucs</label>
        </div>
        <hr>
        <div style="align-items: center;">
          <label>Catégorie d'objet (inventaire) --> 2 choix = choix 1 ou choix 2</label><br/>
          <input type="checkbox" id="cat1" name="Divers"><label>Divers</label>
          <input type="checkbox" id="cat2" name="Livres"><label>Livres</label>
          <input type="checkbox" id="cat3" name="Potions"><label>Potions</label>
          <input type="checkbox" id="cat4" name="Ingrédients"><label>Ingrédients</label>
          <input type="checkbox" id="cat5" name="Armes"><label>Armes</label>
          <input type="checkbox" id="cat6" name="Armures"><label>Armures</label>
          <input type="checkbox" id="cat7" name="Nourritures"><label>Nourritures</label>
          <input type="checkbox" id="cat8" name="Richesses"><label>Richesses</label>
          <input type="checkbox" id="cat9" name="Objets personnels"><label>Objets personnels</label>
          <input type="checkbox" id="cat10" name="Montures"><label>Montures</label>
        </div>
        <hr>
        <div style="align-items: center;">
          <label>Filtre pour arme ou armure --> 2 choix = choix 1 et choix 2</label><br/>
          <input type="checkbox" id="ench1" name="enchantée"><label>Enchantée</label>
          <input type="checkbox" id="ench2" name="relique"><label>Relique</label>
          <input type="checkbox" id="ench3" name="armepoudre"><label>Arme à poudre</label>
          <input type="checkbox" id="ench4" name="bouclier"><label>Bouclier</label>
          <input type="checkbox" id="ench5" name="prtete"><label>PR Tête</label>
          <input type="checkbox" id="ench6" name="prbras"><label>PR Bras</label>
          <input type="checkbox" id="ench7" name="prtorse"><label>PR Torse</label>
          <input type="checkbox" id="ench8" name="prmains"><label>PR Mains</label>
          <input type="checkbox" id="ench9" name="prjambes"><label>PR Jambes</label>
          <input type="checkbox" id="ench10" name="prpieds"><label>PR Pieds</label>
        </div>
        <hr>
        <div style="display: flex;align-items: center;">  
          <label style="flex: 0.6">Mots clés compendium</em></label>
          <input style="flex: 1" type="text" name="compe" id="compe" value="" label="Nom de compendium" />
          <label style="flex: 1.1">&nbsp;&nbsp;Magasin (nom du journal et de la page)</em></label>
          <input style="flex: 0.7" type="text" name="magasin" id="magasin" value="" label="Nom de magasin" />
          <label style="flex:0.02"></label>
          <input style="flex: 0.7" type="text" name="page" id="page" value="" label="Nom de la page" />
        </div>
        <br/>
        <button class="validation" type="button">Rechercher</button>
        <div id="result"></div>
      </form>
      `,
      buttons: {
      }
    }, myDialogOptions);
    d.render(true);
    $(document).ready(function () {
      $("[class=validation]").click(ev2 => {
        var val = $("[id=q]").val().toLowerCase();
        var vals = val.split("&&");
        var compe = $("[id=compe]").val().toLowerCase();
        var magasin = $("[id=magasin]").val();
        var page = $("[id=page]").val();
        var pomin = $("[id=pomin]").val()
        var pomax = $("[id=pomax]").val()
        var res = $("[id=result]");
        res[0].innerHTML = '';
        let list = '';
        var result = [];
        var result2 = [];
        //Recherche txt
        if (val != '') {
          result = arr.filter(entry => {
            let flag1 = true
            for (let valentry of vals) {
              let valss = valentry.split("||");
              if (valss.length == 1) {
                let flag2 = false
                if (entry.name.toLowerCase().indexOf(valentry.trim()) !== -1) { flag2 = true }
                for (let e in entry.system) {
                  if (("" + entry.system[e]).toLowerCase().indexOf(valentry.trim()) !== -1) { flag2 = true }
                }
                if (flag2 == false) { flag1 = false }
              } else {
                let flag3 = false
                for (let valssentry of valss) {
                  let flag2 = false
                  if (entry.name.toLowerCase().indexOf(valssentry.trim()) !== -1) { flag2 = true }
                  for (let e in entry.system) {
                    if (("" + entry.system[e]).toLowerCase().indexOf(valssentry.trim()) !== -1) { flag2 = true }
                  }
                  if (flag2 == true) { flag3 = true }
                }
                if (flag3 == false) { flag1 = false }
              }
            }
            return flag1
          });
        } else { result = arr }

        //Recherche type
        var typeObj = []
        for (let env = 1; env < 15; env++) {
          if (document.getElementById("type" + env).checked) {
            typeObj.push(document.getElementById("type" + env).name)
          }
        }
        if (typeObj.length != 0) {
          for (let r of result) {
            for (let typeO of typeObj) {
              if (r.type == typeO) { result2.push(r) }
            }
          }
        } else {
          result2 = result
        }
        result = []

        //Recherche prix
        if (pomin != "" || pomax != "") {
          for (let r of result2) {
            let flag1 = false
            let flag2 = false
            if (r.system.prix != undefined) {
              if (pomin != "") {
                if (r.system.prix >= parseFloat(pomin)) { flag1 = true }
              } else { flag1 = true }
              if (pomax != "") {
                if (r.system.prix <= parseFloat(pomax)) { flag2 = true }
              } else { flag2 = true }
              if (flag1 == true && flag2 == true) { result.push(r) }
            }
          }
        } else {
          result = result2
        }
        result2 = []

        //Recherche catégorie
        var catObj = []
        for (let env = 1; env < 11; env++) {
          if (document.getElementById("cat" + env).checked) {
            catObj.push(document.getElementById("cat" + env).name)
          }
        }
        if (catObj.length != 0) {
          for (let r of result) {
            for (let catO of catObj) {
              if (r.system.categorie == catO) { result2.push(r) }
            }
          }
        } else {
          result2 = result
        }
        result = []

        //Recherche arme/armure enchantée
        let search_arme_armure = false
        for (let env = 1; env < 11; env++) {
          if (document.getElementById("ench" + env).checked) { search_arme_armure = true }
        }
        if (search_arme_armure == true) {
          for (let r of result2) {
            let flag = true
            if (r.system.enchantement == undefined) { flag = false }
            if (r.system.enchantement == false && document.getElementById("ench" + 1).checked) { flag = false }
            if (r.system.relique == false && document.getElementById("ench" + 2).checked) { flag = false }
            if ((r.system.armefeu == undefined || r.system.armefeu == false) && document.getElementById("ench" + 3).checked) { flag = false }
            if ((r.system.prbouclier == undefined || r.system.prbouclier == false) && document.getElementById("ench" + 4).checked) { flag = false }
            if ((r.system.prtete == undefined || r.system.prtete == false) && document.getElementById("ench" + 5).checked) { flag = false }
            if ((r.system.prbras == undefined || r.system.prbras == false) && document.getElementById("ench" + 6).checked) { flag = false }
            if ((r.system.prtorse == undefined || r.system.prtorse == false) && document.getElementById("ench" + 7).checked) { flag = false }
            if ((r.system.prmains == undefined || r.system.prmains == false) && document.getElementById("ench" + 8).checked) { flag = false }
            if ((r.system.prjambes == undefined || r.system.prjambes == false) && document.getElementById("ench" + 9).checked) { flag = false }
            if ((r.system.prpieds == undefined || r.system.prpieds == false) && document.getElementById("ench" + 10).checked) { flag = false }
            if (flag == true) { result.push(r) }
          }
        } else {
          result = result2
        }
        result2 = []

        //Recherche dans un compendium
        if (compe != '') {
          for (let r of result) {
            let compendium = game.packs.find(p => p.metadata.name === r.compendium);
            if (compendium.metadata.label.toLowerCase().indexOf(compe) !== -1) { result2.push(r) }
          }
        } else {
          result2 = result
        }
        result = []

        //classe par prix
        let result_sans_prix = []
        let result_avec_prix = []
        for (let r of result2) {
          if (r.system.prix == undefined) {
            result_sans_prix.push(r)
          } else {
            result_avec_prix.push(r)
          }
        }
        while (result_avec_prix.length != 0) {
          let i = 0
          let j = 0
          let minprix = result_avec_prix[0]
          for (let r of result_avec_prix) {
            if (r.system.prix < minprix.system.prix) {
              minprix = r
              j = i
            }
            i++
          }
          result.push(minprix)
          result_avec_prix.splice(j, 1)
        }
        for (let r of result_sans_prix) { result.push(r) }


        var magasinObj = "vide"
        var pageObj = "vide"
        if (magasin != "") {
          for (const journal of game.journal) {
            if (journal.name == magasin) {
              magasinObj = journal
              for (let pageFind of magasinObj.pages) {
                if (pageFind.name==page){
                  pageObj=pageFind
                }
              }
            }
          }
        }

        for (let r of result) {
          let compendium = game.packs.find(p => p.metadata.name === r.compendium);
          var prix = ""
          var prix2 = ""
          if (r.system.prix != undefined && r.system.prix.length == undefined) {
            prix = r.system.prix + " PO - "
            prix2 = r.system.prix
          }
          if (pageObj == "vide") {
            list += '<li style="padding-bottom: 5px;display: flex;align-items: center;">&nbsp;<img loading="lazy" decoding="async" src=' + r.img + ' style="width:60px;height:60px;">&nbsp;<a class="entity-link content-link" draggable="true" data-uuid="Compendium.naheulbeuk.' + r.compendium + '.' + r._id + '" data-pack="naheulbeuk.' + r.compendium + '" data-id=' + r._id + '><i class="fas fa-suitcase"></i> ' + r.name + '</a>&nbsp;-&nbsp;' + prix + compendium.metadata.label + '</li>';
          } else {
            list += '<li style="padding-bottom: 5px;display: flex;align-items: center;">&nbsp;<img loading="lazy" decoding="async" src=' + r.img + ' style="width:60px;height:60px;">&nbsp;<a class="entity-link content-link" draggable="true" data-uuid="Compendium.naheulbeuk.' + r.compendium + '.' + r._id + '" data-pack="naheulbeuk.' + r.compendium + '" data-id=' + r._id + '><i class="fas fa-suitcase"></i></a><input style="width: 280px;"id="' + r._id + r._id + '" type="text" value="' + r.name + '" />&nbsp;-&nbsp;<input style="width: 50px;"id="' + r._id + '" type="text" value="' + prix2 + '" />&nbsp;PO&nbsp;-&nbsp;' + compendium.metadata.label + '&nbsp;&nbsp;<button style="width: 140px;" class="magasin" name="' + r.name + '" type="button">Ajouter au magasin</button></li>';
          }
        }
        res[0].innerHTML = '<ul>' + list + '</ul>';
        document.getElementById("app-" + d.appId).style.height = "auto"
        $("[class=magasin]").click(ev2 => {
          for (let r of result2) {
            if (r.name == ev2.currentTarget.name) {
              let prixObj = $('[id=' + r._id + ']').val()
              let nameObj = $('[id=' + r._id + r._id + ']').val()
              let content = pageObj.text.content
              let content2 = content + '<p>Article : ' + nameObj
              if (prixObj != "") {
                content2 = content2 + " - vendu pour " + prixObj + " PO"
              }
              content2 = content2 + '</p>\n<section class="secret">\n<p><a class="entity-link content-link" draggable="true" data-uuid="Compendium.naheulbeuk.' + r.compendium + '.' + r._id + '" data-pack="naheulbeuk.' + r.compendium + '" data-id=' + r._id + '><i class="fas fa-suitcase"></i> ' + r.name + '</a></p>\n</section>'
              pageObj.update({"text": {"content":content2}})
            }
          }
        });
      })
    });
  }

  //chercher les compétence (--> à vérifier)
  static async competence_display() {
    var content = ''
    var competences = []
    const source = game.naheulbeuk.macros.getSpeakersActor();
    for (let item of source.items) {
      if (item.type == "competence") {
        competences.push(item)
      }
    }
    let i = 0
    for (let competence of competences) {
      if (competence.system.diff != "-") {
        var expr = game.naheulbeuk.macros.replaceAttr(competence.system.diff, source)
        expr = expr.replace(/ceil/g, "Math.ceil");
        expr = expr.replace(/max/g, "Math.max");
        expr = eval(expr)
      } else {
        expr = "-"
      }
      var affichage = '<div style="display:flex"><div style="flex:1.5"><label class="competence" id=' + i + '><label class="cliquable">' + competence.name + '</label></label></div>' + '<div style="flex:0.5"><label class="cliquable"><label class="competencejet" name="' + competence.name + '">' + expr + '</label></label></div></div>'
      content = content + affichage
      i = i + 1
    }
    content = content + '<br/>'
    const myDialogOptions = {
      width: 300
    };
    let d = new Dialog({
      title: "Compétences",
      content: content,
      buttons: {
        one: {
          label: "Fermer",
          callback: (html) => {
          }
        }
      }
    }, myDialogOptions);
    d.render(true)
    $(document).ready(function () {
      $("[class=competence]").click(ev => {
        let id = ev.currentTarget.id
        competences[id].sheet.render(true)
      })
      $("[class=competencejet]").click(ev => {
        var diffcomp = ev.currentTarget.childNodes[0].data
        if (diffcomp!="-") {
          var namecomp = ev.currentTarget.attributes.name.value;
          let e = new Dialog({
            title: namecomp,
            content: `
            <label style="font-size: 15px;">Formule :</label>
            <input style="font-size: 15px;" type="text" name="inputFormule" value="d20">
            <br/><br/>
            <label style="font-size: 15px;">Difficulté :</label>
            <input style="font-size: 15px;" type="text" name="inputDiff" value="`+ diffcomp + `"></li>
            <br/><br/>
            `,
            buttons: {
              one: {
                label: "Lancer",
                callback: (html) => {
                  let dice = html.find('input[name="inputFormule"').val();
                  let diff = html.find('input[name="inputDiff"').val();
                  const rollMessageTpl = 'systems/naheulbeuk/templates/chat/skill-roll.hbs';
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
                          name: namecomp
                        }
                        renderTemplate(rollMessageTpl, tplData).then(msgFlavor => {
                          r.toMessage({
                            user: game.user.id,
                            flavor: msgFlavor,
                          });
                        });
                      } else {
                        diff = new Roll(diff);
                        diff.roll({ "async": true }).then(diff => {
                          result = Math.abs(diff.total - r.total);
                          if (r.total > diff.total) { reussite = "Echec !   " };
                          tplData = {
                            diff: reussite + " - Difficulté : " + diff.total + " - Ecart : " + result,
                            name: namecomp
                          };
                          renderTemplate(rollMessageTpl, tplData).then(msgFlavor => {
                            r.toMessage({
                              user: game.user.id,
                              flavor: msgFlavor,
                            });
                          });
                        });
                      };
                    });
                  }
                }
              }
            }
          });
          e.render(true);
        }
      })
    })
  }

  static createMacro = async function(dropData, slot) {
    const item = await fromUuid(dropData.uuid);
    const actor = item.actor;
    let command = null;
    let macroName = null;
    command = `game.naheulbeuk.rollItemMacro("${item.name}",1);//changer le dernier 1 en 0 pour arriver directement sur l'interface de jets de dés`;
    macroName = item.name + " (" + game.actors.get(actor.id).name + ")";
    let macro = game.macros.contents.find(m => (m.name === macroName) && (m.command === command));
    if (!macro) {
      macro = await Macro.create({
          name: macroName,
          type: "script",
          img: item.img,
          command: command,
          flags: {"naheulbeuk.macro": true}
      }, {displaySheet: false});
      game.user.assignHotbarMacro(macro, slot);        
    }
  }

}

