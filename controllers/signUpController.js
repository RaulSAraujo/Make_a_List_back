const prisma = require('../prisma/index')
const cookieToken = require('../util/cookieToken')
const hashPassword = require('../helpers/hashPassword')

exports.singup = async (req, res, next) => {
    try {
        const { name, email, password, confirm_password } = req.body
        // Check
        if (!name || !email || !password, !confirm_password) return next(new Error('Por favor preencha todos os campos.'))

        if (password !== confirm_password) return next(new Error('Ops! Parece que você digitou a senha de confirmação incorretamente. Por favor, verifique e tente novamente.'))

        // Criptografe a senha antes de salvar no banco de dados
        const hashedPassword = await hashPassword(password);

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            return next(new Error('O e-mail já está em uso.'));
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })

        delete user.purchase_list_ids
        delete user.groups_ids

        // send user a token
        cookieToken(user, res)
    } catch (error) {
        throw new Error(error)
    }

}