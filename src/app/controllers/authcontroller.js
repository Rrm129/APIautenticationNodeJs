const express = require('express');
const { findOne } = require('../models/User');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

const authConfig = require('../../config/auth');

const User = require('../models/User');

const router = express.Router();

function generateToken( param= {} ){
    return jwt.sign( param , authConfig.secret, {
        expiresIn:86400,
    });
}

router.post('/register', async (req,res) => {

    try {

        const {email} = req.body;
        if (await User.findOne({ email })){ 
            return res.status(400).send({ error: 'user already exists' });
        };
        const user = await User.create(req.body);

        user.password = undefined;

        return res.send({ 
            user,
            token: generateToken({ id: user.id }),
         });

    } catch (err) {
        return res.status(400).send({ error: 'registration failed1' });
    }
});

router.post('/login', async (req, res) => {

    try{
        const {email, password} = req.body;

        const user = await User.findOne({email}).select('+password');

        if (!user)
            return res.status(400).send({ error: 'User not found' });
        
        if (!await bcrypt.compare(password,user.password))
            return res.status(400).send({ error: 'Invalid Password' });

        user.password = undefined;
        

        return res.send({ 
            user, 
            token: generateToken({ id: user.id }),
        });
    } catch (err) {
        return res.status(400).send({ error: 'login failed1' });
    }
});

module.exports = app => app.use('/auth', router);