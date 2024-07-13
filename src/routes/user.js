const { Router } = require('express')
require('dotenv').config()
const router = Router()

const { PrismaClient } = require('@prisma/client');
const checkToken = require('../utils/utils');
const prisma = new PrismaClient()

router.get('/:id', checkToken,async (req, res) => {
    const { id } = req.params
    const { userId } = req.verifiedUser

    if (userId !== id) {
        return res.status(403).json({
            "status": "Bad request",
            "message": "Unauthorised",
            "statusCode": 403
        })
    }
    
    const user = await prisma.user.findUnique({
        where:{userId},
        select: {
            userId: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
        },
    })

    const data = { ...user }

    return res.status(200).json({
        "status": "success",
        "message": "Registration successful",
        data
    })

})


module.exports = router
