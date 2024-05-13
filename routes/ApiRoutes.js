
const express = require('express');
const user = require("./Users");

const router = express.Router();

router.use("/api", [user]);


module.exports = router;
