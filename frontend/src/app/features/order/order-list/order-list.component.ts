import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  OrderDTO,
  OrderService,
  OrderStatus,
} from '../../../services/order/order.service';
import { IOrdersWindow } from '../../../services/order/order-list-window.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { i18n } from '../../../../i18n';
import { isCateringFirmEnvironment } from '../../../shared/utils/environmentGuard';
import { Subscription } from 'rxjs';
import { MealGetDTO, MealService } from '../../../services/meal/meal.service';

@Component({
  selector: 'order-list',
  templateUrl: './order-list.component.html',
})
export default class OrderListComponent
  implements OnInit, OnDestroy, IOrdersWindow
{
  isCateringFirmEnvironment = isCateringFirmEnvironment;
  orderList: OrderDTO[] = [];
  orderStatusKeys = Object.values(OrderStatus);
  showModal: boolean = false;
  selectedOrder!: OrderDTO;
  selectedOrderMeals: MealGetDTO[] = [];
  sub = new Subscription();

  constructor(
    private orderService: OrderService,
    private mealService: MealService,
  ) {}

  getOrderStatusName(status: OrderStatus): string {
    return i18n.getOrderStatusName(status);
  }

  getSelectedOrderMealsSum(): number {
    return this.selectedOrderMeals.reduce((acc, item) => acc + item.price, 0);
  }

  ngOnInit(): void {
    this.sub.add(
      this.orderService.getOrders().subscribe({
        next: (orders: OrderDTO[]) => {
          this.showOrders(orders);
        },
        error: (error: HttpErrorResponse) => {
          console.log(
            `I cannot download orders! With status code: ${error.status}, message: ${error.message}`,
          );
        },
      }),
    );
  }

  showOrders(orderList: OrderDTO[]): void {
    this.orderList = orderList;
  }

  showOrder(orderDTO: OrderDTO): void {
    this.sub.add(
      this.mealService.getMeals(orderDTO.id).subscribe({
        next: (meals: MealGetDTO[]) => {
          this.selectedOrder = orderDTO;
          this.selectedOrderMeals = meals;
          this.showModal = true;
        },
        error: (error: HttpErrorResponse) => {
          console.log(
            `I cannot download orders! With status code: ${error.status}, message: ${error.message}`,
          );
        },
      }),
    );
  }

  closeModal(): void {
    this.showModal = false;
  }

  onChangeStatus(order: OrderDTO, event: Event) {
    const newStatus: OrderStatus = (event.target as HTMLSelectElement)
      .value as OrderStatus;
    order.orderStatus = newStatus;
    this.sub.add(
      this.orderService.changeOrderStatus(order.id, order).subscribe({
        next: (order: OrderDTO) => {
          this.orderList.forEach((o) => {
            if (o.id === order.id) {
              o.orderStatus = newStatus;
            }
          });
        },
        error: (error: HttpErrorResponse) => {
          console.log(
            `I cannot change status of order! With status code: ${error.status}, message: ${error.message}`,
          );
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}