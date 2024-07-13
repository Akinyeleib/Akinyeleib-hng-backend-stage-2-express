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
    const errors = []
    
    if (!name) { 
        addErrorToList(errors, "name", "name is a required field")
    } else if (typeof name !== "string") {
        addErrorToList(errors, "name", "name must be string")
    }

    if (description && typeof description !== "string") {
        addErrorToList(errors, "description", "description must be string")
    }
    
    if (errors.length > 0) {
        return res.status(422).json({
            "errors": errors
        })
    }

    const organisation = await prisma.organisation.create({
        data: {
            name,
            description
        }  
    })

    const data = { ...organisation }

    return res.status(200).json({
        "status": "success",
        "message": "Organisation created successfully",
        data
    })

})

router.post('/:orgId/users', async (req, res) => {
    const { orgId } = req.params
    const { userId } = req.body
    
    const errors = []
    
    if (!userId) { 
        addErrorToList(errors, "userId", "userId is a required field")
    } else if (typeof userId !== "string") {
        addErrorToList(errors, "userId", "userId must be string")
    }
    
    if (errors.length > 0) {
        return res.status(422).json({
            "errors": errors
        })
    }

    let organisation = await prisma.organisation.findUnique({ where:{ orgId } })

    if (!organisation) {
        return res.status(404).json({
            "status": "Failed",
            "message": "Organisation with the specified id doesn't exist",
            "statusCode": 404
        })
    }
    
    const user = await prisma.user.findUnique({where:{userId}})
    if (!user) {
        return res.status(404).json({
            "status": "Failed",
            "message": "User with the specified id doesn't exist",
            "statusCode": 404
        })
    }

    organisation = await prisma.organisation.findUnique({
        where:{
            orgId,
            users: { some: {userId} }
        }
    })

    if (organisation) {
        return res.status(409).json({
            "status": "failed",
            "message": "User already added to organisation"
        })
    }

    await prisma.organisation.update({
        where: { orgId },
        data: {
            users: {
                connect: { userId }
            }
        }
    })

    return res.status(200).json({
        "status": "success",
        "message": "User added to organisation successfully"
    })

})

function addErrorToList(list, field, message) {
    list.push({ "field": field, "message": message })
} 

module.exports = router
