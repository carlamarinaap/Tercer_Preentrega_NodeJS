import ProductDTO from "../dao/dto/products.dto.js";
import ProductManager from "../dao/controllers_mongo/productManager.js";

export default class ProductRepository {
  constructor(dao) {
    this.dao = dao;
  }
  get = async (data) => {
    const { limit, page, sort, category, stock } = data;
    return await this.dao.getProducts(limit, page, sort, category, stock);
  };
  getById = async (id) => {
    return await this.dao.getProductById(id);
  };

  add = async (product) => {
    const newProduct = new ProductDTO(product);
    return await this.dao.addProduct(newProduct);
  };
  update = async (id, data) => {
    this.dao.updateProduct(id, data);
  };

  delete = async (id) => {
    this.dao.deleteProduct(id);
  };
}
