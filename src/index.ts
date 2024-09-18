import express from "express";
import { handleUserLoginRegister, handleUserLoginRegisterVerify, handleUserSignup, handleUserSignupRegister, handleUserSignupRegisterVerify } from "./controllers";

const app = express();

//You know insted of using dotenv library we can also access our environment variable by runing this command 
//command:--> node --env-file=<file_name> <file location which want to run>
//example: node --env-file=.env.local dist/index.js

//and also when you want to change the value of your environment variable from terminal run this
//command:--> $env:<VARIABLE NAME> = <CHANGES YOU WANT TO>
//example: $env:PORT = 8080

app.use(express.static("./public"))

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/signup", handleUserSignup);

app.post("/signup-register", handleUserSignupRegister);

app.post("/signup-register-verify", handleUserSignupRegisterVerify);

app.post("/login-register", handleUserLoginRegister);

app.post("/login-register-verify", handleUserLoginRegisterVerify);

const PORT = process.env.PORT || 8000;

app.listen(PORT, ()=>{
    console.log(`Server is runing on port: ${PORT}`)
})