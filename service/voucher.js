const { Op } = require("sequelize");
const { Voucher } = require("../model/voucher");
const { sequelize } = require("../config/mysql");
const { Product } = require("../model/product");
const { Category } = require("../model/category");
const { User } = require("../model/user");
const { ProductDetail } = require("../model/productDetail");

const create = async (data) => {
  const {
    category,
    user,
    discountCode,
    nameVoucher,
    startDate,
    endDate,
    quantityDiscount,
    discountUnit,
    discountValue,
    condition,
    maximumPrice,
    status,
  } = data;
  try {
    const check = await Voucher.findOne({
      where: {
        discountCode: discountCode,
      },
    });
    if (check) throw new Error("Mã voucher đã tồn tại");
    else {
      const voucher = await Voucher.create({
        discountCode,
        nameVoucher,
        startDate,
        endDate,
        quantityDiscount,
        discountUnit,
        discountValue,
        condition,
        maximumPrice,
        status,
        isAllProduct: category ? false : true,
        isAllUser: user ? false : true,
      });
      await voucher.addUsers(user ? user : []);
      await voucher.addCategories(category ? category : []);
      return voucher;
    }
  } catch (error) {
    throw error;
  }
};

const update = async (id, data) => {
  const {
    category,
    user,
    discountCode,
    nameVoucher,
    startDate,
    endDate,
    quantityDiscount,
    discountUnit,
    discountValue,
    condition,
    maximumPrice,
    status,
  } = data;
  try {
    const checkId = await Voucher.findByPk(id);
    if (checkId) {
      const check = await Voucher.findOne({
        where: {
          discountCode: data.discountCode,
          id: {
            [Op.ne]: id,
          },
        },
      });
      if (check) throw new Error("Mã voucher đã tồn tại");
      else {
        const voucher = await Voucher.findByPk(id);
        if (voucher.status === "draft") {
          await voucher.setUsers(user ? user : []);
          await voucher.setCategories(category ? category : []);
          await voucher.update({
            discountCode,
            nameVoucher,
            startDate,
            endDate,
            quantityDiscount,
            discountUnit,
            discountValue,
            condition,
            maximumPrice,
            status,
            isAllProduct: category ? false : true,
            isAllUser: user ? false : true,
          });
          return voucher;
        } else {
          throw new Error("Voucher đã hoạt động không được chỉnh sửa");
        }
      }
    } else throw new Error("Không tồn tại voucher");
  } catch (error) {
    throw error;
  }
};

const updateStatus = async (id, status) => {
  try {
    const voucher = await Voucher.findByPk(id);
    if (voucher) {
      if (voucher.status != status && status != "draft") {
        voucher.status = status;
        await voucher.save();
        return voucher;
      } else throw new Error("Không thể cập nhật trạng thái");
    } else throw new Error("Không tồn tại voucher có id ", id);
  } catch (error) {
    throw error;
  }
};

const calculate = async (data) => {
  try {
    // Parse input
    const quantities = String(data.quantity)
      .split(",")
      .map((s) => s.trim());
    const ids = String(data.productIds)
      .split(",")
      .map((s) => s.trim());
    const sizes = String(data.sizes)
      .split(",")
      .map((s) => s.trim());
    const colors = String(data.colors)
      .split(",")
      .map((s) => s.trim());

    const productIds = ids.map((id, idx) => ({
      productId: Number(id),
      size: sizes[idx],
      color: colors[idx],
      quantity: Number(quantities[idx] || 0),
    }));

    // Lấy voucher
    const voucher = await Voucher.findOne({
      where: {
        discountCode: data.discountCode,
        status: "active",
        startDate: { [Op.lte]: new Date() },
        endDate: { [Op.gte]: new Date() },
      },
      include: {
        model: Category,
        attributes: ["id"],
        through: { attributes: [] },
      },
    });

    if (!voucher) throw new Error("Mã voucher không hợp lệ");

    const categoryIds = (voucher.Categories || [])
      .map((c) => (c.id ? c.id : c.dataValues?.id))
      .filter(Boolean);

    let totalPrice = 0;
    let eligiblePrice = 0;
    let appliedItems = [];
    let notApplied = [];

    // Gom nhóm theo productId
    const grouped = {};
    for (const p of productIds) {
      if (!grouped[p.productId]) grouped[p.productId] = [];
      grouped[p.productId].push(p);
    }

    // Xử lý từng nhóm
    for (const [productId, variants] of Object.entries(grouped)) {
      const product = await Product.findOne({
        attributes: ["id", "price", "discount", "CategoryId"],
        where: { id: productId },
      });
      if (!product) continue;

      const unitPrice = Number(product.price) || 0;
      const productDiscount = Number(product.discount) || 0;
      const inVoucherCategory =
        Boolean(voucher.isAllProduct) ||
        categoryIds.includes(product.CategoryId);

      // Tổng qty toàn nhóm
      const totalQtyGroup = variants.reduce(
        (sum, v) => sum + (Number(v.quantity) || 0),
        0
      );

      const meetsCondition = totalQtyGroup >= Number(voucher.condition || 0);

      for (const v of variants) {
        const productDetail = await ProductDetail.findOne({
          attributes: ["id", "color", "size", "quantity"],
          where: {
            ProductId: product.id,
            size: v.size,
            color: v.color,
          },
        });

        const qty = Number(v.quantity) || 0;
        const priceAfterProductDiscount =
          ((unitPrice * (100 - productDiscount)) / 100) * qty;

        totalPrice += priceAfterProductDiscount;

        if (!productDetail) {
          notApplied.push({
            productId: product.id,
            size: v.size,
            color: v.color,
            qty,
            reason: "Không tìm thấy biến thể size/màu",
          });
          continue;
        }

        const eligible = inVoucherCategory && meetsCondition;

        if (eligible) {
          eligiblePrice += priceAfterProductDiscount;
          appliedItems.push({
            productId: product.id,
            productDetailId: productDetail.id,
            color: productDetail.color,
            size: productDetail.size,
            qty,
            CategoryId: product.CategoryId,
            unitPrice,
            productDiscountPercent: productDiscount,
            priceAfterProductDiscount: Number(
              priceAfterProductDiscount.toFixed(2)
            ),
            voucherDiscountPercent:
              String(voucher.discountUnit) === "percent"
                ? Number(voucher.discountValue || 0)
                : 0,
          });
        } else {
          notApplied.push({
            productId: product.id,
            productDetailId: productDetail.id,
            color: productDetail.color,
            size: productDetail.size,
            qty,
            CategoryId: product.CategoryId,
            unitPrice,
            productDiscountPercent: productDiscount,
            priceAfterProductDiscount: Number(
              priceAfterProductDiscount.toFixed(2)
            ),
            reason: !inVoucherCategory
              ? "Sản phẩm không thuộc danh mục áp dụng mã giảm giá"
              : `Số lượng nhóm chưa đạt tối thiểu ${voucher.condition}`,
          });
        }
      }
    }

    // Tính discount
    let discount = 0;

    if (String(voucher.discountUnit) === "percent") {
      appliedItems = appliedItems.map((it) => {
        const basePrice = it.priceAfterProductDiscount;
        let itemDiscount =
          basePrice * (Number(voucher.discountValue || 0) / 100);
        discount += itemDiscount;

        return {
          ...it,
          voucherDiscountAmount: Number(itemDiscount.toFixed(2)),
          priceAfterVoucher: Number((basePrice - itemDiscount).toFixed(2)),
          voucherDiscountPercent: Number(voucher.discountValue || 0),
        };
      });
    } else {
      let fixedDiscount = Number(voucher.discountValue || 0);
      const perItemDiscount = appliedItems.length
        ? fixedDiscount / appliedItems.length
        : 0;

      appliedItems = appliedItems.map((it) => {
        let itemDiscount = perItemDiscount;
        discount += itemDiscount;

        return {
          ...it,
          voucherDiscountAmount: Number(itemDiscount.toFixed(2)),
          priceAfterVoucher: Number(
            (it.priceAfterProductDiscount - itemDiscount).toFixed(2)
          ),
        };
      });
    }

    // Áp cap toàn voucher
    const cap = Number(voucher.maximumPrice || 0);
    if (cap > 0 && discount > cap) discount = cap;
    if (discount > eligiblePrice) discount = eligiblePrice;

    // const finalPrice = totalPrice - discount;
    const voucherDiscount = appliedItems.reduce(
      (sum, item) => sum + item.voucherDiscountAmount,
      0
    );
    return {
      totalPrice: Number(totalPrice.toFixed(2)),
      eligiblePrice: Number(eligiblePrice.toFixed(2)),
      voucherDiscount: Number(voucherDiscount.toFixed(2)),
      finalPrice: Number((totalPrice - voucherDiscount).toFixed(2)),
      appliedItems,
      notApplied,
      categoryIds,
    };
  } catch (error) {
    throw error;
  }
};

const getAllByUser = async (data, userId) => {
  const { productId } = data;

  try {
    const voucher = await Voucher.findAll({
      attributes: [
        "id",
        "discountCode",
        "nameVoucher",
        "startDate",
        "endDate",
        "quantityDiscount",
        "discountUnit",
        "discountValue",
        "maximumPrice",
        "condition",
        "status",
      ],
      where: {
        startDate: {
          [Op.lte]: new Date(),
        },
        endDate: {
          [Op.gte]: new Date(),
        },
        status: "active",

        [Op.and]: [
          {
            [Op.or]: [
              { isAllUser: true },
              ...(userId
                ? [
                    {
                      id: {
                        [Op.in]: sequelize.literal(
                          `(select voucherId from voucherUser where UserId = ${userId})`
                        ),
                      },
                    },
                  ]
                : []),
            ],
          },
          productId && {
            [Op.or]: [
              { isAllProduct: true },
              {
                id: {
                  [Op.in]: sequelize.literal(
                    `(select voucherId from vouchercategory
                                                   where CategoryId in (select CategoryId 
                                                      from product
                                                      where id in (${productId}))
                           )`
                  ),
                },
              },
            ],
          },
        ],
      },
      include: [
        {
          model: Category,
          as: "Categories", // phải match alias trong association
          attributes: ["id", "categoryName"],
          through: { attributes: [] },
        },
      ],
    });
    return voucher;
  } catch (error) {
    throw error;
  }
};

const getAll = async (data) => {
  try {
    const voucher = await Voucher.findAll({
      attributes: [
        "id",
        "discountCode",
        "nameVoucher",
        "startDate",
        "endDate",
        "quantityDiscount",
        "discountUnit",
        "discountValue",
        "maximumPrice",
        "condition",
        "status",
        "usedCount",
        "isAllUser",
        "isAllProduct",
      ],
      where: {
        ...(data.status && {
          status: data.status,
        }),
      },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["id", "fullName", "email"],
          through: { attributes: [] },
        },
        {
          model: Category,
          attributes: ["id", "categoryName"],
          through: { attributes: [] },
        },
      ],
    });
    return voucher;
  } catch (error) {
    throw error;
  }
};

const deleteById = async (id) => {
  console.log(id);
  try {
    const voucher = await Voucher.findByPk(id);
    if (voucher.status == "draft") {
      await voucher.destroy();
    } else throw new Error("Voucher đã hoạt động không được xoá");
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create,
  update,
  updateStatus,
  calculate,
  getAllByUser,
  getAll,
  deleteById,
};
