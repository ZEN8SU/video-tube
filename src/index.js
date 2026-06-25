// require('dotenv').config({path:'./env'}) consistency not maintained
import dotenv from "dotenv";
import connectDB from "./db/db.js";
dotenv.config({
  path: "./env",
});

connectDB() //connection is async so it gives promises thats why we handle some error
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection Failed !!!!", err);
  });
