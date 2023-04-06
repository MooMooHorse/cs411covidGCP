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
    // my very lousy implementation of token handling
    return new Promise((resolve, reject) => {
        var token = localStorage.getItem('token');
        var username = localStorage.getItem('username');
        // console.log(token, username);
        var myheader = {headers : {
            'Content-Type': 'application/json',
        }};
        // console.log(token, username);
        if(token && username) {
            myheader = {headers : {
                'Content-Type': 'application/json',
                'token': token,
                'username': username
                }
            };
        }
        console.log(myheader);
        instance.post(ADQ1API, { stateName: state }, myheader).then(response => {
            var data = response.data;

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
