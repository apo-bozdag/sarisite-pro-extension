'use strict';

export function custom_style() {
  // banneri kaldiralim
  const header_banners = document.querySelector('.header-banners');
  if (header_banners) {
    header_banners.remove();
  }

  // ilan listesi arasindaki reklamlari silelim
  const nativeAd = document.querySelectorAll('.searchResultsItem.nativeAd');
  if (nativeAd) {
    nativeAd.forEach((item) => {
      item.remove();
    });
  }
}

export function open_settings() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
}
