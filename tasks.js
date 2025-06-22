// frontend/js/tasks.js
document.addEventListener('DOMContentLoaded', function() {
    const taskList = document.getElementById('task-list');
    const statusFilter = document.getElementById('status-filter');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const addTaskBtn = document.getElementById('add-task');
    const logoutBtn = document.getElementById('logout-btn');
    const modal = document.getElementById('task-modal');
    const closeBtn = document.querySelector('.close');
    const taskForm = document.getElementById('task-form');
    
    let token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = '/auth.html';
    }
    
    // Загрузка задач
    function loadTasks(status = '') {
        let url = '/api/tasks';
        if (status) {
            url += `?status=${status}`;
        }
        
        fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.status === 401) {
                logout();
                return;
            }
            return response.json();
        })
        .then(tasks => {
            taskList.innerHTML = '';
            if (tasks && tasks.length > 0) {
                tasks.forEach(task => {
                    const taskElement = document.createElement('div');
                    taskElement.className = 'task';
                    taskElement.innerHTML = `
                        <h3>${task.title}</h3>
                        <p>${task.description || 'Нет описания'}</p>
                        <div class="task-footer">
                            <span class="status ${task.status.toLowerCase().replace(' ', '-')}">${task.status}</span>
                            <span class="date">${new Date(task.created_at).toLocaleDateString()}</span>
                            <button class="edit-btn" data-id="${task.id}">Редактировать</button>
                            <button class="delete-btn" data-id="${task.id}">Удалить</button>
                        </div>
                    `;
                    taskList.appendChild(taskElement);
                });
                
                // Добавляем обработчики для кнопок редактирования и удаления
                document.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        openEditModal(this.getAttribute('data-id'));
                    });
                });
                
                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        deleteTask(this.getAttribute('data-id'));
                    });
                });
            } else {
                taskList.innerHTML = '<p>Нет задач</p>';
            }
        })
        .catch(error => console.error('Ошибка:', error));
    }
    
    // Открытие модального окна для создания задачи
    function openAddModal() {
        document.getElementById('modal-title').textContent = 'Новая задача';
        document.getElementById('task-id').value = '';
        document.getElementById('title').value = '';
        document.getElementById('description').value = '';
        document.getElementById('status').value = 'Новая';
        modal.style.display = 'block';
    }
    
    // Открытие модального окна для редактирования задачи
    function openEditModal(taskId) {
        fetch(`/api/tasks/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(task => {
            document.getElementById('modal-title').textContent = 'Редактировать задачу';
            document.getElementById('task-id').value = task.id;
            document.getElementById('title').value = task.title;
            document.getElementById('description').value = task.description || '';
            document.getElementById('status').value = task.status;
            modal.style.display = 'block';
        })
        .catch(error => console.error('Ошибка:', error));
    }
    
    // Удаление задачи
    function deleteTask(taskId) {
        if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
            fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                if (response.ok) {
                    loadTasks(statusFilter.value);
                }
            })
            .catch(error => console.error('Ошибка:', error));
        }
    }
    
    // Сохранение задачи
    function saveTask(e) {
        e.preventDefault();
        
        const taskId = document.getElementById('task-id').value;
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const status = document.getElementById('status').value;
        
        const taskData = {
            title: title,
            description: description,
            status: status
        };
        
        const url = taskId ? `/api/tasks/${taskId}` : '/api/tasks';
        const method = taskId ? 'PUT' : 'POST';
        
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(taskData)
        })
        .then(response => {
            if (response.ok) {
                modal.style.display = 'none';
                loadTasks(statusFilter.value);
            }
        })
        .catch(error => console.error('Ошибка:', error));
    }
    
    // Выход из системы
    function logout() {
        localStorage.removeItem('token');
        window.location.href = '/auth.html';
    }
    
    // Обработчики событий
    applyFiltersBtn.addEventListener('click', function() {
        loadTasks(statusFilter.value);
    });
    
    addTaskBtn.addEventListener('click', openAddModal);
    
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    taskForm.addEventListener('submit', saveTask);
    
    logoutBtn.addEventListener('click', logout);
    
    // Первоначальная загрузка задач
    loadTasks();
});