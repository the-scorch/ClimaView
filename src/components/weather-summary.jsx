import { Droplets, Activity, Wind } from "lucide-react";

function getAQILevel(aqi) {
  if (aqi <= 50) return { level: "Good", color: "text-green-400" };
  if (aqi <= 100) return { level: "Moderate", color: "text-yellow-400" };
  if (aqi <= 150)
    return { level: "Unhealthy for Sensitive", color: "text-orange-400" };
  if (aqi <= 200) return { level: "Unhealthy", color: "text-red-400" };
  if (aqi <= 300) return { level: "Very Unhealthy", color: "text-purple-400" };
  return { level: "Hazardous", color: "text-red-600" };
}

function getWeatherDescription(code) {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Clear";
  if (code === 2) return "Cloudy";
  if (code === 3) return "Cloudy";
  if (code >= 45 && code <= 48) return "Foggy";
  if (code >= 51 && code <= 67) return "Rainy";
  if (code >= 71 && code <= 77) return "Snowy";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 85 && code <= 86) return "Snow showers";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "Clear";
}

export default function WeatherSummary({ current, airQuality }) {
  if (!current) {
    return null;
  }

  const temp = Math.round(current.temperature_2m);
  const feelsLike = Math.round(current.apparent_temperature);
  const humidity = current.relative_humidity_2m;
  const aqiData =
    airQuality && airQuality.us_aqi
      ? getAQILevel(Math.round(airQuality.us_aqi))
      : null;

  return (
    <div className="rounded-2xl bg-secondary/30 p-6 space-y-4">
      {/* Temperature and feels like */}
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-foreground">{temp}°</span>
        <span className="text-sm text-muted-foreground">
          Feels like {feelsLike}°
        </span>
      </div>

      {/* Weather metrics with icons */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">6.1 mph</span>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{humidity}%</span>
        </div>
        {aqiData && (
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className={`text-sm font-medium ${aqiData.color}`}>
              AQI: {Math.round(airQuality.us_aqi)} - {aqiData.level}
            </span>
          </div>
        )}
      </div>

      <div className="pt-2 text-sm text-muted-foreground">
        {getWeatherDescription(current.weather_code)}
      </div>
    </div>
  );
}
