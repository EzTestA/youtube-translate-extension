// popup.js — логика управления попапом

document.addEventListener('DOMContentLoaded', function() {
    // Загружаем сохранённые настройки
    loadSettings();
    
    // Обработчики для переключателей
    document.querySelectorAll('.toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            this.classList.toggle('active');
            saveSettings();
            
            // Сообщаем content-скрипту об изменении настроек
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'settingsChanged',
                    settings: getCurrentSettings()
                });
            });
        });
    });
    
    // Обработчик для выбора языка
    document.getElementById('targetLang').addEventListener('change', function() {
        saveSettings();
        
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'settingsChanged',
                settings: getCurrentSettings()
            });
        });
    });
    
    // Кнопка "Перевести всё сейчас"
    document.getElementById('translateNow').addEventListener('click', function() {
        this.textContent = '⏳ Перевожу...';
        this.disabled = true;
        
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'translateAll'
            }, (response) => {
                this.textContent = '✅ Готово!';
                setTimeout(() => {
                    this.textContent = '🔃 Перевести всё сейчас';
                    this.disabled = false;
                }, 1500);
            });
        });
    });
    
    // Запрашиваем статистику
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            type: 'getStats'
        }, (response) => {
            if (response && response.count !== undefined) {
                document.getElementById('translatedCount').textContent = response.count;
            }
        });
    });
});

function loadSettings() {
    chrome.storage.sync.get(['settings'], (result) => {
        const settings = result.settings || {
            targetLang: 'ru',
            comments: true,
            chat: true,
            auto: true
        };
        
        document.getElementById('targetLang').value = settings.targetLang;
        
        document.querySelectorAll('.toggle').forEach(toggle => {
            const setting = toggle.dataset.setting;
            if (settings[setting] !== undefined) {
                toggle.classList.toggle('active', settings[setting]);
            }
        });
    });
}

function saveSettings() {
    const settings = getCurrentSettings();
    chrome.storage.sync.set({ settings });
}

function getCurrentSettings() {
    const settings = {
        targetLang: document.getElementById('targetLang').value
    };
    
    document.querySelectorAll('.toggle').forEach(toggle => {
        settings[toggle.dataset.setting] = toggle.classList.contains('active');
    });
    
    return settings;
}