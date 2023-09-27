const prisma = require('../prisma/index')

exports.find = async (req, res, next) => {
    try {
        const products = await prisma.productList.findMany({
            where: req.query,
            select: {
                id: true,
                name: true,
                quantity: true,
                category: true,
                price: true,
                place: true,
                createdAt: true,
                purchaseListId: true
            },
        })

        res.status(200).json({
            success: true,
            products
        })
    } catch (error) {
        throw new Error(error)
    }

}

exports.create = async (req, res, next) => {
    try {
        const validFields = ['listId', 'name', 'quantity', 'category', 'price', 'place'];
        if (!Object.entries(req.body).every(([key, data]) => data !== undefined && data !== null && data !== '' && validFields.includes(key))) {
            return next(new Error('Campos obrigatorios devem estar presente no objeto: listId, name, quantity, category, price, place'))
        }

        const { listId } = req.body
        delete req.body.listId
        // Crie o produto e encontre a lista de compras em paralelo
        const [product, list] = await Promise.all([
            prisma.products.create({
                data: req.body,
            }),
            prisma.purchaseList.findUnique({
                where: {
                    id: listId,
                },
            }),
        ]);

        if (list) {
            // Atualize a lista de compras com o novo produto
            list.productsIDs.push(product.id)

            // Atualize a lista de compras no banco de dados
            const updateList = await prisma.purchaseList.update({
                where: {
                    id: listId,
                },
                data: {
                    productsIDs: list.productsIDs
                }
            })

            res.status(200).json({
                success: true,
                updateList
            })
        } else {
            return next(new Error('Id da lista invalido.'))
        }

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

        const validFields = ['name', 'quantity', 'category', 'price', 'place'];
        if (!Object.entries(req.body).some(([key, data]) => data !== undefined && data !== null && data !== '' && validFields.includes(key))) {
            return next(new Error('Pelo menos um dos campos válidos deve estar presente no objeto: name, color, icon, concluded, deleted, total'))
        }

        const update = await prisma.productList.update({
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
            return next(new Error('ID do produto inválido. Verifique se o ID está no formato correto.'))
        }

        // Outros erros
        throw new Error(error)
    }

}

exports.destroy = async (req, res, next) => {
    try {
        const { id } = req.query
        // Check
        if (!id) return next(new Error('Informe o id do produto'));

        await prisma.productList.delete({
            where: {
                id
            }
        })

        res.status(200).json({
            success: true,
            message: 'Produto deletado.'
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