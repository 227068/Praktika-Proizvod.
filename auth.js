// frontend/js/auth.js
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const tabs = document.querySelectorAll('.tab');
    
    // Переключение между вкладками
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            loginForm.classList.remove('active');
            registerForm.classList.remove('active');
            
            if (this.dataset.tab === 'login') {
                loginForm.classList.add('active');
            } else {
                registerForm.classList.add('active');
            }
        });
    });
    
    // Вход
    loginBtn.addEventListener('click', function() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorElement = document.getElementById('login-error');
        
        if (!email || !password) {
            errorElement.textContent = 'Заполните все поля';
            return;
        }
        
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Неверный email или пароль');
            }
            return response.json();
        })
        .then(data => {
            localStorage.setItem('token', data.access_token);
            window.location.href = '/';
        })
        .catch(error => {
            errorElement.textContent = error.message;
        });
    });
    
    // Регистрация
    registerBtn.addEventListener('click', function() {
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        const errorElement = document.getElementById('register-error');
        
        if (!email || !password || !confirm) {
            errorElement.textContent = 'Заполните все поля';
            return;
        }
        
        if (password.length < 6) {
            errorElement.textContent = 'Пароль должен содержать минимум 6 символов';
            return;
        }
        
        if (password !== confirm) {
            errorElement.textContent = 'Пароли не совпадают';
            return;
        }
        
        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.detail || 'Ошибка регистрации');
                });
            }
            return response.json();
        })
        .then(data => {
            // Автоматический вход после регистрации
            return fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
            });
        })
        .then(response => {
            if (!response.ok) throw new Error('Ошибка входа');
            return response.json();
        })
        .then(data => {
            localStorage.setItem('token', data.access_token);
            window.location.href = '/';
        })
        .catch(error => {
            errorElement.textContent = error.message;
        });
    });
});