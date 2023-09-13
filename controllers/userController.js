const prisma = require('../prisma/index')
const cookieToken = require('../util/cookieToken')


exports.find = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            where: req.query
        })

        res.status(200).json({
            success: true,
            users
        })
    } catch (error) {
        throw new Error(error)
    }

}

