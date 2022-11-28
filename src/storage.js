'use strict';
// https://github.com/extend-chrome/storage#interface-bucket-
import { getBucket } from '@extend-chrome/storage'

export const options_enum = {
  hideAds: 'hideAds'
}

export const options = getBucket('options')
export const ads = getBucket('ads')
export const blocked_store = getBucket('store')

export async function get_blocked_store() {
  let block_list = [];
  await blocked_store.getKeys().then(ret_block_list => {
    block_list = ret_block_list || [];
  })
  return block_list;
}

export async function get_ads_displayed() {
  let ads_list = [];
  await ads.getKeys().then(ret_ads_list => {
    ads_list = ret_ads_list || [];
  })
  return ads_list;
}
