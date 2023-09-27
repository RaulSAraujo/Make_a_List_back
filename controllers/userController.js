const prisma = require('../prisma/index')

exports.find = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            where: req.query,
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
                created_at: true,
                updated_at: true,
                created_purchase_lists: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                        icon: true,
                        delete: true,
                        total: true,
                        created_at: true,
                        updated_at: true,
                    }
                },
                created_groups: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                        icon: true,
                        updated_at: true,
                        created_at: true
                    }
                }
            }
        })

        res.status(200).json({
            success: true,
            users
        })
    } catch (error) {
        throw new Error(error)
    }

}

exports.create = async (req, res, next) => {
    try {
        const { name, email, password } = req.body
        // Check
        if (!name || !email || !password) return next(new Error('Por favor preencha todos os campos.'));

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password
            }
        })

        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        throw new Error(error)
    }

}

exports.update = async (req, res, next) => {
    try {
        const { id } = req.query
        // Check
        if (!id) return next(new Error('Informe o id do usuário'));

        if (Object.keys(req.body).length == 0) return next(new Error('Nenhum dado informado.'))
        const { name, email, password } = req.body

        if (!name && !email && !password) {
            return next(new Error('Pelo menos um dos campos (name, email, password) deve ser fornecido.'))
        }

        const user = await prisma.user.update({
            where: {
                id,
            },
            data: {
                name,
                email,
                password
            }
        })

        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        // Verifica se o erro é devido a um ID inválido
        if (error.message.includes('Malformed ObjectID')) {
            return next(new Error('ID de usuário inválido. Verifique se o ID está no formato correto.'))
        }

        // Outros erros
        throw new Error(error)
    }

}

exports.destroy = async (req, res, next) => {
    try {
        const { id } = req.query
        // Check
        if (!id) return next(new Error('Informe o id do usuário'));

        await prisma.user.delete({
            where: {
                id
            }
        })

        res.status(200).json({
            success: true,
            message: 'Usuario deletado.'
        })
    } catch (error) {
        // Verifica se o erro é devido a um ID inválido
        if (error.message.includes('Malformed ObjectID')) {
            return next(new Error('ID de usuário inválido. Verifique se o ID está no formato correto.'))
        }

        // Outros erros
        throw new Error(error)
    }

}