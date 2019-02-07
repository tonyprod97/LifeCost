import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ExpenseItem } from '../interfaces/expense-item.interface';
import { UserService } from './user.service';
import { User } from '../interfaces/user.interface';
import { Category } from '../interfaces/category.interface';
import { SharedDataService } from './shared-data.service';
import { identifierModuleUrl } from '@angular/compiler';


@Injectable({
  providedIn: 'root'
})

export  class ExpenseService {
  private categoriesUpdate = new Subject<any>();
  private configUrl = '/api/user/category/';

  constructor(private  http:  HttpClient, private userService: UserService, private sharedService: SharedDataService) {
  }

  updateAllCategoriesAndSubcategories(id) {
    let user : User = this.userService.getLoggedUser();

    console.log('estimate id from service: ',id)
    //from db get latest
    return this.http.post<any>(this.configUrl + 'get',
    {
      user: {
        estimateid: id,
        userid: user.id,
        token: user.token
      }
    });
  }

  getAllCategoriesAndSubcategories(): Observable<Category[]> {
      return this.categoriesUpdate.asObservable();
  }

  deleteCategory(name: string) {
    let user : User = this.userService.getLoggedUser();
    let categoryToDelete = this.sharedService.allCategories.find(cat => cat.name === name);
    //from db get latest
    console.log(categoryToDelete,name);
    return this.http.post<any>(this.configUrl + 'delete',
    {
      user: {
        userid: user.id,
        token: user.token,
        categoryid: categoryToDelete.categoryid
      }
    });
  }
  createCategory(label: string, id: string) {
    let user : User = this.userService.getLoggedUser();
    console.log('saljem: ',{
    user: {
      name: label,
      userid: user.id,
      token: user.token,
      estimateid: id,
      parentid: null
    }
  })
    //from db get latest
    return this.http.post<any>(this.configUrl + 'create',
    {
      user: {
        name: label,
        userid: user.id,
        token: user.token,
        estimateid: id,
        parentid: null
      }
    });
  }

  createSubCategory(parent: number,label: string,estimateid: string) {
    let user : User = this.userService.getLoggedUser();

    console.log({
      user: {
        name: label,
        userid: user.id,
        token: user.token,
        estimateid: estimateid,
        parentid:parent
      }
    })
    //from db get latest
    return this.http.post<any>(this.configUrl + 'create',
    {
      user: {
        name: label,
        userid: user.id,
        token: user.token,
        estimateid: estimateid,
        parentid:parent
      }
    });
  }

  deleteItem(label: string) {
    console.log('deleting item: ',label);
  }

  createItem(item: ExpenseItem, category: string) {
    console.log('saving item: ',item, category);

  }

  updateCategoryName(label: string, id: number) {
    console.log('updating category name: ',label,id);

    let user : User = this.userService.getLoggedUser();

    return this.http.post<any>(this.configUrl+'update',{
      user: {
        name: label,
        categoryid: id,
        userid: user.id,
        token: user.token,
      }
    });
  }
}


