import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {EventsProxyService} from "../../core/services/events/events-proxy.service";
import {LookupProxyService} from "../../core/services/lookup-proxy.service";
import {Circuit, EventAthlete, EventConfiguration, EventRound} from "../../core/models/data-objects";
import {LookupItem} from "../../core/models/rest-objects";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {clone} from 'ramda';
import {RankingProxyService} from "../../core/services/events/ranking-proxy.service";
import {FirebaseAuthService} from "../../core/services/firebase-auth.service";
import {ConfirmModalComponent} from "../../core/modals/confirm-modal/confirm-modal.component";

@Component({
  selector: 'app-event-format-modal',
  templateUrl: './event-format-modal.component.html',
  styleUrls: ['../events-shared.scss', './event-format-modal.component.scss'],
})
export class EventFormatModalComponent implements OnInit, OnDestroy {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public matDialogRef: MatDialogRef<EventFormatModalComponent>,
              protected eventProxy: EventsProxyService, protected lookupProxy: LookupProxyService,
              protected rankingProxy: RankingProxyService, protected userProxy: FirebaseAuthService,
              protected dialog: MatDialog) {
    this.eventId = data.eventId;
    this.eventName = data.eventName;
    this.getFormat();
  }
  public eventName = 'Current Event';
  public eventId = -1;
  public eventConfig: EventConfiguration;
  public hasEventRole = false;
  public availableCircuits: LookupItem[] = [];

  public getFormat = () => {
    this.eventProxy.getEventConfig(this.eventId).subscribe((config: EventConfiguration) => {
      if (config && config.eventId) {
        this.eventConfig = config;
        this.findPoolOptions();
        this.getAvailableCircuits();
      }
    });
  }
  protected getAvailableCircuits = () => {
    const rankingFilter: any = {
      age: [this.eventConfig.primaryAgeCategoryId],
      athleteType: [this.eventConfig.athleteTypeId]
    };
    if (this.eventConfig.genderId !== 3) {
      rankingFilter.gender =[this.eventConfig.genderId];
    }
    this.rankingProxy.getRankingsList({search: '', filters: rankingFilter}).subscribe((circuits: Circuit[]) => {
      this.availableCircuits = circuits.map((c: Circuit) => {
        return {id: c.circuitId, name: c.circuitName, lookup: 'circuits' };
      });
      // map existing selections
      this.eventConfig.eventRankCircuitIds.map((id: number) => {
        const foundCircuit = this.availableCircuits.find(c => c.id === id);
        if (foundCircuit) {
          foundCircuit.checked = true;
        }
      });
    });
  }

  public selectCircuit = (event: MatCheckboxChange, circuit: LookupItem) => {
    if (event.checked) { // add to the set of selected circuits
      this.eventConfig.eventRankCircuitIds.push(circuit.id);
    } else {
      this.eventConfig.eventRankCircuitIds = this.eventConfig.eventRankCircuitIds.filter((id: number) => {
        return id !== circuit.id;
      });
    }
  }
  public setEventStatus = (statusId: number) => {
    this.eventProxy.setEventStatus(this.eventConfig.eventId, statusId).subscribe(() => {
      this.getFormat();
    });
  }

  public rerunRankings = () => {
    if (!this.eventConfig.registeredNum || this.eventConfig.registeredNum > this.eventConfig.checkedInNum) {
      // get confirmation before continuing
      const dialogRef = this.dialog.open(ConfirmModalComponent,
        { width: '350px', height: '250px', data: { title: `Run rankings`,
            message: `Are you sure you want to run the rankings? Any athletes not checked in will be removed.`}})
      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result === true) {
          this.eventProxy.rerunRankings(this.eventConfig.eventId, this.eventConfig.eventRankCircuitIds).subscribe(() => {
            this.getFormat();
          });
        }
      });

    } else { // just go ahead
      this.eventProxy.rerunRankings(this.eventConfig.eventId, this.eventConfig.eventRankCircuitIds).subscribe(() => {
        this.getFormat();
      });
    }

  }
  public addEventRound = () => {
    this.eventProxy.addEventRound(this.eventId).subscribe((success: boolean) => {
      if (success) {
        this.getFormat();
      }
    });
  }

  protected findPoolOptions = () => {
    const poolRoundOptions: LookupItem[] = [];
    this.eventConfig.rounds.map((round: EventRound) => {
      if (round.roundTypeId === 1) {
        // build out the options for pool rounds to use
        poolRoundOptions.push({
          id: round.eventRoundId,
          name: `Round ${round.eventRoundId} (${round.numberOfPools} pools)`,
          lookup: 'poolRounds'
        });
      }
    });
    // one more pass to clone in options for DE rounds
    this.eventConfig.rounds.map((r: EventRound) => {
      r.poolRoundOptions = clone(poolRoundOptions);
      if (r.poolRoundsUsed?.length) {
        r.poolRoundOptions.map((opt: LookupItem) => {
          if (r.poolRoundsUsed.includes(opt.id)) {
            opt.checked = true;
          }
        });
      }
    });
  }

  /////////////////////////////
  // Selection functions
  /////////////////////////////
  ngOnInit(): void {
    this.userProxy.hasRole('admin_event').subscribe((value: boolean) => {
      this.hasEventRole = value;
    });
  }

  public closeModal = () => {
    this.matDialogRef.close();
  }
  ngOnDestroy(): void {
  }

}
