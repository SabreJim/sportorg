import {Component, OnDestroy, OnInit} from '@angular/core';
import {FeeStructure} from "../../core/models/data-objects";
import {LookupProxyService} from "../../core/services/lookup-proxy.service";
import {Subscription} from "rxjs";
import {map} from 'ramda';

@Component({
  selector: 'app-fees-page',
  templateUrl: './fees-page.component.html',
  styleUrls: [
    '../shared-page.scss',
    './fees-page.component.scss'
  ]
})
export class FeesPageComponent implements OnInit, OnDestroy {

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
