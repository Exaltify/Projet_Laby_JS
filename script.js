// ----------------------------- Variables globales

var timeOutRefresh;
var timeOutChrono;

var gameLoaded = false;

// --------- terrain
var divField;
var divFenetre;
var optionTaille = 30;
var optionFog = true;
var field;
var tabMur = new Array();

// ---------- elements
var joueur;
var directions = new Array('Droite','Haut','Gauche','Bas');
var cptAnimation = 0;
var bonus = new Array();
var bonusType = new Array('Tresor','Diamant','Horloge','Bottes','Sortie');


// ----------- Chrono
var duree="60";
var started=false;


// ---------------------------------- Classes


class Element {	// Definition de l'objet

	constructor(posX, posY) {
		this.posX = posX;
		this.posY = posY;
		this.taille = field.tailleCase * 0.9;
	}
	
	getColonne() {
		return Math.floor(this.getCentreX()/field.tailleCase);
	}
	
	getLigne() {
		return Math.floor(this.getCentreY()/field.tailleCase);
	}

    getCentreX(){
        return this.posX+Math.floor(field.tailleCase/2);
    }

    getCentreY(){
        return this.posY+Math.floor(field.tailleCase/2);
    }

    distanceTo(obj){
        return Math.sqrt(Math.pow(obj.getCentreX()-this.getCentreX(),2)+Math.pow(obj.getCentreY()-this.getCentreY(),2));
    }

    distanceToCorner(obj,coin){
        switch(coin) {
            case '0' :
                return Math.sqrt(Math.pow(obj.posX-this.getCentreX(),2)+Math.pow(obj.posY-this.getCentreY(),2));
                break;
            case '1' :
                return Math.sqrt(Math.pow(obj.posX+field.tailleCase-this.getCentreX(),2)+Math.pow(obj.posY-this.getCentreY(),2));
                break;
            case '2' :
                return Math.sqrt(Math.pow(obj.posX+field.tailleCase-this.getCentreX(),2)+Math.pow(obj.posY-field.tailleCase-this.getCentreY(),2));
                break;
            case '3' :
                return Math.sqrt(Math.pow(obj.posX-this.getCentreX(),2)+Math.pow(obj.posY-this.getCentreY(),2));
                break;
        }
    }
}



// ---------- Joueur

class Joueur extends Element {
	
	constructor(posX,posY,name) {
		super(posX,posY);
		this.score = 0;
		this.speed = field.tailleCase/10;
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
		this.img.style.top=this.taille*this.posY+"px";
		this.img.style.left=this.taille*this.posX+"px";
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
					}
					this.img.src="images/joueur/haut/Haut"+cptAnimation+".png";
					break;
				case 'Gauche' : 
					if(joueur.posX>0) {
						if(!collisionMurJoueur())
							joueur.posX-= joueur.speed;
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
            this.img.src="images/elements/tresor.png";
			break;
		case 'Diamant' :
            this.img.src="images/elements/diamant.png";
			break;
		case 'Horloge' :
            this.img.src="images/elements/horloge.png";
			break;
		case 'Bottes' :
            this.img.src="images/elements/bottes.png";
			break;
		case 'Sortie' :
            this.img.src="images/elements/sortie.png";
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
                loadEnding(1);
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
		for(var i=0; i<field.height; i++) {
			var ligne=[];
			for(var j=0; j<field.width; j++){
				if(i%2==1 && j%2==1) {
					ligne.push(i*field.width+j+1);
				}
				else {
					ligne.push(0);
					var murImage = document.createElement("img");
					var mur = new Mur(i*field.tailleCase,j*field.tailleCase,murImage);
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
		this.img.src = "images/elements/mur.png";
		this.img.width = this.taille;
		this.img.height = this.taille;
		this.img.style.position="absolute";
		this.img.style.top=this.posY+"px";
		this.img.style.left=this.posX+"px";
		this.img.style.visibility = "visible";
	}
}
// -------------------------------------- Options

function sizeSmall() {
	optionTaille = 30;
	document.getElementById('sizeSmall').style.backgroundImage = "url('images/boutons/checked.png')";
	document.getElementById('sizeLarge').style.backgroundImage = "url('images/boutons/unchecked.png')";
}

function sizeLarge() {
	optionTaille = 20;
	document.getElementById('sizeSmall').style.backgroundImage = "url('images/boutons/unchecked.png')";
	document.getElementById('sizeLarge').style.backgroundImage = "url('images/boutons/checked.png')";
}

function fogOn() {
	optionFog = true;
	document.getElementById('fogOff').style.backgroundImage = "url('images/boutons/unchecked.png')";
	document.getElementById('fogOn').style.backgroundImage = "url('images/boutons/checked.png')";	
}

function fogOff() {
	optionFog = false;
	document.getElementById('fogOn').style.backgroundImage = "url('images/boutons/unchecked.png')";
	document.getElementById('fogOff').style.backgroundImage = "url('images/boutons/checked.png')";	
}

// -------------------------------------- Fonctions

// Initialisation et rafraichissement

function loadMenu() {
	hideEnding();
	document.getElementById('menu').style.visibility = 'visible';
	document.getElementById('boutonOptions').style.visibility = 'visible';
	document.getElementById('sizeSmall').style.visibility = 'visible';
	document.getElementById('sizeLarge').style.visibility = 'visible';
	document.getElementById('boutonCommencer').style.visibility = 'visible';
	document.getElementById('fogOn').style.visibility = 'visible';
	document.getElementById('fogOff').style.visibility = 'visible';
	document.getElementById('fenetre').style.height = 640+'px';
}

function hideMenu() {
	document.getElementById('menu').style.visibility = 'hidden';
	document.getElementById('boutonOptions').style.visibility = 'hidden';
	document.getElementById('sizeSmall').style.visibility = 'hidden';
	document.getElementById('sizeLarge').style.visibility = 'hidden';
	document.getElementById('boutonCommencer').style.visibility = 'hidden';
	document.getElementById('fogOn').style.visibility = 'hidden';
	document.getElementById('fogOff').style.visibility = 'hidden';
}

function loadGame() {
	hideMenu();
	hideEnding();
	initField();
	initJoueur();
	initBonus();
	initEventListener();
	document.getElementById('terrain').style.visibility = 'visible';
	document.getElementById('score').style.visibility = 'visible';
	document.getElementById('compteur').style.visibility = 'visible';
	gameLoaded = true;
	refresh();
}

function hideGame() {
	document.getElementById('terrain').style.visibility = 'hidden';
	document.getElementById('score').style.visibility = 'hidden';
	document.getElementById('compteur').style.visibility = 'hidden';	
}

function loadEnding(type) {
	gameLoaded = false;
	hideGame();
	switch(type) {
		case 0 : 	// Defaite
			document.getElementById('endingScreen').backgroundImage = "url('images/endingLose.png')";
			break;
		case 1 : 	// Victoire
			document.getElementById('endingScreen').backgroundImage = "url('images/endingLose.png')";
			break;		
	}
	document.getElementById('fenetre').style.height = 640+'px';
	document.getElementById('endingScreen').style.visibility = 'visible';
	document.getElementById('boutonFastRestart').style.visibility = 'visible';
	document.getElementById('boutonRetourMenu').style.visibility = 'visible';
	resetGame();
}

function hideEnding() {
	document.getElementById('endingScreen').style.visibility = 'hidden';
	document.getElementById('boutonFastRestart').style.visibility = 'hidden';
	document.getElementById('boutonRetourMenu').style.visibility = 'hidden';
}

function refresh() {
	if(gameLoaded) {
		joueur.refreshJoueur();
		for(var i=0;i<bonus.length;i++) {
			if(collisionAABB(joueur,bonus[i],0.75,1))
				bonus[i].ramasser();
		}
		refreshScore();
	}
	timeOutRefresh = setTimeout(refresh,1000/30);
}

function initField() {
	divField = document.getElementById("terrain");
    divFenetre = document.getElementById("fenetre");
	field = new Field(600,600,optionTaille);
	divField.style.width = field.pxWidth+'px';
	divField.style.height = field.pxHeight+'px';
    divFenetre.style.width = field.pxWidth+'px';
    divFenetre.style.height = field.pxHeight+Math.floor(field.pxHeight/10)+'px';
	field.loadMap();
}

function initJoueur() {
    do {
        var randomX = Math.floor((Math.random() * field.width));
    } while (isAMur(randomX,0));
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
        } while (isAMur(randomX, randomY)&&(randomX!=joueur.getLigne()||randomY!=joueur.getColonne()));
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
	if(gameLoaded)
		document.getElementById("score").innerHTML = "Score : "+joueur.score;
	
}

// ---------------- autres fonctions

function resetGame() {
	clearTimeout(timeOutRefresh);
    clearTimeout(timeOutChrono);
	document.getElementById('container').removeEventListener("keydown",joueur.deplacerKeyDown);
	document.getElementById('container').removeEventListener("keyup",joueur.deplacerKeyUp);
	for(var i=0;i<tabMur.length;i++) {
		divField.removeChild(tabMur[i].img);
	}
	for(var i=0;i<bonus.length;i++) {
		divField.removeChild(bonus[i].img);
	}
	divField.removeChild(joueur.img);
	field = null;
	joueur = null;
	bonus = new Array();
	tabMur = new Array();
	duree = "60";
	started = false;
	compteur.innerHTML="01:00";
}

function isAMur(i,j) {
    return (field.map[i][j]==0);
}

// --------- Collision

function collisionAABB(elem1, elem2, correcteur1, correcteur2) {	
    return !(elem1.posX >= elem2.posX + Math.floor(elem2.taille*correcteur2)
    || elem1.posX + Math.floor(elem1.taille*correcteur1) <= elem2.posX
    || elem1.posY >= elem2.posY + Math.floor(elem2.taille*correcteur2)
    || elem1.posY + Math.floor(elem1.taille*correcteur1) <= elem2.posY);
}

function collisionMurJoueur(){

    switch(joueur.direction) {
        case 'Droite' :
            for (var i=0; i<tabMur.length; i++){
                if (tabMur[i].getColonne() == joueur.getColonne()+1)
                    if (collisionCentreJoueur(tabMur[i]))                        
                        return true;
            }
            break;
        case 'Haut' :
            for (var i=0; i<tabMur.length; i++){
                if (tabMur[i].getLigne() == joueur.getLigne()-1)
                    if (collisionCentreJoueur(tabMur[i]))                        
                        return true;
            }
            break;
        case 'Gauche' :
            for (var i=0; i<tabMur.length; i++){
                if (tabMur[i].getColonne() == joueur.getColonne()-1)
                    if (collisionCentreJoueur(tabMur[i]))                        
                        return true;
            }
            break;
        case 'Bas' :
            for (var i=0; i<tabMur.length; i++){
                if (tabMur[i].getLigne() ==  joueur.getLigne()+1)
                    if (collisionCentreJoueur(tabMur[i]))                        
                        return true;
            }
            break;
    }
    return false;
}

function collisionCentreJoueur(obj) {
    var correctionRayon = field.tailleCase*0.4;
    if (joueur.distanceTo(obj)>= correctionRayon/2 + Math.sqrt(Math.pow(field.tailleCase,2)/2))
        return false;
    if (joueur.distanceTo(obj)<= field.tailleCase+correctionRayon )
        return true;
    if (joueur.distanceToCorner(obj,0)<=field.tailleCase/2||
        joueur.distanceToCorner(obj,1)<=field.tailleCase/2||
        joueur.distanceToCorner(obj,2)<=field.tailleCase/2||
        joueur.distanceToCorner(obj,3)<=field.tailleCase/2)
        return true
}


// -------------------------- Chrono

function timer()
{
	if(gameLoaded) {
		var compteur=document.getElementById('compteur');
		var s=duree;
		var m = 0;
		if(s<0)
			loadEnding(0);
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
	}
    timeOutChrono = setTimeout("timer();",999);
}

//--------------------------------Generation Labyrinthe--------------------------------//


function generatePath() {
    while(!labyParfait()) {
        do {
            var index = Math.floor((Math.random() * tabMur.length));
            var randomMur = tabMur[index];
            var tabVoisins = getVoisins(randomMur.getColonne(), randomMur.getLigne());
        } while (tabVoisins.length == 0 || memeVoisins(tabVoisins));
        divField.removeChild(tabMur[index].img);
        tabMur.splice(index, 1);
        var premierVoisin = tabVoisins[Math.floor((Math.random() * tabVoisins.length))];
        remplirZone(randomMur.getColonne(), randomMur.getLigne(), field.map[premierVoisin[0]][premierVoisin[1]]);
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

function memeVoisins(tabVoisins) {
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