import CryptoJS from "crypto-js";
import fs from "fs";
import type { UserEntity, UserRole } from "../src/services/users";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

(async () => {
  const userdata_plain = fs.readFileSync('userdata.json', 'utf-8')
  const userdata = JSON.parse(userdata_plain)

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

  for (const user of userdata) {
    const postData = {
      username: user['Tên hiển thị'].replace(/\s/g, '').toLowerCase(),
      name: user['Tên hiển thị'],
      customer_data: {
        phone: user['Số điện thoại'],
        email: user['Email'],
        address: user['Địa chỉ nhà'],
      },
      role: 6,
    };

    const response = await fetch(`${SERVER_URL}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },

      body: CryptoJS.AES.encrypt(JSON.stringify({
      } as UserEntity), SECRET_KEY).toString()
    });
  }

})();