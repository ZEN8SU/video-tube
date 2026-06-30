// require('dotenv').config({path:'./env'}) consistency not maintained
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import {app} from './app.js'
import connectDB from "./db/db.js";


connectDB() //connection is async so it gives promises thats why we handle some error
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection Failed !!!!", err);
  });
