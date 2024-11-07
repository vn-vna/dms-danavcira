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
  console.log('TEST INSERTING PRODUCTS');
  console.log('------------------------------------------------------------------------------------');

  // Insert new products
  for (let i = 0; i < 10; i++) {
    const response = await fetch(`${SERVER_URL}/api/v1/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: CryptoJS.AES.encrypt(JSON.stringify({
        name: `Product ${i}`,
        price: 10.0 + i,
        unit: 'kg',
        thumbnail: ''
      }), SECRET_KEY).toString()
    });

    const data = CryptoJS.AES.decrypt(await response.text(), SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const { payload: { product } } = JSON.parse(data);
    console.log(`Product: ${product._id} - ${product.name}`);
    await sleep(100);
  }

  // Search for products
  console.log('------------------------------------------------------------------------------------');
  console.log('TEST SEARCHING PRODUCTS');
  console.log('------------------------------------------------------------------------------------');

  let product_ids = [];

  let continueSearch = true;
  let page = 1;

  while (continueSearch) {
    const searchResponse = await fetch(`${SERVER_URL}/api/v1/products?p=${page}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
    });

    const searchData = CryptoJS.AES.decrypt(await searchResponse.text(), SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const { payload: { count, results, pages } } = JSON.parse(searchData);

    console.log(`Page ${page} of ${pages} - Total: ${count}`);

    for (const product of results) {
      console.log(`Product: ${product._id} - ${product.name}`);
      product_ids.push(product._id);
    }

    page += 1;
    continueSearch = page <= pages;
  }

  // Access a product
  console.log('------------------------------------------------------------------------------------');
  console.log('TEST ACCESSING A PRODUCT');
  console.log('------------------------------------------------------------------------------------');

  for (const product_id of product_ids) {
    const productResponse = await fetch(`${SERVER_URL}/api/v1/products/${product_id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
    });

    const productData = CryptoJS.AES.decrypt(await productResponse.text(), SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const { payload: { name } } = JSON.parse(productData);
    console.log(`Product: ${product_id} - ${name}`);
  }

  // Update a product
  console.log('------------------------------------------------------------------------------------');
  console.log('TEST UPDATING A PRODUCT');
  console.log('------------------------------------------------------------------------------------');

  for (const product_id of product_ids) {
    const updateResponse = await fetch(`${SERVER_URL}/api/v1/products/${product_id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: CryptoJS.AES.encrypt(JSON.stringify({
        name: `Updated Product ${product_id}`,
        price: 100.0,
        unit: 'kg',
        thumbnail: ''
      }), SECRET_KEY).toString()
    });

    const updateData = CryptoJS.AES.decrypt(await updateResponse.text(), SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const { payload, message } = JSON.parse(updateData);
    console.log(`Product: ${product_id} - ${message}`);
    await sleep(100);
  }

  // Delete a product
  console.log('------------------------------------------------------------------------------------');
  console.log('TEST DELETING A PRODUCT');
  console.log('------------------------------------------------------------------------------------');

  for (const product_id of product_ids) {
    const deleteResponse = await fetch(`${SERVER_URL}/api/v1/products/${product_id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
    });

    const deleteData = CryptoJS.AES.decrypt(await deleteResponse.text(), SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const { payload, message } = JSON.parse(deleteData);
    console.log(`Product: ${product_id} - ${message}`);
    await sleep(100);
  }

})();
