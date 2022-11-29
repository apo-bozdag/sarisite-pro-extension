'use strict';

import {ads, blocked_store, get_blocked_store} from "./storage";

function add_extra_message_sections(phone_number) {
  const phone_number_regex = new RegExp('0 \\((\\d{3})\\) (\\d{3}) (\\d{2}) (\\d{2})', 'i');
  const phone_number_formatted = phone_number.replace(phone_number_regex, '0$1$2$3$4');
  const current_url = window.location.href;
  const wp_text = `Merhaba, ilanınızı Whatshapp üzerinden gördüm. ${current_url}`;
  const wlink = `https://api.whatsapp.com/send?phone=+9${phone_number_formatted}&text=${wp_text}`;
  const telegram_link = `https://t.me/+9${phone_number_formatted}/sendMessage?url=${current_url}&text=${wp_text}`;
  const sections = [
    'WhatsApp',
    'Telegram'
  ];
  const links = [
    wlink,
    telegram_link
  ];

  sections.forEach((section, index) => {
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.className = 'mobile';
    strong.innerText = section;
    const span = document.createElement('span');
    span.className = 'pretty-phone-part show-part';
    const a = document.createElement('a');
    a.href = links[index];
    a.target = '_blank';
    a.innerText = 'Mesaj Gönder';
    span.appendChild(a);
    li.appendChild(strong);
    li.appendChild(span);
    document.querySelector('ul#phoneInfoPart').appendChild(li);
  });


}

async function add_extra_store_sections(store_username) {
  const block_list = await get_blocked_store();

  let button_text = 'Mağaza Engelle';
  let block_msg = 'Mağaza engellenmiş';
  let block_display = 'none';
  if (block_list.includes(store_username)) {
    button_text = 'Engeli Kaldır';
    block_display = 'block';
  }

  // magaza engelle / engeli kaldir butonu
  const button = document.createElement('button');
  button.id = 'block_store';
  button.className = 'btn btn-form btn-warning';
  button.innerText = button_text;
  document.querySelector('.link-wrapper').appendChild(button);

  // engellenmis magaza mesaji
  const div = document.createElement('div');
  div.style.display = block_display;
  div.className = 'classifiedFavoriteBox store_block_msg';
  const ul = document.createElement('ul');
  const li = document.createElement('li');
  li.className = 'yourFavorite';
  li.innerText = block_msg;
  ul.appendChild(li);
  div.appendChild(ul);
  document.querySelector('.classifiedDetail').prepend(div);
}

async function block_store(store_username) {
  const block_list = await get_blocked_store();

  if (block_list.includes(store_username)) {
    await blocked_store.remove(store_username);
    document.querySelector('#block_store').innerText = 'Mağaza Engelle';
    document.querySelector('.store_block_msg').style.display = 'none';
    return;
  }
  // noinspection JSIgnoredPromiseFromCall
  await blocked_store.set({[store_username]: true});
  document.querySelector('#block_store').innerText = 'Engeli Kaldır';
  document.querySelector('.store_block_msg').style.display = 'block';
}

export async function adDetail(content) {
  const ads_model = {};

  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');

  const elements = [
    {
      name: 'id',
      selector: 'input#classifiedIdValue',
      attr: 'value'
    },
    {
      name: 'title',
      selector: 'div.classifiedDetailTitle h1',
      attr: 'innerText'
    },
    {
      name: 'price',
      selector: 'input#favoriteClassifiedPrice',
      attr: 'value'
    },
    {
      name: 'description',
      selector: 'div#classifiedDescription',
      attr: 'innerText'
    },
    {
      name: 'advertiser_store_name',
      selector: 'span.store-card span.storeInfo',
      attr: 'innerText'
    },
    {
      name: 'advertiser_store_url',
      selector: 'div.storeBox a',
      attr: 'href'
    },
    {
      name: 'advertiser_name',
      selector: 'div.username-info-area h5',
      attr: 'innerText'
    },
    {
      name: 'advertiser_phone',
      selector: 'ul#phoneInfoPart span.pretty-phone-part',
      attr: 'innerText'
    }
  ]

  elements.forEach(element => {
    const el = doc.querySelector(element.selector);
    ads_model[element.name] = el ? el[element.attr].trim() : null
  });

  if (ads_model['advertiser_store_url']) {
    const store_regex = new RegExp('https://(\\w+)\\.sahibinden\\.com/', 'i');
    ads_model['advertiser_store_username'] = ads_model['advertiser_store_url'].replace(store_regex, '$1');
  }

  const json = doc.querySelector('div#gaPageViewTrackingJson');
  if (json) {
    const data = JSON.parse(json.getAttribute('data-json'));
    const dmpData = data['dmpData'];
    const getNameKeys = ['yakit', 'vites', 'kasa', 'renk', 'km', 'yil', 'motor_gucu'];
    const translateKeys = {
      'yakit': 'fuel',
      'vites': 'gear',
      'kasa': 'body',
      'renk': 'color',
      'km': 'km',
      'yil': 'year',
      'motor_gucu': 'engine_power'
    }
    dmpData.forEach(element => {
      if (getNameKeys.includes(element['name'])) {
        ads_model[translateKeys[element['name']]] = element['value'].replace('-', ' ').replace('_', '-').trim();
      }
    });
  }

  const ads_id = ads_model['id'];
  // ziyaret edilenlere kayit ediyoruz
  // noinspection JSIgnoredPromiseFromCall
  await ads.remove([ads_id]);
  await ads.set({[ads_id]: ads_model});
  return ads_model;
}

export async function ads_page() {
  const get_ads = await adDetail(document.documentElement.innerHTML);
  const ads_phone = get_ads['advertiser_phone'];
  const advertiser_store_username = get_ads['advertiser_store_username'];

  if (advertiser_store_username) {
    await add_extra_store_sections(advertiser_store_username);
    document.querySelector('#block_store').addEventListener('click', () => {
      block_store(advertiser_store_username);
    });
  }

  // telefon numarası varsa ekstra alanlar ekliyoruz
  if (ads_phone) {
    add_extra_message_sections(ads_phone);
  }
}

