import express from 'express';
import { router } from 'express-file-routing';
import { decryptRequest, encryptResponse } from './middlewares/encrypted';
import tracing from './middlewares/tracing';

(async () => {
  const app = express();

  app.use("/api/", express.urlencoded({ extended: true }));
  app.use("/api/", express.text());
  app.use("/api/", decryptRequest());
  app.use("/api/", encryptResponse());
  app.use("/api/", tracing());
  app.use("/", await router());

  app.listen(3000, () => {
    console.log('Server is running');
  });

})
  .call(this)
  .then(() => {
    console.log("Application created successfully");
  })
  .catch((err) => {
    console.log("Application Crashed")
    console.error(`An uncaught error occured: ${err.toString()}`);
  })
