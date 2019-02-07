import { Category } from './../../interfaces/category.interface';
import {CollectionViewer, SelectionChange} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import { Component, Injectable, OnInit, Inject, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { BehaviorSubject, merge, Observable, Subscription } from 'rxjs';
import {map} from 'rxjs/operators';
import { Router } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { checkAndUpdateDirectiveInline } from '@angular/core/src/view/provider';
import { updateClassProp } from '@angular/core/src/render3/styling';
import { ExpenseItemService } from '../../services/expense-item.service';
export class DynamicFlatNode {
  constructor(public item: string, public level = 1, public expandable = false,
              public isLoading = false) {}
}

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
export class DynamicDatabase {
  dataMap: Map<string, string[]> ;

  rootLevelNodes: Array<string>;

  /** Initial data from database */
  initialData(): DynamicFlatNode[] {
    return this.rootLevelNodes.map(name => new DynamicFlatNode(name, 0, true));
  }

  getChildren(node: string): string[] | undefined {
    return this.dataMap.get(node);
  }

  isExpandable(node: string): boolean {
    return this.dataMap.has(node);
  }
}
/**
 * File database, it can build a tree structured Json object from string.
 * Each node in Json object represents a file or a directory. For a file, it has filename and type.
 * For a directory, it has filename and children (a list of files or directories).
 * The input will be a json object string, and the output is a list of `FileNode` with nested
 * structure.
 */
@Injectable()
export class DynamicDataSource {

  dataChange = new BehaviorSubject<DynamicFlatNode[]>([]);

  get data(): DynamicFlatNode[] { return this.dataChange.value; }
  set data(value: DynamicFlatNode[]) {
    this.treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(private treeControl: FlatTreeControl<DynamicFlatNode>,
              private database: DynamicDatabase) {}

  connect(collectionViewer: CollectionViewer): Observable<DynamicFlatNode[]> {
    this.treeControl.expansionModel.onChange.subscribe(change => {
      if ((change as SelectionChange<DynamicFlatNode>).added ||
        (change as SelectionChange<DynamicFlatNode>).removed) {
        this.handleTreeControl(change as SelectionChange<DynamicFlatNode>);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
  }

  /** Handle expand/collapse behaviors */
  handleTreeControl(change: SelectionChange<DynamicFlatNode>) {
    if (change.added) {
      change.added.forEach(node => this.toggleNode(node, true));
    }
    if (change.removed) {
      change.removed.slice().reverse().forEach(node => this.toggleNode(node, false));
    }
  }

  /**
   * Toggle the node, remove from display list
   */
  toggleNode(node: DynamicFlatNode, expand: boolean) {
    const children = this.database.getChildren(node.item);
    const index = this.data.indexOf(node);
    if (!children || index < 0) { // If no children, or cannot find the node, no op
      return;
    }

    node.isLoading = true;

    if (expand) {
      const nodes = children.map(name =>
        new DynamicFlatNode(name, node.level + 1, this.database.isExpandable(name)));
      this.data.splice(index + 1, 0, ...nodes);
    } else {
      let count = 0;
      for (let i = index + 1; i < this.data.length
        && this.data[i].level > node.level; i++, count++) {}
      this.data.splice(index + 1, count);
    }

    // notify the change
    this.dataChange.next(this.data);
    node.isLoading = false;

  }
}
@Component({
  selector: 'app-expense-categories',
  templateUrl: './expense-categories.component.html',
  styleUrls: ['./expense-categories.component.css'],
  providers: [DynamicDatabase]
})
export class ExpenseCategoriesComponent implements OnInit, OnDestroy {

  activeCategory: string;
  categories = new Map<string, string[]>();
  categoriesArray: Category[];
  categoriesDeleteSubscriber: Subscription;
  categoriesAddSubcategorySubscriber: Subscription;
  estimateId: string;
  receivedMode: boolean;

  constructor(private database: DynamicDatabase, private router: Router,
              private expenseService: ExpenseService,private itemService: ExpenseItemService, private sharedService: SharedDataService)  {
    this.treeControl = new FlatTreeControl<DynamicFlatNode>(this.getLevel, this.isExpandable);

    this.database.dataMap = this.categories;
    this.database.rootLevelNodes = Array.from(this.categories.keys());

    this.dataSource = new DynamicDataSource(this.treeControl, database);

    this.dataSource.data = database.initialData();

    this.categoriesDeleteSubscriber = sharedService.getDeleteCategoriesSubject().subscribe(name => {
      this.onDelete(name);
    });

    this.categoriesAddSubcategorySubscriber = sharedService.getAddSubCategoriesSubject().subscribe(categories => {
      this.update();
    });

    this.receivedMode = sharedService.receivedMode;
   }

  treeControl: FlatTreeControl<DynamicFlatNode>;

  dataSource: DynamicDataSource;

  getLevel = (node: DynamicFlatNode) => node.level;

  isExpandable = (node: DynamicFlatNode) => node.expandable;

  hasChild = (_: number, _nodeData: DynamicFlatNode) => _nodeData.expandable;

  ngOnInit() {
    this.estimateId = this.getEstimateId();
    this.sharedService.estimateid = this.estimateId;

    this.update();
  }

  ngOnDestroy() {
    this.categoriesDeleteSubscriber.unsubscribe();
  }

  update() {
    this.expenseService.updateAllCategoriesAndSubcategories(this.estimateId).subscribe(data => {
      console.log(data);
      let categoriesArrayFromDb = data.data as Array<Category>;

      this.sharedService.allCategories = categoriesArrayFromDb;
      categoriesArrayFromDb.forEach((x: Category) => {
        if(x.parentid == null) {
          this.categories.set(x.name, new Array<string>());
        } else {
          let parentCategory = categoriesArrayFromDb.find(y => y.categoryid === x.parentid);
          this.categories.get(parentCategory.name).push(x.name);
        };

      });
      this.treeUpdate();
    },err =>{
      console.log(err);
      this.sharedService.error();
    });
  }

  treeUpdate() {
    console.log(this.categories);

        this.treeControl = new FlatTreeControl<DynamicFlatNode>(this.getLevel, this.isExpandable);

        this.database.dataMap = this.categories;
        this.database.rootLevelNodes = Array.from(this.categories.keys());

        this.dataSource = new DynamicDataSource(this.treeControl, this.database);

        this.dataSource.data = this.database.initialData();
  }
  disableButton(label): boolean {
    return this.categories.get(label).length !== 0;
  }

  onDelete(item) {
    if(this.database.rootLevelNodes.find(i => i == item)) {

      this.database.rootLevelNodes = this.database.rootLevelNodes.filter( i => i !== item);
      this.database.dataMap.delete(item);

      this.dataSource = new DynamicDataSource(this.treeControl, this.database);
      this.dataSource.data = this.database.initialData();
    } else {
      let subCategory = this.sharedService.allCategories.find(c => c.name === item);
      let parentId = subCategory.parentid;
      let parent = this.sharedService.allCategories.find(c => c.categoryid === parentId);
      let parentArray = this.categories.get(parent.name);
      parentArray = this.categories.get(parent.name).filter(subCat => subCat != subCategory.name);
      this.update();
    }
  }

  onCreateNewCategory(input) {

    this.expenseService.createCategory(input.value, this.estimateId).subscribe(data => {
      console.log(data);
      if(data.error) {
        this.sharedService.errorMessage(data.error);
        input.value = null;
        return;
      }
      this.database.rootLevelNodes = this.database.rootLevelNodes.concat(input.value);
      this.database.dataMap.set(input.value, new Array<string>());

      this.dataSource = new DynamicDataSource(this.treeControl, this.database);
      this.dataSource.data = this.database.initialData();
      this.update();
      input.value = null;
    }, err => {
      console.log(err);
      this.sharedService.error();
    });
  }

  onCreateSubCategory(parent, subcategory) {
    const newArrayOfSubCategories = this.database.dataMap.get(parent).concat(subcategory);
    this.database.dataMap.set(subcategory, newArrayOfSubCategories);
    this.dataSource = new DynamicDataSource(this.treeControl, this.database);
    this.dataSource.data = this.database.initialData();
  }

  onActivateCategory(category: string) {
    this.sharedService.activaCategoryName = category;
    this.sharedService.activeCategory.next(category);
    this.itemService.collectAllItems();
    //this.itemService.fireItemsForActiveCategorySubject();
  }

  getEstimateId() {
    let url = this.router.url.split('/');
    return url[url.length-2];
  }
}
