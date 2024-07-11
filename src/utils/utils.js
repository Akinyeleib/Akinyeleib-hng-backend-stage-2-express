const { v4: uuidv4 } = require('uuid');

function generateUUID() { return uuidv4() }

function addErrorToList(list, field, message) {
    list.push({ "field": field, "message": message })
} 

function checkToken(req, res, next) {
    const token = req.headers.authorization.split(' ')[1];
    //Authorization: 'Bearer TOKEN'
    if (!token) {
        res
            .status(401)
            .json(
                {
                    success: false,
                    message: "Error!Token was not provided."
                }
            );
    }
    //Decoding the token
    const decodedToken =
        jwt.verify(token, "secretkeyappearshere");
        req['verifiedUser'] = {
            userId: decodedToken.userId,
            email: decodedToken.email
        }
    next()
}

module.exports = checkToken
