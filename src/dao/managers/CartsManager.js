import cartModel from "../../models/cart.js";

export default class CartsManager {
  getCartById(cid) {
    return cartModel.findById(cid).populate("products.product");
  }

  createCart() {
    return cartModel.create({ products: [] });
  }

  // ✅ No duplica productos: si ya existe, suma quantity; si no existe, lo agrega
  async addProductToCart(cid, pid) {
    const updated = await cartModel.findOneAndUpdate(
      { _id: cid, "products.product": pid },
      { $inc: { "products.$.quantity": 1 } },
      { new: true }
    );

    if (updated) return updated;

    return cartModel.findByIdAndUpdate(
      cid,
      { $push: { products: { product: pid, quantity: 1 } } },
      { new: true }
    );
  }

  updateCart(cid, products) {
    return cartModel.findByIdAndUpdate(cid, { products }, { new: true });
  }

  updateProductQuantity(cid, pid, quantity) {
    return cartModel.updateOne(
      { _id: cid, "products.product": pid },
      { $set: { "products.$.quantity": quantity } }
    );
  }

  deleteProduct(cid, pid) {
    return cartModel.findByIdAndUpdate(
      cid,
      { $pull: { products: { product: pid } } },
      { new: true }
    );
  }

  deleteAllProducts(cid) {
    return cartModel.findByIdAndUpdate(cid, { products: [] }, { new: true });
  }
}