import { generateAuthenticationOptions, generateRegistrationOptions, verifyAuthenticationResponse, verifyRegistrationResponse } from "@simplewebauthn/server";
import { verify } from "crypto";
import { Request, Response } from "express";

interface user {
    id: string,
    email: string,
    password: string,
    passKey?: any
}

interface challenge {
    challenge: string
}

interface auth {
    challenge: string
}

type userStore = Record<string, user>;
type challengeStore = Record<string, challenge>;
type authChallenge = Record<string, auth>;

const userStore: userStore = {};
const challengeStore: challengeStore = {};
const authChallengeStore: authChallenge = {};

export const handleUserSignup = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Fill all the fields" });
        }

        const existUser = userStore[email]

        if (existUser) {
            return res.status(400).json({ error: "User already exist" });
        }

        userStore[email] = {
            id: `user_${Date.now().toString()}`,
            email,
            password,
        }

        const user = userStore[email];

        return res.status(201).json({ data: user })
    } catch (err) {
        console.log("Error in handleUserSignup function", err);
        return res.status(500).json({ error: "Unexpected error" });
    }
}

export const handleUserSignupRegister = async (req: Request, res: Response) => {
    try {

        const { email } = req.body;

        const challenge = await generateRegistrationOptions({
            rpID: "localhost",
            rpName: "My localhost machine",
            userName: email,
        });

        challengeStore[email] = challenge;

        return res.status(201).json({ options: challenge })

    } catch (err) {
        console.log("Error in handleUserSignupRegister function", err);
        return res.status(500).json({ error: "Unexpected error" });
    }
}

export const handleUserSignupRegisterVerify = async (req: Request, res: Response) => {
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

        const verifyChallenge = await verifyRegistrationResponse({
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
        })

    } catch (err) {
        console.log("Error in handleUserSignupRegisterVerify function", err);
        return res.status(500).json({ error: "Unexpected error" });
    }
}

export const handleUserLoginRegister = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        const user = userStore[email];

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const challenge = await generateAuthenticationOptions({
            rpID: "localhost"
        });

        authChallengeStore[email] = challenge;

        return res.status(200).json({ options: challenge })

    } catch (err) {
        console.log("Error in handleLoginRegister function", err);
        return res.status(500).json({ error: "Unexpected error" });
    }
}

export const handleUserLoginRegisterVerify = async (req: Request, res: Response) => {
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

        const verifyAuthChallenge = await verifyAuthenticationResponse({
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
    } catch (err) {
        console.log("Error in handleUserLoginRegisterVerify function", err);
        return res.status(500).json({ error: "Unexpected error" });
    }
}