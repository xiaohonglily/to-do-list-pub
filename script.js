// **** Get DOM elements ****
// *** Header ***
const search = document.getElementById('search');
const searchInput = document.getElementById('searchInput');
// *** Left Side Folders ***
const newFileBtn = document.getElementById('newFileBtn');
const newFolderInputContainer = document.getElementById('newFolderInputContainer');
const newFolderInput = document.getElementById('newFolderInput');
const saveFolderBtn = document.getElementById('saveFolderBtn');
const cancelFolderBtn = document.getElementById('cancelFolderBtn');
const fileList = document.getElementById('fileList');
// *** Main ***
// ** fileTitle
const fileTitleContainer = document.getElementById('fileTitleContainer');
const backIcon = document.querySelector('.backIcon');
const fileTitle = document.getElementById('fileTitle');
const renameInputContainer = document.getElementById('renameInputContainer');
const renameInput = document.getElementById('renameInput');
const saveRenameBtn = document.getElementById('saveRenameBtn');
const cancelRenameBtn = document.getElementById('cancelRenameBtn');
// ** fileMenu **
const fileMenuBtn = document.getElementById('fileMenuBtn');
const fileMenu = document.getElementById('fileMenu');
const viewCompleted = document.getElementById('viewCompleted');
const deleteFolderBtn = document.getElementById('deleteFolderBtn');
const renameFolderBtn = document.getElementById('renameFolderBtn');
// ** taskList **
const taskList = document.getElementById('taskList');
// ** completedTask **
const completedTaskList = document.getElementById('completedTaskList');
// ** addTaskBtn **
const addTaskBtn = document.getElementById('addTaskBtn');
// *** Right Side  Details ***
const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate');
const taskDetail = document.getElementById('taskDetail');

// Initial folder and task data
let folders = JSON.parse(localStorage.getItem('folders')) || ['My Tasks'];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFolder = folders[0];  // Default selected folder
let currentTask = null; // Currently selected task

// *** Left Side Folders ***

// ** New Folder Button **

// Save tasks and folders to localStorage
function saveData() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('folders', JSON.stringify(folders));
}

// Show new folder input box
newFileBtn.addEventListener('click', () => {
    newFolderInputContainer.style.display = 'grid';  // Show input box and buttons
    newFolderInput.focus();  // Focus on input box
});

// Cancel new folder
cancelFolderBtn.addEventListener('click', () => {
    newFolderInputContainer.style.display = 'none';  // Hide input box and buttons
    newFolderInput.value = '';  // Clear input box
});

// Utility function to sanitize input (prevent double encoding)
function sanitizeInput(input) {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = input; // Escape special characters
    const sanitized = tempDiv.innerHTML;
    return sanitized
        .replace(/&amp;/g, '&') // Prevent double encoding of '&'
        .replace(/</g, '&lt;')  // Escape '<'
        .replace(/>/g, '&gt;')  // Escape '>'
        .replace(/"/g, '&quot;') // Escape '"'
        .replace(/'/g, '&#39;') // Escape "'"
        .replace(/=/g, '&#61;'); // Escape '='
}

// Utility function to validate input
function validateInput(input, maxLength) {
    const regex = /^[\p{L}\p{N}\s.,!?()\-_"']*$/u; // Allow letters, numbers, spaces, and basic symbols, including empty input
    return input.trim().length <= maxLength && regex.test(input.trim());
}

// Global input event listener for validation and sanitization
document.addEventListener('input', (event) => {
    if (event.target.classList.contains('userInput')) {
        const sanitized = sanitizeInput(event.target.value);
        if (!validateInput(sanitized, 100)) {
            setTimeout(() => {
                event.target.value = sanitized; // Revert to sanitized input
            }, 0);
        }
    }
});

// Global paste event listener to sanitize pasted content
document.addEventListener('paste', (event) => {
    if (event.target.classList.contains('userInput')) {
        event.preventDefault(); // Prevent default paste behavior
        const pastedText = event.clipboardData.getData('text'); // Get plain text
        const sanitized = sanitizeInput(pastedText); // Sanitize pasted content
        event.target.value = sanitized; // Insert sanitized content
    }
});

// Save new folder with sanitization and validation
saveFolderBtn.addEventListener('click', () => {
    const folderName = sanitizeInput(newFolderInput.value.trim());
    if (validateInput(folderName, 50)) {
        folders.push(folderName);
        saveData();  // Save new folder
        updateFolderList();  // Update folder list
    }
    newFolderInputContainer.style.display = 'none';  // Hide input box and buttons
    newFolderInput.value = '';  // Clear input box
});

// ** File List **

// Update folder list
function updateFolderList() {
    fileList.innerHTML = ''; // Clear folder list
    folders.forEach((folder, index) => {
        const li = document.createElement('li');
        li.classList.add('folder-item');
        li.textContent = folder;
        li.addEventListener('click', () => loadFolderTasks(folder)); // Load folder tasks
        fileList.appendChild(li);
    });
}

// Load tasks in folder
function loadFolderTasks(folderName) {
    currentFolder = folderName;  // Update currently selected folder
    fileTitle.textContent = folderName;  // Update title in the right editing area
    taskList.innerHTML = '';  // Clear task list
    const folderTasks = tasks.filter(task => task.folder === folderName);
    folderTasks.forEach(task => {
        const li = createTaskElement(task);
        taskList.appendChild(li);
    });
    updateCompletedTaskList(folderName); // Update completed task list
}

// Folder list drag and drop sorting
new Sortable(fileList, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    onEnd(evt) {
        const movedFolder = folders.splice(evt.oldIndex, 1)[0];
        folders.splice(evt.newIndex, 0, movedFolder);
        updateFolderList();
    }
});

// Initialize page
function initialize() {
    updateFolderList();  // Update folder list
    if (folders.length > 0) {
        loadFolderTasks(folders[0]);  // Load tasks from the first folder
    }
}

// *** Main ***

// ** File Title **

// When the rename button is clicked, show the input box
renameFolderBtn.addEventListener('click', () => {
    renameInputContainer.style.display = 'grid';  // Show input box and buttons
    renameInput.value = fileTitle.textContent;  // Fill the input box with the current title
    renameInput.focus();  // Focus on input box
    fileTitleContainer.style.display = 'none';  // Hide current title
});

// Save renamed folder with sanitization and validation
saveRenameBtn.addEventListener('click', () => {
    const newFolderName = sanitizeInput(renameInput.value.trim());
    if (validateInput(newFolderName, 50)) {
        const oldFolderName = currentFolder;  // Save old folder name
        currentFolder = newFolderName;  // Update current folder name
        folders = folders.map(folder => folder === oldFolderName ? newFolderName : folder);  // Update the name in the folder array
        tasks.forEach(task => {
            if (task.folder === oldFolderName) {
                task.folder = newFolderName;  // Update the task's folder name
            }
        });
        saveData();  // Save changes
        updateFolderList();  // Update folder list
        loadFolderTasks(newFolderName);  // Reload folder tasks
    }
    renameInputContainer.style.display = 'none';  // Hide input box and buttons
    fileTitleContainer.style.display = 'block';  // Show title
});

// When the cancel button is clicked, restore the original title and hide the input box
cancelRenameBtn.addEventListener('click', () => {
    renameInputContainer.style.display = 'none';  // Hide input box and buttons
    fileTitleContainer.style.display = 'block';  // Show title
});

// Delete current folder
function deleteFolder() {
    const folderIndex = folders.indexOf(currentFolder);
    if (folderIndex !== -1) {
        // Delete folder and tasks
        folders.splice(folderIndex, 1);
        tasks = tasks.filter(task => task.folder !== currentFolder);  // Delete all tasks under this folder
        saveData();  // Save updated data
        updateFolderList();  // Update folder list
        taskList.innerHTML = '';  // Clear task list
        fileTitle.textContent = '';  // Clear folder title
    }
}

// Click event for the delete folder button
deleteFolderBtn.addEventListener('click', deleteFolder);

// ** File Menu **

// Toggle FileMenu On fileMenuBtn Click
fileMenuBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    fileMenu.classList.toggle('visible');
    if (fileMenu.classList.contains('visible')) {
        fileMenu.style.display = 'block';
        fileMenu.style.opacity = 1;
    } else {
        fileMenu.style.display = 'none';
    }
});

// Hide fileMenu On Click Item
fileMenu.addEventListener('click', function (event) {
    event.stopPropagation();
    fileMenu.style.display = 'none'; // Hide the file menu
});

// ** Task List **

// When creating a task element, add event listeners to the task input box
function createTaskElement(task) {
    const li = document.createElement('li');

    // Create task completion icon
    const completeIcon = document.createElement('span');
    completeIcon.classList.add('icon', 'icon-circle', 'checkbox');
    completeIcon.addEventListener('click', () => toggleTaskCompletion(task, completeIcon));

    // Create task input box
    const textarea = document.createElement('textarea');
    textarea.rows = 1;
    textarea.classList.add('list-item', 'userInput');
    textarea.value = task.title;

    // Create menu icon
    const menuIcon = document.createElement('span');
    menuIcon.classList.add('icon', 'icon-dots-three-vertical1');
    menuIcon.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleTaskMenu(li);
    });

    // Create task menu
    const taskMenu = document.createElement('ul');
    taskMenu.classList.add('task-menu');
    const deleteOption = document.createElement('li');
    deleteOption.textContent = 'Delete this task';
    deleteOption.addEventListener('click', () => {
        deleteTask(task, li);
    });
    taskMenu.appendChild(deleteOption);

    // When the task title changes, sanitize and validate input
    textarea.addEventListener('input', () => {
        const sanitizedTitle = sanitizeInput(textarea.value);
        if (validateInput(sanitizedTitle, 100)) {
            task.title = sanitizedTitle;
            saveData();  // Save task modification
        }

        // Adjust input box height
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';

        // After the task title changes, immediately synchronize and update the content on the right
        if (currentTask && currentTask.id === task.id) {
            taskInput.value = task.title;
        }
    });

    // Add the task item to the list
    li.appendChild(completeIcon);
    li.appendChild(textarea);
    li.appendChild(menuIcon);
    li.appendChild(taskMenu);

    li.addEventListener('click', () => {  // Triggered when a task item is clicked
        currentTask = task;
        taskInput.value = task.title;
        taskDate.value = task.dueDate || '';
        taskDetail.value = task.detail || '';
    });

    return li;
}

// For security reasons this part has been removed, for more information please contact Xiaohong Li : https://xiaohongli.netlify.app/

// *** Right Side Details ***

// Initialize page
initialize();