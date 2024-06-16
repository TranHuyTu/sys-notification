'use strict';

const permission = ( permission ) =>{
    return ( req, res, next ) => {
        if(!req.objKey.permissions){
            return res.status(403).json({
                message: 'permission denied',
            })
        }
        console.log('permissions::', req.objKey.permissions)
        const validPermission = req.objKey.permissions.includes(permission)
        if(!validPermission) {
            return res.status(403).json({
                message: 'permission denied',
            })
        }

        return next();
    }
}

const asyncHandler = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    }
}

module.exports = {
    permission,
    asyncHandler,
}