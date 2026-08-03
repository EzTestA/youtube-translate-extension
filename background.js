// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'translate') {
        translateText(request.text, request.targetLang)
            .then(translation => {
                sendResponse({ success: true, translation });
            })
            .catch(error => {
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }
    
    if (request.type === 'statsUpdated') {
        chrome.storage.local.set({ translatedCount: request.count });
        sendResponse({ success: true });
    }
});

async function translateText(text, targetLang) {
    try {
        const encodedText = encodeURIComponent(text);
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodedText}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        let fullTranslation = '';
        if (data && data[0]) {
            for (const segment of data[0]) {
                if (segment && segment[0]) {
                    fullTranslation += segment[0];
                }
            }
        }
        
        if (fullTranslation) {
            return fullTranslation;
        } else {
            throw new Error('Не удалось извлечь перевод');
        }
    } catch (error) {
        console.error('Ошибка перевода:', error);
        throw error;
    }
}

chrome.runtime.onInstalled.addListener(() => {
    console.log('🌐 YouTube Translator установлен!');
    chrome.storage.sync.get(['settings'], (result) => {
        if (!result.settings) {
            const defaultSettings = {
                targetLang: 'en'
            };
            chrome.storage.sync.set({ settings: defaultSettings });
        }
    });
});