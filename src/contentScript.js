'use strict';

import {ads, blocked_store, options} from "./storage";
import {ads_page} from "./adDetail";
import {custom_style} from "./helpers";
import {ads_list_page, makeHide} from "./adsList";
import {filter} from "rxjs";


const path = window.location.pathname;
const is_ads = path.indexOf("/ilan/") > -1;
const is_eng_page = path.indexOf("/listing/") > -1 || path.indexOf("/en/") > -1;
let is_car_ads_list = false;
let category_breadcrumb = document.querySelectorAll('div.search-result-bc ul li a');
if (category_breadcrumb.length > 0) {
  category_breadcrumb.forEach((item) => {
    if (item.href.indexOf('vasita') > -1) {
      is_car_ads_list = true;
      return false;
    }
  });
}

function init() {
  custom_style();

  // if the page language is not turkish then redirect to turkish page
  if (is_eng_page) {
    const tr_link = document.querySelector('link[rel="alternate"][hreflang="tr"]');
    if (tr_link) {
      window.location.replace(tr_link.href);
    }
  }


  // is ads page
  if (is_ads) {
    // noinspection JSIgnoredPromiseFromCall
    ads_page();
  }

  // is ads list page
  if (is_car_ads_list) {
    // noinspection JSIgnoredPromiseFromCall
    ads_list_page();
  }
}

init();


// Listen hideAds changes
options.changeStream
  .pipe(filter((hideAds) => !!hideAds))
  .subscribe(({hideAds}) => {
    console.log('sarı site pro - old value', hideAds.oldValue)
    console.log('sarı site pro - new value', hideAds.newValue)
    // is ads list page
    if (is_car_ads_list) {
      // noinspection JSIgnoredPromiseFromCall
      makeHide();
    }
  });

// Listen all changes
options.valueStream.subscribe((values) => {
  console.log('sarı site - options', values)
})
ads.valueStream.subscribe((values) => {
  console.log('sarı site - ads', values)
})
blocked_store.valueStream.subscribe((values) => {
  console.log('sarı site - blocked_store', values)
  // is ads list page
  if (is_car_ads_list) {
    // noinspection JSIgnoredPromiseFromCall
    makeHide();
  }
})
