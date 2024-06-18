class AudioManager {
    constructor() {
        this.sounds = {};
        this.musicFiles = [];
        this.currentMusic = null;
    }

    loadSound(name, src){
        var audio = new Audio(src);
        this.sounds[name] = audio;
    }

    loadMusic(name, src){
        this.musicFiles.push({ name, src });
    }

    playSound(name, loop = false, volume = 1.0){
        if (this.sounds[name]){
            this.sounds[name].loop = loop;
            this.sounds[name].volume = volume;
            this.sounds[name].play();
        }
    }

    stopSound(name){
        if (this.sounds[name]){
            this.sounds[name].pause();
            this.sounds[name].currentTime = 0;
        }
    }
    stopAllSounds(){
        for (let name in this.sounds){
            this.stopSound(name);
        }
    }
    playRandomMusic(){
        var randomIndex = Math.floor(Math.random() * this.musicFiles.length);
        var randomMusic = this.musicFiles[randomIndex];
        if (this.currentMusic == randomMusic.name)
            this.playRandomMusic();
        this.currentMusic = randomMusic.name;
        this.loadSound(randomMusic.name, randomMusic.src);
        this.playSound(randomMusic.name, true, 0.25); 
    }
}