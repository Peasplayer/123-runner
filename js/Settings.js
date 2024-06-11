class Settings {
    static defaultOptions = { difficulty: 50, speedAmplifier: 0.0002, speedAmplifyingEvent: "frame", playerSize: 70,
        minObstacleSize: 40, maxObstacleMultiplier: 3, boost: 0.2, gravity: 0.3 };
    static currentOptions;

    static applySettings() {
        let cookies = document.cookie.split(";");
        let optionCookie = cookies?.find(cookie => cookie?.includes("settings="))?.replace("settings=", "");
        this.currentOptions = optionCookie ? JSON.parse(optionCookie) : this.defaultOptions;

        document.getElementById("difficulty").value = this.currentOptions.difficulty;
        document.getElementById("speedAmplifier").value = this.currentOptions.speedAmplifier;
        document.getElementById("speedAmplifyingEvent").value = this.currentOptions.speedAmplifyingEvent;
        document.getElementById("playerSize").value = this.currentOptions.playerSize;
        document.getElementById("minObstacleSize").value = this.currentOptions.minObstacleSize;
        document.getElementById("maxObstacleMultiplier").value = this.currentOptions.maxObstacleMultiplier;
        document.getElementById("boost").value = this.currentOptions.boost;
        document.getElementById("gravity").value = this.currentOptions.gravity;
    }

    static saveSettings() {
        var settingsObject = {
            difficulty: parseInt(document.getElementById("difficulty").value),
            speedAmplifier: parseFloat(document.getElementById("speedAmplifier").value),
            speedAmplifyingEvent: document.getElementById("speedAmplifyingEvent").value,
            playerSize: parseInt(document.getElementById("playerSize").value),
            minObstacleSize: parseInt(document.getElementById("minObstacleSize").value),
            maxObstacleMultiplier: parseInt(document.getElementById("maxObstacleMultiplier").value),
            boost: parseFloat(document.getElementById("boost").value),
            gravity: parseFloat(document.getElementById("gravity").value)
        }

        this.currentOptions = settingsObject;
        document.cookie = "settings=" + JSON.stringify(settingsObject);
    }
    static loadSettings(){
        let cookies = document.cookie.split(";");
        let optionCookie = cookies?.find(cookie => cookie?.includes("settings="))?.replace("settings=", "");
        this.currentOptions = optionCookie ? JSON.parse(optionCookie) : this.defaultOptions;
    }
}