const app = new Vue({
    el: "#tinyWeather",
    data: {
        location: "-",
        todayForecast: null,
        dailyForecast: null,
        isLoading: true
    },
    methods: {
        getPositionAsync: function () {
            return new Promise(function (fulfill, reject) {
                navigator.geolocation.getCurrentPosition(fulfill, reject);
            })
        },
        loadForecast: async function () {
            try {
                this.isLoading = true;

                const position = await this.getPositionAsync();
                const response = await fetch(`https://tiny-weather.azurewebsites.net/report/${position.coords.latitude}/${position.coords.longitude}`);

                if (!response.ok) {
                    throw new Error("Failed to get weather report.");
                }

                const report = await response.json();

                this.location = report.timezone.replace("/", " - ");
                this.todayForecast = report.currently;
                this.dailyForecast = report.daily.data;

                // Drop the first entry that describes today.
                this.dailyForecast.shift();

                this.isLoading = false;

            } catch (error) {
                this.isLoading = false;
                alert(error.message);
            }
        },
        hasGeolocation: function () {
            return 'geolocation' in navigator;
        }
    },
    mounted: function () {
        if (!this.hasGeolocation()) {
            alert("This app requires access to your location.");
            console.error("Geolocation not present or disabled!");
            return;
        }

        this.loadForecast();

        document.addEventListener("visibilitychange", this.loadForecast);
        window.addEventListener("online", this.loadForecast);
    }
});

const isOnlineToaster = new Vue({
    el: "#onlineToaster",
    data: {
        isOnline: navigator.onLine
    },
    mounted: function () {
        window.addEventListener("online", () => {
            this.isOnline = true;
            console.log("Device is online!");
        });

        window.addEventListener("offline", () => {
            this.isOnline = false
            console.warn("Device is offline!");
        });
    }
});

const iconMap = {
    "clear-day": "☀️",
    "clear-night": "🌕",
    "rain": "🌧️",
    "snow": "🌨️",
    "sleet": "🌨️", // No emoji for this.
    "wind": "💨",
    "fog": "🌫️",
    "cloudy": "☁️",
    "partly-cloudy-day": "⛅",
    "partly-cloudy-night": "🌧️" // Also missing.
};

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("worker.js");
}