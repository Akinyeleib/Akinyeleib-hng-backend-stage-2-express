const { Router } = require('express')
const { v4: uuidv4 } = require('uuid');
const jwt = require("jsonwebtoken");
require('dotenv').config()
const router = Router()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

router.post('/register', async (req, res) => {
    const body = req.body
    const { firstName, lastName, email, phone, password } = body
    const errors = []

    if (!firstName) { 
        addErrorToList(errors, "firstName", "firstName can not be blank")
    }
    if (!lastName) { 
        addErrorToList(errors, "lastName", "lastName can not be blank")
    }
    if (!email) { 
        addErrorToList(errors, "email", "email can not be blank")
    }
    if (!password) { 
        addErrorToList(errors, "password", "password can not be blank")
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

    const user = await prisma.user.create({
        data: {
            email,
            firstName,
            lastName,
            phone,
            password,
            organisations: {
                create: {
                    name: `${firstName}'s Organisation`
                }
            }
        }
    })

    let token = generateToken(user, res)

    console.log(user)
    console.log(user.organisations)
    const data = { "accessToken": token, ...user }

    return res.status(201).json({
        "status": "success",
        "message": "Registration successful",
        data
    })

})

router.post('/login', async (req, res) => {
    const body = req.body
    const { email, password } = body
    const errors = []

    if (!email) { 
        addErrorToList(errors, "email", "email can not be blank")
    }
    if (!password) { 
        addErrorToList(errors, "password", "password can not be blank")
    }
    if (errors.length > 0) {
        return res.status(422).json({
            "errors": errors
        })
    }

    const user = await prisma.user.findUnique({where:{email}})
    if (!user) {
        return res.status(401).json({ "message": "Invalid Credentials" })
    }

    const orgs = []
    
    
    let token = generateToken(user, res)

    return res
        .status(200)
        .json({
            "status": "success",
            "message": "Login successful",
            data: {
                accessToken: token,
                user,
                orgs: email,
            },
        });

})

function generateUUID() { return uuidv4() }

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
