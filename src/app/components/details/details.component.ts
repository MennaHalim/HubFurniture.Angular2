import { CustomerReview, ICustomerReview, IProduct } from './../../Shared/Models/product';
import { ProductService } from './../../Shared/Services/product.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICustomerReviewToCreate, ISet } from '../../Shared/Models/product';
import { CapitalizeSpacePipe } from "../../Shared/Pipes/capitalize-space.pipe";
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap } from 'rxjs';
import { IBasketItem } from '../../Shared/Models/basket';
import { BasketService } from '../../Shared/Services/basket.service';

@Component({
  selector: 'app-details',
  standalone: true,
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
  imports: [CapitalizeSpacePipe, CommonModule, ReactiveFormsModule]
})
export class DetailsComponent implements OnInit {

  selectedTab: string = 'size-guide';

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }


  productDetails: any;

  constructor(private _ActivatedRoute: ActivatedRoute,
    private _ProductService: ProductService,
    private _BasketService: BasketService) { }

  productId!: string | null;
  productType!: any;

  ngOnInit(): void {

    const allStar = document.querySelectorAll<HTMLElement>('.rating .star');
    const ratingValue = document.querySelector<HTMLInputElement>('.rating input');

    allStar.forEach((item, idx) => {
      item.addEventListener('click', function () {
        let click = 0;
        if (ratingValue) {
          ratingValue.value = (idx + 1).toString();
        }

        allStar.forEach(i => {
          i.classList.replace('bxs-star', 'bx-star');
          i.classList.remove('active');
        });

        for (let i = 0; i < allStar.length; i++) {
          if (i <= idx) {
            allStar[i].classList.replace('bx-star', 'bxs-star');
            allStar[i].classList.add('active');
          } else {
            allStar[i].style.setProperty('--i', click.toString());
            click++;
          }
        }
      });
    });

    this._ActivatedRoute.paramMap.subscribe({
      next: (params) => {
        this.productId = params.get('id');
        this.productType = params.get('type');
      }
    })

    this._ProductService.getProductDetails(this.productId, this.productType).subscribe({
      next: (response) => {
        this.productDetails = response;
      }
    });
  }

  currentIndex: number = 0; // Keep track of the current slide index

  next() {
    if (this.productDetails && this.productDetails.customerReviews) {
      let slides = document.querySelectorAll('.slide-container');
      slides[this.currentIndex].classList.remove('active');
      this.currentIndex = (this.currentIndex + 1) % slides.length;
      slides[this.currentIndex].classList.add('active');
    }
  }

  prev() {
    if (this.productDetails && this.productDetails.customerReviews) {
      let slides = document.querySelectorAll('.slide-container');
      slides[this.currentIndex].classList.remove('active');
      this.currentIndex = (this.currentIndex - 1 + slides.length) % slides.length;
      slides[this.currentIndex].classList.add('active');
    }
  }




  counter: number = 1;


  incrementCounter() {
    this.counter++;
    this.updateCounterDisplay();
  }

  decrementCounter() {
    if (this.counter - 1 > 0) {
      this.counter--;
      this.updateCounterDisplay();
    }
  }

  updateCounterDisplay() {
    const numElement = document.querySelector('.num');
    if (numElement) {
      numElement.textContent = this.counter.toString().padStart(2, '0');
    }
  }

  isAvailable(): boolean {
    return this.productDetails?.availability === 'InStock';
  }


  reviewForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z \s]*$')]),
    rating: new FormControl(0, Validators.required),
    reviewText: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z \s]*$')])
  });

  setRatingValue(value: number): void {
    this.reviewForm.get('rating')?.setValue(value);
  }

  submitReview() {
    if (this.reviewForm.valid) {
      let customerReview: CustomerReview = new CustomerReview();

      customerReview.customerName = this.reviewForm.get('name')?.value;
      customerReview.rate = this.reviewForm.get('rating')?.value;
      customerReview.review = this.reviewForm.get('reviewText')?.value;

      if (this.productType == 'set') {
        customerReview.CategorySetId = Number(this.productDetails?.id);
      }
      else if (this.productType == 'item') {
        customerReview.CategoryItemId = Number(this.productDetails?.id);
      }

      this._ProductService.createReview(customerReview).pipe(
        switchMap(() => this._ProductService.getProductDetails(this.productId, this.productType))
      ).subscribe({
        next: (response) => {
          this.productDetails = response;
          this.reviewForm.reset();

          const allStar = document.querySelectorAll<HTMLElement>('.rating .star');
          allStar.forEach(star => {
            star.classList.replace('bxs-star', 'bx-star');
          });
        }
      });

    } else {
      this.reviewForm.markAllAsTouched();
    }
  }

  async addProductToCart(product: IProduct): Promise<void> {
    product.type = this.productType;
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




}

