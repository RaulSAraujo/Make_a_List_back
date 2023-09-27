const prisma = require('../prisma/index')
const parserToken = require('../helpers/parserToken')

exports.find = async (req, res, next) => {
    try {
        const list = await prisma.purchaseList.findMany({
            where: {
                delete: false,
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

        // const list = purchaseLists.map((purchaseList) => {
        //     return {
        //         id: purchaseList.id,
        //         name: purchaseList.name,
        //         color: purchaseList.color,
        //         icon: purchaseList.icon,
        //         concluded: purchaseList.concluded,
        //         delete: purchaseList.delete,
        //         total: purchaseList.total,
        //         productsIDs: purchaseList.productsIDs,
        //         usersIDs: purchaseList.usersIDs,
        //         users: purchaseList.users,
        //         productLists: purchaseList.products.reduce((result, product) => {
        //             const category = product.category;

        //             if (!result.find((item) => item.category === category)) {
        //                 result.push({
        //                     category: category,
        //                     products: [],
        //                 });
        //             }

        //             const categoryItem = result.find((item) => item.category === category);
        //             categoryItem.products.push({
        //                 id: product.id,
        //                 name: product.name,
        //                 quantity: product.quantity,
        //                 category: product.category,
        //                 price: product.price,
        //                 place: product.place,
        //             });

        //             return result;
        //         }, []),
        //     };
        // });

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

        const user = parserToken(req.cookies.token)

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

        const validFields = ['name', 'color', 'icon', 'concluded', 'deleted', 'total', 'shared_ids'];
        if (!Object.entries(req.body).some(([key, data]) => data !== undefined && data !== null && data !== '' && validFields.includes(key))) {
            return next(new Error('Pelo menos um dos campos válidos deve estar presente no objeto: name, color, icon, concluded, deleted, total'))
        }

        if (req.body.shared_ids) {
            const list = await prisma.purchaseList.findUnique({
                where: {
                    id,
                },
            })

            if (list) {
                const check = list.shared_ids.length > 0 ? list.shared_ids.some((item) => item !== req.body.shared_ids) : true
                if (check) {
                    list.shared_ids.push(req.body.shared_ids)
                    req.body.shared_ids = list.shared_ids
                } else {
                    return next(new Error('Usuario ja adicionado.'))
                }
            } else {
                return next(new Error('Id da lista invalida.'))
            }
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

exports.destroy = async (req, res, next) => {
    try {
        const { id } = req.query
        // Check
        if (!id) return next(new Error('Informe o id do usuário'));

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