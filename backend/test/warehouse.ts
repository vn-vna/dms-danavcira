import CryptoJS from "crypto-js";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

(async () => {

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
  console.log('TEST INSERTING WAREHOUSES');
  console.log('------------------------------------------------------------------------------------');

  // Insert new warehouses
  for (let i = 0; i < 10; i++) {
    const response = await fetch(`${SERVER_URL}/api/v1/warehouse`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: CryptoJS.AES.encrypt(JSON.stringify({
        name: `Warehouse ${i}`,
        type: 1,
        address: `Address ${i}`,
        long: 0,
        lat: 0
      }), SECRET_KEY).toString()
    });

    if (!response.ok) {
      console.log(`Failed to create warehouse: ${response.status}`);
      continue;
    }

    const data = CryptoJS.AES.decrypt(await response.text(), SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const { payload: { warehouse } } = JSON.parse(data);
    console.log(`Warehouse: ${warehouse._id} - ${warehouse.name}`);
    await sleep(100);
  }

  // Search for warehouses
  console.log('------------------------------------------------------------------------------------');
  console.log('TEST SEARCHING WAREHOUSES');
  console.log('------------------------------------------------------------------------------------');

  let warehouse_ids = [];

  let continueSearch = true;
  let page = 1;

  while (continueSearch) {
    const searchResponse = await fetch(`${SERVER_URL}/api/v1/warehouse?p=${page}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const searchData = CryptoJS.AES.decrypt(await searchResponse.text(), SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const { payload: { results, count, pages } } = JSON.parse(searchData);

    for (const warehouse of results) {
      console.log(`Warehouse: ${warehouse._id} - ${warehouse.name}`);
      warehouse_ids.push(warehouse._id);
    }

    continueSearch = results.length > 0;
    page++;
  }

  console.log('------------------------------------------------------------------------------------');
  console.log('TEST UPDATING WAREHOUSES');
  console.log('------------------------------------------------------------------------------------');

  // Update warehouses
  for (const warehouse_id of warehouse_ids) {
    const response = await fetch(`${SERVER_URL}/api/v1/warehouse/${warehouse_id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: CryptoJS.AES.encrypt(JSON.stringify({
        name: `Warehouse ${warehouse_id}`,
        type: 2,
        addr: `Address ${warehouse_id}`,
        long: 0,
        lat: 0
      }), SECRET_KEY).toString()
    });

    const data = CryptoJS.AES.decrypt(await response.text(), SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const { payload: { }, message } = JSON.parse(data);
    console.log(`Warehouse: ${warehouse_id} - ${message}`);
    await sleep(100);
  }

  console.log('------------------------------------------------------------------------------------');
  console.log('TEST GETTING WAREHOUSES');
  console.log('------------------------------------------------------------------------------------');

  // Get warehouses
  for (const warehouse_id of warehouse_ids) {
    const response = await fetch(`${SERVER_URL}/api/v1/warehouse/${warehouse_id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      }
    });

    const data = CryptoJS.AES.decrypt(await response.text(), SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const { payload: { warehouse }, message } = JSON.parse(data);
    console.log(`Warehouse: ${warehouse._id} - ${warehouse.name} - ${message}`);
  }

  console.log('------------------------------------------------------------------------------------');
  console.log('TEST DELETING WAREHOUSE ITEMS');
  console.log('------------------------------------------------------------------------------------');

  // Delete warehouses
  for (const warehouse_id of warehouse_ids) {
    const response = await fetch(`${SERVER_URL}/api/v1/warehouse/${warehouse_id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      }
    });

    const data = CryptoJS.AES.decrypt(await response.text(), SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const { payload, message } = JSON.parse(data);
    console.log(`Warehouse: ${warehouse_id} - ${message}`);
    await sleep(100);
  }

})();