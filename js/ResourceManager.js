class ResourceManager {
    static Ghost_Normal = { src: "resources/ghost/normal.png", cols: 5, rows: 5, frames: 22, scale: 1.7 };
    static Ghost_Shield = { src: "resources/ghost/shield.png", cols: 4, rows: 4, frames: 13, scale: 1.7 };
    static Ghost_Shield_2 = { src: "resources/ghost/shield_2.png", cols: 1, rows: 1, frames: 1, scale: 1.7 };
    static Ghost_Book = { src: "resources/ghost/book.png", cols: 4, rows: 4, frames: 13, scale: 1.7 };
    static Ghost_Book_2 = { src: "resources/ghost/book_2.png", cols: 1, rows: 1, frames: 1, scale: 1.7 };
    static Ghost_Damage = { src: "resources/ghost/damage.png", cols: 3, rows: 3, frames: 9, scale: 1.7 };
    static Ghost_Death = { src: "resources/ghost/death.png", cols: 5, rows: 6, frames: 27, scale: 1.7};
    static Ghost_Shoot = { src: "resources/ghost/attack.png", cols: 4, rows: 4, frames: 13, scale: 1.7 };

    static Attack_Cat = { src: "resources/attack_cat.png", cols: 4, rows: 5, frames: 12, scale: 16 };

    static Enemy_Slime = { src: "resources/enemy/slime.png", cols: 3, rows: 3, frames: 9, scale: 1 };
    static Enemy_Witch = { src: "resources/enemy/witch.png", cols: 3, rows: 5, frames: 13, scale: 1 };
    static Enemy_Cloud_1 = { src: "resources/enemy/cloud_1.png", cols: 1, rows: 1, frames: 1, scale: 1 };
    static Enemy_Cloud_2 = { src: "resources/enemy/cloud_2.png", cols: 1, rows: 1, frames: 1, scale: 1 };
    static Enemy_Cloud_3 = { src: "resources/enemy/cloud_3.png", cols: 1, rows: 1, frames: 1, scale: 1 };

    static Item_Heart = { src: "resources/item/heart.png", cols: 3, rows: 3, frames: 7, scale: 2.1 };
    static Item_Shield = { src: "resources/item/shield.png", cols: 4, rows: 5, frames: 19, scale: 1.2 };
    static Item_Book = { src: "resources/item/book.png", cols: 2, rows: 3, frames: 5, scale: 1.4 };
    static Item_Watch = { src: "resources/item/watch.png", cols: 4, rows: 5, frames: 19, scale: 2 };

    static Background_Forest = { src: "resources/background/forest.jpg", cols: 1, rows: 1, frames: 1, scale: 1 };
    static Background_BlauerWald = { src: "resources/background/blauer_wald.jpg", cols: 1, rows: 1, frames: 1, scale: 1 };
    static Background_Sumpf = {src: "resources/background/sumpf.jpg", cols: 1, rows: 1, frames: 1, scale: 1 };
    static Background_EyeLaend = {src: "resources/background/eyelaend.jpg", cols: 1, rows: 3, frames: 3, scale: 1, ticksPerFrame: 15 };
    static Background_YipiLaend = {src: "resources/background/yippie_laend.jpg", cols: 1, rows: 1, frames: 1, scale: 1 };
    static Background_Apocalypse = {src: "resources/background/apocalyptic.jpg", cols: 1, rows: 1, frames: 1, scale: 1 };


    static Portal_Blue = { src: "resources/portal/blue.png", cols: 3, rows: 2, frames: 4, scale: 1 };
    static Portal_Green = { src: "resources/portal/green.png", cols: 3, rows: 2, frames: 4, scale: 1 };
    static Portal_Purple = { src: "resources/portal/purple.png", cols: 3, rows: 2, frames: 4, scale: 1 };

    static LoadAudios(){
        // Sounds
        audioManager.loadSound('portal', 'resources/sound/Portal.mp3');
        audioManager.loadSound('damage', 'resources/sound/Herz_weniger.mp3');
        audioManager.loadSound('one-heart', 'resources/sound/One_Heart.mp3');
        audioManager.loadSound('Hauptmenu', 'resources/sound/Hauptmenu.mp3');
        audioManager.loadSound('extra-heart', 'resources/sound/Herz_dazu.mp3');
        audioManager.loadSound('powerup', 'resources/sound/PowerUp.mp3');
        audioManager.loadSound('shield-brocken', 'resources/sound/Shield_kaputt.mp3');
        audioManager.loadSound('slime-jump', 'resources/sound/Huepf.mp3');
        audioManager.loadSound('slime-land', 'resources/sound/Landen.mp3');
        audioManager.loadSound('player-shoot', 'resources/sound/Angriff_sound.mp3');
        audioManager.loadSound('game-over', 'resources/sound/GameOverSound.mp3');

        // Music
        audioManager.loadMusic('Musik7', 'resources/sound/Musik1.mp3');
        audioManager.loadMusic('Musik1', 'resources/sound/Musik2.mp3');
        audioManager.loadMusic('Musik2', 'resources/sound/Musik3.mp3');
        audioManager.loadMusic('Musik3', 'resources/sound/Musik4.mp3');
        audioManager.loadMusic('Musik4', 'resources/sound/Musik5.mp3');
        audioManager.loadMusic('Musik5', 'resources/sound/Musik6.mp3');
        audioManager.loadMusic('Musik6', 'resources/sound/Musik7.mp3');
    }
}