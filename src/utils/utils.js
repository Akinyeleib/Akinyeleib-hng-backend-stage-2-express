const jwt = require("jsonwebtoken");
require('dotenv').config()
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

async function checkToken(req, res, next) {
    
    const auth = req.headers.authorization;
    if (!auth) {
        return res.status(401).json({
            "status": "Bad request",
            "message": "Missing Token",
            "statusCode": 401
        })
    }
    
    if (!auth.startsWith('Bearer ')) {
        return res.status(401).json({
            "status": "Bad request",
            "message": "Invalid Token",
            "statusCode": 401
        })
    }
    
    const token = auth.split(' ')[1]
    if (!token) {
        return res.status(401).json({
            "status": "Bad request",
            "message": "Invalid Token",
            "statusCode": 401
        })
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({ where: { email: decodedToken.email } })
        if (!user) {
            return res.status(404).json({
                "status": "Bad request",
                "message": "User record not found!",
                "statusCode": 404
            })
        }
        req['verifiedUser'] = { ...decodedToken, token }
        next()
    } catch {
        return res.status(401).json({
            "status": "Bad request",
            "message": "Invalid or expired Token",
            "statusCode": 401
        })
    }
}

module.exports = checkToken
