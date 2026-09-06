const API_BASE_URL = (() => {
  const configuredUrl = window.CHORE_TRACKER_API_URL || 'http://localhost:3000/api';
  return configuredUrl.replace(/\/$/, '');
})();

let chores = [];
// each chore object is as follows:
// {_id: '123abc', name: 'Vacuum', duration: 20, notes: '', due-date: null}

// Starter JS for Chore Tracker
document.addEventListener('DOMContentLoaded', function () {
  console.log('Chore Tracker ready');
  
  fetch(`${API_BASE_URL}/health`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      alert(data);
    })
    .catch(error => {
      console.error('Request failed:', error);
      alert('Unable to load chores. Update the backend URL in assets/js/api-config.js or start the backend server.');
    });

  fetch(`${API_BASE_URL}/api/chores`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      prepareData(data);
    })
    .catch(error => {
      console.error('Request failed:', error);
      alert('Unable to load chores. Update the backend URL in assets/js/api-config.js or start the backend server.');
    });
});

function prepareData (dataChores) {
  //currently the data is automatically sorted by duration when it is returned
  //chores.sort((a, b) => a.duration - b.duration);
  populateDurationOptions();
}

function populateDurationOptions () {
  const select = document.getElementById('durationPicker');
  if (!select) return;

  // extract unique durations and sort them
  const durations = Array.from(new Set(chores.map(c => c.duration))).sort((a, b) => a - b);

  // clear existing options
  select.innerHTML = '';

  // add a placeholder
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select time';
  select.appendChild(placeholder);

  durations.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = `${d} minutes`;
    select.appendChild(opt);
  });

  const btn = document.getElementById('pickChoreBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      const val = select.value;
      pickChore(val);
    });
  }
}

function pickChore (time) {
  const t = Number(time);
  if (!time || Number.isNaN(t)) {
    alert('Please select a time before picking a chore.');
    return;
  }

  const candidates = chores.filter(c => Number(c.duration) === t);
  if (candidates.length === 0) {
    alert(`No chores found for time ${t}`);
    return;
  }

  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  alert(`Picked chore: ${chosen.name} - ${chosen.notes || 'No notes'} (duration: ${chosen.duration})`);

  fetch(`${API_BASE_URL}/api/chores/${encodeURIComponent(chosen._id)}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Chore marked complete:', data);
    })
    .catch(error => {
      console.error('Put failed:', error);
      alert('The chore was picked, but the completion update did not succeed. Check the backend server logs.');
    });
}