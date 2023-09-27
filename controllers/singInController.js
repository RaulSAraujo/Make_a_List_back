const prisma = require('../prisma/index')
const cookieToken = require('../util/cookieToken')
const bcrypt = require('bcrypt');

exports.singin = async (req, res, next) => {
    try {
        const { email, password } = req.body
        // Check
        if (!email || !password) return next(new Error('Login invalido.'))

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if (!user) return next(new Error('E-mail invalido.'))

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) return next(new Error('Senha incorreta.'));

        // send user a token
        cookieToken(user, res)
    } catch (error) {
        throw new Error(error)
    }
}