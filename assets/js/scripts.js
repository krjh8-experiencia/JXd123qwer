/* API Key Management */
const apiKeyButton = document.getElementById('apiKeyButton');
const keyPopup = document.getElementById('keyPopup');
const keyOverlay = document.getElementById('keyOverlay');
const closeKeyPopup = document.getElementById('closeKeyPopup');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveKeyButton = document.getElementById('saveKeyButton');
const clearKeyButton = document.getElementById('clearKeyButton');
let keyStatus = document.getElementById('keyStatus');
let savedKey = localStorage.getItem('apiKey');

const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

const refreshToggle = document.getElementById('refreshToggle');

const savedRefresh = localStorage.getItem('autoRefresh') === 'true';
if (savedRefresh) {
    refreshToggle.checked = true;
}

/* Theme */
function setTheme(theme) {
    if (theme === 'light') {
        body.classList.add('light-mode');
        darkModeToggle.innerHTML = 'â˜€ï¸';
        darkModeToggle.setAttribute('aria-label', 'Switch to dark mode');
        document.querySelector("link[rel='icon']").href = 'assets/img/favicon-light.ico';
        document.querySelector("a.logo img").src = 'assets/img/favicon-nobg-dark.png';
    } else {
        body.classList.remove('light-mode');
        darkModeToggle.innerHTML = 'ðŸŒ™';
        darkModeToggle.setAttribute('aria-label', 'Switch to light mode');
        document.querySelector("link[rel='icon']").href = 'assets/img/favicon-dark.ico';
        document.querySelector("a.logo img").src = 'assets/img/favicon-nobg-light.png';
    }
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    setTheme(savedTheme);
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    setTheme('light');
} else {
    setTheme('dark');
}

darkModeToggle.addEventListener('click', () => {
    const newTheme = body.classList.contains('light-mode') ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
});

window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'light' : 'dark');
    }
});

/* Supported Websites */
const websites = ['Linkvertise', 'Lootlinks', 'Paster.so', 'Work.ink', 'Boost.ink', 'Mboost.me', 'Socialwolvez', 'Sub2get', 'Social-unlock', 'Sub2unlock', 'Rekonise', 'Adfoc.us', 'URL shortener'];
let currentIndex = Math.floor(Math.random() * websites.length);
const supportedWebsitesElement = document.querySelector('.supported-websites');
supportedWebsitesElement.style.transition = 'opacity 0.5s ease-in-out';

setInterval(() => {
    let nextIndex;
    do {
        nextIndex = Math.floor(Math.random() * websites.length);
    } while (nextIndex === currentIndex);
    
    currentIndex = nextIndex;
    supportedWebsitesElement.style.opacity = '0';
    
    setTimeout(() => {
        supportedWebsitesElement.textContent = websites[currentIndex];
        supportedWebsitesElement.style.opacity = '1';
    }, 500);
}, 6500);

/* Navigation */
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger-menu');
    const navList = document.querySelector('nav ul');

    hamburger?.addEventListener('click', function() {
        navList?.classList.toggle('show');
    });

    document.addEventListener('click', function(event) {
        if (!event.target.closest('nav')) {
            navList?.classList.remove('show');
        }
    });
});

/* Misc */
const popup = document.getElementById('popup');
const overlay = document.getElementById('overlay');
const popupBody = document.getElementById('popup-body');
const closePopup = document.getElementById('closePopup');
const copyContent = document.getElementById('copyContent');
const openLink = document.getElementById('openLink');

closePopup ? closePopup.addEventListener('click', hidePopup) : null;
overlay ? overlay.addEventListener('click', hidePopup) : null;
copyContent ? copyContent.addEventListener('click', copyPopupContent) : null;
openLink ? openLink.addEventListener('click', openPopupLink) : null;

function showPopup(content) {
    if (isValidUrl(content)) {
        popupBody.innerHTML = `<a href="${content}" target="_blank">${content}</a>`;
        openLink.hidden = false;
    } else {
        popupBody.innerHTML = content.replace(/\n/g, '<br>');
        openLink.hidden = true;
    }
    popup.style.display = 'block';
    overlay.style.display = 'block';
}

function hidePopup() {
    popup.style.display = 'none';
    overlay.style.display = 'none';
}

function copyPopupContent() {
    // Get content and replace <br> tags with newlines
    const content = popupBody.innerHTML
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]*>/g, ''); // Remove any other HTML tags
    
    navigator.clipboard.writeText(content).then(() => {
        const originalText = copyContent.textContent;
        copyContent.textContent = 'Copied!';
        setTimeout(() => {
            copyContent.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy to clipboard');
    });
}

function openPopupLink() {
    const link = popupBody.querySelector('a');
    if (link) {
        window.open(link.href, '_blank');
    }
}

/* hCaptcha getter function */
function getHcaptcha() {
    return window.hcaptcha;
}

/* Helper functions */
function isValidUrl(string) {
    if(!/^(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?$/.test(string)) {
        return false
    }
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/* Bypass */
async function apiRequest(link) {
    const savedKey = localStorage.getItem('apiKey');
    
    const refresh = localStorage.getItem('autoRefresh') === 'true';
    
    if(!savedKey) {
        const hcaptcha = getHcaptcha();
        if(!hcaptcha) {
            throw new Error('hCAPTCHA not loaded. Please refresh the page.');
        }
        const widgetId = hcaptcha.render('hcaptcha-container', {
            sitekey: '69a3b3f1-9884-4e4f-b381-2843c64d955d',
            size: 'invisible'
        });
        try {
            const hCaptchaToken = (await hcaptcha.execute(widgetId, { async: true }))?.response;
            
            if(!hCaptchaToken) {
                throw new Error('hCAPTCHA token not generated. Please try again.');
            }
            return await (await fetch(`https://api.bypass.vip/bypass?url=${encodeURIComponent(link)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: link,
                    hcaptchaToken: hCaptchaToken
                })
            })).json();
        } catch (e) {
            console.log(e);
            throw new Error('An error occurred while contacting the API.');
        } finally {
            hcaptcha.reset();
        }
    } else {
        try {
            const endpoint = refresh ? 'https://api.bypass.vip/premium/refresh' : 'https://api.bypass.vip/premium/bypass';
            return await (await fetch(`${endpoint}?url=${encodeURIComponent(link)}`, {
                headers: {
                    'x-api-key': savedKey
                }
            })).json();
        } catch (e) {
            console.log(e);
            throw new Error('An error occurred while contacting the API.');
        }
    }
}

if (savedKey) {
    apiKeyButton.style.opacity = '1';
    apiKeyInput.value = savedKey;
}

apiKeyButton.addEventListener('click', () => {
    keyPopup.style.display = 'block';
    keyOverlay.style.display = 'block';
});

closeKeyPopup.addEventListener('click', hideKeyPopup);
keyOverlay.addEventListener('click', hideKeyPopup);

function hideKeyPopup() {
    keyPopup.style.display = 'none';
    keyOverlay.style.display = 'none';
    keyStatus.textContent = '';
    keyStatus.className = 'key-status';
}

saveKeyButton.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
        savedKey = key;
        localStorage.setItem('apiKey', key);
        localStorage.setItem('autoRefresh', refreshToggle.checked);
        keyStatus.textContent = 'API key saved successfully!';
        keyStatus.className = 'key-status success';
        apiKeyButton.style.opacity = '1';
        setTimeout(hideKeyPopup, 1500);
    } else {
        keyStatus.textContent = 'Please enter a valid API key';
        keyStatus.className = 'key-status error';
    }
});

clearKeyButton.addEventListener('click', () => {
    localStorage.removeItem('apiKey');
    localStorage.removeItem('autoRefresh');
    apiKeyInput.value = '';
    refreshToggle.checked = false;
    apiKeyButton.style.opacity = '0.7';
    keyStatus.textContent = 'API key cleared';
    keyStatus.className = 'key-status success';
    setTimeout(hideKeyPopup, 1500);
});

refreshToggle.addEventListener('change', () => {
    localStorage.setItem('autoRefresh', refreshToggle.checked);
});
