const { Router } = require('express')
const jwt = require("jsonwebtoken");
require('dotenv').config()
const router = Router()
const { hash, compare } = require('bcrypt')

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

router.post('/register', async (req, res) => {
    const body = req.body
    const { firstName, lastName, email, phone, password } = body
    const errors = []

    if (!firstName) { 
        addErrorToList(errors, "firstName", "firstName is a required fiels")
    } else if (typeof firstName !== "string") {
        addErrorToList(errors, "firstName", "firstName must be string")
    }
    if (!lastName) { 
        addErrorToList(errors, "lastName", "lastName is a required fiels")
    } else if (typeof lastName !== "string") {
        addErrorToList(errors, "lastName", "lastName must be string")
    }
    if (!email) { 
        addErrorToList(errors, "email", "email is a required fiels")
    } else if (typeof email !== "string") {
        addErrorToList(errors, "email", "email must be string")
    }
    if (!password) { 
        addErrorToList(errors, "password", "password is a required fiels")
    } else if (typeof password !== "string") {
        addErrorToList(errors, "password", "password must be string")
    }

    const emailUsed = await prisma.user.findUnique({where:{email}})
    if (emailUsed) {
        addErrorToList(errors, "email", "Email in use")
    }

    if (errors.length > 0) {
        return res.status(422).json({
            "errors": errors
        })
    }

    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.create({
        data: {
            email,
            firstName,
            lastName,
            phone,
            "password": hashedPassword,
            organisations: {
                create: {
                    name: `${firstName}'s Organisation`
                }
            }
        }
    })

    let token = generateToken(user, res)

    return res.status(201).json({
        "status": "success",
        "message": "Registration successful",
        "data": {
            "accessToken": token,
            userId: user.userId,
            email,
            firstName,
            lastName,
            phone
        }
    })

})

router.post('/login', async (req, res) => {
    const body = req.body
    const { email, password } = body
    const errors = []

    if (!email) { 
        addErrorToList(errors, "email", "email is a required fiels")
    } else if (typeof email !== "string") {
        addErrorToList(errors, "email", "email must be string")
    }
    if (!password) { 
        addErrorToList(errors, "password", "password is a required fiels")
    } else if (typeof password !== "string") {
        addErrorToList(errors, "password", "password must be string")
    }
    
    if (errors.length > 0) {
        return res.status(422).json({
            "errors": errors
        })
    }

    const user = await prisma.user.findUnique({where:{email}})
    if (!user) {
        return res.status(401).json({
            "status": "Bad request",
            "message": "Authentication failed",
            "statusCode": 401
        })
    }

    const isValid = await compare(password, user.password)

    if (!isValid) {
        return res.status(401).json({
            "status": "Bad request",
            "message": "Authentication failed",
            "statusCode": 401
        })
    }

    let token = generateToken(user, res)
    const { userId, firstName, lastName, phone } = user

    return res.status(200).json({
        "status": "success",
        "message": "Login successful",
        "data": {
            "accessToken": token,
            user: {
                userId,
                email,
                firstName,
                lastName,
                phone
            }
        }
    })

})

function addErrorToList(list, field, message) {
    list.push({ "field": field, "message": message })
} 

function generateToken(user, res) {
    const { userId, email } = user
    let token;
    try {
        token = jwt.sign(
            {
                userId,
                email
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        return token
    } catch (err) {
        console.log(err);
        return res
        .status(500)
        .json({
            "status": "failed",
            "message": "Unable to generate token"
        })
    }
}


module.exports = router
