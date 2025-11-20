export function getWeatherIcon(code, isDay = 1) {
	// WMO Weather interpretation codes with day/night support
	if (code === 0) return isDay ? "☀️" : "🌙";
	if (code === 1 || code === 2) return isDay ? "⛅" : "🌙";
	if (code === 3) return "☁️";
	if (code >= 45 && code <= 48) return "🌫️";
	if (code >= 51 && code <= 67) return "🌧️";
	if (code >= 71 && code <= 77) return "❄️";
	if (code >= 80 && code <= 82) return "🌦️";
	if (code >= 85 && code <= 86) return "🌨️";
	if (code >= 95 && code <= 99) return "⛈️";
	return isDay ? "☀️" : "🌙";
}

export function getWeatherDescription(code) {
	if (code === 0) return "Clear sky";
	if (code === 1) return "Clear";
	if (code === 2) return "Partly cloudy";
	if (code === 3) return "Overcast";
	if (code >= 45 && code <= 48) return "Foggy";
	if (code >= 51 && code <= 67) return "Rainy";
	if (code >= 71 && code <= 77) return "Snowy";
	if (code >= 80 && code <= 82) return "Rain showers";
	if (code >= 85 && code <= 86) return "Snow showers";
	if (code >= 95 && code <= 99) return "Thunderstorm";
	return "Clear";
}
