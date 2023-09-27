const prisma = require('../prisma/index')
const cookieToken = require('../util/cookieToken')


exports.singin = async (req, res, next) => {
    try {
        const { email, password } = req.body
        // Check
        if (!email || !password) return next(new Error('Login invalido.'))

        const user = await prisma.user.findUnique({
            where: {
                email,
                password
            }
        })

        if (!user) return next(new Error('Login invalido'))

        // send user a token
        cookieToken(user, res)
    } catch (error) {
        throw new Error(error)
    }

}