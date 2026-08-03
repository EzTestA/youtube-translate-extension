// popup.js — с переводом интерфейса

// ======== ПЕРЕВОДЫ ИНТЕРФЕЙСА ========
const uiTranslations = {
    'ru': {
        appTitle: 'YouTube Translator',
        labelTargetLang: '🎯 Переводить на язык',
        previewOriginal: 'Это комментарий на английском',
        previewTranslation: '🇷🇺 Это комментарий на английском',
        statsTranslated: 'Переведено: {count}',
        statsApi: '⚡ Google Translate',
        footerNote: '💡 Нажмите «🌐 Перевести» под комментарием',
        translateButton: '🌐 Перевести'
    },
    'uk': {
        appTitle: 'YouTube Translator',
        labelTargetLang: '🎯 Перекладати на мову',
        previewOriginal: 'Це коментар англійською',
        previewTranslation: '🇺🇦 Це коментар англійською',
        statsTranslated: 'Перекладено: {count}',
        statsApi: '⚡ Google Translate',
        footerNote: '💡 Натисніть «🌐 Перекласти» під коментарем',
        translateButton: '🌐 Перекласти'
    },
    'en': {
        appTitle: 'YouTube Translator',
        labelTargetLang: '🎯 Translate to language',
        previewOriginal: 'This is a comment in English',
        previewTranslation: '🇬🇧 This is a comment in English',
        statsTranslated: 'Translated: {count}',
        statsApi: '⚡ Google Translate',
        footerNote: '💡 Click «🌐 Translate» under the comment',
        translateButton: '🌐 Translate'
    },
    'de': {
        appTitle: 'YouTube Translator',
        labelTargetLang: '🎯 Übersetzen auf Sprache',
        previewOriginal: 'Dies ist ein Kommentar auf Englisch',
        previewTranslation: '🇩🇪 Dies ist ein Kommentar auf Englisch',
        statsTranslated: 'Übersetzt: {count}',
        statsApi: '⚡ Google Translate',
        footerNote: '💡 Klicken Sie auf «🌐 Übersetzen» unter dem Kommentar',
        translateButton: '🌐 Übersetzen'
    },
    'fr': {
        appTitle: 'YouTube Translator',
        labelTargetLang: '🎯 Traduire en langue',
        previewOriginal: 'Ceci est un commentaire en anglais',
        previewTranslation: '🇫🇷 Ceci est un commentaire en anglais',
        statsTranslated: 'Traduit: {count}',
        statsApi: '⚡ Google Translate',
        footerNote: '💡 Cliquez sur «🌐 Traduire» sous le commentaire',
        translateButton: '🌐 Traduire'
    },
    'es': {
        appTitle: 'YouTube Translator',
        labelTargetLang: '🎯 Traducir al idioma',
        previewOriginal: 'Este es un comentario en inglés',
        previewTranslation: '🇪🇸 Este es un comentario en inglés',
        statsTranslated: 'Traducido: {count}',
        statsApi: '⚡ Google Translate',
        footerNote: '💡 Haz clic en «🌐 Traducir» debajo del comentario',
        translateButton: '🌐 Traducir'
    },
    'it': {
        appTitle: 'YouTube Translator',
        labelTargetLang: '🎯 Traduci in lingua',
        previewOriginal: 'Questo è un commento in inglese',
        previewTranslation: '🇮🇹 Questo è un commento in inglese',
        statsTranslated: 'Tradotto: {count}',
        statsApi: '⚡ Google Translate',
        footerNote: '💡 Clicca su «🌐 Traduci» sotto il commento',
        translateButton: '🌐 Traduci'
    },
    'pt': {
        appTitle: 'YouTube Translator',
        labelTargetLang: '🎯 Traduzir para idioma',
        previewOriginal: 'Este é um comentário em inglês',
        previewTranslation: '🇵🇹 Este é um comentário em inglês',
        statsTranslated: 'Traduzido: {count}',
        statsApi: '⚡ Google Translate',
        footerNote: '💡 Clique em «🌐 Traduzir» sob o comentário',
        translateButton: '🌐 Traduzir'
    },
    'zh': {
        appTitle: 'YouTube 翻译器',
        labelTargetLang: '🎯 翻译成语言',
        previewOriginal: '这是英文评论',
        previewTranslation: '🇨🇳 这是英文评论',
        statsTranslated: '已翻译: {count}',
        statsApi: '⚡ Google 翻译',
        footerNote: '💡 点击评论下方的 «🌐 翻译»',
        translateButton: '🌐 翻译'
    },
    'ja': {
        appTitle: 'YouTube 翻訳者',
        labelTargetLang: '🎯 言語に翻訳',
        previewOriginal: 'これは英語のコメントです',
        previewTranslation: '🇯🇵 これは英語のコメントです',
        statsTranslated: '翻訳済み: {count}',
        statsApi: '⚡ Google 翻訳',
        footerNote: '💡 コメントの下の «🌐 翻訳» をクリック',
        translateButton: '🌐 翻訳'
    },
    'ko': {
        appTitle: 'YouTube 번역기',
        labelTargetLang: '🎯 언어로 번역',
        previewOriginal: '이것은 영어 댓글입니다',
        previewTranslation: '🇰🇷 이것은 영어 댓글입니다',
        statsTranslated: '번역됨: {count}',
        statsApi: '⚡ Google 번역',
        footerNote: '💡 댓글 아래 «🌐 번역»을 클릭하세요',
        translateButton: '🌐 번역'
    }
};

// Текущий язык для кнопок
let currentLang = 'en';

document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    updateUI();
    
    // Обработчик для выбора языка
    document.getElementById('targetLang').addEventListener('change', function() {
        saveSettings();
        updateUI();
        sendSettingsToTab();
    });
    
    // Запрашиваем статистику
    updateStats();
});

function updateUI() {
    const lang = document.getElementById('targetLang').value;
    currentLang = lang;
    const t = uiTranslations[lang] || uiTranslations['en'];
    
    document.getElementById('appTitle').textContent = t.appTitle;
    document.getElementById('labelTargetLang').textContent = t.labelTargetLang;
    document.getElementById('previewOriginal').textContent = t.previewOriginal;
    document.getElementById('previewTranslation').textContent = t.previewTranslation;
    document.getElementById('statsApi').textContent = t.statsApi;
    document.getElementById('footerNote').innerHTML = t.footerNote;
    
    // Обновляем статистику с переводом
    const count = document.getElementById('translatedCount').textContent || '0';
    document.getElementById('statsTranslated').textContent = t.statsTranslated.replace('{count}', count);
}

function sendSettingsToTab() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (!tabs[0] || !tabs[0].url || !tabs[0].url.includes('youtube.com')) {
            return;
        }
        
        chrome.tabs.sendMessage(tabs[0].id, {
            type: 'settingsChanged',
            settings: getCurrentSettings()
        }).catch(() => {});
    });
}

function loadSettings() {
    chrome.storage.sync.get(['settings'], (result) => {
        const settings = result.settings || {
            targetLang: 'en'
        };
        
        document.getElementById('targetLang').value = settings.targetLang;
    });
}

function saveSettings() {
    const settings = getCurrentSettings();
    chrome.storage.sync.set({ settings });
}

function getCurrentSettings() {
    return {
        targetLang: document.getElementById('targetLang').value
    };
}

function updateStats() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (!tabs[0] || !tabs[0].url || !tabs[0].url.includes('youtube.com')) {
            document.getElementById('translatedCount').textContent = '0';
            const lang = document.getElementById('targetLang').value;
            const t = uiTranslations[lang] || uiTranslations['en'];
            document.getElementById('statsTranslated').textContent = t.statsTranslated.replace('{count}', '0');
            return;
        }
        
        chrome.tabs.sendMessage(tabs[0].id, {
            type: 'getStats'
        }, (response) => {
            const count = (response && response.count !== undefined) ? response.count : 0;
            document.getElementById('translatedCount').textContent = count;
            
            const lang = document.getElementById('targetLang').value;
            const t = uiTranslations[lang] || uiTranslations['en'];
            document.getElementById('statsTranslated').textContent = t.statsTranslated.replace('{count}', count);
        });
    });
}

// Обновляем статистику каждые 5 секунд
setInterval(updateStats, 5000);