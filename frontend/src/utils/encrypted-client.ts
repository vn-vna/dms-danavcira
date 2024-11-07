import CryptoJS from "react-native-crypto-js"

export default class EncryptedClient {
  _baseUrl: string;
  _secret: string;
  _token: string | null;

  public constructor(token: string | null = null) {
    this._baseUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
    this._secret = process.env.EXPO_PUBLIC_SECRET ?? "some_key";
    this._token = token;
  }

  public get token() {
    return this._token;
  }

  public async login(username: string, password: string) {
    const response = await fetch(`${this._baseUrl}/api/v1/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: CryptoJS.AES.encrypt(JSON.stringify({
        username,
        password
      }), this._secret).toString()
    });

    const loginData = CryptoJS.AES.decrypt(await response.text(), this._secret).toString(CryptoJS.enc.Utf8);
    const { payload: { token } } = JSON.parse(loginData);
    this._token = token;
  }

  public async request(path: string, method: string, data: any = undefined) {
    if (!this._token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${this._baseUrl}${path}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this._token}`,
        'Content-Type': 'text/plain',
      },
      body: method === 'GET' || method === 'DELETE' ? undefined : CryptoJS.AES.encrypt(JSON.stringify(data), this._secret).toString()
    });

    const decrypted = CryptoJS.AES.decrypt(await response.text(), this._secret).toString(CryptoJS.enc.Utf8);
    console.log(this._token);
    console.log(decrypted);

    let jsondata = JSON.parse(decrypted);
    if (jsondata.message == "Token expired") {
      throw new Error("Token expired");
    }

    return jsondata;
  }

  public async get(path: string) {
    return this.request(path, 'GET');
  }

  public async post(path: string, data: any) {
    return this.request(path, 'POST', data);
  }

  public async put(path: string, data: any) {
    return this.request(path, 'PUT', data);
  }

  public async delete(path: string) {
    return this.request(path, 'DELETE');
  }

  public async uploadImage(path: string, uri: string, name: string, type: string) {
    if (!this._token) {
      throw new Error("Not authenticated");
    }

    const formData = new FormData();
    formData.append('image', new Blob([uri], { type }), name);

    const response = await fetch(`${this._baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this._token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response;
  }

  public async logout() {
    this._token = null;
  }
}