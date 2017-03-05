// ----------------------------- Variables
// --------- terrain
var divField;
var field;
var tabMur;

// ---------- elements
var joueur;
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
		this.taille = field.tailleCase;

	}
}



// ------------------------------- Joueur

class Joueur extends Element {
	
	constructor(posX,posY,name) {
		super(posX,posY);
		this.score = 0;
		this.name = name;
		this.speed = 4;
	}	
	
	deplacer(event) {
		switch(event.keyCode) {
		case 39: //  droite
			if(joueur.posX < 380)joueur.posX+= joueur.speed;
			break;

		case 38: //  haut
			if(joueur.posY>0)joueur.posY-= joueur.speed;
			break;

		case 37: // gauche
			if(joueur.posX>0)joueur.posX-= joueur.speed;
			break;

		case 40: //  bas
			if(joueur.posY<380)joueur.posY+= joueur.speed;
			break;
		}
		if(!started) {
            started=true; 
            timer(); 
        }
	}
	
	refreshJoueur() {
		this.img.style.left = this.posX+'px';
		this.img.style.top = this.posY+'px';
	}
	loadJoueur() {
		this.img = document.createElement("img");
		this.img.src="images/mrpeanut.png";
		this.img.width=this.taille;
		this.img.height=this.taille;
		this.img.style.position="absolute";
		divField.appendChild(this.img);
		this.img.style.top=this.taille*this.posX+"px";
		this.img.style.left=this.taille*this.posY+"px";
		this.img.style.visibility = "visible";
		joueur.refreshJoueur();
	}
}

//------------------------------ Bonus
class Bonus extends Element {
	
	constructor(posX,posY,type) {
		super(posX,posY);
		this.type = type;
		this.taille=field.tailleCase;
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
                duree = (parseInt(duree,10) + 30);
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

// ---------------------------- Field & Mur

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
// --------------------------- Fonctions

function load() {
	divField = document.getElementById("terrain");
	field = new Field(400,400,20);
	field.loadMap();
	initJoueur();
	initBonus();
	document.getElementById('container').addEventListener("keydown",joueur.deplacer);
	refresh();
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
            if (bonusType[i]=="Sortie") randomY=19;
        } while (isAMur(randomY, randomX));
        bonus.push(new Bonus(randomX * field.tailleCase, randomY * field.tailleCase, bonusType[i]));
    }
    for (var i = 0; i < bonus.length; i++)
        bonus[i].loadBonus();
}

function refresh() {
	joueur.refreshJoueur();
	for(var i=0;i<bonus.length;i++) {
		if(collision(bonus[i]))
			bonus[i].ramasser();
	}
	refreshScore();
	setTimeout(refresh,1000/30);
}

function collision(el) {
	
    return !(joueur.posX >= el.posX + 15
    || joueur.posX + 15 <= el.posX
    || joueur.posY >= el.posY + 15
    || joueur.posY + 15 <= el.posY);
}

function refreshScore() {
	document.getElementById("score").innerHTML = "Score : "+joueur.score;
}

function isAMur(i, j) {
    return (field.map[i][j]==0);
}

// -------------------------- Chrono

function timer()
{
    var compteur=document.getElementById('compteur');
    var s=duree;
    var m = 0;
    if(s<0)
    {
        compteur.innerHTML="Perdu !"
    }
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
    while(!isLabyrinthPerfect()) {
        do {
            var index = Math.floor((Math.random() * tabMur.length));
            var randomMur = tabMur[index];
            var tabNeighbors = getNeighbors(randomMur.posX, randomMur.posY);
        } while (tabNeighbors.length == 0 || areNeighborsTheSame(tabNeighbors));
        divField.removeChild(tabMur[index].img);
        tabMur.splice(index, 1);
        var firstNeighbor = tabNeighbors[Math.floor((Math.random() * tabNeighbors.length))];
        fillZone(randomMur.posX, randomMur.posY, field.map[firstNeighbor[0]][firstNeighbor[1]]);
    }
}

function getNeighbors(i, j) {
    tabNeighbors = [];
    if(j>0 && field.map[i][j-1]!=0) tabNeighbors.push([i, j-1]); //voisin gauche
    if(j<field.width-1 && field.map[i][j+1]!=0) tabNeighbors.push([i, j+1]); //voisin droit
    if(i>0 && field.map[i-1][j]!=0) tabNeighbors.push([i-1, j]); //voisin haut
    if(i<field.height-1 && field.map[i+1][j]!=0) tabNeighbors.push([i+1, j]); //voisin bas
    return tabNeighbors;
}

function areNeighborsTheSame(tabNeighbors) {
    var valueTab = [];
    if(tabNeighbors.length<2) {return false;}
    valueTab.push(field.map[tabNeighbors[0][0]][tabNeighbors[0][1]]);
    for(var i=0; i<tabNeighbors.length; i++) {
        for(var j=0; j<valueTab.length; j++) {
            if(field.map[tabNeighbors[i][0]][tabNeighbors[i][1]]!=valueTab[j]) {
                return false;
            }
        }
        valueTab[i]=field.map[tabNeighbors[i][0]][tabNeighbors[i][1]];
    }
    return true;
}

function fillZone(i, j, value) {
    if(field.map[i][j]!=value) {
        var tabNeighbors = getNeighbors(i, j);
        field.map[i][j] = value;
        if(tabNeighbors.length!=0) {
            for(var k = 0, count=tabNeighbors.length; k < count; k++) {
                fillZone(tabNeighbors[k][0], tabNeighbors[k][1], value);
            }
        }
    }
}

function isLabyrinthPerfect() {
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