//  A simple app for recording noting mediation in daily life. Pressing the button records a note and
//  increments a counter. The notes are saved in a session object and can be downloaded as a JSON file.

// Label buttons (now just one)
let startTimes = {}
let sessionId = 0;

let label_button = document.getElementById('label_button');

let label_to_key = {}
let key_to_label = {}
let label_to_button = {}


// Update the number of daily labels
function updateLabelCount() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    todays_notes = notes.filter(label => {
        const labelDate = new Date(label.startTime);
        labelDate.setHours(0, 0, 0, 0);
        return labelDate.getTime() === today.getTime();
    });

    document.getElementById('labelCount').textContent = todays_notes.length;
}

// Add a label event to the notes list
function add_label(label) {
    const endTime = new Date();
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    if (startTimes[label] === undefined) {
        startTime = new Date();
    } else {
        startTime = startTimes[label];
    }
    notes.push({ note: label, startTime: startTime, endTime: endTime });
    localStorage.setItem('notes', JSON.stringify(notes));
    console.log('Adding label', notes)
    updateLabelCount()
}


// Listeners for starting and ending labels
function start_label(label) {
    startTimes[label] = new Date();
    const button = label_to_button[label];
    button.classList.remove('btn-secondary');
    button.classList.add('btn-success');
}

document.addEventListener('keydown', (event) => {
    label = key_to_label[event.key]
    if(!label){
        return
    }
    
    if (startTimes[label]){
        return 
    }
    start_label(label)
});

function end_label(label) {
    add_label(label)
    delete startTimes[label];
    const button = label_to_button[label];
    button.classList.remove('btn-success');
    button.classList.add('btn-secondary');
}

document.addEventListener('keyup', (event) => {
    label = key_to_label[event.key]
    if(!label){
        return
    }
    end_label(label)
});


// Update label buttons to a specific set of labels
function startSession(labels) {
    var sessionLabels = labels;

    // map labels to middle row buttons and print instructions
    keys = ["a", "s", "d", "f", "g", "h", "j", "k", "l"]
    key_to_label = {}
    label_to_key = {}
    for (let i = 0; i < sessionLabels.length; i++) {
        label_to_key[sessionLabels[i]] = keys[i]
        key_to_label[keys[i]] = sessionLabels[i]
    }

    // Remove any previous noting buttons
    const buttons = document.querySelectorAll('.label');
    buttons.forEach(button => button.remove());
    
    label_container = document.getElementById('label_container')
    for (const label of sessionLabels) {
        const button = document.createElement('button');
        button.classList = 'btn btn-secondary m-2 flex-fill square-btn d-flex align-items-center justify-content-center';
        button.textContent = label + ' (' + label_to_key[label] + ')';
        button.addEventListener('mousedown', () => {
            start_label(label)
        });
        button.addEventListener('mouseup', () => {
            end_label(label)
        });
        label_container.appendChild(button);
        label_to_button[label] = button;
    }

    updateLabelCount();
}

// Start the session
startSession(['Note']);



// Download notes button
function download_notes_csv() {
    // Extract notes to a CSV file
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const csv = notes.map(note => {
        return `${note.session},${note.note},${note.startTime},${note.endTime}`;
    }).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'notes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const downloadButton = document.createElement('button');
downloadButton.textContent = 'Download Notes as CSV';
downloadButton.addEventListener('click', download_notes_csv);
downloadButton.classList = 'btn btn-primary mx-1';
const download_button_container = document.getElementById('download_button_container');
download_button_container.appendChild(downloadButton);




