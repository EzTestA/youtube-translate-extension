// popup.js — с фиксом сохранения языка

// ======== ПЕРЕВОДЫ ИНТЕРФЕЙСА ========
const uiTranslations = {
    'ru': {
        appTitle: 'YouTube Translator',
        labelTargetLang: '🎯 Переводить на язык',
        previewOriginal: 'Это комментарий на английском',
        previewTranslation: '🇷🇺 Это комментарий на английском',
        statsTranslated: 'Переведено: {count}',
        statsApi: '⚡ Google Translate',
        footerNote: '💡 Нажмите «🌐 Перевести» под комментарием'
    },
    'uk': {
        appTitle: 'YouTube Translator',
        labelTargetLang: '🎯 Перекладати на мову',
        previewOriginal: 'Це коментар англійською',
        previewTranslation: '🇺🇦 Це коментар англійською',
        statsTranslated: 'Перекладено: {count}',
        statsApi: '⚡ Google Translate',
        footerNote: '💡 Натисніть «🌐 Перекласти» під коментарем'
    },
    'en': {
        appTitle: 'YouTube Translator',
        labelTargetLang: '🎯 Translate to language',
        previewOriginal: 'This is a comment in English',
        previewTranslation: '🇬🇧 This is a comment in English',
        statsTranslated: 'Translated: {count}',
        statsApi: '⚡ Google Translate',
        footerNote: '💡 Click «🌐 Translate» under the comment'
    },
    'de': {
        appTitle: 'YouTube Translator',
        labelTargetLang: '🎯 Übersetzen auf Sprache',
        previewOriginal: 'Dies ist ein Kommentar auf Englisch',
        previewTranslation: '🇩🇪 Dies ist ein Kommentar auf Englisch',
        statsTranslated: 'Übersetzt: {count}',
        statsApi: '⚡ Google Translate',
        footerNote: '💡 Klicken Sie auf «🌐 Übersetzen» unter dem Kommentar'
    },
    'fr': {
        appTitle: 'YouTube Translator',
        labelTargetLang: '🎯 Traduire en langue',
        previewOriginal: 'Ceci est un commentaire en anglais',
        previewTranslation: '🇫🇷 Ceci est un commentaire en anglais',
        statsTranslated: 'Traduit: {count}',
        statsApi: '⚡ Google Translate',
        footerNote: '💡 Cliquez sur «🌐 Traduire» sous le commentaire'
    },
    'es': {
        appTitle: 'YouTube Translator',
        labelTargetLang: '🎯 Traducir al idioma',
        previewOriginal: 'Este es un comentario en inglés',
        previewTranslation: '🇪🇸 Este es un comentario en inglés',
        statsTranslated: 'Traducido: {count}',
        statsApi: '⚡ Google Translate',
        footerNote: '💡 Haz clic en «🌐 Traducir» debajo del comentario'
    },
    'it': {
        appTitle: 'YouTube Translator',
        labelTargetLang: '🎯 Traduci in lingua',
        previewOriginal: 'Questo è un commento in inglese',
        previewTranslation: '🇮🇹 Questo è un commento in inglese',
        statsTranslated: 'Tradotto: {count}',
        statsApi: '⚡ Google Translate',
        footerNote: '💡 Clicca su «🌐 Traduci» sotto il commento'
    },
    'pt': {
        appTitle: 'YouTube Translator',
        labelTargetLang: '🎯 Traduzir para idioma',
        previewOriginal: 'Este é um comentário em inglês',
        previewTranslation: '🇵🇹 Este é um comentário em inglês',
        statsTranslated: 'Traduzido: {count}',
        statsApi: '⚡ Google Translate',
        footerNote: '💡 Clique em «🌐 Traduzir» sob o comentário'
    },
    'zh': {
        appTitle: 'YouTube 翻译器',
        labelTargetLang: '🎯 翻译成语言',
        previewOriginal: '这是英文评论',
        previewTranslation: '🇨🇳 这是英文评论',
        statsTranslated: '已翻译: {count}',
        statsApi: '⚡ Google 翻译',
        footerNote: '💡 点击评论下方的 «🌐 翻译»'
    },
    'ja': {
        appTitle: 'YouTube 翻訳者',
        labelTargetLang: '🎯 言語に翻訳',
        previewOriginal: 'これは英語のコメントです',
        previewTranslation: '🇯🇵 これは英語のコメントです',
        statsTranslated: '翻訳済み: {count}',
        statsApi: '⚡ Google 翻訳',
        footerNote: '💡 コメントの下の «🌐 翻訳» をクリック'
    },
    'ko': {
        appTitle: 'YouTube 번역기',
        labelTargetLang: '🎯 언어로 번역',
        previewOriginal: '이것은 영어 댓글입니다',
        previewTranslation: '🇰🇷 이것은 영어 댓글입니다',
        statsTranslated: '번역됨: {count}',
        statsApi: '⚡ Google 번역',
        footerNote: '💡 댓글 아래 «🌐 번역»을 클릭하세요'
    }
};

let currentLang = 'en';

// ======== БЕЗОПАСНОЕ ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ ========
function getElement(id) {
    return document.getElementById(id);
}

function setText(id, text) {
    const el = getElement(id);
    if (el) el.textContent = text;
}

function setHTML(id, html) {
    const el = getElement(id);
    if (el) el.innerHTML = html;
}

function getValue(id) {
    const el = getElement(id);
    return el ? el.value : 'en';
}

// ======== ИНИЦИАЛИЗАЦИЯ ========
document.addEventListener('DOMContentLoaded', function() {
    // Сначала грузим настройки, потом обновляем UI
    loadSettingsAndInit();
    
    const targetLang = getElement('targetLang');
    if (targetLang) {
        targetLang.addEventListener('change', function() {
            const lang = this.value;
            currentLang = lang;
            saveSettings();
            updateUI();
            updateStats();
            sendSettingsToTab();
        });
    }
});

function loadSettingsAndInit() {
    const storage = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
    storage.sync.get(['settings']).then((result) => {
        const settings = result.settings || { targetLang: 'en' };
        
        const targetLang = getElement('targetLang');
        if (targetLang) {
            targetLang.value = settings.targetLang;
        }
        currentLang = settings.targetLang;
        
        // Теперь, когда язык загружен, обновляем весь UI
        updateUI();
        updateStats();
    }).catch(() => {
        // Если ошибка — используем английский по умолчанию
        const targetLang = getElement('targetLang');
        if (targetLang) {
            targetLang.value = 'en';
        }
        currentLang = 'en';
        updateUI();
        updateStats();
    });
}

function updateUI() {
    const lang = getValue('targetLang');
    currentLang = lang;
    const t = uiTranslations[lang] || uiTranslations['en'];
    
    setText('appTitle', t.appTitle);
    setText('labelTargetLang', t.labelTargetLang);
    setText('previewOriginal', t.previewOriginal);
    setText('previewTranslation', t.previewTranslation);
    setText('statsApi', t.statsApi);
    setHTML('footerNote', t.footerNote);
    
    updateStatsText();
}

function updateStatsText() {
    const lang = getValue('targetLang');
    const t = uiTranslations[lang] || uiTranslations['en'];
    const countEl = getElement('translatedCount');
    const count = countEl ? countEl.textContent : '0';
    const statsEl = getElement('statsTranslated');
    if (statsEl) {
        statsEl.textContent = t.statsTranslated.replace('{count}', count);
    }
}

function sendSettingsToTab() {
    const storage = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
    const tabs = typeof browser !== 'undefined' ? browser.tabs : chrome.tabs;
    
    tabs.query({active: true, currentWindow: true}).then((tabs) => {
        if (!tabs || tabs.length === 0 || !tabs[0] || !tabs[0].url || !tabs[0].url.includes('youtube.com')) {
            return;
        }
        
        tabs.sendMessage(tabs[0].id, {
            type: 'settingsChanged',
            settings: getCurrentSettings()
        }).catch(() => {});
    });
}

function saveSettings() {
    const storage = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
    const settings = getCurrentSettings();
    storage.sync.set({ settings });
}

function getCurrentSettings() {
    return {
        targetLang: getValue('targetLang')
    };
}

function updateStats() {
    const tabs = typeof browser !== 'undefined' ? browser.tabs : chrome.tabs;
    
    tabs.query({active: true, currentWindow: true}).then((tabs) => {
        const countEl = getElement('translatedCount');
        if (!countEl) return;
        
        if (!tabs || tabs.length === 0 || !tabs[0] || !tabs[0].url || !tabs[0].url.includes('youtube.com')) {
            countEl.textContent = '0';
            updateStatsText();
            return;
        }
        
        tabs.sendMessage(tabs[0].id, {
            type: 'getStats'
        }).then((response) => {
            const count = (response && response.count !== undefined) ? response.count : 0;
            countEl.textContent = count;
            updateStatsText();
        }).catch(() => {
            countEl.textContent = '0';
            updateStatsText();
        });
    });
}

// Обновляем статистику каждые 5 секунд
setInterval(updateStats, 5000);