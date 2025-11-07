document.addEventListener("DOMContentLoaded", function () {
	const startBtn = document.getElementById("start-btn");
	const landing = document.getElementById("landing");
	const mainApp = document.getElementById("main-app");

	if (startBtn) {
		startBtn.onclick = function () {
			landing.style.opacity = "0";
			landing.style.transition = "opacity 0.3s ease-out";
			setTimeout(() => {
				landing.style.display = "none";
				mainApp.style.display = "block";
				mainApp.style.opacity = "0";
				document.body.classList.add("dashboard-bg");
				setTimeout(() => {
					mainApp.style.transition = "opacity 0.3s ease-in";
					mainApp.style.opacity = "1";
					document.getElementById("city-input").focus();
				}, 30);
			}, 320);
		};
	}
});

let lastQuery = "";
let dashboardCities = [];
let debounceTimer = null;

const TOKEN = "900705c526bf99539259010e010655a23666be2c"; // API token for air quality

const dashboard = document.getElementById("city-dashboard");
const infoToast = document.getElementById("info-toast");
let cityAddCount = 0;

function showToast(message, position = "top", timeout = 3500) {
	infoToast.textContent = message;
	infoToast.className = "dashboard-toast " + position + " visible";
	infoToast.style.display = "block";

	if (position === "bottom") {
		setTimeout(() => {
			const lastCard = dashboard.lastElementChild;
			if (lastCard)
				lastCard.scrollIntoView({ behavior: "smooth", block: "center" });
		}, 450);
	}

	setTimeout(function () {
		infoToast.classList.remove("visible");
		setTimeout(function () {
			infoToast.style.display = "none";
		}, 350);
	}, timeout);
}

// weather icons based on codes
const weatherIcon = (code) =>
	code === 0
		? "☀️"
		: [1, 2, 3].includes(code)
			? "⛅"
			: [45, 48].includes(code)
				? "🌫️"
				: [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)
					? "🌧️"
					: [71, 73, 75, 77, 85, 86].includes(code)
						? "❄️"
						: [95, 96, 99].includes(code)
							? "⛈️"
							: "❓";

function aqiDesc(aqi) {
	if (aqi <= 50) return "Good";
	if (aqi <= 100) return "Moderate";
	if (aqi <= 150) return "Unhealthy for Sensitive Groups";
	if (aqi <= 200) return "Unhealthy";
	if (aqi <= 300) return "Very Unhealthy";
	return "Hazardous";
}

function healthAdvice(aqi) {
	if (aqi == null) return "";
	if (aqi <= 50) return "Air quality is good.";
	if (aqi <= 100) return "Moderate: Ok for most.";
	if (aqi <= 150) return "Sensitive groups: Consider mask.";
	if (aqi <= 200) return "Unhealthy: Wear mask, limit outdoor time.";
	if (aqi <= 300) return "Very Unhealthy: Avoid going outside.";
	return "Hazardous: Stay indoors.";
}

function weatherAdvice(temp, code) {
	if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code))
		return "Rain expected, carry umbrella.";
	if (temp < 10) return "Wear a heavy jacket.";
	if (temp < 20) return "Light jacket recommended.";
	if (temp > 35) return "Stay hydrated, wear comfortable clothing.";
	return "Dress comfortably for the day.";
}

function formatLocation(place, query) {
	const parts = [];
	if (place.name) parts.push(place.name);
	if (place.admin1) parts.push(place.admin1);
	const cityRegion = parts.join(", ");
	const country = place.country ? ` - ${place.country}` : "";

	let matchIdx = cityRegion
		.toLowerCase()
		.indexOf(query ? query.toLowerCase() : "");
	if (matchIdx >= 0 && query) {
		return (
			cityRegion.slice(0, matchIdx) +
			'<span class="highlight">' +
			cityRegion.slice(matchIdx, matchIdx + query.length) +
			"</span>" +
			cityRegion.slice(matchIdx + query.length) +
			country
		);
	}
	return cityRegion + country;
}

async function addCityCard(lat, lon, label) {
	const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,apparent_temperature,precipitation,relative_humidity_2m,weathercode,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,weathercode,windspeed_10m_max&current_weather=true&timezone=auto`;
	const weatherRes = await fetch(weatherUrl);
	const data = await weatherRes.json();

	let aqiInfo = null;
	if (TOKEN) {
		try {
			const aqiRes = await fetch(
				`https://api.waqi.info/feed/geo:${lat};${lon}/?token=${TOKEN}`,
			);
			const aqiData = await aqiRes.json();
			if (
				aqiData.status === "ok" &&
				aqiData.data &&
				typeof aqiData.data.aqi !== "undefined"
			) {
				aqiInfo = {
					aqi: aqiData.data.aqi,
					desc: aqiDesc(aqiData.data.aqi),
				};
			} else {
				aqiInfo = { aqi: "--", desc: "Unavailable" };
			}
		} catch (err) {
			aqiInfo = { aqi: "--", desc: "Unavailable" };
		}
	} else {
		aqiInfo = { aqi: "--", desc: "No API Token" };
	}

	const card = document.createElement("div");
	card.className = "weather-card";
	card.innerHTML = `
      <button class="remove-btn">✖</button>
      <div class="city-header">
        <div class="main-weather-icon">${weatherIcon(data.current_weather.weathercode)}</div>
        <span class="main-temp">${Math.round(data.current_weather.temperature)}°</span>
        <span class="city-name">${label}</span>
      </div>
      <div class="advice-box">${weatherAdvice(data.current_weather.temperature, data.current_weather.weathercode)}</div>
      <div class="aqi-box" style="display:block;">
        AQI: <span>${aqiInfo.aqi}</span> <span>${aqiInfo.desc}</span>
        <br/><span>${healthAdvice(aqiInfo.aqi)}</span>
      </div>
      <div class="weather-details">
        <div class="wd-box"><span class="wd-icon">🌡️</span>High:<span class="wd-val">${Math.round(data.daily.temperature_2m_max[0])}°</span></div>
        <div class="wd-box"><span class="wd-icon">🌡️</span>Low:<span class="wd-val">${Math.round(data.daily.temperature_2m_min[0])}°</span></div>
        <div class="wd-box"><span class="wd-icon">🤗</span>Feels High:<span class="wd-val">${Math.round(data.daily.apparent_temperature_max[0])}°</span></div>
        <div class="wd-box"><span class="wd-icon">🤗</span>Feels Low:<span class="wd-val">${Math.round(data.daily.apparent_temperature_min[0])}°</span></div>
        <div class="wd-box"><span class="wd-icon">💨</span>Wind:<span class="wd-val">${Math.round(data.daily.windspeed_10m_max[0])} mph</span></div>
        <div class="wd-box"><span class="wd-icon">💧</span>Precip:<span class="wd-val">${data.daily.precipitation_sum[0]?.toFixed(2) ?? "--"} in</span></div>
      </div>
      <div class="daily-forecast"></div>
      <div class="hourly-forecast">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th></th>
              <th>Temp</th>
              <th>Feels</th>
              <th>Wind</th>
              <th>Precip</th>
              <th>Humidity</th>
              <th>AQI</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    `;

	card.querySelector(".remove-btn").onclick = () => {
		dashboard.removeChild(card);
		dashboardCities = dashboardCities.filter((c) => c.label !== label);
	};

	const dailyDiv = card.querySelector(".daily-forecast");
	for (let i = 0; i < 7; i++) {
		const day = new Date(data.daily.time[i]);
		const dailyCard = document.createElement("div");
		dailyCard.className = "daily-card" + (i === 0 ? " selected" : "");
		dailyCard.innerHTML = `<div class="icon">${weatherIcon(data.daily.weathercode[i])}</div>
         <div>${day.toLocaleDateString("en-US", { weekday: "short" })}</div>
         <div>${Math.round(data.daily.temperature_2m_max[i])}°</div>`;

		dailyCard.onclick = () => {
			dailyDiv
				.querySelectorAll(".daily-card")
				.forEach((el, idx) => el.classList.toggle("selected", idx === i));
			updateHourly(card, data, i, aqiInfo);
		};
		dailyDiv.appendChild(dailyCard);
	}

	updateHourly(card, data, 0, aqiInfo);
	dashboard.appendChild(card);
	document.body.classList.remove("dashboard-bg");

	cityAddCount++;
	if (cityAddCount === 1) {
		showToast(
			"You can add multiple city weather — just type a city name and click Find Weather again.",
			"top",
		);
	} else if (cityAddCount === 2) {
		showToast("Reorder or remove weather cards anytime.", "top");
	} else if (cityAddCount === 3) {
		showToast("Tip: Use scroll or swipe to view all cities!", "bottom");
	}
}

function updateHourly(card, data, dayIdx, aqiInfo) {
	const tbody = card.querySelector("tbody");
	tbody.innerHTML = "";
	const hoursInDay = 24;
	const startIdx = dayIdx * hoursInDay;

	for (let i = startIdx; i < startIdx + hoursInDay; i++) {
		if (!data.hourly.time[i]) break;

		const dt = new Date(data.hourly.time[i]);
		const hours = dt.getHours();
		const label =
			hours === 0
				? "12 AM"
				: hours < 12
					? `${hours} AM`
					: hours === 12
						? "12 PM"
						: `${hours - 12} PM`;
		const humidity =
			(data.hourly.relative_humidity_2m &&
				data.hourly.relative_humidity_2m[i]) ||
			"--";
		const precipitation =
			(data.hourly.precipitation && data.hourly.precipitation[i]) || 0;

		const tr = document.createElement("tr");
		tr.innerHTML = `
        <td>${label}</td>
        <td>${weatherIcon(data.hourly.weathercode[i])}</td>
        <td>${Math.round(data.hourly.temperature_2m[i])}°</td>
        <td>${Math.round(data.hourly.apparent_temperature[i])}°</td>
        <td>${Math.round(data.hourly.windspeed_10m[i])} mph</td>
        <td>${precipitation.toFixed(2)} in</td>
        <td>${humidity}%</td>
        <td>${aqiInfo ? aqiInfo.aqi : "--"}</td>
      `;
		tbody.appendChild(tr);
	}
}

const input = document.getElementById("city-input");
const suggList = document.getElementById("suggestions");

input.addEventListener("input", () => {
	if (debounceTimer) clearTimeout(debounceTimer);

	debounceTimer = setTimeout(async () => {
		const query = input.value.trim();
		if (query.length < 2) return suggList.classList.remove("visible");

		suggList.innerHTML = "";
		const res = await fetch(
			`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en`,
		);
		const data = await res.json();

		if (data.results) {
			data.results.forEach((place) => {
				const li = document.createElement("li");
				li.innerHTML = formatLocation(place, query);
				li.onclick = () => {
					input.value = stripHtml(li.innerHTML);
					input.dataset.lat = place.latitude;
					input.dataset.lon = place.longitude;
					suggList.innerHTML = "";
					suggList.classList.remove("visible");
				};
				suggList.appendChild(li);
			});

			if (data.results.length > 0) suggList.classList.add("visible");
		}
	}, 160);
});

function stripHtml(v) {
	const d = document.createElement("div");
	d.innerHTML = v;
	return d.textContent || d.innerText;
}

document.getElementById("search-form").onsubmit = async (e) => {
	e.preventDefault();
	const query = input.value.trim();
	let lat, lon, label;

	if (input.dataset.lat && input.dataset.lon) {
		lat = input.dataset.lat;
		lon = input.dataset.lon;
		label = input.value;
	} else {
		const geoRes = await fetch(
			`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}`,
		);
		const geoData = await geoRes.json();

		if (!geoData.results || geoData.results.length === 0) {
			alert("City not found.");
			return;
		}

		const place = geoData.results[0];
		lat = place.latitude;
		lon = place.longitude;
		label = stripHtml(formatLocation(place, query));
	}

	dashboardCities.push({ lat, lon, label });
	addCityCard(lat, lon, label);

	input.value = "";
	input.dataset.lat = "";
	input.dataset.lon = "";
	suggList.innerHTML = "";
	suggList.classList.remove("visible");
};
