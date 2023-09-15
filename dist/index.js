var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// prisma/index.js
var require_prisma = __commonJS({
  "prisma/index.js"(exports, module2) {
    var { PrismaClient } = require("@prisma/client");
    var prisma = new PrismaClient();
    module2.exports = prisma;
  }
});

// helpers/getJwtToken.js
var require_getJwtToken = __commonJS({
  "helpers/getJwtToken.js"(exports, module2) {
    var jwt = require("jsonwebtoken");
    var getJwtToken = (userId) => {
      return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1 day" });
    };
    module2.exports = getJwtToken;
  }
});

// util/cookieToken.js
var require_cookieToken = __commonJS({
  "util/cookieToken.js"(exports, module2) {
    var getJwtToken = require_getJwtToken();
    var cookieToken = (user, res) => {
      const token = getJwtToken(user.id);
      const options = {
        expires: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1e3
        ),
        httpOnly: true
      };
      user.password = void 0;
      res.status(200).cookie("token", token, options).json({
        success: true,
        token,
        user
      });
    };
    module2.exports = cookieToken;
  }
});

// controllers/singUpController.js
var require_singUpController = __commonJS({
  "controllers/singUpController.js"(exports) {
    var prisma = require_prisma();
    var cookieToken = require_cookieToken();
    exports.singup = async (req, res, next) => {
      try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
          return next(new Error("Por favor preencha todos os campos."));
        const user = await prisma.user.create({
          data: {
            name,
            email,
            password
          }
        });
        cookieToken(user, res);
      } catch (error) {
        throw new Error(error);
      }
    };
  }
});

// routes/singUpRoutes.js
var require_singUpRoutes = __commonJS({
  "routes/singUpRoutes.js"(exports, module2) {
    var express2 = require("express");
    var router = express2.Router();
    var { singup } = require_singUpController();
    router.route("/").post(singup);
    module2.exports = router;
  }
});

// controllers/singInController.js
var require_singInController = __commonJS({
  "controllers/singInController.js"(exports) {
    var prisma = require_prisma();
    var cookieToken = require_cookieToken();
    exports.singin = async (req, res, next) => {
      try {
        const { email, password } = req.body;
        if (!email || !password)
          return next(new Error("Login invalido."));
        const user = await prisma.user.findUnique({
          where: {
            email
          }
        });
        cookieToken(user, res);
      } catch (error) {
        throw new Error(error);
      }
    };
  }
});

// routes/singInRoutes.js
var require_singInRoutes = __commonJS({
  "routes/singInRoutes.js"(exports, module2) {
    var express2 = require("express");
    var router = express2.Router();
    var { singin } = require_singInController();
    router.route("/").post(singin);
    module2.exports = router;
  }
});

// helpers/verifyToken.js
var require_verifyToken = __commonJS({
  "helpers/verifyToken.js"(exports, module2) {
    var express2 = require("express");
    var jwt = require("jsonwebtoken");
    function verifyToken2(req, res, next) {
      const token = req.headers["authorization"];
      if (!token) {
        return res.status(401).json({ message: "Token n\xE3o fornecido" });
      }
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: "Token inv\xE1lido" });
        }
        req.user = decoded;
        next();
      });
    }
    module2.exports = verifyToken2;
  }
});

// controllers/userController.js
var require_userController = __commonJS({
  "controllers/userController.js"(exports) {
    var prisma = require_prisma();
    var cookieToken = require_cookieToken();
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
            updated_at: true
          }
        });
        res.status(200).json({
          success: true,
          users
        });
      } catch (error) {
        throw new Error(error);
      }
    };
    exports.create = async (req, res, next) => {
      try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
          return next(new Error("Por favor preencha todos os campos."));
        const user = await prisma.user.create({
          data: {
            name,
            email,
            password
          }
        });
        res.status(200).json({
          success: true,
          user
        });
      } catch (error) {
        throw new Error(error);
      }
    };
    exports.update = async (req, res, next) => {
      try {
        const { id } = req.query;
        if (!id)
          return next(new Error("Informe o id do usu\xE1rio"));
        if (Object.keys(req.body).length == 0)
          return next(new Error("Nenhum dado informado."));
        const { name, email, password } = req.body;
        if (!name && !email && !password) {
          return next(new Error("Pelo menos um dos campos (name, email, password) deve ser fornecido."));
        }
        const user = await prisma.user.update({
          where: {
            id
          },
          data: {
            name,
            email,
            password
          }
        });
        res.status(200).json({
          success: true,
          user
        });
      } catch (error) {
        if (error.message.includes("Malformed ObjectID")) {
          return next(new Error("ID de usu\xE1rio inv\xE1lido. Verifique se o ID est\xE1 no formato correto."));
        }
        throw new Error(error);
      }
    };
    exports.destroy = async (req, res, next) => {
      try {
        const { id } = req.query;
        if (!id)
          return next(new Error("Informe o id do usu\xE1rio"));
        await prisma.user.delete({
          where: {
            id
          }
        });
        res.status(200).json({
          success: true,
          message: "Usuario deletado."
        });
      } catch (error) {
        if (error.message.includes("Malformed ObjectID")) {
          return next(new Error("ID de usu\xE1rio inv\xE1lido. Verifique se o ID est\xE1 no formato correto."));
        }
        throw new Error(error);
      }
    };
  }
});

// routes/userRoutes.js
var require_userRoutes = __commonJS({
  "routes/userRoutes.js"(exports, module2) {
    var express2 = require("express");
    var router = express2.Router();
    var { find, create, update, destroy } = require_userController();
    router.route("/").get(find);
    router.route("/").post(create);
    router.route("/").put(update);
    router.route("/").delete(destroy);
    module2.exports = router;
  }
});

// controllers/purchaseListController.js
var require_purchaseListController = __commonJS({
  "controllers/purchaseListController.js"(exports) {
    var prisma = require_prisma();
    exports.find = async (req, res, next) => {
      try {
        const purchaseLists = await prisma.purchaseList.findMany({
          where: {
            delete: false,
            concluded: false,
            ...req.query
          },
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            products: {
              select: {
                id: true,
                name: true,
                quantity: true,
                price: true,
                place: true,
                category: true,
                createdAt: true
              }
            }
          }
        });
        const list = purchaseLists.map((purchaseList) => {
          return {
            id: purchaseList.id,
            name: purchaseList.name,
            color: purchaseList.color,
            icon: purchaseList.icon,
            concluded: purchaseList.concluded,
            delete: purchaseList.delete,
            total: purchaseList.total,
            productsIDs: purchaseList.productsIDs,
            usersIDs: purchaseList.usersIDs,
            users: purchaseList.users,
            productLists: purchaseList.products.reduce((result, product) => {
              const category = product.category;
              if (!result.find((item) => item.category === category)) {
                result.push({
                  category,
                  products: []
                });
              }
              const categoryItem = result.find((item) => item.category === category);
              categoryItem.products.push({
                id: product.id,
                name: product.name,
                quantity: product.quantity,
                category: product.category,
                price: product.price,
                place: product.place
              });
              return result;
            }, [])
          };
        });
        res.status(200).json({
          success: true,
          list
        });
      } catch (error) {
        throw new Error(error);
      }
    };
    exports.create = async (req, res, next) => {
      try {
        const { name, color, icon } = req.body;
        if (!name || !color || !icon)
          return next(new Error("Por favor informe o nome, cor e icone"));
        const list = await prisma.purchaseList.create({
          data: {
            name,
            color,
            icon
          }
        });
        res.status(200).json({
          success: true,
          list
        });
      } catch (error) {
        throw new Error(error);
      }
    };
    exports.update = async (req, res, next) => {
      try {
        const { id } = req.query;
        if (!id)
          return next(new Error("Informe um id"));
        if (Object.keys(req.body).length == 0)
          return next(new Error("Nenhum dado informado."));
        const validFields = ["name", "color", "icon", "concluded", "deleted", "total", "usersIDs"];
        if (!Object.entries(req.body).some(([key, data]) => data !== void 0 && data !== null && data !== "" && validFields.includes(key))) {
          return next(new Error("Pelo menos um dos campos v\xE1lidos deve estar presente no objeto: name, color, icon, concluded, deleted, total"));
        }
        if (req.body.usersIDs) {
          const list = await prisma.purchaseList.findUnique({
            where: {
              id
            }
          });
          if (list) {
            const check = list.usersIDs.length > 0 ? list.usersIDs.some((item) => item !== req.body.usersIDs) : true;
            if (check) {
              list.usersIDs.push(req.body.usersIDs);
              req.body.usersIDs = list.usersIDs;
            } else {
              return next(new Error("Usuario ja adicionado."));
            }
          } else {
            return next(new Error("Id da lista invalida."));
          }
        }
        const update = await prisma.purchaseList.update({
          where: {
            id
          },
          data: req.body
        });
        res.status(200).json({
          success: true,
          update
        });
      } catch (error) {
        if (error.message.includes("Malformed ObjectID")) {
          return next(new Error("ID da lista inv\xE1lido. Verifique se o ID est\xE1 no formato correto."));
        }
        throw new Error(error);
      }
    };
    exports.destroy = async (req, res, next) => {
      try {
        const { id } = req.query;
        if (!id)
          return next(new Error("Informe o id do usu\xE1rio"));
        await prisma.purchaseList.delete({
          where: {
            id
          }
        });
        res.status(200).json({
          success: true,
          message: "Lista de produtos deletada."
        });
      } catch (error) {
        if (error.message.includes("Malformed ObjectID")) {
          return next(new Error("ID da lista inv\xE1lido. Verifique se o ID est\xE1 no formato correto."));
        }
        throw new Error(error);
      }
    };
  }
});

// routes/purchaseListRoutes.js
var require_purchaseListRoutes = __commonJS({
  "routes/purchaseListRoutes.js"(exports, module2) {
    var express2 = require("express");
    var router = express2.Router();
    var { find, create, update, destroy } = require_purchaseListController();
    router.route("/").get(find);
    router.route("/").post(create);
    router.route("/").put(update);
    router.route("/").delete(destroy);
    module2.exports = router;
  }
});

// controllers/productsController.js
var require_productsController = __commonJS({
  "controllers/productsController.js"(exports) {
    var prisma = require_prisma();
    exports.find = async (req, res, next) => {
      try {
        const products = await prisma.products.findMany({
          where: req.query,
          select: {
            id: true,
            name: true,
            quantity: true,
            category: true,
            price: true,
            place: true,
            createdAt: true
          }
        });
        res.status(200).json({
          success: true,
          products
        });
      } catch (error) {
        throw new Error(error);
      }
    };
    exports.create = async (req, res, next) => {
      try {
        const validFields = ["listId", "name", "quantity", "category", "price", "place"];
        if (!Object.entries(req.body).every(([key, data]) => data !== void 0 && data !== null && data !== "" && validFields.includes(key))) {
          return next(new Error("Campos obrigatorios devem estar presente no objeto: listId, name, quantity, category, price, place"));
        }
        const { listId } = req.body;
        delete req.body.listId;
        const [product, list] = await Promise.all([
          prisma.products.create({
            data: req.body
          }),
          prisma.purchaseList.findUnique({
            where: {
              id: listId
            }
          })
        ]);
        if (list) {
          list.productsIDs.push(product.id);
          const updateList = await prisma.purchaseList.update({
            where: {
              id: listId
            },
            data: {
              productsIDs: list.productsIDs
            }
          });
          res.status(200).json({
            success: true,
            updateList
          });
        } else {
          return next(new Error("Id da lista invalido."));
        }
      } catch (error) {
        throw new Error(error);
      }
    };
    exports.update = async (req, res, next) => {
      try {
        const { id } = req.query;
        if (!id)
          return next(new Error("Informe um id"));
        if (Object.keys(req.body).length == 0)
          return next(new Error("Nenhum dado informado."));
        const validFields = ["name", "color", "icon", "concluded", "deleted", "total", "usersIds"];
        if (!Object.entries(req.body).some(([key, data]) => data !== void 0 && data !== null && data !== "" && validFields.includes(key))) {
          return next(new Error("Pelo menos um dos campos v\xE1lidos deve estar presente no objeto: name, color, icon, concluded, deleted, total"));
        }
        const update = await prisma.products.update({
          where: {
            id
          },
          data: req.body
        });
        res.status(200).json({
          success: true,
          update
        });
      } catch (error) {
        if (error.message.includes("Malformed ObjectID")) {
          return next(new Error("ID do produto inv\xE1lido. Verifique se o ID est\xE1 no formato correto."));
        }
        throw new Error(error);
      }
    };
    exports.destroy = async (req, res, next) => {
      try {
        const { id } = req.query;
        if (!id)
          return next(new Error("Informe o id do produto"));
        await prisma.products.delete({
          where: {
            id
          }
        });
        res.status(200).json({
          success: true,
          message: "Produto deletado."
        });
      } catch (error) {
        if (error.message.includes("Malformed ObjectID")) {
          return next(new Error("ID do produto inv\xE1lido. Verifique se o ID est\xE1 no formato correto."));
        }
        throw new Error(error);
      }
    };
  }
});

// routes/productsRoutes.js
var require_productsRoutes = __commonJS({
  "routes/productsRoutes.js"(exports, module2) {
    var express2 = require("express");
    var router = express2.Router();
    var { find, create, update, destroy } = require_productsController();
    router.route("/").get(find);
    router.route("/").post(create);
    router.route("/").put(update);
    router.route("/").delete(destroy);
    module2.exports = router;
  }
});

// controllers/groupsController.js
var require_groupsController = __commonJS({
  "controllers/groupsController.js"(exports) {
    var prisma = require_prisma();
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
                concluded: false
              },
              select: {
                id: true,
                name: true,
                color: true,
                icon: true,
                total: true,
                created_at: true,
                updated_at: true
              }
            }
          }
        });
        res.status(200).json({
          success: true,
          group
        });
      } catch (error) {
        throw new Error(error);
      }
    };
    exports.create = async (req, res, next) => {
      try {
        const { name, color, icon } = req.body;
        if (!name || !color || !icon)
          return next(new Error("Por favor informe o nome,cor e icone do grupo"));
        const group = await prisma.groups.create({
          data: {
            name,
            color,
            icon
          }
        });
        res.status(200).json({
          success: true,
          group
        });
      } catch (error) {
        throw new Error(error);
      }
    };
    exports.update = async (req, res, next) => {
      try {
        const { id } = req.query;
        if (!id)
          return next(new Error("Informe um id"));
        if (Object.keys(req.body).length == 0)
          return next(new Error("Nenhum dado informado."));
        const validFields = ["name", "color", "icon", "usersIDs", "purchaseListId"];
        if (!Object.entries(req.body).some(([key, data]) => data !== void 0 && data !== null && data !== "" && validFields.includes(key))) {
          return next(new Error("Pelo menos um dos campos v\xE1lidos deve estar presente no objeto: name, color, icon, concluded, deleted, total"));
        }
        if (req.body.usersIDs) {
          const group = await prisma.groups.findUnique({
            where: {
              id
            }
          });
          if (group) {
            const check = group.usersIDs.length > 0 ? group.usersIDs.some((item) => item !== req.body.usersIDs) : true;
            if (check) {
              group.usersIDs.push(req.body.usersIDs);
              req.body.usersIDs = group.usersIDs;
            } else {
              return next(new Error("Usuario ja adicionado."));
            }
          } else {
            return next(new Error("Id da grupo invalido."));
          }
        }
        if (req.body.purchaseListId) {
          const group = await prisma.groups.findUnique({
            where: {
              id
            }
          });
          if (group) {
            const check = group.purchaseListId.length > 0 ? group.purchaseListId.some((item) => item !== req.body.purchaseListId) : true;
            if (check) {
              group.purchaseListId.push(req.body.purchaseListId);
              req.body.purchaseListId = group.purchaseListId;
            } else {
              return next(new Error("Lista de compra ja adicionada."));
            }
          } else {
            return next(new Error("Id do grupo invalido."));
          }
        }
        const update = await prisma.groups.update({
          where: {
            id
          },
          data: req.body
        });
        res.status(200).json({
          success: true,
          update
        });
      } catch (error) {
        if (error.message.includes("Malformed ObjectID")) {
          return next(new Error("ID da lista inv\xE1lido. Verifique se o ID est\xE1 no formato correto."));
        }
        throw new Error(error);
      }
    };
    exports.destroy = async (req, res, next) => {
      try {
        const { id } = req.query;
        if (!id)
          return next(new Error("Informe o id do grupo"));
        await prisma.groups.delete({
          where: {
            id
          }
        });
        res.status(200).json({
          success: true,
          message: "Grupo deletado."
        });
      } catch (error) {
        if (error.message.includes("Malformed ObjectID")) {
          return next(new Error("ID do grupo inv\xE1lido. Verifique se o ID est\xE1 no formato correto."));
        }
        throw new Error(error);
      }
    };
  }
});

// routes/groupsRoutes.js
var require_groupsRoutes = __commonJS({
  "routes/groupsRoutes.js"(exports, module2) {
    var express2 = require("express");
    var router = express2.Router();
    var { find, create, update, destroy } = require_groupsController();
    router.route("/").get(find);
    router.route("/").post(create);
    router.route("/").put(update);
    router.route("/").delete(destroy);
    module2.exports = router;
  }
});

// index.js
var cookieParser = require("cookie-parser");
var express = require("express");
require("dotenv").config();
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("Funciona");
});
var singUpRouter = require_singUpRoutes();
app.use("/singup", singUpRouter);
var singInRoutes = require_singInRoutes();
app.use("/signin", singInRoutes);
var verifyToken = require_verifyToken();
app.use(verifyToken);
var userRouter = require_userRoutes();
app.use("/users", userRouter);
var purchaseListRouter = require_purchaseListRoutes();
app.use("/purchase-list", purchaseListRouter);
var productsRouter = require_productsRoutes();
app.use("/products", productsRouter);
var groupsRouter = require_groupsRoutes();
app.use("/groups", groupsRouter);
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({ error: err.message });
});
app.listen(3e3, () => {
  console.log("Servidor iniciado na porta 3000");
});
