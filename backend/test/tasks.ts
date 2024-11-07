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
  console.log('TEST INSERTING TASKS');
  console.log('------------------------------------------------------------------------------------');

  // Insert new tasks
  for (let i = 0; i < 10; i++) {
    const response = await fetch(`${SERVER_URL}/api/v1/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: CryptoJS.AES.encrypt(JSON.stringify({
        uid: 'vnvna',
        address: `Address ${i}`,
        long: 0,
        lat: 0,
      }), SECRET_KEY).toString()
    });

    const data = CryptoJS.AES.decrypt(await response.text(), SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const { payload: { task } } = JSON.parse(data);
    console.log(`Task: ${task._id} - ${task.address}`);
    await sleep(100);
  }

  // Search for tasks
  console.log('------------------------------------------------------------------------------------');
  console.log('TEST SEARCHING TASKS');
  console.log('------------------------------------------------------------------------------------');

  let task_ids = [];

  let continueSearch = true;
  let page = 1;

  while (continueSearch) {
    const response = await fetch(`${SERVER_URL}/api/v1/tasks?s=&f=&p=${page}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
    });

    const data = CryptoJS.AES.decrypt(await response.text(), SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const { payload: { results, count, pages } } = JSON.parse(data);

    for (let task of results) {
      console.log(`Task: ${task._id} - ${task.address}`);
      task_ids.push(task._id);
    }

    continueSearch = results.length > 0;
    page++;
  }

  console.log('------------------------------------------------------------------------------------');
  console.log('TEST UPDATING TASKS');
  console.log('------------------------------------------------------------------------------------');

  for (let task_id of task_ids) {
    const response = await fetch(`${SERVER_URL}/api/v1/tasks/${task_id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: CryptoJS.AES.encrypt(JSON.stringify({
        uid: 'hahahah',
        address: `Updated Address`,
        long: 0.31273192,
        lat: 0.31273192,
      }), SECRET_KEY).toString()
    });

    const data = CryptoJS.AES.decrypt(await response.text(), SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const { payload: { }, message } = JSON.parse(data);
    console.log(`Task: ${task_id} - ${message}`);

    await sleep(100);
  }

  console.log('------------------------------------------------------------------------------------');
  console.log('TEST REPORTING TASKS');
  console.log('------------------------------------------------------------------------------------');

  for (let task_id of task_ids) {
    const response = await fetch(`${SERVER_URL}/api/v1/tasks/${task_id}/report`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: CryptoJS.AES.encrypt(JSON.stringify({
        report: {
          type: 'checkin',
          long: 0.31273192,
          lat: 0.31273192,
        }
      }), SECRET_KEY).toString()
    });

    const data = CryptoJS.AES.decrypt(await response.text(), SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const { payload: { }, message } = JSON.parse(data);
    console.log(`Task: ${task_id} - ${message}`);

    await sleep(100);
  }

  console.log('------------------------------------------------------------------------------------');
  console.log('TEST DELETING TASKS');
  console.log('------------------------------------------------------------------------------------');


  for (let task_id of task_ids) {
    const response = await fetch(`${SERVER_URL}/api/v1/tasks/${task_id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
    });

    const data = CryptoJS.AES.decrypt(await response.text(), SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const { payload: { }, message } = JSON.parse(data);
    console.log(`Task: ${task_id} - ${message}`);

    await sleep(100);
  }

})()