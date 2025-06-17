document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.create({ 'url': 'Chrome-extension://' + chrome.runtime.id + '/index.html' });
});