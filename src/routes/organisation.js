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

    if (!organisation) {
        return res.status(404).json({
            "status": "Failed",
            "message": "User doesn't belong to any organisation with the specified id",
            "statusCode": 404
        })
    }

    const data = { ...organisation }

    return res.status(200).json({
        "status": "success",
        "message": "successful",
        data
    })

})

router.post('/', checkToken, async (req, res) => {
    const { name, description } = req.body
    const { userId } = req.verifiedUser

    const organisations = await prisma.organisation.create({
        data: {
            name,
            description,
            users: {
                connect: { userId }
            }            
        }
    })

    return res.status(200).json({
        "status": "success",
        "message": "organisations retrieval successful",
        "data": {
            "organisations": organisations
        }
    })

})

module.exports = router
