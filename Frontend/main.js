// === КОНФИГУРАЦИЯ ===
// Для локальной разработки используем localhost
// При деплое на Render замените на URL вашего бэкенда
const API_BASE = 'http://localhost:3000/todo';  // ← измените на ваш URL после деплоя
let currentFilter = 'all';  // 'all', 'active', 'completed'
let todos = [];

// === ЗАГРУЗКА ПРИ СТАРТЕ ===
window.addEventListener("load", () => {
    fetchTodos();
});

// === ФУНКЦИИ РАБОТЫ С API ===

// Получить все задачи
async function fetchTodos() {
    try {
        const res = await fetch(API_BASE);
        todos = await res.json();
        renderTodos(todos);
        updateCounter(todos);
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}

// Добавить задачу
async function addTodoItem() {
    const input = document.getElementById("todo");
    const title = input.value.trim();
    if (!title) return alert('Введите текст задачи');

    const newTodo = {
        title: title,
        status: false,
        createdAt: new Date().toLocaleString(),
        id: Date.now()
    };

    try {
        const res = await fetch(API_BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTodo)
        });
        if (res.ok) {
            input.value = '';
            await fetchTodos();
        }
    } catch (error) {
        console.error('Ошибка добавления:', error);
    }
}

// Удалить задачу
async function deleteTodo(id) {
    if (!confirm('Удалить задачу?')) return;
    try {
        await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
        await fetchTodos();
    } catch (error) {
        console.error('Ошибка удаления:', error);
    }
}

// Переключить статус (активно/выполнено)
async function toggleTodo(id) {
    try {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;
        const updated = { status: !todo.status };
        await fetch(`${API_BASE}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated)
        });
        await fetchTodos();
    } catch (error) {
        console.error('Ошибка переключения:', error);
    }
}

// Редактирование через prompt (inline-редактирование по двойному клику)
async function editTodoInline(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const newTitle = prompt('Редактировать задачу:', todo.title);
    if (newTitle === null || newTitle.trim() === '') return;
    try {
        await fetch(`${API_BASE}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle.trim() })
        });
        await fetchTodos();
    } catch (error) {
        console.error('Ошибка редактирования:', error);
    }
}

// Очистить все выполненные задачи
async function clearCompleted() {
    const completed = todos.filter(t => t.status === true);
    if (completed.length === 0) return alert('Нет выполненных задач');
    if (!confirm(`Удалить ${completed.length} выполненных задач?`)) return;
    try {
        for (const todo of completed) {
            await fetch(`${API_BASE}/${todo.id}`, { method: "DELETE" });
        }
        await fetchTodos();
    } catch (error) {
        console.error('Ошибка очистки:', error);
    }
}

// === ОТРИСОВКА ===

// Отрисовать задачи с учётом фильтра
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

        // Заголовок (с возможностью редактирования по двойному клику)
        const h5 = document.createElement("h3");
        h5.className = "card-title";
        h5.innerText = title;
        h5.style.cursor = 'pointer';
        h5.title = 'Двойной клик для редактирования';
        h5.addEventListener('dblclick', () => editTodoInline(id));

        // Статус
        const p = document.createElement("p");
        p.className = "card-text";
        p.innerText = status ? "✅ Выполнено" : "⏳ Активно";
        p.style.color = status ? 'green' : 'orange';

        // Дата создания
        const dateSpan = document.createElement("span");
        dateSpan.className = "todo-date";
        dateSpan.innerText = `📅 ${createdAt || 'не указана'}`;

        // Кнопки управления
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

// Обновить счётчик активных задач
function updateCounter(data) {
    const active = data.filter(t => t.status === false).length;
    document.getElementById('counter').textContent = `Осталось: ${active}`;
}

// === ОБРАБОТЧИКИ СОБЫТИЙ ===

// Добавление задачи по кнопке
document.getElementById("add_todo").addEventListener("click", addTodoItem);

// Добавление по Enter
document.getElementById("todo").addEventListener("keypress", (e) => {
    if (e.key === 'Enter') addTodoItem();
});

// Фильтрация
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