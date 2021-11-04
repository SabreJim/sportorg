import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {TableColumn} from "../../core/models/ui-objects";
import {
  AppMember,
  Enrollment,
  Invoice,
  InvoiceItem,
  MemberAttendance,
  NewInvoice,
  Payment
} from "../../core/models/data-objects";
import {MemberModalComponent} from "../../core/modals/member-modal/member-modal.component";
import { MatDialog } from "@angular/material/dialog";
import {MembersProxyService} from "../../core/services/member-proxy.service";
import {FirebaseAuthService} from "../../core/services/firebase-auth.service";
import {AppUser, UserProfile} from "../../core/models/authentication";
import {Subscription} from "rxjs";
import {EnrollmentProxyService} from "../../core/services/enrollment-proxy.service";
import {StaticValuesService} from "../../core/services/static-values.service";
import {FinancialProxyService} from "../../core/services/financial-proxy.service";
import {InvoiceModalComponent} from "../../core/modals/invoice-modal/invoice-modal.component";
import {PaymentModalComponent} from "../../core/modals/payment-modal/payment-modal.component";
import {EditModalComponent} from "../../core/edit-panel/edit-modal/edit-modal.component";
import {clone} from 'ramda';
import {LookupItem} from "../../core/models/rest-objects";
import {EditModalResponse} from "../../core/edit-panel/edit-panel.component";
import {SnackbarService} from "../../core/services/snackbar.service";
import {CurrencyPipe} from "@angular/common";

@Component({
  selector: 'app-my-profile-page',
  templateUrl: './my-profile-page.component.html',
  styleUrls: [ '../shared-page.scss',
    './my-profile-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyProfilePageComponent implements OnInit, OnDestroy {
    ngOnDestroy(): void {
        StaticValuesService.cleanSubs([this.enrollSub, this.memberSub, this.userSub, this.invoiceSub,
          this.paymentSub, this.profileSub]);
    }

  constructor(public dialog: MatDialog, private memberService: MembersProxyService,
              private authService: FirebaseAuthService, private enrollService: EnrollmentProxyService,
              private detector: ChangeDetectorRef, private financialService: FinancialProxyService) { }

  ngOnInit() {
    this.userSub = this.authService.CurrentUser.subscribe((user: AppUser) => {
      if (user.isAnonymous === false) {
        this.currentUser = user;
        this.getMembers(); // get members after being authenticated
        this.getEnrollments();
        if (!this.profileSub) {
          this.profileSub = this.authService.getMyProfile().subscribe((profile: UserProfile) => {
            this.myProfile = profile;
            this.detector.detectChanges();
          })
        }
      }
    });
    this.authService.getSession();
    this.invoiceSub = this.financialService.Invoices.subscribe((invoices: Invoice[]) => {
      this.myInvoices = invoices;
      // run totals as well
      let invoiceTotal = 0;
      let balanceTotal = 0;
      invoices.map((r: Invoice) => {
        invoiceTotal = invoiceTotal + r.invoiceValue;
        balanceTotal = balanceTotal + r.invoiceValue - r.paidValue;
      });
      this.financialSummary.balance = balanceTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD'});
      this.financialSummary.invoiced = invoiceTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD'});
      this.detector.detectChanges();
    });
    this.paymentSub = this.financialService.Payments.subscribe((payments: Payment[]) => {
      this.myPayments = payments;
      this.detector.detectChanges();
    });
  }
  protected userSub: Subscription;
  protected memberSub: Subscription;
  protected enrollSub: Subscription;
  protected invoiceSub: Subscription;
  protected paymentSub: Subscription;
  protected profileSub: Subscription;

  public currentUser: AppUser;
  public myProfile: UserProfile;
  public myMembers: AppMember[] = [];
  public myInvoices: Invoice[] = [];
  public myPayments: Payment[] = [];
  public buttonTextFn = (row: any) => { return 'Edit' }
  public editMyMember = (selectedMember: AppMember) => {
    if (!selectedMember || !selectedMember.memberId) return;
    // open a modal and pass in the member
    const dialogRef = this.dialog.open(MemberModalComponent,
      { width: '80vw', height: '80vh', data: selectedMember });
    dialogRef.afterClosed().subscribe((result: AppMember) => {
      if (result && result.firstName && result.lastName && result.email) {
        this.memberService.upsertMember(result).subscribe((saveResult: boolean) => {
          this.getMembers();
        });
      }
    });
  }

  public memberColumns: TableColumn[] = [
    TableColumn.fromConfig({fieldName: 'editButton', title: '', type: 'button', buttonClass: '',
      buttonTextFn: this.buttonTextFn, buttonFn: this.editMyMember  }),
    TableColumn.fromConfig({fieldName: 'memberName', title: 'Name', type: 'string', displayType: 'long-string'}),
    new TableColumn('yearOfBirth', 'Year of Birth', 'number'),
    new TableColumn('competeGender', 'Competition Gender', 'string'),
    new TableColumn('membershipStart', 'Joined', 'date'),
    TableColumn.fromConfig({fieldName: 'email', title: 'Contact Email', type: 'string', displayType: 'long-string'}),
    new TableColumn('license', 'License #', 'number'),
    TableColumn.fromConfig({fieldName: 'streetAddress', title: 'Address', type: 'string', displayType: 'long-string'}),
    new TableColumn('cellPhone', 'Cell #', 'string'),
    new TableColumn('homePhone', 'Home #', 'string')
  ];

  public getMembers = () => {
    StaticValuesService.cleanSubs([this.memberSub]); // remove old sub
    this.memberSub = this.memberService.getMyMembers().subscribe((myMembers: AppMember[]) => {
      this.myMembers = myMembers;
      this.detector.detectChanges();
    });
  };

  // Enrollments configuration
  public myEnrollments: Enrollment[] = [];
  public selectedEnrollment: Enrollment;
  public enrollColumns: TableColumn[] = [
    TableColumn.fromConfig({fieldName: 'memberName', title: 'Member', type: 'string', displayType: 'long-string'}),
    TableColumn.fromConfig({fieldName: 'programName', title: 'Program', type: 'string', displayType: 'long-string'}),
    new TableColumn('seasonName', 'Season', 'string'),
    new TableColumn('programFees', 'Program Fees', 'number'),
    new TableColumn('startDate', 'Start date', 'date'),
    new TableColumn('endDate', 'End date', 'date')
  ];

  public getEnrollments = () => {
    if (!this.enrollSub) {
      this.enrollSub = this.enrollService.getMyEnrollments().subscribe((myEnrollments: Enrollment[]) => {
        this.myEnrollments = myEnrollments;
        this.detector.detectChanges();
      });
    }
  }
  public selectEnrollments = (selectedEnrollment: Enrollment[]) => {
    if (selectedEnrollment.length) {
      this.selectedEnrollment = selectedEnrollment[0];
      this.detector.detectChanges();
    }
  };
  public withdrawFromClass = () => {
    if (!this.selectedEnrollment || !this.selectedEnrollment.enrollId) return;
  }

  // Financial configurations
  public getFinancials = () => {
    this.financialService.getMyInvoices();
    this.financialService.getMyPayments();
  }

  public invoiceDetailsModal = (row: Invoice) => {
    // preprocess the JSON array
    try {
      row.lineItems = JSON.parse(row.lineItemsJson);
    }catch (err) {
      row.lineItems = [];
    }
    // open a modal and pass in the invoice. Go directly to a PDF file if on mobile
    const dialogRef = this.dialog.open(InvoiceModalComponent,
      { minWidth: '800px', maxWidth: '800px', maxHeight: '80vh', data: { invoice: row, printImmediate: StaticValuesService.isMobile() } });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result.refresh) {
        this.financialService.getMyInvoices();
      }
    });
  }
  public invoiceText = () => {
    return StaticValuesService.isMobile() ? 'pdf' : 'Details';
  }
  public financialSummary = {
    invoiced: '$0.00',
    balance: '$0.00'
  }
  public invoiceColumns: TableColumn[] = [
    TableColumn.fromConfig({fieldName: 'detailsButton', title: '', type: 'button', buttonClass: '',
      buttonTextFn: this.invoiceText, buttonFn: this.invoiceDetailsModal }),
    TableColumn.fromConfig({fieldName: 'fromName', title: 'Member', type: 'string', displayType: 'long-string'}),
    new TableColumn('invoiceId', 'Invoice #', 'number'),
    new TableColumn('invoiceAmount', 'Invoiced', 'number'),
    new TableColumn('paidAmount', 'Paid', 'number'),
    new TableColumn('balance', 'Balance', 'number'),

    new TableColumn('updateDate', 'Update date', 'date')
  ];
  public paymentColumns: TableColumn[] = [
    TableColumn.fromConfig({fieldName: 'memberName', title: 'Member', type: 'string', displayType: 'long-string'}),
    new TableColumn('paymentAmount', 'Paid', 'number'),
    new TableColumn('invoiceAmount', 'Invoiced', 'number'),
    new TableColumn('paymentDate', 'Payment date', 'date'),
    new TableColumn('invoiceDescription', 'Invoice for', 'long-string')
  ];

  public createInvoice = () => {
    // open a record-edit modal and create an Invoice
    const memberLookup: LookupItem[] = this.myMembers.map((member:AppMember) => {
      return {id: member.memberId, name: member.memberName, lookup: 'member'}
    });
    const newInvoiceConfig: TableColumn[] = [
      TableColumn.fromConfig({fieldName: 'fromMemberId', title: 'From Member', type: 'select',
        displayField: 'memberName', lookupStatic: memberLookup, displayType: 'long-string'}),
      TableColumn.fromConfig({fieldName: 'fromCompanyId', title: 'From Company', type: 'select',
        displayField: 'companyName', lookupField: 'companies'}),
      TableColumn.fromConfig({fieldName: 'toMemberId', title: 'To Member', type: 'select',
        displayField: 'memberName', lookupStatic: memberLookup, displayType: 'long-string'}),
      TableColumn.fromConfig({fieldName: 'toCompanyId', title: 'To Company', type: 'select',
        displayField: 'companyName', lookupField: 'companies'}),
      new TableColumn('dueDate', 'Due Date', 'date')
    ];
    const dialogRef = this.dialog.open(EditModalComponent,
      { width: '80vw', height: '80vh', data: { record: {}, columns: newInvoiceConfig, entityType: 'Invoice' }});
    dialogRef.afterClosed().subscribe((result: EditModalResponse) => {
      if (result && result.record && result.saveRecord) {
        // save a new invoice
        if ((!result.record.toCompanyId && !result.record.toMemberId) || (!result.record.toCompanyId && !result.record.toMemberId)) {
          SnackbarService.notify(`A new invoice requires both a sender and receiver to be selected.`);
          return; // no valid record to save
        }
        const newInvoice: NewInvoice = {
          fromId: result.record.fromCompanyId > 0 ? result.record.fromCompanyId : result.record.fromMemberId,
          fromType: result.record.fromCompanyId > 0 ? 'company' :'member',
          toId: result.record.toCompanyId > 0 ? result.record.toCompanyId : result.record.toMemberId,
          toType: result.record.toCompanyId > 0 ? 'company' :'member',
          dueDate: result.record.dueDate
        };
        this.financialService.createInvoice(newInvoice).subscribe((completed: boolean) => {
          if (completed) {
            this.financialService.getMyInvoices();
          }
        });
      }
    });
  }
  public recordNewPayment = () => {
    if (!this.currentUser || !this.currentUser.isAdmin) return;
    // open a modal and pass in the member
    const dialogRef = this.dialog.open(PaymentModalComponent,
      { width: '80vw', maxWidth: '80vw', maxHeight: '80vh', data: { members: this.myMembers, invoices: this.myInvoices } })
    dialogRef.afterClosed().subscribe((result: Payment) => {
      if (result && result.fromId && result.toId && result.amount) {
        this.financialService.recordPayment(result).subscribe((didRecord: boolean) => {
          if (didRecord) {
            this.getFinancials();
          }
        });
      }
    });
  }


}
