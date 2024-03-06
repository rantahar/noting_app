const form = document.getElementById('custom-session-form');
const output = document.getElementById('output');
let sessionLabels = [];
let label_map = {}
let key_map = {}

let startTimes = {}
let sessionId = 0;

const sessionTypes = {
    'See-Hear-Feel': ['see', 'hear', 'feel'],
    'Flow': ['flow']
};


const select = document.createElement('select');
const option = document.createElement('option');
option.textContent = "select a predefined session type";
select.appendChild(option);
for (const sessionType in sessionTypes) {
    const option = document.createElement('option');
    option.textContent = sessionType;
    option.value = sessionType;
    select.appendChild(option);
}
output.before(select);

select.addEventListener('change', () => {
    sessionLabels = sessionTypes[select.value];
    output.textContent = `${select.value} session started`;
    startSession(sessionLabels)
    console.log(sessionLabels); // Log sessionLabels when a session is selected
    // Remove focus from the dropdown to prevent key labels from causing a
    // different label to be selected
    select.blur();
});

form.addEventListener('submit', (event) => {
    event.preventDefault();
    sessionLabels = form.elements['custom-session-labels'].value.split(',');
    output.textContent = `Custom session started with labels: ${sessionLabels.join(', ')}`;

    startSession(sessionLabels)
});

function find_button(label) {
    let button;
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        if (btn.textContent.includes(label)) {
            button = btn;
        }
    });
    return button;
}

// Listen to the keyboard for labels
document.addEventListener('keydown', (event) => {
    if (key_map[event.key] && !startTimes[key_map[event.key]]){
        label = key_map[event.key]
        startTimes[label] = new Date();
        const button = find_button(label);
        output.textContent = `Noting ${label}...`;
        button.classList.add('btn-primary');
    }
});

document.addEventListener('keyup', (event) => {
    if (key_map[event.key]){
        label = key_map[event.key]
        const endTime = new Date();
        output.textContent = `Noted: ${label} from ${startTimes[label]} to ${endTime}`;
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        notes.push({ note: label, startTime: startTimes[label], endTime });
        localStorage.setItem('notes', JSON.stringify(notes));
        delete startTimes[label]; // Remove the start time for the key
        const button = find_button(label);
        button.classList.remove('btn-primary');
    }
});



function add_label(button, label) {
    // Add a label to the list of notes
    console.log(label)
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.push({ note: label, time: new Date() });
    localStorage.setItem('notes', JSON.stringify(notes));

    // Flash the button green
    button.classList.add('btn-success');
    setTimeout(() => {
        button.classList.remove('btn-success');
    }, 100);
}


function startSession(labels) {
    // Start a session with the given labels
    let sessionId = Number(localStorage.getItem('sessionId')) || 0;
    sessionId++;
    localStorage.setItem('sessionId', sessionId.toString());

    sessionLabels = labels;
    output.textContent = `Session started with labels: ${sessionLabels.join(', ')}`;

    // map labels to middle row buttons and print instructions
    keys = ["a", "s", "d", "f", "g", "h", "j", "k", "l"]
    label_map = {}
    key_map = {}
    for (let i = 0; i < sessionLabels.length; i++) {
        label_map[sessionLabels[i]] = keys[i]
        key_map[keys[i]] = sessionLabels[i]
    }
    output.innerHTML = `Press the following keys to note the following labels: <br>`

    // Remove any previous noting buttons
    const buttons = document.querySelectorAll('.label');
    buttons.forEach(button => button.remove());
    
    for (const label of sessionLabels) {
        const button = document.createElement('button');
        button.classList = 'btn btn-secondary mx-1 label';
        button.textContent = label + ' (' + label_map[label] + ')';
        button.addEventListener('click', () => {
            add_label(button, label)
        });
        output.after(button);
    }

    // Show the timer
    document.getElementById('meditation-timer-form').style.display = 'block';
}


function download_notes_csv() {
    // Extract notes to a CSV file
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const csv = notes.map(note => {
        return `${note.note},${note.startTime},${note.endTime}`;
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


document.getElementById('start-meditation').addEventListener('click', function() {
    const duration = document.getElementById('meditation-duration').value;
    const display = document.getElementById('timer-display');
    startTimer(duration, display);
});

function startTimer(duration, display) {
    let timer = duration * 60, minutes, seconds;
    const intervalId = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            timer = duration;
            clearInterval(intervalId);
            alert('Meditation session has ended.');
        }
    }, 1000);
}





