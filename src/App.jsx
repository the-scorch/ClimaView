import { useState, useEffect } from "react";
import SearchBar from "./components/search-bar";
import { getWeatherDescription } from "../lib/weather-utils";
import HourlyForecast from "./components/hourly-forecast";
import WeatherSummary from "./components/weather-summary";

export default function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("Ghaziabad");

  // Fetch weather on city change
  useEffect(() => {
    fetchWeather(city);
  }, [city]);

  // Fetch weather on first load using GPS
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          console.warn("GPS not available or permission denied:", error);
          fetchWeather(city); // fallback
        }
      );
    } else {
      fetchWeather(city);
    }
  }, []);

  // Fetch weather by city name
  const fetchWeather = async (location) => {
    setLoading(true);
    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          location
        )}&count=1&language=en&format=json`
      );
      const geoData = await geoResponse.json();

      if (geoData.results && geoData.results.length > 0) {
        const { latitude, longitude, name, country } = geoData.results[0];

        const [weatherResponse, airQualityResponse] = await Promise.all([
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,is_day&hourly=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=7`
          ),
          fetch(
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm10,pm2_5&timezone=auto`
          ),
        ]);

        const weather = await weatherResponse.json();
        const airQuality = await airQualityResponse.json();

        setWeatherData({
          location: `${name}, ${country}`,
          current: weather.current,
          hourly: weather.hourly,
          daily: weather.daily,
          airQuality: airQuality.current,
        });
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather by coordinates (GPS)
  const fetchWeatherByCoords = async (latitude, longitude) => {
    setLoading(true);
    try {
      // Reverse geocoding to get location name
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`
      );
      const geoData = await geoResponse.json();

      const locationName =
        geoData.results && geoData.results.length > 0
          ? `${geoData.results[0].name}, ${geoData.results[0].country}`
          : "Your Location";

      const [weatherResponse, airQualityResponse] = await Promise.all([
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,is_day&hourly=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=7`
        ),
        fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm10,pm2_5&timezone=auto`
        ),
      ]);

      const weather = await weatherResponse.json();
      const airQuality = await airQualityResponse.json();

      setWeatherData({
        location: locationName,
        current: weather.current,
        hourly: weather.hourly,
        daily: weather.daily,
        airQuality: airQuality.current,
      });
    } catch (error) {
      console.error("Error fetching weather:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchCity) => {
    setCity(searchCity);
  };

  function getCurrentDate() {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  function Clock() {
    const [time, setTime] = useState(getCurrentTime());

    useEffect(() => {
      const interval = setInterval(() => {
        setTime(getCurrentTime());
      }, 60 * 1000);

      setTime(getCurrentTime());

      return () => clearInterval(interval);
    }, []);

    return <div>{time}</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} />
        </div>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-foreground" />
          </div>
        ) : weatherData ? (
          <div className="rounded-3xl bg-card border border-border p-8 md:p-12">
            <div className="mb-12 flex flex-wrap items-start justify-between gap-4">
              <div className="text-3xl font-medium text-foreground">
                {weatherData.location.split(",")[0]}
              </div>
              <div className="text-3xl font-medium text-foreground">
                {getCurrentDate()}
              </div>
              <div className="text-xl font-medium text-muted-foreground">
                <div className="flex flex-col justify-center items-end">
                  <div className="text-3xl font-bold  text-foreground">
                    {getGreeting()}
                  </div>
                  <Clock />
                </div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
              <div className="space-y-8">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="mb-4 text-[200px] font-bold text-foreground">
                    {Math.round(weatherData.current.temperature_2m)}°
                  </div>
                  <div className="text-3xl text-muted-foreground">
                    {getWeatherDescription(weatherData.current.weather_code)}
                  </div>
                </div>

                <div>
                  <div className="mb-6 flex gap-3">
                    {weatherData.daily.time.slice(0, 6).map((date, index) => {
                      const dayNames = [
                        "Sun",
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                      ];
                      const forecastDate = new Date(date);
                      const dayName =
                        index === 0 ? "Today" : dayNames[forecastDate.getDay()];
                      const isToday = index === 0;
                      const maxTemp = Math.round(
                        isToday
                          ? weatherData.current.temperature_2m
                          : weatherData.daily.temperature_2m_max[index]
                      );
                      const weatherCode = isToday
                        ? weatherData.current.weather_code
                        : weatherData.daily.weather_code[index];
                      const weatherDesc =
                        getWeatherDescription(weatherCode).split(" ")[0];

                      return (
                        <div
                          key={index}
                          className="flex flex-1 flex-col items-center gap-3 rounded-2xl bg-secondary/50 p-4"
                        >
                          <div className="text-sm font-medium text-secondary-foreground">
                            {dayName}
                          </div>
                          <div className="text-xl font-bold text-secondary-foreground">
                            {maxTemp}°
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {weatherDesc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <WeatherSummary
                    current={weatherData.current}
                    airQuality={weatherData.airQuality}
                  />
                </div>

                <HourlyForecast data={weatherData.hourly} />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-12 text-center text-muted-foreground">
            <p>City not found. Please try again.</p>
          </div>
        )}
      </div>
    </div>
  );
}
