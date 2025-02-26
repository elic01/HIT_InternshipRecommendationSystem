class JSearchAPI {
    constructor() {
        this.baseUrl = 'https://jsearch.p.rapidapi.com/search';
        this.options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': '6fe6b904a8msh23483909ec99cb1p1bd0a2jsn41eea5a885c6',
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
        };
    }

    async fetchInternships(query = 'Internship IT', location = 'Zimbabwe') {
        const url = `${this.baseUrl}?query=${query}&location=${location}`;
        try {
            const response = await fetch(url, this.options);
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching internships:', error);
            return [];
        }
    }
}
