"use strict";

// background.js
let toggle = false;

chrome.action.onClicked.addListener(function() {
    chrome.storage.local.get(['toggle'], function(result) {
      let toggle = result.toggle || false;
      let popupUrl = toggle ? 'popup1.html' : 'popup2.html';
      
      chrome.windows.create({
        url: chrome.runtime.getURL(popupUrl),
        type: 'popup',
        width: 300,
        height: 500
      });
  
      chrome.storage.local.set({toggle: !toggle});
    });
  });
