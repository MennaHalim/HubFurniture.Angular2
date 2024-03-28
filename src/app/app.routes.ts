<<<<<<< HEAD
import { Routes } from '@angular/router';
import { BlankLayoutComponent } from './Layouts/blank-layout/blank-layout.component';
import { NotFoundComponent } from './Components/not-found/not-found.component';
import { BodyComponent } from './Components/body/body.component';
import { QueryParamGuard } from './Shared/Guards/query-param.guard';
import { DetailsComponent } from './Components/details/details.component';
import { BasketComponent } from './Components/basket/basket.component';
import { ProductsComponent } from './Components/products/products.component';
import { ShopByComponent } from './Components/shop-by/shop-by.component';
import { SignInComponent } from './Components/sign-in/sign-in.component';
import { SignUpComponent } from './Components/sign-up/sign-up.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
=======
import { Routes } from "@angular/router";
import { BasketComponent } from "./components/basket/basket.component";
import { BodyComponent } from "./components/body/body.component";
import { DetailsComponent } from "./components/details/details.component";
import { BlankLayoutComponent } from "./Layouts/blank-layout/blank-layout.component";
import { QueryParamGuard } from "./Shared/Guards/query-param.guard";
import { NotFoundComponent } from "./components/not-found/not-found.component";
import { SignInComponent } from "./components/sign-in/sign-in.component";
import { SignUpComponent } from "./components/sign-up/sign-up.component";
>>>>>>> b51573c89243f6ac18c447b0f51f523abb44fffd



export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: BodyComponent, title: 'Home' },
    { path: 'products/categories', component: BlankLayoutComponent, title: 'Shop', canActivate: [QueryParamGuard] },
    { path: 'products/categories/:type', component: BlankLayoutComponent, pathMatch: 'full' },
    { path: 'sets/details/:id', component: DetailsComponent, title: 'Details' },
    { path: 'basket', component: BasketComponent, title: 'Cart' },
    { path: 'notFound', component: NotFoundComponent, title: 'Not Found' },
    { path: 'login', component: SignInComponent, title: 'sign-in' },
    { path: 'Register', component: SignUpComponent, title: 'sign-Up' },
    { path: 'checkout', component: CheckoutComponent, title: 'payment' },
    { path: '**', redirectTo: 'notFound' }
];
