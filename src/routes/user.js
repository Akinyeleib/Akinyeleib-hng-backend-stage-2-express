const { Router } = require('express')
require('dotenv').config()
const router = Router()

const { PrismaClient } = require('@prisma/client');
const checkToken = require('../utils/utils');
const prisma = new PrismaClient()

router.get('/:id', checkToken,async (req, res) => {
    const { id } = req.params
    const { userId } = req.verifiedUser

    return res.status(200).json({
        "status": "success",
        "message": "Registration successful",
        id,
        userId
        // "data": {
        //     "accessToken": token,
        //     userId: user.userId,
        //     email,
        //     firstName,
        //     lastName,
        //     phone
        // }
    })

})


module.exports = router
