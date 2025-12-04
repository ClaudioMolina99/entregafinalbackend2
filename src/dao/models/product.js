import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productCollection = 'products';

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    thumbnails: { type: [String], default: [] }, // ✔ Arreglo de strings
    code: String,
    category: String,
    status: { type: Boolean, default: true },
    stock: Number
});

// Plugin necesario para paginate
productSchema.plugin(mongoosePaginate);

export default mongoose.model(productCollection, productSchema);
