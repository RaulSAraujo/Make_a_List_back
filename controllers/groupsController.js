const prisma = require('../prisma/index')

exports.find = async (req, res, next) => {
    try {
        const group = await prisma.groups.findMany({
            where: req.query,
            include: {
                users: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        password: true,
                        created_at: true,
                        updated_at: true
                    }
                },
                PurchaseList: {
                    where: {
                        delete: false,
                        concluded: false,
                    },
                    select: {
                        id: true,
                        name: true,
                        color: true,
                        icon: true,
                        total: true,
                        created_at: true,
                        updated_at: true,
                    }
                }
            }
        })

        res.status(200).json({
            success: true,
            group
        })
    } catch (error) {
        throw new Error(error)
    }

}

exports.create = async (req, res, next) => {
    try {
        const { name, color, icon } = req.body

        // Check
        if (!name || !color || !icon) return next(new Error('Por favor informe o nome,cor e icone do grupo'));

        const group = await prisma.groups.create({
            data: {
                name,
                color,
                icon
            },
        })

        res.status(200).json({
            success: true,
            group
        })
    } catch (error) {
        throw new Error(error)
    }

}

exports.update = async (req, res, next) => {
    try {
        const { id } = req.query
        // Check
        if (!id) return next(new Error('Informe um id'));

        if (Object.keys(req.body).length == 0) return next(new Error('Nenhum dado informado.'))

        const validFields = ['name', 'color', 'icon', 'usersIDs', 'purchaseListId'];
        if (!Object.entries(req.body).some(([key, data]) => data !== undefined && data !== null && data !== '' && validFields.includes(key))) {
            return next(new Error('Pelo menos um dos campos válidos deve estar presente no objeto: name, color, icon, concluded, deleted, total'))
        }

        if (req.body.usersIDs) {
            const group = await prisma.groups.findUnique({
                where: {
                    id,
                },
            })

            if (group) {
                const check = group.usersIDs.length > 0 ? group.usersIDs.some((item) => item !== req.body.usersIDs) : true
                if (check) {
                    group.usersIDs.push(req.body.usersIDs)
                    req.body.usersIDs = group.usersIDs
                } else {
                    return next(new Error('Usuario ja adicionado.'))
                }
            } else {
                return next(new Error('Id da grupo invalido.'))
            }
        }

        if (req.body.purchaseListId) {
            const group = await prisma.groups.findUnique({
                where: {
                    id,
                },
            })

            if (group) {
                const check = group.purchaseListId.length > 0 ? group.purchaseListId.some((item) => item !== req.body.purchaseListId) : true
                if (check) {
                    group.purchaseListId.push(req.body.purchaseListId)
                    req.body.purchaseListId = group.purchaseListId
                } else {
                    return next(new Error('Lista de compra ja adicionada.'))
                }
            } else {
                return next(new Error('Id do grupo invalido.'))
            }
        }

        const update = await prisma.groups.update({
            where: {
                id,
            },
            data: req.body
        })

        res.status(200).json({
            success: true,
            update
        })
    } catch (error) {
        // Verifica se o erro é devido a um ID inválido
        if (error.message.includes('Malformed ObjectID')) {
            return next(new Error('ID da lista inválido. Verifique se o ID está no formato correto.'))
        }

        // Outros erros
        throw new Error(error)
    }

}

exports.destroy = async (req, res, next) => {
    try {
        const { id } = req.query
        // Check
        if (!id) return next(new Error('Informe o id do grupo'));

        await prisma.groups.delete({
            where: {
                id
            }
        })

        res.status(200).json({
            success: true,
            message: 'Grupo deletado.'
        })
    } catch (error) {
        // Verifica se o erro é devido a um ID inválido
        if (error.message.includes('Malformed ObjectID')) {
            return next(new Error('ID do grupo inválido. Verifique se o ID está no formato correto.'))
        }

        // Outros erros
        throw new Error(error)
    }

}