import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {TableColumn} from "../../core/models/ui-objects";
import {AppMember, Enrollment, Invoice, InvoiceItem, MemberAttendance, Payment} from "../../core/models/data-objects";
import {MemberModalComponent} from "../../core/modals/member-modal/member-modal.component";
import {MatDialog} from "@angular/material";
import {MembersProxyService} from "../../core/services/member-proxy.service";
import {FirebaseAuthService} from "../../core/services/firebase-auth.service";
import {AppUser, UserProfile} from "../../core/models/authentication";
import {Subscription} from "rxjs";
import {EnrollmentProxyService} from "../../core/services/enrollment-proxy.service";
import {StaticValuesService} from "../../core/services/static-values.service";
import {FinancialProxyService} from "../../core/services/financial-proxy.service";
import {InvoiceModalComponent} from "../../core/modals/invoice-modal/invoice-modal.component";
import {PaymentModalComponent} from "../../core/modals/payment-modal/payment-modal.component";

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
      { width: '80vw', height: '80vh', data: selectedMember })
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
      buttonTextFn: this.buttonTextFn, buttonFn: this.editMyMember }),
    TableColumn.fromConfig({fieldName: 'name', title: 'Name', type: 'string', displayType: 'long-string'}),
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
    if (!this.memberSub) {
      this.memberSub = this.memberService.getMyMembers().subscribe((myMembers: AppMember[]) => {
        this.myMembers = myMembers;
        this.detector.detectChanges();
      });
    }
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
    // open a modal and pass in the member
    this.dialog.open(InvoiceModalComponent,
      { minWidth: '50vw', minHeight: '50vh', maxWidth: '80vw', maxHeight: '80vw', data: { invoice: row } });
  }
  public invoiceText = () => 'Details';
  public invoiceColumns: TableColumn[] = [
    TableColumn.fromConfig({fieldName: 'memberName', title: 'Member', type: 'string', displayType: 'long-string'}),
    new TableColumn('invoiceId', 'Invoice #', 'number'),
    new TableColumn('invoiceAmount', 'Invoiced', 'number'),
    new TableColumn('paidAmount', 'Paid', 'number'),
    new TableColumn('balance', 'Balance', 'number'),
    TableColumn.fromConfig({fieldName: 'detailsButton', title: '', type: 'button', buttonClass: '',
      buttonTextFn: this.invoiceText, buttonFn: this.invoiceDetailsModal }),
    new TableColumn('updateDate', 'Update date', 'date')
  ];
  public paymentColumns: TableColumn[] = [
    TableColumn.fromConfig({fieldName: 'memberName', title: 'Member', type: 'string', displayType: 'long-string'}),
    new TableColumn('paymentAmount', 'Paid', 'number'),
    new TableColumn('invoiceAmount', 'Invoiced', 'number'),
    new TableColumn('updateDate', 'Payment date', 'date'),
    new TableColumn('invoiceDescription', 'Invoice for', 'long-string')
  ];

  public recordNewPayment = () => {
    if (!this.currentUser || !this.currentUser.isAdmin) return;
    // open a modal and pass in the member
    const dialogRef = this.dialog.open(PaymentModalComponent,
      { width: '60vw', height: '60vh', data: { members: this.myMembers, invoices: this.myInvoices } })
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
