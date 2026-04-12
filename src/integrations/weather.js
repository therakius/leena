export async function getNextDayWeather(city) {
  try {
    const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
    const data = await res.json();

    const tomorrow = data.weather[1]; // index 0 = hoje, 1 = amanhã

    return {
            "maxTemp": `${tomorrow.maxtempC}°C`,
            "minTemp": `${tomorrow.mintempC}°C`,
            "rainChance": `${tomorrow.hourly[4].chanceofrain}`,
            "city": `${city}`
            }

  } catch (erro) {
    console.error("Erro:", erro.message);
  }
}


