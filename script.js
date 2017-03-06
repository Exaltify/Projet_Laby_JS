// ----------------------------- Variables globales

// --------- terrain
var divField;
var field;
var tabMur;

// ---------- elements
var joueur;
var directions = new Array('Droite','Haut','Gauche','Bas');
var cptAnimation = 0;
var bonus = new Array();
var bonusType = new Array('Tresor','Diamant','Horloge','Bottes','Sortie');


// ----------- Chrono
var duree="60";
var started=false;

var echo; // à supprimer, c'est pour print sans alert();


// ---------------------------------- Classes


class Element {	// Definition de l'objet

	constructor(posX, posY) {
		this.posX = posX;
		this.posY = posY;
		this.taille = field.tailleCase * 0.9;

	}
	
	getColonne() {
		return Math.floor(this.posX/field.tailleCase);
	}
	
	getLigne() {
		return Math.floor(this.posY/field.tailleCase);
	}	
}



// ---------- Joueur

class Joueur extends Element {
	
	constructor(posX,posY,name) {
		super(posX,posY);
		this.score = 0;
		this.name = name;
		this.speed = 4;
		this.direction = directions[3];
		this.enMouvement = false;
	}	
	
	deplacerKeyDown(event) {
		switch(event.keyCode) {
		case 39: //  droite
			joueur.direction = directions[0];
			joueur.enMouvement = true;
			break;

		case 38: //  haut
			joueur.direction = directions[1];
			joueur.enMouvement = true;
			break;

		case 37: // gauche			
			joueur.direction = directions[2];
			joueur.enMouvement = true;
			break;

		case 40: //  bas			
			joueur.direction = directions[3];
			joueur.enMouvement = true;
			break;
		}
		if(!started) {
            started=true; 
            timer(); 
        }
	}
	
	deplacerKeyUp(event) {
		joueur.enMouvement = false;
	}
	
	refreshJoueur() {
		this.img.style.left = this.posX+'px';
		this.img.style.top = this.posY+'px';
		this.animate();
	}
	
	loadJoueur() {
		this.img = document.createElement("img");
		this.img.src="images/joueur/bas/Bas0.png";
		this.img.width=this.taille;
		this.img.height=this.taille;
		this.img.style.position="absolute";
		divField.appendChild(this.img);
		this.img.style.top=this.taille*this.posX+"px";
		this.img.style.left=this.taille*this.posY+"px";
		this.img.style.visibility = "visible";
		joueur.refreshJoueur();
	}
	
	animate() {
		if(this.enMouvement) {
			switch(this.direction) {
				case 'Droite' : 
					if((joueur.posX < field.pxWidth - field.tailleCase)&&!collisionMurJoueur())
						joueur.posX+= joueur.speed;
					this.img.src="images/joueur/droite/Droite"+cptAnimation+".png";
					break;
				case 'Haut' : 
					if(joueur.posY>0) {
						if(!collisionMurJoueur()) 
							joueur.posY-= joueur.speed;
						else
							joueur.posY+= joueur.speed;
					}
					this.img.src="images/joueur/haut/Haut"+cptAnimation+".png";
					break;
				case 'Gauche' : 
					if(joueur.posX>0) {
						if(!collisionMurJoueur())
							joueur.posX-= joueur.speed;
						else
							joueur.posX+= joueur.speed;
						
					}
					this.img.src="images/joueur/gauche/Gauche"+cptAnimation+".png";
					break;
				case 'Bas' : 
					if((joueur.posY< field.pxHeight - field.tailleCase)&&!collisionMurJoueur())
						joueur.posY+= joueur.speed;
					this.img.src="images/joueur/bas/Bas"+cptAnimation+".png";
					break;
			}
			cptAnimation = (cptAnimation + 1) % 9;
		}
		else {
			cptAnimation = 0;
			switch(this.direction) {
				case 'Droite' : 
					this.img.src="images/joueur/droite/Droite0.png";
					break;
				case 'Haut' : 
					this.img.src="images/joueur/haut/Haut0.png";
					break;
				case 'Gauche' : 
					this.img.src="images/joueur/gauche/Gauche0.png";
					break;
				case 'Bas' : 
					this.img.src="images/joueur/bas/Bas0.png";
					break;
			}
		}
	}
}

//------------- Bonus
class Bonus extends Element {
	
	constructor(posX,posY,type) {
		super(posX,posY);
		this.type = type;
		switch(this.type) {
		case 'Tresor' :
			this.score = 500;
			break;
		case 'Diamant' :
			this.score = 1000;
			break;
		case 'Horloge' : 
			this.score=0;
			break;
		case 'Bottes' : 
			this.score=0;
			break;
		case 'Sortie' : 
			this.score=0;
			break;
		}
	}


	loadBonus() {
	    this.img= document.createElement("img");
		switch(this.type) {
		case 'Tresor' :
            this.img.src="images/tresor.png";
			break;
		case 'Diamant' :
            this.img.src="images/diamant.png";
			break;
		case 'Horloge' :// à copier
            this.img.src="images/horloge.png";
			break;
		case 'Bottes' :// à copier
            this.img.src="images/bottes.png";
			break;
		case 'Sortie' :// à copier
            this.img.src="images/sortie.png";
			break;
		}
        this.img.width=this.taille;
        this.img.height=this.taille;
        this.img.style.position="absolute";
        divField.appendChild(this.img);
        this.img.style.top=this.posY+"px";
        this.img.style.left=this.posX+"px";
        this.img.style.visibility = "visible";
	}

	
	ramasser() {
		this.img.style.display = 'none';
		joueur.score += this.score;
		switch (this.type) {
            case 'Horloge' :
                duree = parseInt(duree,10) + 30;
                break;
            case 'Bottes' :
                joueur.speed *= 2;
                break;
            case 'Sortie' :
                alert("C'est gagné !");
                break;
        }
		var tmp = Array();
		for(var i=0;i<bonus.length;i++) {
			if(bonus[i] != this) 
				tmp.push(bonus[i]);
		}
		bonus = tmp;
	}
}

// ---------- Field & Mur

class Field {
	
	constructor(fieldW,fieldH,tailleCase) {
		this.tailleCase = tailleCase;
		this.pxWidth = fieldW;
		this.pxHeight = fieldH;
		this.width = this.pxWidth/this.tailleCase;
		this.height = this.pxHeight/this.tailleCase;
		this.map = Array();
	}
	
	loadMap() {
		tabMur = [];
		for(var i=0; i<field.height; i++) {
			var ligne=[];
			for(var j=0; j<field.width; j++){
				if(i%2==1 && j%2==1) {
					ligne.push(i*field.width+j+1);
				}
				else {
					ligne.push(0);
					var murImage = document.createElement("img");
					var mur = new Mur(j,i,murImage);
					mur.loadImg();
					tabMur.push(mur);
					divField.appendChild(mur.img);
				}
			}
			field.map.push(ligne);
		}
		generatePath();
	}
			
}

class Mur extends Element {
	
	constructor(posX,posY,img) {
		super(posX,posY);
		this.taille = field.tailleCase;
		this.img = img;
	}
	
	loadImg() {
		this.img.src = "images/mur.png";
		this.img.width = this.taille;
		this.img.height = this.taille;
		this.img.style.position="absolute";
		this.img.style.top=this.taille*this.posX+"px";
		this.img.style.left=this.taille*this.posY+"px";
		this.img.style.visibility = "visible";
	}
}
// -------------------------------------- Fonctions

function load() {
	echo = document.getElementById('echo'); // à supprimer
	initField();
	initJoueur();
	initBonus();
	initEventListener();	
	refresh();
}

function refresh() {
	joueur.refreshJoueur();
	for(var i=0;i<bonus.length;i++) {
		if(collisionAABB(joueur,bonus[i],0.75,1))
			bonus[i].ramasser();
	}
	refreshScore();
	setTimeout(refresh,1000/30);
}

function initField() {
	divField = document.getElementById("terrain");
	field = new Field(800,800,40);
	divField.style.width = field.pxWidth+'px';
	divField.style.height = field.pxHeight+'px';
	field.loadMap();
}

function initJoueur() {
    do {
        var randomX = Math.floor((Math.random() * field.width));
    } while (isAMur(0, randomX));
    joueur = new Joueur(randomX*field.tailleCase,0,'Joueur');
    joueur.loadJoueur();
}

function initBonus() {
    for (var i = 0; i < 5; i++) {
        do {
            var randomX = Math.floor((Math.random() * field.width));
            var randomY = Math.floor((Math.random() * field.height));
            switch(bonusType[i]) {
				case "Sortie" :
					randomY = field.height-1;
					break;
				case "Bottes" :
					if(randomY>Math.floor(field.height/2)) randomY = Math.floor((Math.random() * Math.floor(field.height/2)));
					 break;
			}
        } while (isAMur(randomY, randomX));
        bonus.push(new Bonus(randomX * field.tailleCase, randomY * field.tailleCase, bonusType[i]));
    }
    for (var i = 0; i < bonus.length; i++)
        bonus[i].loadBonus();
}

function initEventListener() {
	document.getElementById('container').addEventListener("keydown",joueur.deplacerKeyDown);
	document.getElementById('container').addEventListener("keyup",joueur.deplacerKeyUp);
}

function refreshScore() {
	document.getElementById("score").innerHTML = "Score : "+joueur.score;
}

function isAMurElement(elem) {
	var i = normalizeLigne(elem.getLigne());
	var j = normalizeColonne(elem.getColonne());
	return isAMur(i,j);
}

function isAMur(i,j) {
    return (field.map[i][j]==0);
}

function normalizeColonne(unsafeX) {
	retour = unsafeX;
	if(retour < 0) retour = 0;
	if(retour > field.width - 1) retour = field.width - 1;
	return retour;
}

function normalizeLigne(unsafeY) {
	retour = unsafeY;
	if(retour < 0) retour = 0;
	if(retour > field.height - 1) retour = field.height - 1;
	return retour;
}

// --------- Collision

function collisionAABB(elem1, elem2, correcteur1, correcteur2) {	
    return !(elem1.posX >= elem2.posX + Math.floor(elem2.taille*correcteur2)
    || elem1.posX + Math.floor(elem1.taille*correcteur1) <= elem2.posX
    || elem1.posY >= elem2.posY + Math.floor(elem2.taille*correcteur2)
    || elem1.posY + Math.floor(elem1.taille*correcteur1) <= elem2.posY);
}

function collisionMurJoueur(direction) {
	return isAMurElement(getProchaineCase());
}

function getProchaineCase() {
	var retour;
	switch(joueur.direction) {
		case 'Droite' : 
			retour = new Element(joueur.posX+joueur.taille,joueur.posY);
			break;
		case 'Haut' : 
			retour = new Element(joueur.posX, joueur.posY);
			break;
		case 'Gauche' : 
			retour = new Element(joueur.posX,joueur.posY);	
			break;
		case 'Bas' : 
			retour = new Element(joueur.posX, joueur.posY+joueur.taille);;
			break;
	}
	return retour;
}


// -------------------------- Chrono

function timer()
{
    var compteur=document.getElementById('compteur');
    var s=duree;
    var m = 0;
    if(s<0)
        compteur.innerHTML="Perdu !"
    else
    {
        if(s>59)
        {
            m=Math.floor(s/60);
            s=s-m*60
        }
        if(s<10)
        {
            s="0"+s
        }
        if(m<10)
        {
            m="0"+m
        }
        compteur.innerHTML=m+":"+s
    }
    duree=duree-1;
    setTimeout("timer();",999);

}

//--------------------------------Generation Labyrinthe--------------------------------//


function generatePath() {
    while(!labyParfait()) {
        do {
            var index = Math.floor((Math.random() * tabMur.length));
            var randomMur = tabMur[index];
            var tabVoisins = getVoisins(randomMur.posX, randomMur.posY);
        } while (tabVoisins.length == 0 || voisinsMemeZone(tabVoisins));
        divField.removeChild(tabMur[index].img);
        tabMur.splice(index, 1);
        var premierVoisin = tabVoisins[Math.floor((Math.random() * tabVoisins.length))];
        remplirZone(randomMur.posX, randomMur.posY, field.map[premierVoisin[0]][premierVoisin[1]]);
    }
}

function getVoisins(i, j) {
    tabVoisins = [];
    if(j>0 && field.map[i][j-1]!=0) tabVoisins.push([i, j-1]); //voisin gauche
    if(j<field.width-1 && field.map[i][j+1]!=0) tabVoisins.push([i, j+1]); //voisin droit
    if(i>0 && field.map[i-1][j]!=0) tabVoisins.push([i-1, j]); //voisin haut
    if(i<field.height-1 && field.map[i+1][j]!=0) tabVoisins.push([i+1, j]); //voisin bas
    return tabVoisins;
}

function voisinsMemeZone(tabVoisins) {
    var valueTab = [];
    if(tabVoisins.length<2) {return false;}
    valueTab.push(field.map[tabVoisins[0][0]][tabVoisins[0][1]]);
    for(var i=0; i<tabVoisins.length; i++) {
        for(var j=0; j<valueTab.length; j++) {
            if(field.map[tabVoisins[i][0]][tabVoisins[i][1]]!=valueTab[j]) {
                return false;
            }
        }
        valueTab[i]=field.map[tabVoisins[i][0]][tabVoisins[i][1]];
    }
    return true;
}

function remplirZone(i, j, value) {
    if(field.map[i][j]!=value) {
        var tabVoisins = getVoisins(i, j);
        field.map[i][j] = value;
        if(tabVoisins.length!=0) {
            for(var k = 0, count=tabVoisins.length; k < count; k++) {
                remplirZone(tabVoisins[k][0], tabVoisins[k][1], value);
            }
        }
    }
}

function labyParfait() {
	if(field.map[1][1] != -1) {
		var value = field.map[1][1];
		for(var i=0; i<field.height; i++){
			for(var j=0; j<field.width; j++) {
				if(field.map[i][j]!=value && field.map[i][j]!=0) {
					return false;
				}
			}
		}
		return true;
	}
	else
		return false;
}