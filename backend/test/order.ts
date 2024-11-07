import CryptoJS from "crypto-js";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

(async() => {
  const SERVER_URL = 'http://localhost:3000'
  const SECRET_KEY = 'some_key'

  // Login as User vnvna
  const loginResponse = await fetch(`${SERVER_URL}/api/v1/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: CryptoJS.AES.encrypt(JSON.stringify({
      username: 'vnvna',
      password: 'vnvna'
    }), SECRET_KEY).toString()
  });

  const loginData = CryptoJS.AES.decrypt(await loginResponse.text(), SECRET_KEY).toString(CryptoJS.enc.Utf8);
  const { payload: { token } } = JSON.parse(loginData);
  console.log(`Token: ${token}`);

  console.log('------------------------------------------------------------------------------------');
  console.log('TEST INSERTING ORDER');
  console.log('------------------------------------------------------------------------------------');

  // Insert new order
  for (let i = 0; i < 10; i++) {
    const response = await fetch(`${SERVER_URL}/api/v1/order`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: CryptoJS.AES.encrypt(JSON.stringify({
        uid: 'vnvna',
        items: {
          item1: 1,
          item2: 2,
          item3: 3
        }
      }), SECRET_KEY).toString()
    });

    const data = CryptoJS.AES.decrypt(await response.text(), SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const { payload: { order } } = JSON.parse(data);
    console.log(`Order: ${order._id} - ${order.items}`);

    await sleep(100);
  }

  console.log('------------------------------------------------------------------------------------');
  console.log('TEST SEARCHING ORDER');
  console.log('------------------------------------------------------------------------------------');
  // Search for order

  let order_ids = [];

  let continueSearch = true;
  let page = 1;

  while (continueSearch) {
    const response = await fetch(`${SERVER_URL}/api/v1/order?s=&f=&p=${page}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    const data = CryptoJS.AES.decrypt(await response.text(), SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const { payload: { results, count, pages } } = JSON.parse(data);

    for (const order of results) {
      console.log(`Order: ${order._id} - ${JSON.stringify(order.items)}`);
      order_ids.push(order._id);
    }

    page++;
    continueSearch = page <= pages;
  }

  console.log('------------------------------------------------------------------------------------');
  console.log('TEST DELETING ORDER');
  console.log('------------------------------------------------------------------------------------');

  // Delete orders
  for (const order_id of order_ids) {
    const response = await fetch(`${SERVER_URL}/api/v1/order/${order_id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    const data = CryptoJS.AES.decrypt(await response.text(), SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const { payload: { }, message } = JSON.parse(data);
    console.log(`Order: ${order_id} - ${message}`);
    await sleep(100);
  }

})()