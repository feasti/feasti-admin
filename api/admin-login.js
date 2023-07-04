const express = require('express')
const Admin = require("../models/admin.model")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/signup", async (req, res) => {
    try {
        const { email, password } = req.body;
        const hash = await bcrypt.hash(password, 10);
        const admin = await Admin.findOne({ email });
        if (admin) {
            return res.status(401).json({ message: "Admin Already Exist" });
        }
        const user = new Admin({ email, password: hash });
        const result = await user.save();
        if (!result) {
            return res.status(500).json({ message: "Error Creating User" });
        }
        res.status(201).json({ message: "User created!", result });
    } catch (error) {
        res.status(500).json({ error });
    }
});


router.post("/login", (req, res, next) => {
    let fetchedUser;

    Admin.findOne({ email: req.body.email }).then(user => {
        if (!user) {
            return res.status(401).json({
                message: "Auth failed no such user"
            })
        }
        fetchedUser = user;
        return bcrypt.compare(req.body.password, user.password);
    }).then(result => {
        console.log(fetchedUser)
        if (!result) {
            return res.status(401).json({
                message: "Auth failed inccorect password"
            })
        }
        const token = jwt.sign(
            { email: fetchedUser.email, userId: fetchedUser._id },
            "secret_this_should_be_longer",
            { expiresIn: "1h" }
        );
        res.status(200).json({
            token: token,
            expiresIn: 3600,
            userId: fetchedUser._id
        });
    })
        .catch(e => {

            console.log(e)

        })
})
module.exports = router
