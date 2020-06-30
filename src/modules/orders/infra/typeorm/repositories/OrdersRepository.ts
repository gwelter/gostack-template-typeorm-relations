import { getRepository, Repository } from 'typeorm';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Order from '../entities/Order';
import OrdersProducts from '../entities/OrdersProducts';

class OrdersRepository implements IOrdersRepository {
  private orderRepository: Repository<Order>;

  private ordersProductsRepository: Repository<OrdersProducts>;

  constructor() {
    this.orderRepository = getRepository(Order);
    this.ordersProductsRepository = getRepository(OrdersProducts);
  }

  public async create({ customer, products }: ICreateOrderDTO): Promise<Order> {
    const order = new Order();
    order.customer = customer;
    const order_products = products.map(product =>
      this.ordersProductsRepository.create({
        order_id: order.id,
        price: product.price,
        product_id: product.product_id,
        quantity: product.quantity,
      }),
    );
    order.order_products = order_products;
    await this.orderRepository.save(order);
    return order;
  }

  public async findById(id: string): Promise<Order | undefined> {
    const order = await this.orderRepository.findOne(id);
    return order;
  }
}

export default OrdersRepository;
