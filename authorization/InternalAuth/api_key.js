
module.exports = (req,res,next) => {
    // console.log(req.headers);
    // console.log(req.header('X-API-KEY'));
    if(req.header('X-API-KEY') == '1Ie007qXmLbFKe03sTJPyjfImquKJMPI'){ //testing, to be picked up from DB
        res.locals.service = 'developer';
        next();
    }else if(req.header('X-API-KEY') == 'GdPbd9lgwQBWRF6owmneJD9db4hPYZ4Z'){
        res.locals.service = 'deviceManagement';
        next();
    }else{
        res
        .status(403)
        .json({code:403,message:"Invalid API KEY",name:"forbidden"});
    } 
}