const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const themeToggle = document.getElementById('theme-toggle');
const filterBtns = document.querySelectorAll('.filter-btn');

let tasks = JSON.parse(localStorage.getItem('tasks-modern')) || [];
let filter = 'all';

// Motivational quotes array
const motivationalQuotes = [
    '✨ Every task completed is a step toward your goals!',
    '🚀 Progress, not perfection. Keep going!',
    '🌟 Small steps every day lead to big results.',
    '💡 Stay positive, work hard, make it happen!',
    '🔥 You are capable of amazing things!'
];

function getFormattedDate() {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[now.getDay()];
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${day}, ${date} ${time}`;
}

function getCurrentDate() {
    return new Date().toLocaleDateString();
}

function saveTasks() {
    localStorage.setItem('tasks-modern', JSON.stringify(tasks));
}

function renderTasks() {
    taskList.innerHTML = '';
    let filtered = tasks;
    if (filter === 'completed') filtered = tasks.filter(t => t.completed);
    if (filter === 'pending') filtered = tasks.filter(t => !t.completed);
    filtered.forEach((task, idx) => {
        const li = document.createElement('li');
        li.className = 'task-card' + (task.completed ? ' completed' : '');
        li.setAttribute('draggable', 'true');
        li.dataset.index = idx;

        if (task.editing) {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = task.text;
            input.className = 'edit-input';
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') finishEdit(idx, input.value);
                if (e.key === 'Escape') cancelEdit(idx);
            });
            input.addEventListener('blur', () => finishEdit(idx, input.value));
            li.appendChild(input);
            setTimeout(() => input.focus(), 10);
        } else {
            const span = document.createElement('span');
            span.className = 'task-text';
            span.textContent = task.text;
            li.appendChild(span);
            
            // Add date/time/day
            const dateSpan = document.createElement('span');
            dateSpan.className = 'task-date';
            dateSpan.textContent = task.date || '';
            li.appendChild(dateSpan);
        }

        const actions = document.createElement('div');
        actions.className = 'task-actions';

        const completeBtn = document.createElement('button');
        completeBtn.className = 'task-btn complete';
        completeBtn.title = 'Mark as completed';
        completeBtn.innerHTML = task.completed ? '✅' : '⬜';
        completeBtn.onclick = () => toggleComplete(idx);
        actions.appendChild(completeBtn);

        const editBtn = document.createElement('button');
        editBtn.className = 'task-btn edit';
        editBtn.title = 'Edit task';
        editBtn.innerHTML = '📝';
        editBtn.onclick = () => startEdit(idx);
        actions.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-btn delete';
        deleteBtn.title = 'Delete task';
        deleteBtn.innerHTML = '❌';
        deleteBtn.onclick = () => deleteTask(idx);
        actions.appendChild(deleteBtn);

        li.appendChild(actions);
        taskList.appendChild(li);
    });
}

function setRandomMotivationalQuote() {
    const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    document.getElementById('motivational-quote').textContent = quote;
}

// Show congratulations popup
function showCongratsPopup() {
    const modal = document.getElementById('congrats-modal');
    if (modal) {
        // Set the motivational line in the popup with a color class
        const currentQuote = document.getElementById('motivational-quote').textContent;
        const messageDiv = modal.querySelector('.congrats-message');
        let colorClass = '';
        const idx = motivationalQuotes.findIndex(q => q === currentQuote);
        if (idx !== -1) colorClass = `color${idx+1}`;
        if (messageDiv) {
            messageDiv.innerHTML = `Congratulations! Task completed!<br><span class='popup-motivation ${colorClass}'>${currentQuote}</span>`;
        }
        modal.style.display = 'flex';
    }
}

function hideCongratsPopup() {
    const modal = document.getElementById('congrats-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Add event listeners for closing the popup
window.addEventListener('DOMContentLoaded', () => {
    setRandomMotivationalQuote();
    const closeBtn = document.getElementById('close-congrats');
    const modal = document.getElementById('congrats-modal');
    if (closeBtn && modal) {
        closeBtn.onclick = hideCongratsPopup;
        modal.onclick = (e) => {
            if (e.target === modal) hideCongratsPopup();
        };
    }
});

// Update motivational quote after each task action
function afterTaskAction() {
    setRandomMotivationalQuote();
}

function addTask(text) {
    tasks.push({ 
        text, 
        completed: false, 
        date: getFormattedDate()
    });
    saveTasks();
    renderTasks();
    afterTaskAction();
}

function deleteTask(idx) {
    tasks.splice(idx, 1);
    saveTasks();
    renderTasks();
    afterTaskAction();
}

function toggleComplete(idx) {
    const task = tasks[idx];
    const wasCompleted = task.completed;
    if (!wasCompleted) {
        showCongratsPopup();
    }
    task.completed = !wasCompleted;
    saveTasks();
    renderTasks();
    afterTaskAction();
}

function startEdit(idx) {
    tasks = tasks.map((t, i) => ({ ...t, editing: i === idx }));
    renderTasks();
}

function finishEdit(idx, newText) {
    if (newText.trim()) tasks[idx].text = newText.trim();
    delete tasks[idx].editing;
    saveTasks();
    renderTasks();
    afterTaskAction();
}

function cancelEdit(idx) {
    delete tasks[idx].editing;
    renderTasks();
}

taskForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (text) {
        addTask(text);
        taskInput.value = '';
        taskInput.focus();
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filter = btn.dataset.filter;
        renderTasks();
    });
});

// Light/Dark mode toggle
function setTheme(dark) {
    document.body.classList.toggle('dark', dark);
    themeToggle.textContent = dark ? '🌙' : '🌞';
    localStorage.setItem('todo-theme', dark ? 'dark' : 'light');
}
themeToggle.addEventListener('click', () => {
    setTheme(!document.body.classList.contains('dark'));
});
// On load, set theme
setTheme(localStorage.getItem('todo-theme') === 'dark');

// Drag-and-drop reordering
let dragIdx = null;
taskList.addEventListener('dragstart', e => {
    dragIdx = +e.target.dataset.index;
    e.dataTransfer.effectAllowed = 'move';
});
taskList.addEventListener('dragover', e => {
    e.preventDefault();
    const li = e.target.closest('.task-card');
    if (!li) return;
    li.style.transform = 'scale(1.04)';
});
taskList.addEventListener('dragleave', e => {
    const li = e.target.closest('.task-card');
    if (!li) return;
    li.style.transform = '';
});
taskList.addEventListener('drop', e => {
    e.preventDefault();
    const li = e.target.closest('.task-card');
    if (!li) return;
    const dropIdx = +li.dataset.index;
    if (dragIdx !== null && dropIdx !== dragIdx) {
        const [moved] = tasks.splice(dragIdx, 1);
        tasks.splice(dropIdx, 0, moved);
        saveTasks();
        renderTasks();
    }
    li.style.transform = '';
    dragIdx = null;
});
taskList.addEventListener('dragend', () => {
    dragIdx = null;
    renderTasks();
});

// Initial render
renderTasks(); 