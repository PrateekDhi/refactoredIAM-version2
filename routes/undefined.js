const express = require('express')
const router = express.Router()

router.use((req,res,next) => {
    res.status(404).json({
        "code": 404,
        "message": "This route is not defined",
        "name": "undefined_route"
    })
})

module.exports = router