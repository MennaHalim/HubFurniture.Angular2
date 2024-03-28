import { ProductService } from './../../Shared/Services/product.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IPage, IProduct } from '../../Shared/Models/product';
import { Subscription } from 'rxjs';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { BasketService } from '../../Shared/Services/basket.service';
import { IBasketItem } from '../../Shared/Models/basket';
import { UserAuthService } from '../../Shared/Services/user-auth.service';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterLink, NgxPaginationModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit, OnDestroy {

  categoryId: number = 0;
  productTypeId: number = 0;
  total: number = 0;
  type: string = 'sets';
  page: IPage | null = null;
  pageSize: number = 0;
  pageIndex: number = 1;
  private categorySetsSubscription: Subscription | undefined;
  private categoryItemsSubscription: Subscription | undefined;
  private routeSubscription: Subscription | undefined;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private ProductService: ProductService,
    private _BasketService: BasketService,
    private _UserAuthService: UserAuthService) { }

  ngOnInit(): void {
    this.applyPagination(1);
    // ////////////////////
    // this._UserAuthService.login('mostafa.ahmed@gmail.com', 'mostafaAhmed123#').subscribe()
    // ////////////////////
  }

  applyPagination(pageNum:number){
    this.getCategoryIdFromUrl(pageNum);
    this.routeSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.getCategoryIdFromUrl(pageNum);
      }
    });
  }


  private getCategoryIdFromUrl(pageNum : number) {
    this.route.queryParams.subscribe(params => {
      this.categoryId = +params['categoryId'];
    })
    this.route.params.subscribe(params => {
      this.type = params['type'];
      this.productTypeId = +params['productTypeId'];
      if (!this.type) {
        this.type = 'sets';
      }
    });
    this.loadComponentData(pageNum);
  }

  private loadComponentData(pageNum : number): void {
    if (this.type === 'sets' && Number.isNaN(this.productTypeId)) {
      this.categorySetsSubscription = this.ProductService.getSetsByCategory(this.categoryId, pageNum).subscribe(
        (data) => {
          this.page = data;
          this.pageSize = data.pageSize;
          this.pageIndex = data.pageIndex;
          //this.total = data.count;
          this.total = 10;
        });
    }
    else if (this.type === 'items' && Number.isNaN(this.productTypeId)) {
      this.categoryItemsSubscription = this.ProductService.getItemsByCategory(this.categoryId, pageNum).subscribe(
        (data) => {
          this.page = data;
          this.pageSize = data.pageSize;
          this.pageIndex = data.pageIndex;
          this.total = data.count;
        });
    }
    else if (this.type === 'sets') {
      this.categorySetsSubscription = this.ProductService.getSetsByCategoryAndSetType(this.categoryId, this.productTypeId , pageNum).subscribe(
        (data) => {
          this.page = data;
          this.pageSize = data.pageSize;
          this.pageIndex = data.pageIndex;
          this.total = data.count;
        });
    }
  }


  ngOnDestroy(): void {
    this.unsubscribeSubscriptions();
  }


  async addProductToCart(product: IProduct): Promise<void> {
    await this._BasketService.getUserBasket();
    this.updateProductCount(product);
    this._BasketService.addToOrUpdateCart(this._BasketService.basket).subscribe({
      next: (basket) => {
        this._BasketService.basketItemsCount.next(basket.basketItems.length);
      }
    });

  }

  private updateProductCount(set: IProduct) {
    let basket = this._BasketService.basket;

    if (basket !== null && basket.basketItems !== null) {
      for (let item of basket.basketItems) {
        if (item.productId == set.id) {
          item.productQuantity += 1;
          return;
        }
      };

      let basketItem: IBasketItem = this.initializeBasketItemForAddingToCart(set)

      basket.basketItems.push(basketItem);
    }
  }


  initializeBasketItemForAddingToCart(set: IProduct): IBasketItem {
    let basketItem: IBasketItem = {
      productId: set.id,
      productName: set.name,
      productPrice: set.price,
      productQuantity: 1,
      productPictureUrl: set.productPictures[0],
      category: set.type,
      type: set.type
    }
    return basketItem;
  }

  private unsubscribeSubscriptions(): void {
    if (this.categorySetsSubscription) {
      this.categorySetsSubscription.unsubscribe();
    }
    if (this.categoryItemsSubscription) {
      this.categoryItemsSubscription.unsubscribe();
    }
  }

  pageChanged(event: any) {
    this.applyPagination(event);
  }

}
