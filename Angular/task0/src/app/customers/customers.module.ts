import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { CustomersComponent } from "./customers.component";
import { CustomersListComponent } from "./customers-list/customers-list.component";
import { SharedModule } from "../shared/shared.module";
import { FilterTextboxComponent } from "./customers-list/filter-textbox.components";


@NgModule({
    imports :[CommonModule, SharedModule, FormsModule],
    declarations: [CustomersComponent, CustomersListComponent, FilterTextboxComponent],
    exports:[CustomersComponent]
})
export class CustomersModule {}