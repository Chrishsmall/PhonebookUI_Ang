import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxDataGridModule,DxLookupModule,DxButtonModule,DxTextBoxModule,DxPopupModule,DxValidatorModule } from 'devextreme-angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ConfigService } from 'src/sharedservices/config.service';
import { PhonebookService } from './phonebook/phonebook.service';
import { PhonebookComponent } from './phonebook/phonebook.component';


@NgModule({
  declarations: [
    AppComponent,
    PhonebookComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DxDataGridModule,
    DxLookupModule,
    HttpClientModule,
    DxButtonModule,
    DxTextBoxModule,
    DxPopupModule,
    DxValidatorModule,
  ],
  providers: [ConfigService,PhonebookService],
  bootstrap: [AppComponent]
})
export class AppModule { }
