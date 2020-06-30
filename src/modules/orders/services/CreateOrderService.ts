import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);
    if (!customer) {
      throw new AppError('User does not exists');
    }

    const productIds = products.map(product => ({ id: product.id }));
    const foundProducts = await this.productsRepository.findAllById(productIds);

    if (foundProducts.length !== productIds.length) {
      throw new AppError('Invalid product');
    }

    const productsToBeUpdated = foundProducts.map(foundProduct => {
      const product = products.find(p => p.id === foundProduct.id);
      if (!product) {
        throw new AppError('Invalid product');
      }
      if (product.quantity > foundProduct.quantity) {
        throw new AppError(`Product ${foundProduct.name} with insuficiente quantity`);
      }
      return {
        ...foundProduct,
        quantity: foundProduct.quantity - product.quantity,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: foundProducts.map(product => ({
        product_id: product.id,
        price: product.price,
        quantity: products.find(p => p.id === product.id)?.quantity ?? 0,
      })),
    });

    await this.productsRepository.updateQuantity(productsToBeUpdated);

    return order;
  }
}

export default CreateOrderService;
