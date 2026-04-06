/**
 * ========================================
 *                 TODO APP 
 * ========================================
    * Objectif : Créer une application de gestion de tâches (To-Do List) en utilisant JavaScript et le localStorage.
**/
// ==========================================
// ÉTAPE 1 - SINGLETON POUR LE STORAGE
// ==========================================
// 
// Objectif : Créer une classe TaskManager qui gère TOUT le localStorage

class TaskManager {
    // Propriété statique pour l'instance unique
    static instance = null;

    // contructeur privé
    constructor() {
        if (TaskManager.instance) {
            return TaskManager.instance;
        }
        this.tasks = []; // tableau de taches 
        this.loadTasks();
        TaskManager.instance = this; // instance actuelle
    }

    // charger les taches du localStorage
    loadTasks() {
        try {
            const data = localStorage.getItem('tasks');
            if (data) {
                this.tasks = JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading tasks from localStorage:', error);
        }
    }

    //sauvegarder les taches dans le localStorage
    saveTasks() {
        try{
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
        } catch (error) {
        console.error('Error saving tasks to localStorage:', error);
        }
    }
    // supprimer une tache
    deleteTask(id) { 
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
    }

    // ajouter une tache
    addTask(taskData) {
        const newTask = {
            id: Date.now(), // id unique basé sur le timestamp
            title: taskData.title,
            description: taskData.description,
            completed: false,
            priority: taskData.priority
        };
        this.tasks.push(newTask);
        this.saveTasks();
    }

    // modifier une tache
    updateTask(id, updates) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            Object.assign(task, updates);
            this.saveTasks();
        }
    }
    //obtenir les statistiques
    getStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const active = total - completed;
        return { total, active, completed };
    }
    // cocher/décocher une tache
    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id); // trouver la tache en question
        if (task) { // si la tache existe, alors on change son état, puis on enregistre dans localStorage
            task.completed = !task.completed;
            this.saveTasks();
        }
    }

}
const taskManager = new TaskManager()

// ==========================================
// ÉTAPE 2 - SÉLECTIONNER LES ÉLÉMENTS DOM
// ==========================================
//
// Récupèrer les références des éléments HTML
const input = document.getElementById('task');
const descriptionInput = document.getElementById('description');
const prioritySelect = document.getElementById('categories');
const addButton = document.getElementById('add-task');
const output = document.querySelector('.output'); // Output button
// stats
const totalStats = document.querySelector('.stat-item-1 p:first-child');
const activeStats = document.querySelector('.stat-item-2 p:first-child');
const completedStats = document.querySelector('.stat-item-3 p:first-child');

//récupérer les boutons de filtre
const all = document.querySelector('.all');
const active = document.querySelector('.active');
const completed = document.querySelector('.completed');
const highPrior = document.querySelector('.high-p');
const mediumPrior = document.querySelector('.med-p');
const lowPrior = document.querySelector('.low-p');





// ==========================================
// ÉTAPE 3 - AFFICHER LES TÂCHES
// ==========================================

// Créer un élément HTML pour une tâche
const createTaskElement = (task) => {
    const taskDiv = document.createElement('div');
    taskDiv.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
    taskDiv.dataset.id = task.id;

    const priorityEmoji = {
        'high': '🔴',
        'medium': '🟡',
        'low': '🟢'
    };

    taskDiv.innerHTML = `
        <div class="task-header">
            <input type="checkbox" class="task-checkbox" aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}: ${task.title}" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <h3>${task.title}</h3>
                <p class="task-description">${task.description || 'Pas de description'}</p>
                <span class="task-priority" aria-label="Priority: ${task.priority}">Priority ${task.priority}</span>
            </div>
        </div>
        <div class="task-actions">
            <button class="btn-edit" aria-label="Edit task: ${task.title}">✏️</button>
            <button class="btn-delete" aria-label="Delete task: ${task.title}">🗑️</button>
        </div>

    `;

    // Événement checkbox
    const checkbox = taskDiv.querySelector('.task-checkbox');
    checkbox.addEventListener('change', () => {
        taskManager.toggleTask(task.id);
        renderTasks(taskManager.tasks);
        updateStats();
    });

    // Événement delete
    const btnDelete = taskDiv.querySelector('.btn-delete');
    btnDelete.addEventListener('click', () => {
        taskManager.deleteTask(task.id);
        renderTasks(taskManager.tasks);
        updateStats();
    });

    // Événement edit
    const btnEdit = taskDiv.querySelector('.btn-edit');
    btnEdit.addEventListener('click', () => {
        startEditing(task);
    });

    return taskDiv;
};

// - renderTasks(tasksArray) - affiche les tâches dans .output
const renderTasks = (taskArray) => {
    output.innerHTML = ''; // vider l'output avant de réafficher
    if(taskArray.length === 0){
        output.innerHTML = '<p role="status" aria-live="polite">No tasks to show</p>';
    }
    taskArray.forEach(task => {
        const taskElement = createTaskElement(task);
        output.appendChild(taskElement);
    });
    // Annoncer aux lecteurs d'écran
    output.setAttribute('aria-live', 'polite');
    output.setAttribute('aria-label', `List of ${taskArray.length} tasks`);
};
const updateStats = () => {
    const stats = taskManager.getStats();
    totalStats.textContent = stats.total;
    activeStats.textContent = stats.active;
    completedStats.textContent = stats.completed;
}


// ==========================================
// ÉTAPE 4 - AJOUTER / ÉDITER UNE TÂCHE
// ==========================================

// Variable pour tracker la tâche en édition
let editingTaskId = null;

/**
 * Passer en mode édition
 * @param {Object} task - La tâche à éditer
 */
const startEditing = (task) => {
    editingTaskId = task.id;
    input.value = task.title;
    descriptionInput.value = task.description || '';
    prioritySelect.value = task.priority;
    addButton.textContent = '✏️ Update Task';
    input.focus();
};

/**
 * Annuler l'édition (revenir au mode ajout)
 */
const cancelEditing = () => {
    editingTaskId = null;
    input.value = '';
    descriptionInput.value = '';
    prioritySelect.value = 'medium';
    addButton.textContent = '+Add Task';
};

const handleAddTaskClick = () => {
    const title = input.value.trim();
    const description = descriptionInput.value.trim();
    const priority = prioritySelect.value;
    
    if (title) {
        if (editingTaskId) {
            // Mode édition
            taskManager.updateTask(editingTaskId, { title, description, priority });
            cancelEditing();
        } else {
            // Mode ajout
            taskManager.addTask({ title, description, priority });
            input.value = '';
            descriptionInput.value = '';
            prioritySelect.value = 'medium';
        }
        
        // Réafficher les tâches et stats
        renderTasks(taskManager.tasks);
        updateStats();
    }
}
// Ajouter attributs ARIA au bouton
addButton.setAttribute('aria-label', 'Add a new task');

// Événement : Quand on clique sur "Add Task"
addButton.addEventListener('click', handleAddTaskClick);

// ==========================================
// ÉTAPE 5 - CHARGER AU DÉMARRAGE
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    renderTasks(taskManager.tasks);
    updateStats();
});

// ===========================================
// Etape 6 - GERER LES FILTRES ET L'EDITION
// ===========================================

let currentFilter = 'all'; // tracker le filtre actuel

const filterTasks = (type) => {
    currentFilter = type;
    let filteredTasks = [];
    if (type === 'all') {
        filteredTasks = taskManager.tasks;
    } else if (type === 'active') {
        filteredTasks = taskManager.tasks.filter(task => !task.completed);
    } else if (type === 'completed') {
        filteredTasks = taskManager.tasks.filter(task => task.completed);
    } else if(type === 'high-priority') {
        filteredTasks = taskManager.tasks.filter(task => task.priority === 'high');
    } else if(type === 'medium-priority') {
        filteredTasks = taskManager.tasks.filter(task => task.priority === 'medium');
    } else if(type === 'low-priority') {
        filteredTasks = taskManager.tasks.filter(task => task.priority === 'low');
    }
    renderTasks(filteredTasks);
}

// Mettre à jour les boutons active
const updateFilterButtons = () => {
    all.classList.toggle('active', currentFilter === 'all');
    all.setAttribute('aria-pressed', currentFilter === 'all' ? 'true' : 'false');
    active.classList.toggle('active', currentFilter === 'active');
    active.setAttribute('aria-pressed', currentFilter === 'active' ? 'true' : 'false');
    completed.classList.toggle('active', currentFilter === 'completed');
    completed.setAttribute('aria-pressed', currentFilter === 'completed' ? 'true' : 'false');
    highPrior.classList.toggle('active', currentFilter === 'high-priority');
    highPrior.setAttribute('aria-pressed', currentFilter === 'high-priority' ? 'true' : 'false');
    mediumPrior.classList.toggle('active', currentFilter === 'medium-priority');
    mediumPrior.setAttribute('aria-pressed', currentFilter === 'medium-priority' ? 'true' : 'false');
    lowPrior.classList.toggle('active', currentFilter === 'low-priority');
    lowPrior.setAttribute('aria-pressed', currentFilter === 'low-priority' ? 'true' : 'false');
}

// Ajouter attributs ARIA aux boutons de filtre
all.setAttribute('aria-label', 'Show all tasks');
all.setAttribute('aria-pressed', 'true');
active.setAttribute('aria-label', 'Show active tasks only');
active.setAttribute('aria-pressed', 'false');
completed.setAttribute('aria-label', 'Show completed tasks only');
completed.setAttribute('aria-pressed', 'false');
highPrior.setAttribute('aria-label', 'Show high priority tasks only');
highPrior.setAttribute('aria-pressed', 'false');
mediumPrior.setAttribute('aria-label', 'Show medium priority tasks only');
mediumPrior.setAttribute('aria-pressed', 'false');
lowPrior.setAttribute('aria-label', 'Show low priority tasks only');
lowPrior.setAttribute('aria-pressed', 'false');

// Événements de clic sur les boutons de filtre
all.addEventListener('click', () => {
    filterTasks('all');
    updateFilterButtons();
})
active.addEventListener('click', () => {
    filterTasks('active');
    updateFilterButtons();
})
completed.addEventListener('click', () => {
    filterTasks('completed');
    updateFilterButtons();
})
highPrior.addEventListener('click', () => {
    filterTasks('high-priority');
    updateFilterButtons();
})  
mediumPrior.addEventListener('click', () => {
    filterTasks('medium-priority');
    updateFilterButtons();
})  
lowPrior.addEventListener('click', () => {
    filterTasks('low-priority');
    updateFilterButtons();
})

