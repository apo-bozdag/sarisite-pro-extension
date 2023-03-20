'use strict';

import './popup.scss';
import {options_enum, options} from "./storage";
import {open_settings} from "./helpers";

(function () {
  const hideAds = options_enum.hideAds;
  const hide_ads_element = document.getElementById('hide_ads');

  const hideSevere = options_enum.hideSevere;
  const hide_severe_element = document.getElementById('hide_severe');

  function updateHideAds(newHideAds) {
    options.set({[hideAds]: newHideAds}).then(r => {
      hide_ads_element.checked = r[hideAds];
    });
  }

  function restoreHideAds() {
    options.get({[hideAds]: 0}).then(r => {
      hide_ads_element.checked = r[hideAds];
    });
  }

  function updateHideSevere(newHideAds) {
    options.set({[hideSevere]: newHideAds}).then(r => {
      hide_severe_element.checked = r[hideSevere];
    });
  }

  function restoreHideSevere() {
    options.get({[hideSevere]: 0}).then(r => {
      hide_severe_element.checked = r[hideSevere];
    });

    options.get({[options_enum.ignoredText]: ''});
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
      else if (e.target.id === 'hide_severe') {
        const status = e.target.checked;

        if (status) {
          updateHideSevere(true);
        } else {
          updateHideSevere(false);
        }
      } 
    });
  }

  function init() {
    restoreHideAds();
    restoreHideSevere();
    clickListener();
  }

  document.addEventListener('DOMContentLoaded', init);
})();

