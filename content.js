// content.js — исправленная версия

// ======== НАСТРОЙКИ ПО УМОЛЧАНИЮ ========
let settings = {
    targetLang: 'ru',
    comments: true,
    chat: true,
    auto: true
};

let translatedCount = 0;

// ======== ФУНКЦИЯ ПЕРЕВОДА ЧЕРЕЗ BACKGROUND ========
async function translateText(text, targetLang) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            type: 'translate',
            text: text,
            targetLang: targetLang
        }, (response) => {
            if (response && response.success) {
                resolve(response.translation);
            } else {
                reject(new Error(response?.error || 'Ошибка перевода'));
            }
        });
    });
}

// ======== ПОИСК КОНТЕЙНЕРА КОММЕНТАРИЯ ========

// Находит родительский контейнер комментария
function findCommentContainer(element) {
    let container = element.closest('ytd-comment-view-model, ytd-comment-thread-renderer, #comment, .ytd-comment-renderer, .yt-live-chat-text-message-renderer');
    
    if (!container) {
        let parent = element.parentElement;
        for (let i = 0; i < 5; i++) {
            if (parent) {
                const tagName = parent.tagName?.toLowerCase() || '';
                if (tagName.includes('comment') || parent.id === 'comment') {
                    container = parent;
                    break;
                }
                parent = parent.parentElement;
            }
        }
    }
    
    return container;
}

// Собирает весь текст комментария
function getFullCommentText(container) {
    if (!container) return null;
    
    // Для чата
    if (container.classList?.contains('yt-live-chat-text-message-renderer')) {
        const content = container.querySelector('#content, .yt-live-chat-text-message-renderer #content');
        if (content) {
            const text = content.textContent.trim();
            return text || null;
        }
        return container.textContent.trim() || null;
    }
    
    // Для комментариев — ищем #content-text
    const textContainer = container.querySelector('#content-text, .yt-core-attributed-string, yt-attributed-string#content-text');
    
    if (textContainer) {
        // Берём текст из span с классом ytAttributedStringHost
        const span = textContainer.querySelector('.ytAttributedStringHost');
        if (span) {
            // Получаем текст, удаляем лишние пробелы в начале строк, но сохраняем структуру
            let text = span.textContent;
            // Убираем лишние пробелы в начале каждой строки, но сохраняем переносы
            text = text.split('\n').map(line => line.trim()).join('\n');
            return text || null;
        }
        
        // Если span не нашёлся, берём весь текст
        const text = textContainer.textContent.trim();
        if (text) return text;
    }
    
    // Если не нашли — пробуем найти любой текстовый элемент
    const possibleText = container.querySelector('#content-text, .yt-core-attributed-string, yt-attributed-string');
    if (possibleText) {
        return possibleText.textContent.trim() || null;
    }
    
    // Последняя попытка — весь текст контейнера
    return container.textContent.trim() || null;
}

// ======== ДИЗАЙН: ЭЛЕМЕНТЫ ПЕРЕВОДА ========

function createTranslateButton(container, text) {
    const button = document.createElement('button');
    button.className = 'yt-translator-btn';
    button.textContent = '🌐 Перевести';
    button.style.cssText = `
        background: none;
        border: none;
        color: #3ea6ff;
        font-size: 12px;
        cursor: pointer;
        padding: 4px 8px;
        margin-left: 8px;
        border-radius: 4px;
        transition: background 0.2s;
        font-weight: 500;
        font-family: inherit;
        flex-shrink: 0;
    `;
    
    button.addEventListener('mouseenter', () => {
        button.style.background = 'rgba(62, 166, 255, 0.1)';
    });
    button.addEventListener('mouseleave', () => {
        button.style.background = 'none';
    });
    
    button.addEventListener('click', async (e) => {
        e.stopPropagation();
        e.preventDefault();
        await translateSingleComment(container, text);
    });
    
    return button;
}

function createTranslationElement(text, targetLang) {
    const div = document.createElement('div');
    div.className = 'yt-translator-translation';
    div.style.cssText = `
        color: #3ea6ff;
        font-size: 13px;
        margin-top: 4px;
        padding: 6px 12px 6px 16px;
        border-left: 3px solid #3ea6ff;
        opacity: 0.9;
        font-style: italic;
        background: rgba(62, 166, 255, 0.05);
        border-radius: 0 4px 4px 0;
        animation: fadeIn 0.3s ease;
        display: flex;
        align-items: flex-start;
        gap: 8px;
        line-height: 1.5;
        white-space: pre-wrap;
        word-break: break-word;
        width: 100%;
        box-sizing: border-box;
    `;
    
    // Иконка языка
    const flagIcon = document.createElement('span');
    const flags = {
        'ru': '🇷🇺',
        'uk': '🇺🇦',
        'en': '🇬🇧',
        'de': '🇩🇪',
        'fr': '🇫🇷',
        'es': '🇪🇸',
        'it': '🇮🇹',
        'pt': '🇵🇹',
        'zh': '🇨🇳',
        'ja': '🇯🇵',
        'ko': '🇰🇷'
    };
    flagIcon.textContent = flags[targetLang] || '🌐';
    flagIcon.style.cssText = `
        flex-shrink: 0;
        font-size: 14px;
        margin-top: 2px;
    `;
    
    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    textSpan.style.cssText = `
        flex: 1;
    `;
    
    div.appendChild(flagIcon);
    div.appendChild(textSpan);
    
    // Кнопка скрытия
    const hideButton = document.createElement('button');
    hideButton.textContent = '✕';
    hideButton.style.cssText = `
        background: none;
        border: none;
        color: #666;
        font-size: 14px;
        cursor: pointer;
        padding: 0 4px;
        margin-left: auto;
        opacity: 0.4;
        transition: opacity 0.2s;
        font-weight: bold;
        flex-shrink: 0;
    `;
    hideButton.addEventListener('mouseenter', () => {
        hideButton.style.opacity = '1';
    });
    hideButton.addEventListener('mouseleave', () => {
        hideButton.style.opacity = '0.4';
    });
    hideButton.addEventListener('click', () => {
        div.remove();
    });
    div.appendChild(hideButton);
    
    return div;
}

function createLoadingIndicator() {
    const div = document.createElement('div');
    div.className = 'yt-translator-loading';
    div.style.cssText = `
        color: #888;
        font-size: 12px;
        margin-top: 4px;
        padding-left: 16px;
        font-style: italic;
        animation: pulse 1.5s ease-in-out infinite;
    `;
    div.textContent = '⏳ Перевод...';
    return div;
}

// ======== ОСНОВНАЯ ЛОГИКА ========

function findCommentContainers() {
    const containers = [];
    const seen = new Set();
    
    // Комментарии — ищем ytd-comment-view-model
    if (settings.comments) {
        const commentModels = document.querySelectorAll('ytd-comment-view-model');
        commentModels.forEach(el => {
            if (!seen.has(el)) {
                seen.add(el);
                containers.push(el);
            }
        });
        
        // Запасной вариант: ищем через #content-text
        const textElements = document.querySelectorAll('#content-text, yt-attributed-string#content-text');
        textElements.forEach(el => {
            const container = findCommentContainer(el);
            if (container && !seen.has(container)) {
                seen.add(container);
                containers.push(container);
            }
        });
    }
    
    // Чат
    if (settings.chat) {
        const chatMessages = document.querySelectorAll('.yt-live-chat-text-message-renderer');
        chatMessages.forEach(el => {
            if (!seen.has(el)) {
                seen.add(el);
                containers.push(el);
            }
        });
    }
    
    return containers;
}

function hasTranslateButton(container) {
    return container.querySelector('.yt-translator-btn') !== null;
}

function addTranslateButtons() {
    const containers = findCommentContainers();
    
    containers.forEach(container => {
        if (hasTranslateButton(container)) {
            return;
        }
        
        const text = getFullCommentText(container);
        if (!text || text.length < 1) return;
        
        // Ищем место для вставки кнопки — в заголовке комментария
        let insertPoint = container.querySelector('#header, #author-text, .ytd-comment-view-model #header');
        
        // Если не нашли, ищем author-text
        if (!insertPoint) {
            insertPoint = container.querySelector('[id*="author"], [id*="header"]');
        }
        
        // Если всё ещё не нашли, используем сам контейнер
        if (!insertPoint) {
            insertPoint = container;
        }
        
        const button = createTranslateButton(container, text);
        insertPoint.appendChild(button);
    });
}

async function translateSingleComment(container, text) {
    // Проверяем, есть ли уже перевод
    const existingTranslation = container.querySelector('.yt-translator-translation');
    if (existingTranslation) {
        existingTranslation.remove();
        return;
    }
    
    // Находим место для вставки перевода
    let textContainer = container.querySelector('#content-text, .yt-core-attributed-string, yt-attributed-string#content-text');
    if (!textContainer) {
        textContainer = container;
    }
    
    // Добавляем индикатор загрузки
    const loadingIndicator = createLoadingIndicator();
    textContainer.parentElement.insertBefore(loadingIndicator, textContainer.nextSibling);
    
    try {
        // Отправляем текст с сохранением переносов строк
        const translation = await translateText(text, settings.targetLang);
        
        loadingIndicator.remove();
        
        const translationElement = createTranslationElement(translation, settings.targetLang);
        textContainer.parentElement.insertBefore(translationElement, textContainer.nextSibling);
        
        translatedCount++;
        updateStats();
        
    } catch (error) {
        loadingIndicator.remove();
        showError(container, 'Ошибка перевода');
        console.error('Translation error:', error);
    }
}

async function translateAll() {
    const containers = findCommentContainers();
    let count = 0;
    
    for (const container of containers) {
        if (container.querySelector('.yt-translator-translation')) {
            continue;
        }
        
        const text = getFullCommentText(container);
        if (!text || text.length < 2) continue;
        
        await translateSingleComment(container, text);
        count++;
        await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    return count;
}

function showError(container, message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        color: #ff6b6b;
        font-size: 12px;
        margin-top: 4px;
        padding-left: 16px;
    `;
    errorDiv.textContent = `⚠️ ${message}`;
    container.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

function updateStats() {
    chrome.runtime.sendMessage({
        type: 'statsUpdated',
        count: translatedCount
    });
}

// ======== CSS АНИМАЦИИ ========

function addStyles() {
    if (document.getElementById('yt-translator-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'yt-translator-styles';
    style.textContent = `
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(-5px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
        }
        
        .yt-translator-translation {
            animation: fadeIn 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

// ======== НАБЛЮДАТЕЛЬ ========

function setupObserver() {
    let timeoutId = null;
    
    const observer = new MutationObserver(() => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            if (settings.auto) {
                addTranslateButtons();
            }
        }, 500);
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// ======== ОБРАБОТКА СООБЩЕНИЙ ========

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'settingsChanged') {
        settings = { ...settings, ...request.settings };
        if (settings.auto) {
            addTranslateButtons();
        }
        sendResponse({ success: true });
    }
    
    if (request.type === 'translateAll') {
        translateAll().then(count => {
            sendResponse({ count });
        });
        return true;
    }
    
    if (request.type === 'getStats') {
        sendResponse({ count: translatedCount });
    }
});

// ======== ИНИЦИАЛИЗАЦИЯ ========

chrome.storage.sync.get(['settings'], (result) => {
    if (result.settings) {
        settings = { ...settings, ...result.settings };
    }
    
    addStyles();
    setupObserver();
    
    // Ждём загрузки
    setTimeout(() => {
        addTranslateButtons();
    }, 2000);
    
    setTimeout(() => {
        addTranslateButtons();
    }, 5000);
});

console.log('🌐 YouTube Translator v2 загружен!');