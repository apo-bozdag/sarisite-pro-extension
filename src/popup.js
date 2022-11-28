'use strict';

import './popup.css';
import {options_enum, options} from "./storage";
import {open_settings} from "./helpers";

(function () {
  const hideAds = options_enum.hideAds;
  const hide_ads_element = document.getElementById('hide_ads');

  function updateHideAds(newHideAds) {
    options.set({[hideAds]: newHideAds}).then(r => {
      hide_ads_element.checked = r[hideAds];
    });
  }

  function restoreHideAds() {
    options.get({[hideAds]: 0}).then(r => {
      hide_ads_element.checked = r[hideAds];
    })
  }

  function clickListener() {
    document.body.addEventListener('click', (e) => {

      if (e.target.id === 'go_to_options') {
        open_settings();
      } else if (e.target.id === 'hide_ads') {
        const status = e.target.checked;

        if (status) {
          updateHideAds(true);
        } else {
          updateHideAds(false);
        }
      }

    });
  }

  function init() {
    restoreHideAds();
    clickListener();
  }

  document.addEventListener('DOMContentLoaded', init);
})();

