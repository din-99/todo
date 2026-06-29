// ============================================================
//  Todo App — полностью локальная версия (localStorage)
//  Не требует запуска json-server, данные сохраняются в браузере
// ============================================================

let currentFilter = 'all';  // 'all', 'active', 'completed'
let todos = [];

// === ЗАГРУЗКА ПРИ СТАРТЕ ===
window.addEventListener("load", () => {
    loadTodos();
});

// === РАБОТА С ХРАНИЛИЩЕМ ===

// Загрузить задачи из localStorage
function loadTodos() {
    const stored = localStorage.getItem('todos');
    if (stored) {
        try {
            todos = JSON.parse(stored);
        } catch (e) {
            todos = [];
        }
    } else {
        // Если нет данных, создаём пару тестовых задач
        todos = [
            { id: Date.now() + 1, title: 'Изучить JavaScript', status: false, createdAt: new Date().toLocaleString() },
            { id: Date.now() + 2, title: 'Написать Todo App', status: true, createdAt: new Date().toLocaleString() }
        ];
        saveTodos();
    }
    renderTodos(todos);
    updateCounter(todos);
}

// Сохранить задачи в localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// === ОСНОВНЫЕ ОПЕРАЦИИ ===

// Добавить задачу
function addTodoItem() {
    const input = document.getElementById("todo");
    const title = input.value.trim();
    if (!title) return alert('Введите текст задачи');

    const newTodo = {
        id: Date.now(),
        title: title,
        status: false,
        createdAt: new Date().toLocaleString()
    };
    todos.unshift(newTodo); // добавляем в начало списка
    saveTodos();
    renderTodos(todos);
    updateCounter(todos);
    input.value = '';
}

// Удалить задачу
function deleteTodo(id) {
    if (!confirm('Удалить задачу?')) return;
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos(todos);
    updateCounter(todos);
}

// Переключить статус
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    todo.status = !todo.status;
    saveTodos();
    renderTodos(todos);
    updateCounter(todos);
}

// Редактировать задачу (по двойному клику или кнопке)
function editTodoInline(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const newTitle = prompt('Редактировать задачу:', todo.title);
    if (newTitle === null || newTitle.trim() === '') return;
    todo.title = newTitle.trim();
    saveTodos();
    renderTodos(todos);
    // счётчик не меняется, но обновим
    updateCounter(todos);
}

// Очистить все выполненные задачи
function clearCompleted() {
    const completed = todos.filter(t => t.status === true);
    if (completed.length === 0) return alert('Нет выполненных задач');
    if (!confirm(`Удалить ${completed.length} выполненных задач?`)) return;
    todos = todos.filter(t => t.status === false);
    saveTodos();
    renderTodos(todos);
    updateCounter(todos);
}

// === ОТРИСОВКА ===

function renderTodos(data) {
    const container = document.getElementById("dataContainer");
    container.innerHTML = '';

    let filtered = data;
    if (currentFilter === 'active') {
        filtered = data.filter(t => t.status === false);
    } else if (currentFilter === 'completed') {
        filtered = data.filter(t => t.status === true);
    }

    if (filtered.length === 0) {
        container.innerHTML = '<p class="text-center">Нет задач</p>';
        return;
    }

    filtered.forEach(({ id, title, status, createdAt }) => {
        const col = document.createElement("div");
        col.className = "col-md-4 card-div mb-3";

        const card = document.createElement("div");
        card.className = "card w-100";

        const cardBody = document.createElement("div");
        cardBody.className = "card-body";

        const h5 = document.createElement("h3");
        h5.className = "card-title";
        h5.innerText = title;
        h5.style.cursor = 'pointer';
        h5.title = 'Двойной клик для редактирования';
        h5.addEventListener('dblclick', () => editTodoInline(id));

        const p = document.createElement("p");
        p.className = "card-text";
        p.innerText = status ? "✅ Выполнено" : "⏳ Активно";
        p.style.color = status ? 'green' : 'orange';

        const dateSpan = document.createElement("span");
        dateSpan.className = "todo-date";
        dateSpan.innerText = `📅 ${createdAt || 'не указана'}`;

        const toggleBtn = document.createElement("button");
        toggleBtn.className = "btn btn-primary btn-sm me-1";
        toggleBtn.innerText = status ? "↩️ Вернуть" : "✅ Выполнить";
        toggleBtn.onclick = () => toggleTodo(id);

        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-warning btn-sm me-1";
        editBtn.innerText = "✏️ Edit";
        editBtn.onclick = () => editTodoInline(id);

        const removeBtn = document.createElement("button");
        removeBtn.className = "btn btn-danger btn-sm";
        removeBtn.innerText = "🗑️ Remove";
        removeBtn.onclick = () => deleteTodo(id);

        cardBody.append(h5, p, dateSpan, document.createElement('br'), toggleBtn, editBtn, removeBtn);
        card.append(cardBody);
        col.append(card);
        container.append(col);
    });

    updateCounter(data);
}

function updateCounter(data) {
    const active = data.filter(t => t.status === false).length;
    document.getElementById('counter').textContent = `Осталось: ${active}`;
}

// === ОБРАБОТЧИКИ СОБЫТИЙ ===
document.getElementById("add_todo").addEventListener("click", addTodoItem);
document.getElementById("todo").addEventListener("keypress", (e) => {
    if (e.key === 'Enter') addTodoItem();
});

// Фильтры
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        renderTodos(todos);
    });
});

// Очистка выполненных
document.getElementById("clearCompleted").addEventListener("click", clearCompleted);