const prisma = require('../prisma/index')
const parserToken = require('../helpers/parserToken')

exports.find = async (req, res, next) => {
    try {
        const { userId } = parserToken(req.headers.authorization)

        const list = await prisma.purchaseList.findMany({
            where: {
                delete: false,
                OR: [
                    {
                        created_by_id: userId,
                    },
                    {
                        shared_ids: {
                            has: userId
                        }
                    }
                ],
                ...req.query
            },
            select: {
                id: true,
                name: true,
                color: true,
                icon: true,
                total: true,
                created_at: true,
                updated_at: true,
                created_by: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                shared: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        })

        res.status(200).json({
            success: true,
            list
        })
    } catch (error) {
        throw new Error(error)
    }

}

exports.findListProducts = async (req, res, next) => {
    try {
        const { id } = req.query
        if (!id) return next(new Error('Informe um id da lista'));

        const { name, shared, total, Products, created_by } = await prisma.purchaseList.findUnique({
            where: {
                id: id
            },
            select: {
                name: true,
                shared: true,
                total: true,
                Products: true,
                created_by: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        })

        const list = Products.reduce((result, product) => {
            const category = product.category;

            if (!result.find((item) => item.category === category)) {
                result.push({
                    category: category,
                    products: [],
                });
            }

            const categoryItem = result.find((item) => item.category === category);
            categoryItem.products.push({
                id: product.id,
                name: product.name,
                quantity: product.quantity,
                category: product.category,
                price: product.price,
                place: product.place,
            });

            return result;
        }, [])

        res.status(200).json({
            success: true,
            list: {
                name,
                shared,
                total,
                productsList: list,
                created_by
            }
        })
    } catch (error) {
        // Verifica se o erro é devido a um ID inválido
        if (error.message.includes('Malformed ObjectID')) {
            return next(new Error('ID do produto inválido. Verifique se o ID está no formato correto.'))
        }

        // Outros erros
        throw new Error(error)
    }

}

exports.findDeleted = async (req, res, next) => {
    try {
        const { userId } = parserToken(req.headers.authorization)

        const list = await prisma.purchaseList.findMany({
            where: {
                delete: true,
                OR: [
                    {
                        created_by_id: userId,
                    },
                    {
                        shared_ids: {
                            has: userId
                        }
                    }
                ],
                ...req.query
            },
            select: {
                id: true,
                name: true,
                color: true,
                icon: true,
                total: true,
                created_at: true,
                updated_at: true,
                created_by: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                shared: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                delete_at: true
            }
        })

        res.status(200).json({
            success: true,
            list
        })
    } catch (error) {
        throw new Error(error)
    }

}

exports.create = async (req, res, next) => {
    try {
        const { name, color, icon } = req.body

        // Check
        if (!name || !color || !icon) return next(new Error('Por favor informe o nome, cor e icone'));

        const user = parserToken(req.headers.authorization)

        const list = await prisma.purchaseList.create({
            data: {
                name,
                color,
                icon,
                created_by_id: user.userId
            },
        })

        res.status(200).json({
            success: true,
            list
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

        const validFields = ['name', 'color', 'icon', 'delete', 'total'];
        if (!Object.entries(req.body).some(([key, data]) => data !== undefined && data !== null && data !== '' && validFields.includes(key))) {
            return next(new Error('Pelo menos um dos campos válidos deve estar presente no objeto: name, color, icon, delete, total'))
        }

        if (req.body.delete) {
            req.body.delete_at = new Date()
        }

        const update = await prisma.purchaseList.update({
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

exports.shared = async (req, res, next) => {
    try {
        const { id } = req.query
        if (!id) return next(new Error('Informe um id'));

        const { email } = req.body
        if (!email) return next(new Error('Informe o e-mail do usuário.'))

        // Verificar se a lista é existente
        const { id: shared_ids } = await prisma.user.findUnique({
            where: {
                email,
            },
        })

        // Verificar se a lista é existente
        const list = await prisma.purchaseList.findUnique({
            where: {
                id,
            },
        })

        const { userId } = parserToken(req.headers.authorization)
        if (userId !== list.created_by_id) return next(new Error('Você não possui permissão para compartilhar esta lista.'))

        // Verificar se o id do usuario ja esta adicionado na lista
        const check = list.shared_ids.length > 0 ? list.shared_ids.some((item) => item === req.body.shared_ids) : false
        if (!check) {
            list.shared_ids.push(shared_ids)
        } else {
            return next(new Error('Usuário já adicionado.'))
        }

        const update = await prisma.purchaseList.update({
            where: {
                id,
            },
            data: {
                shared_ids: list.shared_ids
            }
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

exports.leaveList = async (req, res, next) => {
    try {
        const { id } = req.query
        if (!id) return next(new Error('Informe um id'));

        const { shared_ids } = req.body
        if (!shared_ids) return next(new Error('Informe o id do usuário.'))

        // Verificar se a lista é existente
        const list = await prisma.purchaseList.findUnique({
            where: {
                id,
            },
        })

        const { userId } = parserToken(req.headers.authorization)
        if (userId !== list.created_by_id && userId !== shared_ids) return next(new Error('Você não possui permissão para compartilhar esta lista.'))

        // Verificar se o id do usuario ja esta adicionado na lista
        const index = list.shared_ids.findIndex((item) => item === req.body.shared_ids)
        if (index !== -1) {
            list.shared_ids.splice(index, 1)
            req.body.shared_ids = list.shared_ids
        } else {
            return next(new Error('Usuário inválido.'))
        }

        const update = await prisma.purchaseList.update({
            where: {
                id,
            },
            data: {
                shared_ids: req.body.shared_ids
            }
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
        if (!id) return next(new Error('Informe o id do usuário'));

        // Verificar se a lista é existente
        const { created_by_id, Products } = await prisma.purchaseList.findUnique({
            where: {
                id,
            },
            select: {
                created_by_id: true,
                Products: true
            }
        })

        const { userId } = parserToken(req.headers.authorization)
        if (userId !== created_by_id) return next(new Error('Você não possui permissão para deletar a lista.'))

        if (Products.length > 0) {
            for (product of Products) {
                await prisma.products.delete({
                    where: {
                        id: product.id
                    }
                })
            }
        }

        await prisma.purchaseList.delete({
            where: {
                id
            }
        })

        res.status(200).json({
            success: true,
            message: 'Lista de produtos deletada.'
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