// popup.js — исправленная версия с проверкой

document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    
    // Обработчики для переключателей
    document.querySelectorAll('.toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            this.classList.toggle('active');
            saveSettings();
            sendSettingsToTab();
        });
    });
    
    // Обработчик для выбора языка
    document.getElementById('targetLang').addEventListener('change', function() {
        saveSettings();
        sendSettingsToTab();
    });
    
    // Кнопка "Перевести всё сейчас"
    document.getElementById('translateNow').addEventListener('click', function() {
        this.textContent = '⏳ Перевожу...';
        this.disabled = true;
        
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (!tabs[0] || !tabs[0].url) {
                this.textContent = '❌ Ошибка';
                setTimeout(() => {
                    this.textContent = '🔃 Перевести всё сейчас';
                    this.disabled = false;
                }, 1500);
                return;
            }
            
            // Проверяем, что это YouTube
            if (!tabs[0].url.includes('youtube.com')) {
                this.textContent = '❌ Не YouTube';
                setTimeout(() => {
                    this.textContent = '🔃 Перевести всё сейчас';
                    this.disabled = false;
                }, 1500);
                return;
            }
            
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'translateAll'
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.log('Ошибка:', chrome.runtime.lastError.message);
                    this.textContent = '❌ Ошибка';
                } else {
                    this.textContent = '✅ Готово!';
                }
                setTimeout(() => {
                    this.textContent = '🔃 Перевести всё сейчас';
                    this.disabled = false;
                }, 1500);
            });
        });
    });
    
    // Запрашиваем статистику
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (!tabs[0] || !tabs[0].url || !tabs[0].url.includes('youtube.com')) {
            return;
        }
        
        chrome.tabs.sendMessage(tabs[0].id, {
            type: 'getStats'
        }, (response) => {
            if (response && response.count !== undefined) {
                document.getElementById('translatedCount').textContent = response.count;
            }
        });
    });
});

function sendSettingsToTab() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        // Проверяем, что вкладка существует и это YouTube
        if (!tabs[0] || !tabs[0].url || !tabs[0].url.includes('youtube.com')) {
            return;
        }
        
        chrome.tabs.sendMessage(tabs[0].id, {
            type: 'settingsChanged',
            settings: getCurrentSettings()
        }).catch(() => {
            // Игнорируем ошибку
        });
    });
}

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