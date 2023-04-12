let COMMUNICATION = 'http://34.16.138.110:8443/';

let paperAPI = '/papers/papersearch'
let paperAPI1 = 'papers/papersearch1'
const form = document.getElementById('paper-form');
const titleInput = document.getElementById('title-input');
const authorInput = document.getElementById('author-input');
const journalInput = document.getElementById('journal-input');

const paperData = document.getElementById('paper-data'); // search results


form.addEventListener('submit', event => {
  event.preventDefault(); // prevent from page reloading
  const title = titleInput.value;
  const author = authorInput.value;
  const journal = journalInput.value;

  // Create a new instance of axios
  const instance = axios.create({ baseURL: COMMUNICATION });

  // Make a POST request to the server to get the data for the selected state
  // my very lousy implementation of token handling
  return new Promise((resolve, reject) => {
    var token = localStorage.getItem('token');
    var username = localStorage.getItem('username');
    // console.log(token, username);
    var myheader = {
      headers: {
        'Content-Type': 'application/json',
      }
    };
    // console.log(token, username);
    if (token && username) {
      myheader = {
        headers: {
          'Content-Type': 'application/json',
          'token': token,
          'username': username
        }
      };
    }
    console.log(myheader);
    instance.post(paperAPI, { titleName: title, authorName: author, journalName: journal }, myheader).then(response => {
      var data = response.data; // paper count

      // Display the data for the selected state
      paperData.innerHTML = `
            <p>Satisfied Paper Count: ${data.papercnt}</p>
            `;

      resolve(data);
    })

    instance.post(paperAPI1, { titleName: title, authorName: author, journalName: journal }, myheader).then(response => {
      var data = response.data; // paper title, authors, journals
      // console.log(data);

      const table = document.getElementById('PaperSearchTable');
      const tbody = table.getElementsByTagName('tbody')[0];

      // Clear the table
      tbody.innerHTML = '';

      data.forEach(item => {
        const row = tbody.insertRow();

        const titleCell = row.insertCell();
        titleCell.textContent = item.papertitle;

        const authorCell = row.insertCell();
        authorCell.textContent = item.paperauthor;

        const journalCell = row.insertCell();
        journalCell.textContent = item.paperjournal;

        const publish_timeCell = row.insertCell();
        publish_timeCell.textContent = item.papertime;

        const searchtimesCell = row.insertCell();
        searchtimesCell.textContent = item.searchtimes;
      });

      // Display the data for the selected state
      // paperData.innerHTML = `
      //       <p>Satisfied Paper Count: ${data.papercnt}</p>
      //       `;

      resolve(data);
    })


      .catch(error => {
        console.error('Error fetching paper data:', error);
        reject(error);
      });

  });


  // paperData.innerHTML = `<p>title request: ${title}</p>
  //                       <p>author request: ${author}</p>
  //                       <p>journal request: ${journal}</p>`;
})
