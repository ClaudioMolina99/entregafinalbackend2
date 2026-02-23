import productModel from '../../models/product.js';

export default class ProductsManager {

    getProducts(query, options) {
        return productModel.paginate(query, options);
    }

    // CORRECCIÓN: agregar .lean() para que Handlebars pueda leer el objeto
    getProductById(id) {
        return productModel.findById(id).lean();
    }

    createProduct(data) {
        return productModel.create(data);
    }

    updateProduct(id, data) {
        return productModel.findByIdAndUpdate(id, data, { new: true }).lean();
    }

    deleteProduct(id) {
        return productModel.findByIdAndDelete(id).lean();
    }

    // 👇 NUEVOS MÉTODOS PARA LA COMPRA

    getProductByIdRaw(id) {
        return productModel.findById(id);
    }

    updateProductStock(pid, newStock) {
        return productModel.findByIdAndUpdate(
            pid,
            { stock: newStock },
            { new: true }
        );
    }
}