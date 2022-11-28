'use strict';
import {
  ads,
  get_ads_displayed,
  get_blocked_store,
  options,
  options_enum
} from "./storage";
import {adsDetail} from "./adsDetail";

const hideAds = options_enum.hideAds;

async function allAdsConf() {
  const ads_element = document.querySelectorAll('tbody.searchResultsRowClass tr');
  if (ads_element) {
    for (const item of ads_element) {
      if (item.classList.contains('searchResultsPromoSuper')) {
        continue;
      }
      item.style.display = 'table-row';

      const id = item.getAttribute('data-id');
      let href = item.querySelector('td.searchResultsTitleValue a.classifiedTitle');
      if (href) {
        href = href.getAttribute('href');
      }

      await ads.get({[id]: null}).then(async r => {
          let get_ads = r[id];

          if (!get_ads && href) {
            const url = `https://www.sahibinden.com${href}`;
            // jQuery.ajax({
            //   url: adr,
            //   dataType:'text',
            //   success: function (data) {
            //     getirData(data,i) ;
            //   }
            // }); to js
            await fetch(url)
              .then(response => response.text())
              .then(async data => {
                console.log('data kayit ediliyor');
                get_ads = await adsDetail(data);
              }).catch(err => {
                console.log(err);
              })
            await new Promise(resolve => setTimeout(resolve, 2000))
          }

          if (get_ads) {
            item.setAttribute('data-store_name', get_ads.advertiser_store_username);

            if (get_ads['advertiser_store_name']) {
              const store_name = document.createElement('span');
              store_name.classList.add('store_name');
              store_name.innerText = get_ads['advertiser_store_name'];
              const br = document.createElement('br');
              item.querySelector('td.searchResultsTitleValue').prepend(br);
              item.querySelector('td.searchResultsTitleValue').prepend(store_name);
            }else if (get_ads['advertiser_name']) {
              const advertiser_name = document.createElement('span');
              advertiser_name.classList.add('advertiser_name');
              advertiser_name.innerText = get_ads['advertiser_name'];
              const br = document.createElement('br');
              item.querySelector('td.searchResultsTitleValue').prepend(br);
              item.querySelector('td.searchResultsTitleValue').prepend(advertiser_name);
            }

            const extra_element_names = {
              'damage': {
                'name': 'damage',
                'color': 'damage_color',
                'append': 'searchResultsTitleValue'
              },
              'painted': {
                'name': 'painted',
                'color': 'painted_color',
                'append': 'searchResultsTitleValue'
              },
              'gear': {
                'name': 'gear',
                'append': 'searchResultsTagAttributeValue'
              },
              'fuel': {
                'name': 'fuel',
                'append': 'searchResultsTagAttributeValue'
              }
            }

            for (const extra_element_name in extra_element_names) {
              if (get_ads[extra_element_names[extra_element_name].name]) {
                const br_element = document.createElement('br');
                item.querySelector('td.' + extra_element_names[extra_element_name].append).appendChild(br_element);

                const extra_element = document.createElement('span');
                extra_element.setAttribute('class', 'spro_' + extra_element_name);
                extra_element.innerText = get_ads[extra_element_names[extra_element_name].name];
                if (extra_element_names[extra_element_name].color) {
                  extra_element.style.backgroundColor = get_ads[extra_element_names[extra_element_name].color];
                  extra_element.style.color = '#fff';
                  extra_element.style.textShadow = '0 0 1px #000';
                }
                item.querySelector('td.' + extra_element_names[extra_element_name].append).appendChild(extra_element);
              }
            }


            console.log('get_ads', get_ads);
          }
        }
      );
    }
  }
}

export async function makeHide() {
  const displayed_ads_ids = await get_ads_displayed();
  const blocked_store_names = await get_blocked_store();
  const ads_element = document.querySelectorAll('tbody.searchResultsRowClass tr');

  options.get({[hideAds]: 0}).then(async r => {
    if (ads_element) {
      for (const item of ads_element) {
        const id = item.getAttribute('data-id');
        const store_name = item.getAttribute('data-store_name');
        if (blocked_store_names.includes(store_name)) {
          item.style.display = 'none';
        } else {
          if (displayed_ads_ids.includes(id)) {
            item.style.display = r[hideAds] ? 'none' : 'table-row';
          } else {
            item.style.display = 'table-row';
          }
        }
      }
    }
  });
}

export async function ads_list_page() {
  await allAdsConf();
  await makeHide();
}
