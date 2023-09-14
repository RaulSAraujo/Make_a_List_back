const prisma = require('../prisma/index')
const cookieToken = require('../util/cookieToken')

exports.singup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body
        // Check
        if (!name || !email || !password)  return next(new Error('Por favor preencha todos os campos.'))

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password
            }
        })
        
        // send user a token
        cookieToken(user, res)
    } catch (error) {
        throw new Error(error)
    }

}