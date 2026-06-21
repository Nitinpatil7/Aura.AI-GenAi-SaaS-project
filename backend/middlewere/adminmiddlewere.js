
const adminmiddlewere = async(req,res,next)=>{
    if(req.user.role !== "admin"){
        return res.status(403).json({message:"Admin only Access"});
    };
next();
};

module.exports = adminmiddlewere;