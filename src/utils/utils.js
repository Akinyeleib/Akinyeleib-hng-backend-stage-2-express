const jwt = require("jsonwebtoken");
require('dotenv').config()

function checkToken(req, res, next) {
    
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
        
        req['verifiedUser'] = {
            userId: decodedToken.userId,
            email: decodedToken.email,
            token
        }
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
