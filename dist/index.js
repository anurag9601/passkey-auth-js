"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("./controllers");
const app = (0, express_1.default)();
//You know insted of using dotenv library we can also access our environment variable by runing this command 
//command:--> node --env-file=<file_name> <file location which want to run>
//example: node --env-file=.env.local dist/index.js
//and also when you want to change the value of your environment variable from terminal run this
//command:--> $env:<VARIABLE NAME> = <CHANGES YOU WANT TO>
//example: $env:PORT = 8080
app.use(express_1.default.static("./public"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.post("/signup", controllers_1.handleUserSignup);
app.post("/signup-register", controllers_1.handleUserSignupRegister);
app.post("/signup-register-verify", controllers_1.handleUserSignupRegisterVerify);
app.post("/login-register", controllers_1.handleUserLoginRegister);
app.post("/login-register-verify", controllers_1.handleUserLoginRegisterVerify);
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is runing on port: ${PORT}`);
});
