'use strict';

import {ads, blocked_store, get_blocked_store} from "./storage";

function is_damage(description) {
  const severe_damage = [
    'agir hasar kaydi \\d+(\\.\\d+)*', 'erp-agir hasarli', 'agir hasar kaydi cikmaktadir',
    'kaporta hasarindan dolayi agir hasar vardir', 'aracimin pert kaydi vardir',
    'arac pert kayitli ', ' hasar kayitlidir', 'aracta pert kaydi mevcuttur',
    'az hasarli, calisir', 'arac pert kayitliymis', 'pert kaydi vardir',
    'agir hasarli', 'agir hasar kayitli', 'agir hasar cikmaktadir',
    '(agir hasar) kayit', 'agir kayit vardir', 'agir hasar olusmus',
    'agir hazar kaydi var', 'agir hasar kaydi var', 'agir hasarli',
    'agi̇r hasar kaydi̇ vardi̇r', 'agir hasarlidir', 'agi̇r hasarli', 'sisirme agir',
    'hasarli agir', 'agir hasar kaydi gelmekte', 'bedelsiz agir',
    'agir hasar kayitlidir', 'agir hasar var', 'agir hasar kay'
  ]
  const light_damage = [
    'hasar kaydi bulunmakta', 'aracimizin bazi sorunlari vardir',
    'aracimizda hasar kaydi vardir', ' hasar kaydi var', ' hasar kayitli ',
    'aracimiz hs kayitlidir', ' calinti buluntu kaydindan ', 'aracta agar hasar gozukmek',
    'hasar kaydina takintisi olmayanlar', 'hasar kayitlidirarac', 'hasar kaydi vardir',
    ' hasarli bir sekilde aldim', 'arac sigortadan anlasmali', 'tl hasar kayitli',
    'tl hasar kaydi cikar', 'tl tramer kaydi var', 'tlhasar kaydi var ', 'yle hasari var',
    'hasar kayitlidir', 'hasar kaydi mevcut', 'hasar kaydi bu yuzdendir',
    'dolayi hasar kaydi cikmakta', 'calisir yürür durumdadir', 'tramer parca parca',
    'tramer kaydi var', 'tramer kaydi vardir', 'tramer kaydi mevcuttur',
    'tramer kaydi cikmaktadir', 'tramer kaydi cikar', 'tramer kaydi bulunmakta',
    'tramer vardir', 'parca parca tramer kaydi', 'parca parca tramer',
    'parca parca hasar kaydi', 'parca parca hasar', 'parca parca hasar kaydi',
    'tramer \\d+(\\.\\d+)*', 'hasar kaydi \\d+(\\.\\d+)*', 'parca parca \\d+(\\.\\d+)*',
    'tek parca', 'tek parca \\d+(\\.\\d+)*', 'tramer kaydi:', 'hasar bulunmakta',
    'erp carpma', 'carpisma', 'hasar sorgulamasi resimlerde', 'tramer kaydi:',
    'hasar sorgulamasi resi̇mlerde', 'hasar kaydi sorgulamasi fotograflarda',
    'son tramer kaydi', 'tramer kaydi : \\d+(\\.\\d+)*', '\\d+(\\.\\d+)* tramer var',
    '\\d+(\\.\\d+)* tramer kaydi', 'tramer:\\d+(\\.\\d+)*', 'tramer: \\d+(\\.\\d+)*',
    'tramer : \\d+(\\.\\d+)*', 'tramer ve ekspertiz bilgileri', 'tramer mevcuttur',
    'tarihli hasar', 'agir hasar kaydi yoktur', 'agir hasar yoktur', 'agi̇r hasar yoktur',
    'normal kayit', 'normal kayit vardir', 'hasar kayitli aldim', 'carpma \\d+(\\.\\d+)*',
    'hasar kaydi resi̇mlerde', 'tramer sorgusu resimlerde', 'carpma kaydi', 'trameri vardir',
    'tramer cikmaktadir', 'tramer kaydi parca', 'tramer kaydi parca parca',
    'hasar kaydi: \\d+(\\.\\d+)*', 'hasar kaydi : \\d+(\\.\\d+)*', 'hasar kaydi :\\d+(\\.\\d+)*',
    'parca halinde', 'parca hali̇nde', 'parca parca kayit', 'hasar kaydi :', 'bin tramer',
    'tl tramer', 'tramer\\d+(\\.\\d+)*', 'hasar sorgusu resimlerde',
    'tramer = \\d+(\\.\\d+)*', 'tramer =\\d+(\\.\\d+)*', 'tramer = \\d+(\\.\\d+)*',
    'tramer=\\d+(\\.\\d+)*', 'tramer= \\d+(\\.\\d+)*', 'hasar kaydi ise', 'hasar kaydi yalnizca',
    'adet carpma', '\\d+(\\.\\d+)* hasar kaydi', '\\d+(\\.\\d+)*hasar kaydi', 'kayit parca',
    'bin kayit'
  ]

  const severe_damage_regex = new RegExp(severe_damage.join('|'), 'i');
  const light_damage_regex = new RegExp(light_damage.join('|'), 'i');

  let color = null;
  let text = null;
  if (severe_damage_regex.test(description)) {
    color = 'red';
    text = 'Ağır hasar kaydı var';
  } else if (light_damage_regex.test(description)) {
    color = 'darkorange';
    text = 'Hasar kaydı var';
  }

  return {color, text};
}

function is_painted(description) {
  const painted = [
    'boyali', 'boyali arac', 'boyali aracimiz', 'boyali aracimizdir',
    '\\d+(\\.\\d+)* parca boyali', 'lokal boyali', 'lokal boyali arac',
    'lokal boyali aracimiz', 'lokal', 'cizik boyasi', 'boyasi vardir', 'parca boya',
    '\\d+(\\.\\d+)* boya', 'boyali\\d+(\\.\\d+)*', 'boyali \\d+(\\.\\d+)*',
    'alti boya', 'boyasi mevcut', 'boya var', 'boyanmistir'
  ]

  const painted_regex = new RegExp(painted.join('|'), 'i');
  const is_painted = painted_regex.test(description);

  let color = null;
  let text = null;
  if (is_painted) {
    color = 'darkorange';
    text = 'Boyalı';
  }

  return {color, text};
}

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
    let value = el ? el[element.attr].trim() : null;

    if (value && element.name === 'description') {
      value = value.replace(/(\r\n|\n|\r)/gm, ' ');
      value = value.replace(/\s+/g, ' ');
      value = value.replace(/₺|tl|ytl/gi, '');
      value = value.replace(/\),\(/g, ' ');
      value = value.toLowerCase();

      const turkish = 'çğıöşüÇĞİÖŞÜ';
      const english = 'cgiosuCGIOSU';
      for (let i = 0; i < turkish.length; i++) {
        value = value.replace(new RegExp(turkish[i], 'g'), english[i]);
      }
    }

    ads_model[element.name] = value
  });

  ads_model['damage'] = is_damage(ads_model['description']).text;
  ads_model['damage_color'] = is_damage(ads_model['description']).color;
  ads_model['painted'] = is_painted(ads_model['description']).text;
  ads_model['painted_color'] = is_painted(ads_model['description']).color;

  if (ads_model['advertiser_store_url']) {
    const store_regex = new RegExp('https://(\\w+)\\.sahibinden\\.com/', 'i');
    ads_model['advertiser_store_username'] = ads_model['advertiser_store_url'].replace(store_regex, '$1');
  }

  const json = doc.querySelector('div#gaPageViewTrackingJson');
  if (json) {
    const data = JSON.parse(json.getAttribute('data-json'));
    const dmpData = data['dmpData'];
    const getNameKeys = ['yakit', 'vites', 'kasa', 'renk', 'km', 'yil'];
    const translateKeys = {
      'yakit': 'fuel',
      'vites': 'gear',
      'kasa': 'body',
      'renk': 'color',
      'km': 'km',
      'yil': 'year',
    }
    dmpData.forEach(element => {
      if (getNameKeys.includes(element['name'])) {
        ads_model[translateKeys[element['name']]] = element['value'].replace('-', ' ').trim();
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

