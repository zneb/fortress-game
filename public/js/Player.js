Player = function(game, canvas) {
    // _this est l'accès à la caméraà l'interieur de Player
    var _this = this;

    // Si le tir est activée ou non
    this.weaponShoot = false;

    // Si le tir est activée ou non
    this.weaponAlt = true;

    // On ajoute les joueurs
    this.ghostPlayers=[];

    // Le jeu, chargé dans l'objet Player
    this.game = game;

    // La vitesse de course du joueur
    this.speed = 1;

    // La vitesse de mouvement
    this.angularSensibility = 200;

    // Compteur de tué à la suite
    this.killStreak = 0;

    // Zones de textes pour les annonces
    this.displayAnnouncement = document.getElementById('announcementKill');
    this.textDisplayAnnouncement = document.getElementById('textAnouncement');

    // Menus
    this.leaderboard = document.getElementById('leaderboard');

    // Axe de mouvement X et Z
    this.axisMovement = [false,false,false,false];

    this.textHealth = document.getElementById('textHealth');

    // Quand les touches sont relachés
    window.addEventListener("keydown", function(evt) {
        switch(evt.code){
            case "KeyW":
                _this.camera.axisMovement[0] = true;
                _this.camera.axisMovement[1] = false;
                break;
            case "KeyS":
                _this.camera.axisMovement[1] = true;
                _this.camera.axisMovement[0] = false;
                break;
            case "KeyA":
                _this.camera.axisMovement[2] = true;
                _this.camera.axisMovement[3] = false;
                break;
            case "KeyD":
                _this.camera.axisMovement[3] = true;
                _this.camera.axisMovement[2] = false;
                break;
            case "Tab":
                this.leaderboard.style.display = "block";
                canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
                if (canvas.requestPointerLock) {
                    canvas.requestPointerLock();
                }
                break;
        }
        var data={
            axisMovement : _this.camera.axisMovement
        };
        _this.sendNewData(data)
        
    }, false);

    window.addEventListener("keyup", function(evt) {
        switch(evt.code){
            case "KeyW":
                _this.camera.axisMovement[0] = false;
                break;
            case "KeyS":
                _this.camera.axisMovement[1] = false;
                break;
            case "KeyA":
                _this.camera.axisMovement[2] = false;
                break;
            case "KeyD":
                _this.camera.axisMovement[3] = false;
                break;
            case "Tab":
                this.leaderboard.style.display = "none";
                break;
        }
        var data={
            axisMovement : _this.camera.axisMovement
        };
        _this.sendNewData(data)

    }, false);

    // Quand la souris bouge dans la scène
    window.addEventListener("pointermove", function(evt) {
        if(_this.rotEngaged === true){
            _this.camera.playerBox.rotation.y+=evt.movementX * 0.001 * (_this.angularSensibility / 250);
            var nextRotationX = _this.camera.playerBox.rotation.x + (evt.movementY * 0.001 * (_this.angularSensibility / 250));
            if( nextRotationX < degToRad(90) && nextRotationX > degToRad(-90)){
                _this.camera.playerBox.rotation.x+=evt.movementY * 0.001 * (_this.angularSensibility / 250);
            }
            var data={
                rotation : _this.camera.playerBox.rotation
            };
            _this.sendNewData(data)
        }
    }, false);

    // On récupère le canvas de la scène 
    var canvas = this.game.scene.getEngine().getRenderingCanvas();

    // On affecte le clic et on vérifie qu'il est bien utilisé dans la scène (_this.controlEnabled)
    canvas.addEventListener("pointerdown", function(evt) {
        switch(evt.button) {
            case 0:
                if (_this.controlEnabled && !_this.weaponShoot) {
                    _this.weaponShoot = true;
                    _this.handleUserMouseDown();
                }
                break;
            case 2:
                if (_this.controlEnabled && !_this.weaponAlt) {
                    _this.weaponAlt = true;
                    _this.handleUserMouseDown();
                }
                break;
    }
    }, false);

    // On fais pareil quand l'utilisateur relache le clic de la souris
    canvas.addEventListener("pointerup", function(evt) {
        switch(evt.button) {
            case 0:
                if (_this.controlEnabled && _this.weaponShoot) {
                    _this.weaponShoot = false;
                    _this.handleUserMouseUp();
                }
                break;
                case 2:
                if (_this.controlEnabled && !_this.weaponAlt) {
                    _this.weaponAlt = false;
                    _this.handleUserMouseUp();
                }
                break;
        }
    }, false);

    // Changement des armes
    this.previousWheeling = 0;

    canvas.addEventListener("wheel", function(evt) {
        // Si la différence entre les deux tour de souris sont minime
        if(Math.round(evt.timeStamp - _this.previousWheeling)>10){
            if(evt.deltaY<0){
                // Si on scroll vers le haut, on va chercher l'arme suivante
                _this.camera.weapons.nextWeapon(1);
            }else{
                // Si on scroll vers le haut, on va chercher l'arme précédente
                _this.camera.weapons.nextWeapon(-1);
            }
            //On affecte a previousWheeling la valeur actuelle
            _this.previousWheeling = evt.timeStamp;
        }
    }, false);

    // Initialisation de la caméra
    this._initCamera(this.game.scene, canvas); 

    // Le joueur doit cliquer dans la scène pour que controlEnabled soit changé
    this.controlEnabled = false;

    // On lance l'event _initPointerLock pour checker le clic dans la scène
    this._initPointerLock(); 

    // Affichage de la vie et de l'armure
    this.textHealth.innerText = this.camera.health;

    // Si je loueur peut sauter ou non
    _this.camera.canJump = true;

    // La hauteur de saut
    _this.jumpHeight = 3;

    // La hauteur du personnage
    _this.originHeight = _this.camera.playerBox.position.clone();
    window.addEventListener("keypress", function(evt) {
        switch(evt.code) {
            case "Space":
                if(_this.camera.canJump===true && !(evt.repeat)){
                    _this.camera.jumpNeed = _this.camera.playerBox.position.y + _this.jumpHeight;
    
                    _this.camera.canJump=false;
                    var data={
                        jumpNeed : _this.camera.jumpNeed
                    };
                    _this.sendNewData(data)
                }
                break;
            case "Digit1":
            _this.camera.weapons.selectWeapon(0);
            break;
            case "Digit2":
            _this.camera.weapons.selectWeapon(1);
            break;
            case "Digit3":
            _this.camera.weapons.selectWeapon(2);
            break;
            case "Digit4":
            _this.camera.weapons.selectWeapon(3);
            break;
        }
    }, false);
};

Player.prototype = {
    _initCamera : function(scene, canvas) {
        // Math.random nous donne un nombre entre 0 et 1
        let randomPoint = Math.random();

        // randomPoint fais un arrondis de ce chiffre et du nombre de spawnPoints
        randomPoint = Math.round(randomPoint * (this.game.allSpawnPoints.length - 1));

        // On dit que le spawnPoint est celui choisi selon le random plus haut
        this.spawnPoint = this.game.allSpawnPoints[randomPoint];

        var playerBox = BABYLON.Mesh.CreateBox("headMainPlayer", 3, scene);
        // On donne le sawnPoint avec clone() pour que celui ci ne soit pas affécté par le déplacement du joueur
        playerBox.position = this.spawnPoint.clone();
        playerBox.ellipsoid = new BABYLON.Vector3(2, 2, 2);
        playerBox.isPickable = false;

        // On crée la caméra
        this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, 0), scene);
        this.camera.playerBox = playerBox
        this.camera.parent = this.camera.playerBox;

        // Ajout des collisions avec playerBox
        this.camera.playerBox.checkCollisions = true;
        this.camera.playerBox.applyGravity = true;

        // Si le joueur est en vie ou non
        this.isAlive = true;

        // La santé du joueur
        this.camera.health = 100;
        // Pour savoir que c'est le joueur principal
        this.camera.isMain = true;

        // On crée les armes !
        this.camera.weapons = new Weapons(this);

        // On ajoute l'axe de mouvement
        this.camera.axisMovement = [false,false,false,false];

        // On réinitialise la position de la caméra
        //this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.canJump = true;
        this.game.scene.activeCamera = this.camera;

        var hitBoxPlayer = BABYLON.Mesh.CreateBox("hitBoxPlayer", 3, scene);
        hitBoxPlayer.parent = this.camera.playerBox;
        hitBoxPlayer.scaling.y = 2;
        hitBoxPlayer.isPickable = true;


    },
    handleUserMouseDown : function() {
        if(this.isAlive === true){
            this.camera.weapons.fire();
        }
    },
    handleUserMouseUp : function() {
        if(this.isAlive === true){
            this.camera.weapons.stopFire();
        }
    },
    _initPointerLock : function() {
        var _this = this;
        
        // Requete pour la capture du pointeur
        var canvas = this.game.scene.getEngine().getRenderingCanvas();
        canvas.addEventListener("click", function(evt) {
            canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
            if (canvas.requestPointerLock) {
                canvas.requestPointerLock();
            }
        }, false);

        // Evenement pour changer le paramètre de rotation
        var pointerlockchange = function (event) {
            _this.controlEnabled = (document.mozPointerLockElement === canvas || document.webkitPointerLockElement === canvas || document.msPointerLockElement === canvas || document.pointerLockElement === canvas);
            if (!_this.controlEnabled) {
                _this.rotEngaged = false;
            } else {
                _this.rotEngaged = true;
            }
        };
        
        // Event pour changer l'état du pointeur, sous tout les types de navigateur
        document.addEventListener("pointerlockchange", pointerlockchange, false);
        document.addEventListener("mspointerlockchange", pointerlockchange, false);
        document.addEventListener("mozpointerlockchange", pointerlockchange, false);
        document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
    },
    _checkMove : function(ratioFps){
        // On bouge le player en lui attribuant la caméra
        this._checkUniqueMove(ratioFps,this.camera);
        for (var i = 0; i < this.ghostPlayers.length; i++) {
            // On bouge chaque ghost présent dans ghstPlayers
            this._checkUniqueMove(ratioFps,this.ghostPlayers[i]);
        }
    },
    _checkUniqueMove : function(ratioFps, player) {
        let relativeSpeed = this.speed / ratioFps;
        var playerSelected = player
        // On regarde si c'est un ghost ou non (seul les ghost on un élément head)
        if(playerSelected.head){
            var rotationPoint = playerSelected.head.rotation;
        }else{
            var rotationPoint = playerSelected.playerBox.rotation;
        }
        if(playerSelected.axisMovement[0]){
            forward = new BABYLON.Vector3(
                parseFloat(Math.sin(parseFloat(rotationPoint.y))) * relativeSpeed / 1.4, 
                0, 
                parseFloat(Math.cos(parseFloat(rotationPoint.y))) * relativeSpeed / 1.4
            );
            playerSelected.playerBox.moveWithCollisions(forward);
        }
        if(playerSelected.axisMovement[1]){
            backward = new BABYLON.Vector3(
                parseFloat(-Math.sin(parseFloat(rotationPoint.y))) * relativeSpeed / 1.4, 
                0, 
                parseFloat(-Math.cos(parseFloat(rotationPoint.y))) * relativeSpeed / 1.4 * 0.9
            );
            playerSelected.playerBox.moveWithCollisions(backward);
        }
        if(playerSelected.axisMovement[2]){
            left = new BABYLON.Vector3(
                parseFloat(Math.sin(parseFloat(rotationPoint.y) + degToRad(-90))) * relativeSpeed / 1.4, 
                0, 
                parseFloat(Math.cos(parseFloat(rotationPoint.y) + degToRad(-90))) * relativeSpeed / 1.4
            );
            playerSelected.playerBox.moveWithCollisions(left);
        }
        if(playerSelected.axisMovement[3]){
            right = new BABYLON.Vector3(
                parseFloat(-Math.sin(parseFloat(rotationPoint.y) + degToRad(-90))) * relativeSpeed / 1.4, 
                0, 
                parseFloat(-Math.cos(parseFloat(rotationPoint.y) + degToRad(-90))) * relativeSpeed / 1.4
            );
            playerSelected.playerBox.moveWithCollisions(right);
        }
        if(playerSelected.jumpNeed){
            // Lerp 
            percentMove = playerSelected.jumpNeed - playerSelected.playerBox.position.y;
            // Axe de mouvement
            up = new BABYLON.Vector3(0,percentMove/4 *  relativeSpeed,0);
            playerSelected.playerBox.moveWithCollisions(up);
            // On vérifie si le joueur a atteind la hauteur désiré
            if(playerSelected.playerBox.position.y + 1 > playerSelected.jumpNeed || this.game._ArenaData.plafond.intersectsMesh(playerSelected.playerBox)){
                // Si c'est le cas, on prépare airTime
                playerSelected.airTime = 0;
                playerSelected.jumpNeed = false;
            }
        }else{

            // On trace un rayon depuis le joueur
            var rayPlayer = new BABYLON.Ray(playerSelected.playerBox.position,new BABYLON.Vector3(0,-1,0));

            // On regarde quel est le premier objet qu'on touche
            // On exclue tout les mesh qui appartiennent au joueur
            var distPlayer = this.game.scene.pickWithRay(rayPlayer, function (item) {
                if (item.name == "hitBoxPlayer" || item.id == "headMainPlayer" || item.id == "bodyGhost"  ||  item.isPlayer || item.id == 'weaponHand')
                    return false;
                else
                    return true;
            });
            
            // isMain permet de vérifier si c'est le joueur
            if(playerSelected.isMain){
                var targetHeight = this.originHeight.y;
            }else{
                // si c'est un ghost, on fixe la hauteur à 3 
                var targetHeight = 3;
            }
            if(distPlayer.distance <= targetHeight){
                if(playerSelected.isMain && !playerSelected.canJump){
                    playerSelected.canJump = true;
                }
                playerSelected.airTime = 0;
            }else{
                playerSelected.airTime++;
                playerSelected.playerBox.moveWithCollisions(new BABYLON.Vector3(0,(-playerSelected.airTime/30) * relativeSpeed ,0));
            }
        }
    },
    getDamage : function(damage, whoDamage){
        var damageTaken = damage;

        if(this.camera.health>damageTaken){
            this.camera.health-=damageTaken;
            if(this.camera.isMain){
                this.textHealth.innerText = this.camera.health;
            }
        }else{
            if(this.camera.isMain){
                this.textHealth.innerText = 0;
            }
            this.playerDead(whoDamage)
        }
    },
    playerDead : function(whoKilled) {
        if(this.displayAnnouncement.classList.contains("annoucementClose")){
            this.displayAnnouncement.classList.remove("annoucementClose");
        }
        this.textDisplayAnnouncement.style.fontSize = '1rem';
        this.textDisplayAnnouncement.innerText = 'Vous êtes mort';

        // Fonction appelé pou annoncer la destruction du joueur
        sendPostMortem(whoKilled);

        this.deadCamera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 
        1, 0.8, 10, new BABYLON.Vector3(
            this.camera.playerBox.position.x, 
            this.camera.playerBox.position.y, 
            this.camera.playerBox.position.z), 
        this.game.scene);
        
        this.game.scene.activeCamera = this.deadCamera;
        this.deadCamera.attachControl(this.game.scene.getEngine().getRenderingCanvas());

        // Suppression de la playerBox
        this.camera.playerBox.dispose();

        // Suppression de la camera
        this.camera.dispose();   

        // Suppression des armes
        var inventoryWeapons = this.camera.weapons.inventory;
        for (var i = 0; i < inventoryWeapons.length; i++) {
            inventoryWeapons[i].dispose();
        }
        inventoryWeapons = [];

        // On signale a Weapon que le joueur est mort
        this.isAlive=false;

        var newPlayer = this;
        var canvas = this.game.scene.getEngine().getRenderingCanvas();
        setTimeout(function(){ 
            newPlayer._initCamera(newPlayer.game.scene, canvas, newPlayer.spawnPoint);
            newPlayer.displayAnnouncement.classList.add("annoucementClose");
            newPlayer.launchRessurection();
        }, 4000);
    },
    newDeadEnnemy : function(nameKilled){
        var _this = this;
        // Si le nombre de kill d'affilé est a 0
        if(this.killStreak === 0){
            // On fixe la taille du texte à 1rem
            this.textDisplayAnnouncement.style.fontSize = '1rem';
            // De base, si aucun nom n'est donné, on dit que Bob a été tué
            var messageDisplay = "Vous avez tué Bob"
            if(nameKilled){
                // Si il y a un nom de donné, on affiche le nom
                var messageDisplay = "Vous avez tué " + nameKilled;
            }
        }else{
            // On va chercher les messages de kill dans Armory
            var multiKillAnouncement = this.camera.weapons.Armory.multiKillAnnoucement;
            // Si on a deja tué plus d'une personne
            // Et si on a pas atteind la limite des 15 messages
            if(this.killStreak<=multiKillAnouncement.length){
                // On affiche le message associé au nombre de kills
                var messageDisplay = multiKillAnouncement[this.killStreak-1];
                // On augmente la taille du texte proportionellement à la rareté du message
                this.textDisplayAnnouncement.style.fontSize = (1+(this.killStreak/1.2))+'rem';
            }else{
                // Si on a atteind la limite de message disponible
                // On affiche le dernier de la liste
                var messageDisplay = multiKillAnouncement[multiKillAnouncement.length-1]
            }
            
        }
        // On augmente le nombre de tués à la suite
        this.killStreak++;

        // Si l'annonceur est fermé
        if(this.displayAnnouncement.classList.contains("annoucementClose")){
            // On l'ouvre
            this.displayAnnouncement.classList.remove("annoucementClose");
        }
        // On affiche ce qui est contenu dans messageDisplay
        this.textDisplayAnnouncement.innerText = messageDisplay;

        // Si le compteur a été créé, on le réinitialise
        if(this.timerKillStreak){
            clearTimeout(this.timerKillStreak);
        }
        // On set le compteur à 3 secondes. 
        // Passé ce délai, le jeu fais repasser le compteur de kill à 0 
        // Et ferme la fenêtre de messages
        this.timerKillStreak = setTimeout(function(){ 
            _this.killStreak = 0;
            
            if(!_this.displayAnnouncement.classList.contains("annoucementClose")){
                _this.displayAnnouncement.classList.add("annoucementClose");

            }
        }, 3000);
    },
    // Donner un heal au joueur
    givePlayerHeal : function(what,howMany) {
        
        var typeHeal = what;
        var amountHeal = howMany;
        if(typeHeal === 'health'){
            if(this.camera.health + amountHeal>100){
                this.camera.health = 100;
            }else{
                this.camera.health += amountHeal;
            }
        }
        this.textHealth.innerText = this.camera.health;
    },
    // FONCTIONS MULTIJOUEUR
    sendNewData : function(data){
        updateGhost(data);
    },
    launchRessurection : function(){
        ressurectMe();
    },
    sendActualData : function(){
        return {
            actualTypeWeapon : this.camera.weapons.actualWeapon,
            life : this.camera.health,
            position  : this.camera.playerBox.position,
            rotation : this.camera.playerBox.rotation,
            axisMovement : this.camera.axisMovement
        }
    },
    updateLocalGhost : function(data){
        ghostPlayers = this.ghostPlayers;
        
        for (var i = 0; i < ghostPlayers.length; i++) {
            if(ghostPlayers[i].idRoom === data.id){
                var boxModified = ghostPlayers[i].playerBox;
                // On applique un correctif sur Y, qui semble tre au mauvais endroit
                if(data.position){
                    boxModified.position = new BABYLON.Vector3(data.position.x,data.position.y-2.76,data.position.z);
                }
                if(data.axisMovement){
                    ghostPlayers[i].axisMovement = data.axisMovement;
                }
                if(data.rotation){
                    ghostPlayers[i].head.rotation.y = data.rotation.y;
                }
                if(data.jumpNeed){
                    ghostPlayers[i].jumpNeed = data.jumpNeed;
                }
                if(data.axisMovement){
                    ghostPlayers[i].axisMovement = data.axisMovement;
                }
            }
            
        }
    }
};