import { HttpClient, HttpRequest } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfigService } from 'src/sharedservices/config.service';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-phonebook',
  templateUrl: './phonebook.component.html',
  styleUrls: ['./phonebook.component.css']
})

export class PhonebookComponent implements OnInit {

  //Info
  PbEntriesCnt=0;

  //Popup
  phonebook_popupVisible: boolean = false;
  pbEntry_popupVisible: boolean = false;
  PhonebookDelete_popupVisible: boolean = false;
  PbEntryDelete_popupVisible: boolean = false;

  //Current Selected Models
  pendUpdatePhonebook = {id:0,name:""};
  selectedPhonebook = {id:0,name:""};
  selectedPbEntry = {id:0,name:"",contactnumber:"",phonebookid:0};
  
  //FunctionVars
  pbEntrySearch = ""
  disablePhoneEdit = true;
  namePattern: any = /^[^0-9]+$/;
  showDesign=false;

  //Datasources
  PbDataSource;
  PbEntriesDataSource;
  CrossPbEntriesDataSource;
  

  constructor(
    private httpclient: HttpClient,
    private config: ConfigService,
  ){}

  ngOnInit(): void {
    this.loadPhonebooks();
  }
  addPhonebook(){
    //Chris: TODO: Need to create new input object for Popup in case the user cancel request
    //this.selectedPhonebook = {id:0,name:""};
    this.pendUpdatePhonebook = {id:0,name:""};
    this.phonebook_popupVisible = true;
  }
  editPhonebook(){
    this.pendUpdatePhonebook = { ...this.selectedPhonebook };
    this.phonebook_popupVisible = true;
  }
  closePopups(){
    this.phonebook_popupVisible = false;
    this.pbEntry_popupVisible = false;
    this.PhonebookDelete_popupVisible = false;
    this.PbEntryDelete_popupVisible = false;
  }
  cleanErrorMsg (ex){
    var message = "";
    if ((ex as any).error != null && (ex as any).error.title != null){
      message = `Reason: ${(ex as any).error.title}`;
    }
    else if ((ex as any).error != null)
    {
      message = `${(ex as any).error}`
    }
    else{
      message = `${(ex as any).message}`
    }
    if (message.indexOf("http:") >= 0)
    {
      message = "Please contact a system administrator."
    }
    return message;
  }
  lookup_valueChanged(data) {
    if (data != null && data.value > 0){
      this.pbEntrySearch = "";
      this.CrossPbEntriesDataSource =null;
      this.selectedPhonebook.id = data.value;
      this.loadPhonebookAndEntries(data.value);
      this.disablePhoneEdit = false;

    }
  }
  askDeletePhonebook(){
    this.PhonebookDelete_popupVisible = true;
  }
  askDeletePbEntry(data){
    this.selectedPbEntry = {id:data.entryId,name:data.name,contactnumber:data.contactNumber,phonebookid:this.selectedPhonebook.id};
    this.PbEntryDelete_popupVisible = true;
  }
  clearFilter(){
    this.CrossPbEntriesDataSource =null;
    this.pbEntrySearch = "";
    this.loadPbEntries(this.selectedPhonebook.id);
  }
  toggleDesign(){
    this.showDesign = !this.showDesign;
  }
  async addPBEntry(){
    this.selectedPbEntry = {id:0,name:"",contactnumber:"",phonebookid:this.selectedPhonebook.id};
    this.pbEntry_popupVisible = true;
  }
  async editPBEntry(data){
    this.selectedPbEntry = {id:data.entryId,name:data.name,contactnumber:data.contactNumber,phonebookid:this.selectedPhonebook.id};
    this.pbEntry_popupVisible = true;
  }
  async savePbEntry (){
    try {
      if (this.selectedPbEntry.id == 0) {
        var Postbody = { Name: this.selectedPbEntry.name, contactnumber:this.selectedPbEntry.contactnumber,phonebookid:this.selectedPbEntry.phonebookid };
        const httpRequest = new HttpRequest("POST", `${this.config.URL}/api/PbEntries`, Postbody);
        const httpResponse: any = await this.httpclient.request(httpRequest).toPromise();

        if (httpResponse.status == 200 || httpResponse.status == 201) {
          notify("Phonebook entry successfully saved.", "success", 2000);
          this.closePopups();
          await this.loadPbEntries(this.selectedPhonebook.id);
        }
        else {
          notify(httpResponse.status + " status code received. Message:" + httpResponse.message, "info", 3000);
        }
      }
      else if (this.selectedPbEntry.id > 0) {
        var Putbody = {entryId:this.selectedPbEntry.id, Name: this.selectedPbEntry.name, contactnumber:this.selectedPbEntry.contactnumber,phonebookid:this.selectedPbEntry.phonebookid };
        const httpRequest = new HttpRequest("PUT", `${this.config.URL}/api/PbEntries/${this.selectedPbEntry.id}`, Putbody);
        const httpResponse: any = await this.httpclient.request(httpRequest).toPromise();
        if (httpResponse.status == 200 || httpResponse.status == 204) {
          notify("Phonebook successfully saved.", "success", 2000);
          this.closePopups();
          await this.loadPbEntries(this.selectedPhonebook.id);
        }
        else {
          notify(httpResponse.status + " status code received. Message:" + httpResponse.message, "info", 3000);
        }
      }
      else {
        throw new Error("The phonebook entry state is unknown. Please reselect the phonebook or insert a new phonebook.");
      }
    }
    catch (ex) {
      //Chris: TODO: Need to log errors.
      var message = this.cleanErrorMsg(ex);
      notify(`An error occurred while saving the phonebook entry. ${message}`, "error", 3000);
    }
  }
  async savePhonebook() {
    try {
      if (this.pendUpdatePhonebook.id == 0) {
        var Postbody = { name: this.pendUpdatePhonebook.name };
        const httpRequest = new HttpRequest("POST", `${this.config.URL}/api/Phonebook`, Postbody);
        const httpResponse: any = await this.httpclient.request(httpRequest).toPromise();

        if (httpResponse.status == 200 || httpResponse.status == 201) {
          notify("Phonebook successfully saved.", "success", 2000);
          this.closePopups();
          await this.loadPhonebooks();
          this.selectedPhonebook.id = httpResponse.body.id;

        }
        else {
          notify(httpResponse.status + " status code received. Message:" + httpResponse.message, "info", 3000);
        }
      }
      else if (this.pendUpdatePhonebook.id > 0) {
        var Putbody = { id: this.pendUpdatePhonebook.id, name: this.pendUpdatePhonebook.name };
        const httpRequest = new HttpRequest("PUT", `${this.config.URL}/api/Phonebook/${this.pendUpdatePhonebook.id}`, Putbody);
        const httpResponse: any = await this.httpclient.request(httpRequest).toPromise();
        if (httpResponse.status == 200 || httpResponse.status == 204) {
          notify("Phonebook successfully saved.", "success", 2000);
          this.closePopups();
          await this.loadPhonebooks();
          this.selectedPhonebook.id = httpResponse.body.id;
        }
        else {
          notify(httpResponse.status + " status code received. Message:" + httpResponse.message, "info", 3000);
        }
      }
      else 
      {
        throw new Error("The phonebook state is unknown. Please reselect the phonebook or insert a new phonebook.");
      }
    }
    catch (ex) {
      //Chris: TODO: Need to log errors.
      var message = this.cleanErrorMsg(ex);
      notify(`An error occurred while saving the phonebook. ${message}`, "error", 3000);
    }
  }
  async crossFindPbEntry(){
    if (this.pbEntrySearch == ""){
      this.clearFilter();
      notify("Please type in a phrase to filter by.");
      return;
    }
    if (this.selectedPhonebook.id != null && this.selectedPhonebook.id != 0){
      this.loadPbEntries(this.selectedPhonebook.id);
    }
    this.loadAllPbEntries();
  }
  async loadPbEntries(phonebookid) {
    try {

      const httpRequest = new HttpRequest("GET",`${this.config.URL}/api/PbEntries/GetByPhonebook/${phonebookid}/${this.pbEntrySearch}`);
      const httpResponse: any = await this.httpclient.request(httpRequest).toPromise();
      if (httpResponse.status == 200){
        this.PbEntriesDataSource = httpResponse.body;
        this.PbEntriesCnt = this.PbEntriesDataSource.count;
      }
      else{
        notify(httpResponse.status +" status code received. Message:"+httpResponse.message, "info", 3000); 
      }
    }
    catch (ex){
        //Chris: TODO: Need to log errors.
        var message = this.cleanErrorMsg(ex);
        notify(`An error occurred while loading the phonebook entries. ${message}`, 'error', 6000);
    }
  }
  async loadPhonebookAndEntries(phonebookid){
    try {
      const httpRequest = new HttpRequest("GET",`${this.config.URL}/api/Phonebook/GetDetailByID/${phonebookid}`);
      const httpResponse: any = await this.httpclient.request(httpRequest).toPromise();
      if (httpResponse.status == 200){
        this.selectedPhonebook.name = httpResponse.body.name;
        this.PbEntriesDataSource = httpResponse.body.entries;
        this.PbEntriesCnt = this.PbEntriesDataSource.count;
      }
      else{
        notify(httpResponse.status +" status code received. Message:"+httpResponse.message, "info", 3000); 
      }
    }
    catch (ex){
        //Chris: TODO: Need to log errors.
        var message = this.cleanErrorMsg(ex);
        notify(`An error occurred while loading the phonebook and entries. ${message}`, 'error', 6000);
    }
  }
  async loadPhonebooks (){
    try {
      //Chris: TODO: Replace the new Promise code.
      const httpRequest = new HttpRequest("GET",`${this.config.URL}/api/Phonebook`);
      const httpResponse: any = await this.httpclient.request(httpRequest).toPromise();
      if (httpResponse.status == 200){
        this.PbDataSource = httpResponse.body;
      }
      else{
        notify(httpResponse.status +" status code received. Message:"+httpResponse.message, "info", 3000); 
      }
    }
    catch (ex){
      //Chris: TODO: Need to log errors.
      var message = this.cleanErrorMsg(ex);
      notify(`An error occurred while loading the phonebook. ${message}`, 'error', 6000);
  }
  }
  async deletePhonebook() {
    try {
      if (this.selectedPhonebook.id > 0) {
        const httpRequest = new HttpRequest("DELETE", `${this.config.URL}/api/Phonebook/${this.selectedPhonebook.id}`);
        const httpResponse: any = await this.httpclient.request(httpRequest).toPromise();
        if (httpResponse.status == 200 || httpResponse.status == 204) {
          notify("Phonebook successfully removed.", "success", 2000);
          this.closePopups();
          await this.loadPhonebooks();
          this.selectedPhonebook.id = 0;
          this.PbEntriesDataSource = null;
        }
        else {
          notify(httpResponse.status + " status code received. Message:" + httpResponse.message, "info", 3000);
        }
      }
      else {
        notify("Please select a phonebook before continunig.");
      }
    }
    catch (ex) {
      var message = this.cleanErrorMsg(ex);
      notify(`An error occurred while attempting to remove the phonebook. ${message}`, "error", 6000);
    }
  }
  async deletePbEntry() {
    try {
      if (this.selectedPhonebook.id > 0) {
        const httpRequest = new HttpRequest("DELETE", `${this.config.URL}/api/PbEntries/${this.selectedPbEntry.id}`);
        const httpResponse: any = await this.httpclient.request(httpRequest).toPromise();
        if (httpResponse.status == 200 || httpResponse.status == 204) {
          notify("Entry successfully removed.", "success", 2000);
          this.closePopups();
          await this.loadPbEntries(this.selectedPhonebook.id);
        }
        else {
          notify(httpResponse.status + " status code received. Message:" + httpResponse.message, "info", 3000);
        }
      }
      else {
        notify("Please select a phonebook entry before continunig.");
      }
    }
    catch (ex) {
      var message = this.cleanErrorMsg(ex);
      notify(`An error occurred while attempting to remove the phonebook entry. ${message}`, "error", 6000);
    }
  }
  async loadAllPbEntries(){
    try {
      const httpRequest = new HttpRequest("GET",`${this.config.URL}/api/PbEntries/GetAllByName/${this.pbEntrySearch}/${this.selectedPhonebook.id}`);
      const httpResponse: any = await this.httpclient.request(httpRequest).toPromise();
      if (httpResponse.status == 200){
        this.CrossPbEntriesDataSource = httpResponse.body;
      }
      else{
        notify(httpResponse.status +" status code received. Message:"+httpResponse.message, "info", 3000); 
      }
    }
    catch (ex){
        //Chris: TODO: Need to log errors.
        var message = this.cleanErrorMsg(ex);
        notify(`An error occurred while loading the filtered entries. ${message}`, 'error', 6000);
    }
  }
}
  

