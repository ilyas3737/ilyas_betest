const jwt = require('jsonwebtoken');
const db = require("../helper/db");
const dbname = require("../helper/dbname");
const constants = require("../helper/constants");

const authentication = (req, res, next) => {
        try {

            let token = req.headers['authorization'];
            token = token.split(' ')[1];


            if (token == null) return res.sendStatus(401)

            jwt.verify(token, process.env.TOKEN_SECRET, async(err, user) => {
                if (err) return res.sendStatus(401)
                if (user.username == constants.ROLE_ADMIN) {
                    next();
                } else {
                    return res.sendStatus(403)

                }
            })
        } catch (error) {
            return res.sendStatus(401)

        }
}

module.exports = authentication;