import axios from 'axios'

export async function getNextHolyday() {
    try {
        // Usando a Nager.Date por ser zero-config
        const response = await axios.get('https://date.nager.at/api/v3/NextPublicHolidays/MZ');
        const holidays = response.data;

        if (holidays.length > 0) {
            
            const next = holidays[0];
            
            return `Próximo feriado: ${next.localName} em ${next.date}`;
            
        }
        
    } catch (error) {
        console.error("error looking dor holidays", error);
    }
}