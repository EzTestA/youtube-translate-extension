// content.js — с поддержкой чата через кнопки

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

// ======== ПОИСК КОНТЕЙНЕРА ========

function findCommentContainer(element) {
    let container = element.closest('ytd-comment-view-model, ytd-comment-thread-renderer, #comment, .ytd-comment-renderer');
    
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

function findChatContainer(element) {
    return element.closest('yt-live-chat-text-message-renderer');
}

// ======== СБОР ТЕКСТА ========

function getFullCommentText(container) {
    if (!container) return null;
    
    // Для чата
    if (container.tagName === 'YT-LIVE-CHAT-TEXT-MESSAGE-RENDERER') {
        const messageSpan = container.querySelector('#message');
        if (messageSpan) {
            let text = messageSpan.textContent.trim();
            // Убираем эмодзи, оставляем только текст
            text = text.replace(/[\u{1F000}-\u{1FFFF}]/gu, '').trim();
            return text || null;
        }
        return container.textContent.trim() || null;
    }
    
    // Для комментариев
    const textContainer = container.querySelector('#content-text, .yt-core-attributed-string, yt-attributed-string#content-text');
    
    if (textContainer) {
        const span = textContainer.querySelector('.ytAttributedStringHost');
        if (span) {
            let text = span.textContent;
            text = text.split('\n').map(line => line.trim()).join('\n');
            return text || null;
        }
        const text = textContainer.textContent.trim();
        if (text) return text;
    }
    
    const possibleText = container.querySelector('#content-text, .yt-core-attributed-string, yt-attributed-string');
    if (possibleText) {
        return possibleText.textContent.trim() || null;
    }
    
    return container.textContent.trim() || null;
}

// ======== ДИЗАЙН ========

function createTranslateButton(container, text, isChat = false) {
    const button = document.createElement('button');
    button.className = 'yt-translator-btn';
    button.textContent = '🌐 Перевести';
    button.style.cssText = `
        background: none;
        border: none;
        color: #3ea6ff;
        font-size: ${isChat ? '11px' : '12px'};
        cursor: pointer;
        padding: ${isChat ? '2px 6px' : '4px 8px'};
        margin-left: ${isChat ? '4px' : '8px'};
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
        await translateSingleComment(container, text, isChat);
    });
    
    return button;
}

function createTranslationElement(text, targetLang, isChat = false) {
    const div = document.createElement('div');
    div.className = 'yt-translator-translation';
    div.style.cssText = `
        color: #3ea6ff;
        font-size: ${isChat ? '12px' : '13px'};
        margin-top: ${isChat ? '2px' : '4px'};
        padding: ${isChat ? '4px 8px 4px 12px' : '6px 12px 6px 16px'};
        border-left: 2px solid #3ea6ff;
        opacity: 0.9;
        font-style: italic;
        background: rgba(62, 166, 255, 0.05);
        border-radius: 0 4px 4px 0;
        animation: fadeIn 0.3s ease;
        display: flex;
        align-items: flex-start;
        gap: 6px;
        line-height: ${isChat ? '1.3' : '1.5'};
        white-space: pre-wrap;
        word-break: break-word;
        width: 100%;
        box-sizing: border-box;
    `;
    
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
    
    const flagIcon = document.createElement('span');
    flagIcon.textContent = flags[targetLang] || '🌐';
    flagIcon.style.cssText = `
        flex-shrink: 0;
        font-size: ${isChat ? '12px' : '14px'};
        margin-top: 1px;
    `;
    
    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    textSpan.style.cssText = 'flex: 1;';
    
    div.appendChild(flagIcon);
    div.appendChild(textSpan);
    
    const hideButton = document.createElement('button');
    hideButton.textContent = '✕';
    hideButton.style.cssText = `
        background: none;
        border: none;
        color: #666;
        font-size: ${isChat ? '11px' : '14px'};
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

function createLoadingIndicator(isChat = false) {
    const div = document.createElement('div');
    div.className = 'yt-translator-loading';
    div.style.cssText = `
        color: #888;
        font-size: ${isChat ? '11px' : '12px'};
        margin-top: ${isChat ? '2px' : '4px'};
        padding-left: ${isChat ? '10px' : '16px'};
        font-style: italic;
        animation: pulse 1.5s ease-in-out infinite;
    `;
    div.textContent = '⏳ Перевод...';
    return div;
}

// ======== ОСНОВНАЯ ЛОГИКА ========

function findChatContainers() {
    const containers = [];
    const seen = new Set();
    
    if (settings.chat) {
        const chatMessages = document.querySelectorAll('yt-live-chat-text-message-renderer');
        chatMessages.forEach(el => {
            if (!seen.has(el)) {
                if (el.hidden || el.style.display === 'none') return;
                seen.add(el);
                containers.push(el);
            }
        });
    }
    
    return containers;
}

function findCommentContainers() {
    const containers = [];
    const seen = new Set();
    
    if (settings.comments) {
        const commentModels = document.querySelectorAll('ytd-comment-view-model');
        commentModels.forEach(el => {
            if (!seen.has(el)) {
                seen.add(el);
                containers.push(el);
            }
        });
        
        const textElements = document.querySelectorAll('#content-text, yt-attributed-string#content-text');
        textElements.forEach(el => {
            const container = findCommentContainer(el);
            if (container && !seen.has(container)) {
                seen.add(container);
                containers.push(container);
            }
        });
    }
    
    return containers;
}

function hasTranslateButton(container) {
    return container.querySelector('.yt-translator-btn') !== null;
}

function hasTranslation(container) {
    return container.querySelector('.yt-translator-translation') !== null;
}

function addTranslateButtons() {
    // ===== ЧАТ =====
    const chatContainers = findChatContainers();
    chatContainers.forEach(container => {
        if (hasTranslateButton(container)) return;
        
        const text = getFullCommentText(container);
        if (!text || text.length < 1) return;
        
        let insertPoint = container.querySelector('#author-name, yt-live-chat-author-chip');
        if (!insertPoint) {
            insertPoint = container.querySelector('#content, .yt-live-chat-text-message-renderer #content');
        }
        if (!insertPoint) {
            insertPoint = container;
        }
        
        const button = createTranslateButton(container, text, true);
        insertPoint.appendChild(button);
    });
    
    // ===== КОММЕНТАРИИ =====
    const commentContainers = findCommentContainers();
    commentContainers.forEach(container => {
        if (hasTranslateButton(container)) return;
        
        const text = getFullCommentText(container);
        if (!text || text.length < 1) return;
        
        let insertPoint = container.querySelector('#header, #author-text, .ytd-comment-view-model #header');
        if (!insertPoint) {
            insertPoint = container.querySelector('[id*="author"], [id*="header"]');
        }
        if (!insertPoint) {
            insertPoint = container;
        }
        
        const button = createTranslateButton(container, text, false);
        insertPoint.appendChild(button);
    });
}

async function translateSingleComment(container, text, isChat = false) {
    if (hasTranslation(container)) {
        const existing = container.querySelector('.yt-translator-translation');
        if (existing) existing.remove();
        return;
    }
    
    let textContainer;
    if (isChat) {
        textContainer = container.querySelector('#message-container, #content, .yt-live-chat-text-message-renderer #content');
        if (!textContainer) textContainer = container;
    } else {
        textContainer = container.querySelector('#content-text, .yt-core-attributed-string, yt-attributed-string#content-text');
        if (!textContainer) textContainer = container;
    }
    
    const loadingIndicator = createLoadingIndicator(isChat);
    textContainer.parentElement.insertBefore(loadingIndicator, textContainer.nextSibling);
    
    try {
        const translation = await translateText(text, settings.targetLang);
        loadingIndicator.remove();
        
        const translationElement = createTranslationElement(translation, settings.targetLang, isChat);
        textContainer.parentElement.insertBefore(translationElement, textContainer.nextSibling);
        
        translatedCount++;
        updateStats();
        
    } catch (error) {
        loadingIndicator.remove();
        showError(container, 'Ошибка перевода', isChat);
        console.error('Translation error:', error);
    }
}

async function translateAll() {
    let count = 0;
    
    // Чат
    const chatContainers = findChatContainers();
    for (const container of chatContainers) {
        if (hasTranslation(container)) continue;
        const text = getFullCommentText(container);
        if (!text || text.length < 2) continue;
        await translateSingleComment(container, text, true);
        count++;
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Комментарии
    const commentContainers = findCommentContainers();
    for (const container of commentContainers) {
        if (hasTranslation(container)) continue;
        const text = getFullCommentText(container);
        if (!text || text.length < 2) continue;
        await translateSingleComment(container, text, false);
        count++;
        await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    return count;
}

function showError(container, message, isChat = false) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        color: #ff6b6b;
        font-size: ${isChat ? '11px' : '12px'};
        margin-top: ${isChat ? '2px' : '4px'};
        padding-left: ${isChat ? '10px' : '16px'};
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

// ======== CSS ========

function addStyles() {
    if (document.getElementById('yt-translator-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'yt-translator-styles';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-3px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
        }
        .yt-translator-translation { animation: fadeIn 0.3s ease; }
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
        }, 300);
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
    
    // Первоначальная загрузка
    setTimeout(() => {
        addTranslateButtons();
    }, 2000);
    
    setTimeout(() => {
        addTranslateButtons();
    }, 5000);
    
    // Для чата — частая проверка
    setInterval(() => {
        if (settings.chat && settings.auto) {
            addTranslateButtons();
        }
    }, 3000);
});

console.log('🌐 YouTube Translator v3 (с поддержкой чата) загружен!');