import { Droplets, Gauge, Activity } from "lucide-react";

function getAQILevel(aqi) {
  if (aqi <= 50) return { level: "Good", color: "text-green-400" };
  if (aqi <= 100) return { level: "Moderate", color: "text-yellow-400" };
  if (aqi <= 150)
    return { level: "Unhealthy for Sensitive", color: "text-orange-400" };
  if (aqi <= 200) return { level: "Unhealthy", color: "text-red-400" };
  if (aqi <= 300) return { level: "Very Unhealthy", color: "text-red-500" };
  return { level: "Hazardous", color: "text-red-600" };
}

export default function WeatherDetails({ current, airQuality }) {
  if (!current) {
    return null;
  }

  const details = [
    {
      icon: Droplets,
      label: "Humidity",
      value: `${current.relative_humidity_2m}%`,
    },
    {
      icon: Gauge,
      label: "Precipitation",
      value: `${current.precipitation} mm`,
    },
    ...(airQuality && airQuality.us_aqi
      ? [
          {
            icon: Activity,
            label: "Air Quality",
            value: Math.round(airQuality.us_aqi),
            aqiLevel: getAQILevel(Math.round(airQuality.us_aqi)),
          },
        ]
      : []),
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {details.map((detail, index) => {
        const Icon = detail.icon;
        return (
          <div
            key={index}
            className="rounded-2xl bg-card border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-secondary p-2">
                <Icon className="h-5 w-5 text-secondary-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {detail.label}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {detail.value}
              </p>
              {detail.aqiLevel && (
                <p
                  className={`text-sm font-semibold mt-1 ${detail.aqiLevel.color}`}
                >
                  {detail.aqiLevel.level}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
