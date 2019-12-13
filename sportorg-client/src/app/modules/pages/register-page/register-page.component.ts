import {Component, OnDestroy, OnInit} from '@angular/core';
import {FeeStructure} from "../../core/models/data-objects";
import {LookupProxyService} from "../../core/services/lookup-proxy.service";
import {Subscription} from "rxjs";
import {map} from 'ramda';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: [
    '../shared-page.scss',
    './register-page.component.scss'
  ]
})
export class RegisterPageComponent implements OnInit, OnDestroy {

  public setActiveFee = () => {

  }

  private feesSubscription: Subscription;
  public feeStructures: FeeStructure[] = [];

  constructor(protected lookupProxy: LookupProxyService) {
  }

  ngOnInit() {
    this.feesSubscription = this.lookupProxy.AllFees.subscribe((fees: FeeStructure[]) => {
      fees = map((fee) => {
        fee.expanded = true;
        return fee;
      }, fees);
      this.feeStructures = fees;
    });
    this.lookupProxy.getFees();
  }

  ngOnDestroy(): void {
    this.feesSubscription.unsubscribe();
  }

}
