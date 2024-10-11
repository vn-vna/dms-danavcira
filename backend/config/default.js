module.exports = {
  database: {
    url: "mongodb://root:example@localhost:27017/",
    dbname: "dms"
  },
  storage: {
    location: __dirname + "/uploads"
  },
  secret: {
    jwt: {
      key: "some_key"
    },
    aes: {
      key: "some_key"
    }
  }
}