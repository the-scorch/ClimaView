import { getWeatherIcon, getWeatherDescription } from "@/lib/weather-utils"

export default function WeatherCard({ data }) {
  const { location, current } = data
  const temp = Math.round(current.temperature_2m)
  const feelsLike = Math.round(current.apparent_temperature)
  const weatherIcon = getWeatherIcon(current.weather_code, current.is_day)
  const weatherDesc = getWeatherDescription(current.weather_code)

  return (
    <div className="rounded-2xl bg-card border border-border p-8 md:p-10">
      <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
        {/* Location and Description */}
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">{location}</h2>
          <p className="text-lg text-muted-foreground">{weatherDesc}</p>
        </div>

        {/* Temperature */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-7xl md:text-8xl">{weatherIcon}</div>
          <div className="text-center">
            <div className="text-6xl font-bold leading-none text-foreground md:text-7xl">{temp}°</div>
            <p className="mt-2 text-sm text-muted-foreground">Feels like {feelsLike}°</p>
          </div>
        </div>
      </div>
    </div>
  )
}
