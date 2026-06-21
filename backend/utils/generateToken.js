const jwt = require('jsonwebtoken');

exports.generatetoken=(user)=>{
    return jwt.sign(
        {
            id:user.id,
            role: user.role,
        },
        process.env.JWT_SEC, {expiresIn: "30m"}
    );
};