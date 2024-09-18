"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUserLoginRegisterVerify = exports.handleUserLoginRegister = exports.handleUserSignupRegisterVerify = exports.handleUserSignupRegister = exports.handleUserSignup = void 0;
const server_1 = require("@simplewebauthn/server");
const userStore = {};
const challengeStore = {};
const authChallengeStore = {};
const handleUserSignup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Fill all the fields" });
        }
        const existUser = userStore[email];
        if (existUser) {
            return res.status(400).json({ error: "User already exist" });
        }
        userStore[email] = {
            id: `user_${Date.now().toString()}`,
            email,
            password,
        };
        const user = userStore[email];
        return res.status(201).json({ data: user });
    }
    catch (err) {
        console.log("Error in handleUserSignup function", err);
        return res.status(500).json({ error: "Unexpected error" });
    }
});
exports.handleUserSignup = handleUserSignup;
const handleUserSignupRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const challenge = yield (0, server_1.generateRegistrationOptions)({
            rpID: "localhost",
            rpName: "My localhost machine",
            userName: email,
        });
        challengeStore[email] = challenge;
        return res.status(201).json({ options: challenge });
    }
    catch (err) {
        console.log("Error in handleUserSignupRegister function", err);
        return res.status(500).json({ error: "Unexpected error" });
    }
});
exports.handleUserSignupRegister = handleUserSignupRegister;
const handleUserSignupRegisterVerify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, cred } = req.body;
        const user = userStore[email];
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        const storeChallenge = challengeStore[email];
        if (!storeChallenge) {
            return res.status(401).json({ error: "Challenge not found" });
        }
        const verifyChallenge = yield (0, server_1.verifyRegistrationResponse)({
            expectedChallenge: storeChallenge.challenge,
            expectedOrigin: "http://localhost:8000",
            expectedRPID: "localhost",
            response: cred,
        });
        if (!verifyChallenge) {
            return res.status(401).json({ error: "Unauthorized person" });
        }
        user.passKey = verifyChallenge.registrationInfo;
        return res.status(201).json({
            data: user,
            verified: true
        });
    }
    catch (err) {
        console.log("Error in handleUserSignupRegisterVerify function", err);
        return res.status(500).json({ error: "Unexpected error" });
    }
});
exports.handleUserSignupRegisterVerify = handleUserSignupRegisterVerify;
const handleUserLoginRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = userStore[email];
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        const challenge = yield (0, server_1.generateAuthenticationOptions)({
            rpID: "localhost"
        });
        authChallengeStore[email] = challenge;
        return res.status(200).json({ options: challenge });
    }
    catch (err) {
        console.log("Error in handleLoginRegister function", err);
        return res.status(500).json({ error: "Unexpected error" });
    }
});
exports.handleUserLoginRegister = handleUserLoginRegister;
const handleUserLoginRegisterVerify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, cred } = req.body;
        const user = userStore[email];
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        const prevAuthChallenge = authChallengeStore[email];
        if (!prevAuthChallenge) {
            return res.status(400).json({ error: "Auth challenge not found" });
        }
        const verifyAuthChallenge = yield (0, server_1.verifyAuthenticationResponse)({
            response: cred,
            expectedChallenge: prevAuthChallenge.challenge,
            expectedOrigin: "http://localhost:8000",
            expectedRPID: "localhost",
            authenticator: user.passKey,
        });
        if (!verifyAuthChallenge) {
            return res.status(401).json({ error: "Unauthorized user" });
        }
        return res.status(200).json({ data: user, verified: true });
    }
    catch (err) {
        console.log("Error in handleUserLoginRegisterVerify function", err);
        return res.status(500).json({ error: "Unexpected error" });
    }
});
exports.handleUserLoginRegisterVerify = handleUserLoginRegisterVerify;
