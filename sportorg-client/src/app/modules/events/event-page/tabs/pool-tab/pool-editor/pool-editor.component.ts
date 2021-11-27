import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit} from "@angular/core";
import {EventsProxyService} from "../../../../../core/services/events/events-proxy.service";
import {PoolsProxyService} from "../../../../../core/services/events/pools-proxy.service";
import {EventPool, EventPoolAthlete, PoolAthleteScore, PoolOrderItem} from "../../../../../core/models/data-objects";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {Subscription} from "rxjs";
import {StaticValuesService} from "../../../../../core/services/static-values.service";
import Timeout = NodeJS.Timeout;

export interface TimerObject {
  minutes: string;
  seconds: string;
  milliseconds: string;
  timerEnded: boolean;
  isRunning: boolean;
  interval?: Timeout;
  currentTime: number;
}


@Component({
  selector: 'app-pool-editor',
  templateUrl: './pool-editor.component.html',
  styleUrls: ['../../../../events-shared.scss',
    './pool-editor.component.scss'],

})
export class PoolEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor ( protected eventProxy: EventsProxyService, protected poolsProxy: PoolsProxyService,
                protected route: ActivatedRoute, private elementRef: ElementRef){}

  public pool: EventPool;
  public poolId = -1;
  public readonly MAX_SCORE = 5;

  protected defaultTime = 180000;
  protected tempTime: number;
  public timerObject: TimerObject = {
    minutes: '3',
    seconds: '00',
    milliseconds: '000',
    timerEnded: false,
    interval: null,
    isRunning: false,
    currentTime: 180000
  };

  protected navSub: Subscription;
  protected poolSub: Subscription;
  protected saveSub: Subscription;

  protected currentMatchIndex = 0;
  public totalMatches = 0;
  public matchesCompleted = 0;
  public currentPeriod = 0;
  public previousMatch: PoolOrderItem;
  public currentMatch: PoolOrderItem;
  public onDeckMatch: PoolOrderItem;
  public nextMatch: PoolOrderItem;
  public athlete1: EventPoolAthlete;
  public athlete2: EventPoolAthlete;

  protected getMatchWithNames = (orderId: number) => {
    if (!this.pool) {
      return null;
    }
    const findMatch = this.pool.boutOrders.find(o => o.scoreOrderNum === orderId);
    if (findMatch) {
      if (this.pool?.athletes?.length) {
        const athlete1 = this.pool.athletes.find(a => a.athleteId === findMatch.athlete1Id);
        const athlete2 = this.pool.athletes.find(a => a.athleteId === findMatch.athlete2Id);
        if (athlete1 && athlete2) {
          findMatch.athlete1FirstName =  athlete1.firstName;
          findMatch.athlete1LastName =  athlete1.lastName.toUpperCase();
          const foundScore1 = athlete1.poolScores.find(s => s.vsAthlete === athlete2.athleteId);
          findMatch.athlete1Score = foundScore1 && foundScore1.score ? foundScore1.score : 0;

          findMatch.athlete2FirstName =  athlete2.firstName;
          findMatch.athlete2LastName =  athlete2.lastName.toUpperCase();
          const foundScore2 = athlete2.poolScores.find(s => s.vsAthlete === athlete1.athleteId);
          findMatch.athlete2Score = foundScore2 && foundScore2.score ? foundScore2.score : 0;
        }
      }
      return findMatch;
    } else {
      return null;
    }
  }

  protected setMatchIndex = (index: number) => {
    this.currentMatchIndex = index;
    // assign match items
    this.currentMatch = this.getMatchWithNames(index);
    this.previousMatch = this.getMatchWithNames(index - 1);
    this.nextMatch = this.getMatchWithNames(index + 1);
    // scan forward for the next not completed match
    let nextIncomplete = -1;
    this.pool.boutOrders.map((order: PoolOrderItem, findIndex: number) => {
      if (findIndex > index && order.completed === 'N' && nextIncomplete === -1) {
        nextIncomplete = findIndex;
      }
    });
    this.onDeckMatch = (nextIncomplete > -1) ? this.getMatchWithNames(nextIncomplete) : null;

    // assign current athletes
    if (this.currentMatch) {
      this.athlete1 = this.pool.athletes.find(a => a.athleteId === this.currentMatch.athlete1Id);
      this.athlete2 = this.pool.athletes.find(a => a.athleteId === this.currentMatch.athlete2Id);
    }
  }
  public getPool = () => {
    if (this.poolId) {
      this.poolSub = this.poolsProxy.getPool(this.poolId).subscribe((pool: EventPool) => {
        if (pool?.poolId) {
          this.pool = pool;
          // read this index in from the query
          this.setMatchIndex(this.pool.currentMatch);

          // update counts
          this.matchesCompleted = (this.pool.boutOrders.filter(o => o.completed === 'Y')).length;
          this.totalMatches = this.pool.boutOrders.length;
        }
      });
    }
  }
  protected clearTimer = () => {
    if (this.timerObject.interval) {
      clearInterval(this.timerObject.interval);
    }
    this.timerObject.isRunning = false;
  }
  public toggleTimer = () => {
    if (this.currentMatch.completed === 'Y') return;
    if (this.timerObject.isRunning) {
      // stop it
      this.clearTimer();
    } else {
      //start it
      this.tempTime = new Date().valueOf();
      this.timerObject.interval = setInterval(() => {
        const timerDiff = new Date().valueOf();
        let newTime = this.timerObject.currentTime - (timerDiff - this.tempTime); // subtract the actual passed time
        if (newTime <= 0) {
          newTime = 0;
          this.clearTimer(); // stop the timer
          this.timerObject.timerEnded = true;
          this.timerObject.milliseconds = '0';
        } else {
          this.tempTime = new Date().valueOf(); // update starting point
          this.timerObject.currentTime = newTime;
        }
        this.updateTimeString();
      }, 87);
      this.timerObject.isRunning = true;
    }
  }
  protected updateTimeString = () => {
    const minutes = Math.floor(this.timerObject.currentTime / 60000);
    const seconds = Math.floor((this.timerObject.currentTime % 60000) / 1000).toFixed(0);
    if (seconds === '60') {
      this.timerObject.seconds = '00';
      this.timerObject.minutes = (this.timerObject.currentTime) ? (minutes + 1).toFixed(0) : '0';
    } else {
      this.timerObject.seconds = seconds;
      this.timerObject.minutes = minutes.toFixed(0);
    }
    this.timerObject.milliseconds = ((this.timerObject.currentTime % 60000) % 1000).toFixed(0);
  }
  public setTimer = (minutes: number) => {
    this.timerObject.currentTime = 60000 * minutes;
    this.defaultTime = this.timerObject.currentTime;
    this.updateTimeString();
    this.timerObject.timerEnded = false;
    this.clearTimer();
  }
  public resetTimer = () => {
    this.timerObject.currentTime = this.defaultTime;
    this.updateTimeString();
    this.timerObject.timerEnded = false;
    this.clearTimer();
  }

  public goToNext = () => {
    this.clearTimer();
    this.setMatchIndex(this.currentMatchIndex + 1);
  }
  public goToPrevious = () => {
    this.clearTimer();
    this.setMatchIndex(this.currentMatchIndex -1);
  }

  public setPeriod = (period: number) => {
    this.currentPeriod = period;
  }

  public addToScore = (event: Event, athleteNum: number, diff: number) => {
    if (this.currentMatch.completed === 'Y') {
      return;
    }
    if (athleteNum === 1) {
      if (this.currentMatch.athlete2Score === this.MAX_SCORE) {
        return; // second athlete already won so ignore score changes
      }
    } else {
      if (this.currentMatch.athlete1Score === this.MAX_SCORE) {
        return; // first athlete already won so ignore score changes
      }
    }
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const updateScores = (id1: number, id2: number, position: string) => {
      const currentScore = position === 'LEFT' ? this.currentMatch.athlete1Score : this.currentMatch.athlete2Score;
      if (currentScore + diff <= this.MAX_SCORE && currentScore + diff >= 0) {
        if (position === 'LEFT') {
          this.currentMatch.athlete1Score = this.currentMatch.athlete1Score + diff;
        } else {
          this.currentMatch.athlete2Score = this.currentMatch.athlete2Score + diff;
        }
        this.pool.athletes.map((a: EventPoolAthlete) => {
          if (a.athleteId === id1) {
            a.poolScores.map((s: PoolAthleteScore) => {
              if (s.vsAthlete === id2) {
                s.score = position === 'LEFT' ? this.currentMatch.athlete1Score : this.currentMatch.athlete2Score;
                s.vsScore = position === 'LEFT' ? this.currentMatch.athlete2Score : this.currentMatch.athlete1Score;
              }
            });
          }
        });
      }
    }
    (athleteNum === 1) ? updateScores(this.currentMatch.athlete1Id, this.currentMatch.athlete2Id, 'LEFT')
                        : updateScores(this.currentMatch.athlete2Id, this.currentMatch.athlete1Id, 'RIGHT');
  }

  public saveScore = () => {
    // determine if the match is "completed"
    if ((this.timerObject.timerEnded && this.currentMatch.athlete1Score !== this.currentMatch.athlete2Score)
      || this.currentMatch.athlete1Score === 5 || this.currentMatch.athlete2Score === 5) {
      this.currentMatch.completed = 'Y';
    }
    this.saveSub = this.poolsProxy.savePoolScore(this.pool.poolId, this.currentMatch).subscribe((success: boolean) => {
      // for multiple referees, re-pull the pool scores after saving
      this.getPool();
    });
  }
  public reopenMatch = () => {
    if (this.currentMatch) {
      this.currentMatch.completed = 'N';
    }
  }

  ngOnInit() {
    this.navSub =  this.route.paramMap.subscribe((params: ParamMap) => {
      const poolId = Number(params.get('poolId'));
      if (poolId && poolId > 0) { // request event content
        this.poolId = poolId;
        this.getPool();
      }
    });
  }
  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.navSub, this.poolSub, this.saveSub]);
    this.clearTimer();
  }
}
