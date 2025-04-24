<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo List App</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        #listTabs {
            display: flex;
            margin-bottom: 10px;
            overflow-x: auto;
        }
        .list-tab {
            padding: 10px;
            margin-right: 5px;
            cursor: pointer;
            background-color: #f0f0f0;
            border: 1px solid #ddd;
            white-space: nowrap;
            position: relative;
        }
        .list-tab.active {
            background-color: #007bff;
            color: white;
        }
        .list-tab .delete-list-btn {
            margin-left: 5px;
            color: red;
            background: none;
            border: none;
            cursor: pointer;
        }
        #taskForm {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        #taskForm input, 
        #taskForm textarea {
            padding: 8px;
            margin-bottom: 10px;
        }
        #taskList {
            list-style-type: none;
            padding: 0;
        }
        .task-item {
            display: flex;
            align-items: center;
            padding: 10px;
            border-bottom: 1px solid #eee;
        }
        .task-item.completed {
            text-decoration: line-through;
            color: #888;
        }
        .task-actions {
            margin-left: auto;
            display: flex;
            gap: 10px;
        }
        .delete-btn {
            color: red;
            background: none;
            border: none;
            cursor: pointer;
        }
        .edit-btn {
            color: blue;
            background: none;
            border: none;
            cursor: pointer;
        }
        .complete-btn {
            margin-right: 10px;
            background: none;
            border: none;
            cursor: pointer;
        }
        .new-list-form {
            display: flex;
            margin-bottom: 20px;
        }
        .new-list-form input {
            flex-grow: 1;
            margin-right: 10px;
            padding: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Todo List Manager</h1>
        
        <div class="new-list-form">
            <input type="text" id="newListInput" placeholder="New List Name">
            <button id="addListBtn">Add List</button>
        </div>

        <div class="list-container">
            <div id="listTabs"></div>
        </div>

        <form id="taskForm">
            <input type="text" id="taskTitle" placeholder="Task Title" required>
            <textarea id="taskDescription" placeholder="Task Description (Optional)"></textarea>
            <input type="date" id="taskDate">
            <input type="time" id="taskTime">
            <button type="submit" id="addTaskBtn">Add Task</button>
        </form>

        <ul id="taskList"></ul>
    </div>

    <script>
    // Wrap everything in an immediately invoked function to avoid global scope pollution
    (function() {
        // Todo App Constructor
        function TodoApp() {
            // Data storage
            this.lists = [
                { id: 'default', name: 'Personal', tasks: [] }
            ];
            this.currentListId = 'default';
            this.editingTask = null;

            // DOM Elements
            this.elements = {
                listTabs: document.getElementById('listTabs'),
                taskForm: document.getElementById('taskForm'),
                taskList: document.getElementById('taskList'),
                newListInput: document.getElementById('newListInput'),
                addListBtn: document.getElementById('addListBtn'),
                addTaskBtn: document.getElementById('addTaskBtn'),
                taskTitle: document.getElementById('taskTitle'),
                taskDescription: document.getElementById('taskDescription'),
                taskDate: document.getElementById('taskDate'),
                taskTime: document.getElementById('taskTime')
            };

            // Initialize
            this.bindEvents();
            this.renderLists();
            this.renderTasks();
        }

        // Bind Events Method
        TodoApp.prototype.bindEvents = function() {
            var self = this;

            // Add List Event
            this.elements.addListBtn.addEventListener('click', function() {
                self.addList();
            });

            // Task Form Submit Event
            this.elements.taskForm.addEventListener('submit', function(e) {
                e.preventDefault();
                if (self.editingTask) {
                    self.updateTask();
                } else {
                    self.addTask();
                }
            });
        };

        // Add List Method
        TodoApp.prototype.addList = function() {
            var listName = this.elements.newListInput.value.trim();
            if (listName) {
                var newList = {
                    id: 'list_' + Date.now(),
                    name: listName,
                    tasks: []
                };
                this.lists.push(newList);
                this.currentListId = newList.id;
                this.elements.newListInput.value = '';
                this.renderLists();
                this.renderTasks();
            }
        };

        // Add Task Method
        TodoApp.prototype.addTask = function() {
            var title = this.elements.taskTitle.value.trim();
            if (title) {
                var newTask = {
                    id: 'task_' + Date.now(),
                    title: title,
                    description: this.elements.taskDescription.value,
                    date: this.elements.taskDate.value,
                    time: this.elements.taskTime.value,
                    completed: false
                };

                var currentList = this.getCurrentList();
                currentList.tasks.push(newTask);

                this.resetTaskForm();
                this.renderTasks();
            }
        };

        // Update Task Method
        TodoApp.prototype.updateTask = function() {
            var currentList = this.getCurrentList();
            var taskIndex = -1;
            
            for (var i = 0; i < currentList.tasks.length; i++) {
                if (currentList.tasks[i].id === this.editingTask.id) {
                    taskIndex = i;
                    break;
                }
            }

            if (taskIndex !== -1) {
                currentList.tasks[taskIndex] = {
                    id: this.editingTask.id,
                    title: this.elements.taskTitle.value.trim(),
                    description: this.elements.taskDescription.value,
                    date: this.elements.taskDate.value,
                    time: this.elements.taskTime.value,
                    completed: this.editingTask.completed
                };

                this.resetTaskForm();
                this.editingTask = null;
                this.renderTasks();
            }
        };

        // Render Lists Method
        TodoApp.prototype.renderLists = function() {
            var self = this;
            this.elements.listTabs.innerHTML = '';

            this.lists.forEach(function(list) {
                var listTab = document.createElement('button');
                listTab.textContent = list.name;
                listTab.className = 'list-tab' + (list.id === self.currentListId ? ' active' : '');
                
                listTab.addEventListener('click', function() {
                    self.currentListId = list.id;
                    self.renderLists();
                    self.renderTasks();
                });

                if (list.id !== 'default') {
                    var deleteBtn = document.createElement('button');
                    deleteBtn.textContent = '✖';
                    deleteBtn.className = 'delete-list-btn';
                    deleteBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        self.deleteList(list.id);
                    });
                    listTab.appendChild(deleteBtn);
                }

                self.elements.listTabs.appendChild(listTab);
            });
        };

        // Delete List Method
        TodoApp.prototype.deleteList = function(listId) {
            if (listId === 'default') return;

            this.lists = this.lists.filter(function(list) {
                return list.id !== listId;
            });
            
            this.currentListId = 'default';
            this.renderLists();
            this.renderTasks();
        };

        // Render Tasks Method
        TodoApp.prototype.renderTasks = function() {
            var self = this;
            this.elements.taskList.innerHTML = '';

            var currentList = this.getCurrentList();

            currentList.tasks.forEach(function(task) {
                var taskItem = document.createElement('li');
                taskItem.className = 'task-item' + (task.completed ? ' completed' : '');

                taskItem.innerHTML = `
                    <div>
                        <strong>${task.title}</strong>
                        ${task.description ? '<p>' + task.description + '</p>' : ''}
                        ${(task.date || task.time) ? '<small>' + (task.date || '') + ' ' + (task.time || '') + '</small>' : ''}
                    </div>
                    <div class="task-actions">
                        <button class="complete-btn">✓</button>
                        <button class="edit-btn">✎</button>
                        <button class="delete-btn">✖</button>
                    </div>
                `;

                // Complete button
                taskItem.querySelector('.complete-btn').addEventListener('click', function() {
                    self.toggleTaskCompletion(currentList.id, task.id);
                });

                // Edit button
                taskItem.querySelector('.edit-btn').addEventListener('click', function() {
                    self.startEditTask(task);
                });

                // Delete button
                taskItem.querySelector('.delete-btn').addEventListener('click', function() {
                    self.deleteTask(currentList.id, task.id);
                });

                self.elements.taskList.appendChild(taskItem);
            });
        };

        // Toggle Task Completion Method
        TodoApp.prototype.toggleTaskCompletion = function(listId, taskId) {
            var currentList = this.getCurrentList();
            
            for (var i = 0; i < currentList.tasks.length; i++) {
                if (currentList.tasks[i].id === taskId) {
                    currentList.tasks[i].completed = !currentList.tasks[i].completed;
                    break;
                }
            }
            
            this.renderTasks();
        };

        // Delete Task Method
        TodoApp.prototype.deleteTask = function(listId, taskId) {
            var currentList = this.getCurrentList();
            
            currentList.tasks = currentList.tasks.filter(function(task) {
                return task.id !== taskId;
            });
            
            this.renderTasks();
        };

        // Start Edit Task Method
        TodoApp.prototype.startEditTask = function(task) {
            this.editingTask = task;
            
            this.elements.taskTitle.value = task.title;
            this.elements.taskDescription.value = task.description;
            this.elements.taskDate.value = task.date;
            this.elements.taskTime.value = task.time;

            this.elements.addTaskBtn.textContent = 'Update Task';
        };

        // Reset Task Form Method
        TodoApp.prototype.resetTaskForm = function() {
            this.elements.taskTitle.value = '';
            this.elements.taskDescription.value = '';
            this.elements.taskDate.value = '';
            this.elements.taskTime.value = '';
            this.elements.addTaskBtn.textContent = 'Add Task';
        };

        // Get Current List Method
        TodoApp.prototype.getCurrentList = function() {
            for (var i = 0; i < this.lists.length; i++) {
                if (this.lists[i].id === this.currentListId) {
                    return this.lists[i];
                }
            }
            return this.lists[0]; // Default to first list
        };

        // Initialize App when window loads
        window.addEventListener('load', function() {
            new TodoApp();
        });
    })();
    </script>
</body>
</html>
