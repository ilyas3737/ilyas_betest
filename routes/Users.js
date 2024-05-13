
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userName:
 *           type: string
 *         accountNumber:
 *           type: string
 *         emailAddress:
 *           type: string
 *         identityNumber:
 *           type: string
 *       required:
 *         - userName
 *         - accountNumber
 *         - emailAddress
 *         - identityNumber
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authentication = require("./authMiddleware");
const cacheMiddleware = require("./cacheMiddleware");
const User = require('../models/User');
const constants = require('../helper/constants');
const { v4: uuidv4 } = require('uuid');

const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

const client = redis.createClient({
    host: process.env.REDIS_HOST, 
    port: process.env.REDIS_PORT
});

client.on('connect', function() {
    console.log('Terhubung ke Redis');
});

client.on('error', function(err) {
    console.error('Koneksi Redis gagal:', err);
});


/**
 * @swagger
 * /api/user/gettoken:
 *   post:
 *     summary: Get Token (username - admin, password - admin)
 *     tags: [Users]
 *     responses:
 *       '201':
 *         description: User created successfully
 *       '400':
 *         description: Bad request, invalid data
 */
router.post('/user/gettoken',  async (req, res) => {
    try {        
        if (req.body.username != "admin" && req.body.password != "admin") {
            return res.status(404).json({ message: 'User not found' });
        }else{
            const dataJwt = {
                username : req.body.username,
                loginAt: new Date()
            };

            const token = jwt.sign(dataJwt, process.env.TOKEN_SECRET, { expiresIn: '1000d' });
            res.status(200).json({ result: true, token: token });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: false, message: error });
    }
});

/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '201':
 *         description: User created successfully
 *       '400':
 *         description: Bad request, invalid data
 */
router.post('/user', authentication,  async (req, res) => {
    try {
        
        var data = {
            id : uuidv4(),
            userName : req.body.userName,
            accountNumber : req.body.accountNumber,
            emailAddress : req.body.emailAddress,
            identityNumber : req.body.identityNumber
        }

        const command = await User.create(data);
        res.status(201).json(command);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }

});

/**
 * @swagger
 * /api/user/:id:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '201':
 *         description: User created successfully
 *       '400':
 *         description: Bad request, invalid data
 */
router.put('/user/:id', authentication, async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedUserData = req.body;

        const command = await User.findOneAndUpdate({id:userId}, updatedUserData, { new: true } );
        res.status(201).json(command);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }

});

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get user
 *     tags: [Users]
 *     responses:
 *       '201':
 *         description: User created successfully
 *       '400':
 *         description: Bad request, invalid data
 */
router.get('/user', authentication, async (req, res) => {
    try {
        const user = await User.find({}, {
            _id:0,
            __v:0
        });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({  message: 'Internal Server Error' });
    }

});

/**
 * @swagger
 * /api/user/:id:
 *   get:
 *     summary: Get user by id, accountNumber, or identityNumber
 *     tags: [Users]
 *     responses:
 *       '201':
 *         description: User created successfully
 *       '400':
 *         description: Bad request, invalid data
 */
router.get('/user/:id', authentication, cacheMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        let user = null;

        if(isUUID(id)){
            user = await User.findOne({ id: id }, {_id:0, __v:0});
        }else{
            user = await User.findOne({ $or: [{ accountNumber: id }, {identityNumber:id}] }, {_id:0, __v:0});
        }

        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        client.setex(req.originalUrl, 120, JSON.stringify(user));
        res.status(200).json(user);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal Server Error' });
    }

});

/**
 * @swagger
 * /api/user/:id:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     responses:
 *       '201':
 *         description: User created successfully
 *       '400':
 *         description: Bad request, invalid data
 */
router.delete('/user/:id', authentication, async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findOneAndDelete({id:userId});
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({  message: 'Internal Server Error' });
    }

});

function isUUID(input) {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(input);
}

module.exports = router;
