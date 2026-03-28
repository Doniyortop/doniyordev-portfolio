document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const contactForm = document.getElementById('contactForm');

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
            
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    let isSubmitting = false;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (isSubmitting) return;

        const formData = new FormData(this);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            message: formData.get('message')
        };
        
        // Валидация полей
        if (!data.name || !data.email || !data.message) {
            showNotification('Пожалуйста, заполните все обязательные поля', 'error');
            return;
        }
        
        if (!isValidEmail(data.email)) {
            showNotification('Пожалуйста, введите корректный email', 'error');
            return;
        }
        
        // Показываем уведомление об отправке
        showNotification('Отправка заявки...', 'info');
        
        isSubmitting = true;
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        // Отправка в Telegram бота
        sendToTelegramBot(data).finally(() => {
            isSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        });
        
        // Очищаем форму
        this.reset();
    });

    function sendToTelegramBot(data) {
        const botToken = '8734249847:AAENDD9nxKbMRCE8mYgD9nT3TZhsC3MwoFc';
        const chatId = '6215212292';
        
        const message = `<b>🔔 НОВАЯ ЗАЯВКА С ПОРТФОЛИО 🔔</b>\n\n<b>👤 Имя:</b> ${data.name}\n<b>📧 Email:</b> ${data.email}\n<b>📱 Телефон:</b> ${data.phone || 'Не указан'}\n<b>📝 Проект:</b> ${data.message}`;
        
        return fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.ok) {
                console.log('Сообщение успешно отправлено в Telegram');
                showNotification('✅ Заявка успешно отправлена! Я свяжусь с вами в ближайшее время.', 'success');
            } else {
                console.error('Ошибка отправки:', result);
                showNotification('❌ Ошибка отправки. Попробуйте позже.', 'error');
            }
        })
        .catch(error => {
            console.error('Ошибка сети:', error);
            showNotification('❌ Ошибка соединения. Проверьте интернет.', 'error');
        });
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showNotification(message, type) {
        // Удаляем существующие уведомления
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => {
            if (notif.parentNode) {
                notif.parentNode.removeChild(notif);
            }
        });
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Автоматическое скрытие
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Анимация при прокрутке
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.project-card, .price-card, .skill-item');
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // Изменение хедера при прокрутке с оптимизацией
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                const header = document.querySelector('.header');
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                if (scrollTop > 100) {
                    header.style.backgroundColor = 'rgba(15, 23, 42, 0.98)';
                    header.style.backdropFilter = 'blur(10px)';
                } else {
                    header.style.backgroundColor = 'rgba(15, 23, 42, 0.95)';
                    header.style.backdropFilter = 'none';
                }
                scrollTimeout = null;
            }, 50);
        }
    });

    // Анимация кнопок
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    heroButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Логика отображения аватарки
    const avatars = [
        { img: document.getElementById('avatarImage'), icon: document.getElementById('avatarIcon') },
        { img: document.querySelector('.mobile-avatar-img'), icon: document.querySelector('.mobile-avatar-icon') }
    ];

    avatars.forEach(avatar => {
        if (avatar.img) {
            avatar.img.onload = function() {
                avatar.img.style.display = 'block';
                if (avatar.icon) avatar.icon.style.display = 'none';
            };
            
            avatar.img.onerror = function() {
                avatar.img.style.display = 'none';
                if (avatar.icon) avatar.icon.style.display = 'block';
            };
            
            // Перезагружаем src, чтобы сработал onload/onerror
            const currentSrc = avatar.img.src;
            avatar.img.src = currentSrc;
        }
    });

    // Обработка кликов по карточкам проектов
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card) => {
        card.addEventListener('click', function() {
            const url = this.getAttribute('data-url');
            if (url) {
                window.open(url, '_blank');
            } else {
                const title = this.querySelector('h3').textContent;
                showNotification(`📁 Проект: ${title}`, 'info');
            }
        });
    });
});
