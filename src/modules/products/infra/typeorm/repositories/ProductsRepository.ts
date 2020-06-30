import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({ name, price, quantity }: ICreateProductDTO): Promise<Product> {
    const product = await this.ormRepository.create({ name, price, quantity });
    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const products = await this.ormRepository.findOne({
      where: { name },
    });
    return products;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const foundProducts = await this.ormRepository.findByIds(products);
    return foundProducts;
  }

  public async updateQuantity(products: IUpdateProductsQuantityDTO[]): Promise<Product[]> {
    const foundProducts = await this.ormRepository.findByIds(products);
    const productsToBeUpdated = foundProducts.map(product => ({
      ...product,
      quantity: products.find(p => p.id === product.id)?.quantity ?? product.quantity,
    }));

    productsToBeUpdated.forEach(async product => {
      await this.ormRepository.save(product);
    });
    return foundProducts;
  }
}

export default ProductsRepository;
