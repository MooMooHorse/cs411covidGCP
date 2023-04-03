let COMMUNICATION = 'http://34.16.138.110:8443/';
let ADQ1API = '/adquery1';
const form = document.getElementById('state-form');
const stateInput = document.getElementById('state-input');
const stateData = document.getElementById('state-data');

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const state = stateInput.value;

    // Create a new instance of axios
    const instance = axios.create({ baseURL: COMMUNICATION });

    // Make a POST request to the server to get the data for the selected state
    return new Promise((resolve, reject) => {
        instance.post(ADQ1API, { stateName: state }, { headers: { 'Content-Type': 'application/json' } })
            .then(response => {
                var data = response.data;
                console.log(data);

                // Display the data for the selected state
                stateData.innerHTML = `
                <p>Bed utilization: ${data.bed_utl}</p>
                <p>Vaccination ratio: ${data.vacc_ratio}</p>
                `;

                resolve(data);
            })
            .catch(error => {
                console.error('Error fetching state data:', error);
                reject(error);
            });
    });
});
