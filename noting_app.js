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


session_dropdown_container = document.getElementById('session_dropdown_container')
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
session_dropdown_container.appendChild(select);

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
        button.classList.remove('btn-secondary');
        button.classList.add('btn-success');
    }
});

document.addEventListener('keyup', (event) => {
    if (key_map[event.key]){
        label = key_map[event.key]
        const endTime = new Date();
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        notes.push({ session: sessionId, note: label, startTime: startTimes[label], endTime });
        localStorage.setItem('notes', JSON.stringify(notes));
        delete startTimes[label]; // Remove the start time for the key
        const button = find_button(label);
        button.classList.remove('btn-success');
        button.classList.add('btn-secondary');
    }
});



function startSession(labels) {
    // Start a session with the given labels
    sessionId = Number(localStorage.getItem('sessionId')) || 0;
    sessionId++;
    localStorage.setItem('sessionId', sessionId.toString());

    console.log(sessionId); // Log the sessionId when a session is started

    sessionLabels = labels;

    // map labels to middle row buttons and print instructions
    keys = ["a", "s", "d", "f", "g", "h", "j", "k", "l"]
    label_map = {}
    key_map = {}
    for (let i = 0; i < sessionLabels.length; i++) {
        label_map[sessionLabels[i]] = keys[i]
        key_map[keys[i]] = sessionLabels[i]
    }

    // Remove any previous noting buttons
    const buttons = document.querySelectorAll('.label');
    buttons.forEach(button => button.remove());
    
    label_container = document.getElementById('label_container')
    for (const label of sessionLabels) {
        const button = document.createElement('button');
        button.classList = 'btn btn-secondary mx-1 label';
        button.textContent = label + ' (' + label_map[label] + ')';
        button.addEventListener('click', () => {
            add_label(button, label)
        });
        label_container.appendChild(button);
    }

    // Show the timer
    stopTimer();
    document.getElementById('meditation-timer-form').style.display = 'block';
}


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
            const audio = new Audio('bell/bell-08.wav');
            audio.play();
        }
    }, 1000);
}

function stopTimer() {
    const duration = document.getElementById('meditation-duration').value;
    timer = duration;
}




