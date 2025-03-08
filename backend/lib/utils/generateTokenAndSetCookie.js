import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "1d"
    });

    res.cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true, //prevent XSS attack cross site scripting attack
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "production",
    })

    return token;
}       