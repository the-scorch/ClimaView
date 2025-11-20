export default function HourlyForecast({ data }) {
  if (!data || !data.time) {
    return null;
  }

  const hours = data.time.slice(0, 6).map((time, index) => ({
    time,
    temp: Math.round(data.temperature_2m[index]),
    weatherCode: data.weather_code[index],
    isDay: data.is_day[index],
  }));

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    const hour = date.getHours();
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  const getWeatherShort = (code, isDay) => {
    if ((code === 0 || code === 1) && isDay) return "Sunny";
    if ((code === 0 || code === 1) && !isDay) return "Clear Night";
    if (code === 2 || code === 3) return "Cloudy";
    if (code >= 45 && code <= 48) return "Foggy";
    if (code >= 51 && code <= 82) return "Rainy";
    if (code >= 85 && code <= 86) return "Snowy";
    if (code >= 95 && code <= 99) return "Stormy";
    return isDay ? "Clear" : "Clear Night";
  };

  return (
    <div className="rounded-2xl bg-secondary/30 p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        Hourly Forecast
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {hours.map((hour, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-2 rounded-xl bg-card border border-border p-4"
          >
            <span className="text-xs font-medium text-muted-foreground">
              {formatTime(hour.time)}
            </span>
            <span className="text-2xl font-bold text-foreground">
              {hour.temp}°
            </span>
            <span className="text-xs text-muted-foreground">
              {getWeatherShort(hour.weatherCode, hour.isDay)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
