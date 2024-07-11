const { Router } = require('express')
require('dotenv').config()
const router = Router()

const { PrismaClient } = require('@prisma/client');
const checkToken = require('../utils/utils');
const prisma = new PrismaClient()

router.get('/', checkToken,async (req, res) => {
    const { userId } = req.verifiedUser

    const organisations = await prisma.organisation.findMany({
        where:{
            users: 
            { some: {userId} }
        }
    })
    console.log(organisations)

    return res.status(200).json({
        "status": "success",
        "message": "organisations retrieval successful",
        "data": {
            "organisations": organisations
        }
    })

})

router.get('/:orgId', checkToken,async (req, res) => {
    const { orgId } = req.params
    const { userId } = req.verifiedUser
    
    const organisation = await prisma.organisation.findUnique({
        where:{
            orgId,
            users: { some: {userId} }
        },
        
    })

    const data = { ...organisation }

    return res.status(200).json({
        "status": "success",
        "message": "Registration successful",
        data
    })

})


module.exports = router
