import { Component, OnInit } from '@angular/core';
import {ClassItem, ProgramRecord} from "../../core/models/data-objects";
import {StaticValuesService} from "../../core/services/static-values.service";
import {LookupItem} from "../../core/models/rest-objects";
import {Subscription} from "rxjs";
import {ProgramsProxyService} from "../../core/services/programs-proxy.service";
import {DateHeader} from "../../core/sportorg-calendar/sportorg-calendar.component";


@Component({
  selector: 'app-schedule-page',
  templateUrl: './schedule-page.component.html',
  styleUrls: [ '../shared-page.scss','./schedule-page.component.scss']
})
export class SchedulePageComponent implements OnInit {

  constructor(private programService: ProgramsProxyService) { }
  protected programSub: Subscription;
  public allPrograms: ProgramRecord[];
  public currentPrograms: ProgramRecord[];
  public dayColumns: ClassItem[][] = [];
  public weekdays: DateHeader[] = [];
  public maxClassHeight = '100%';
  public currentSeason: LookupItem;

  ngOnInit() {
    this.programSub = this.programService.Programs.subscribe((newPrograms: ProgramRecord[]) => {
      const parsedPrograms = newPrograms.map((program:ProgramRecord) => {
        try {
          program.classes = JSON.parse(program.classes);
        } catch(err) {}
        return program;
      })
      this.allPrograms = parsedPrograms;
      this.applySeason(); // if seasonID has already arrived, update
    });
    this.programService.getPrograms();
    // build date headers
    StaticValuesService.WEEK_DAYS.map((item: LookupItem) => {
      this.weekdays.push({id: item.id, dayName: item.name, specificDate: '', date: ''})
    });
  }

  public selectSeason = (newSeason: LookupItem) => {
    if (newSeason?.id > 0) {
      this.currentSeason = newSeason;
      this.applySeason();
    }
  }

  public applySeason = () => {
    if (this.currentSeason.id > 0 && this.allPrograms?.length) {
      this.currentPrograms = this.allPrograms.filter((program: ProgramRecord) => {
        return program.seasonId === this.currentSeason.id;
      });
      const daysObj = {};
      this.weekdays.map((day) => {
        daysObj[day.id] = [];
      });

      const makeTime = (timeString: string) => {
        const parts: string[] = timeString.split(':');
        if (!timeString || parts.length < 2 || Number.isNaN(timeString)) {
          return '';
        }
        const hourNum = parseInt(parts[0]);
        return hourNum > 12 ? `${hourNum - 12}:${parts[1]}PM` :
          hourNum === 12 ? `${hourNum}:${parts[1]}PM` :`${hourNum}:${parts[1]}AM`;
      }
      this.currentPrograms.map((program: ProgramRecord) => {
        if (program.classes?.length) {
          program.classes.map((currentClass: any) => {
            let foundDay = daysObj[currentClass.dayId];
            const colorMatch = StaticValuesService.ORG_COLORS[program.colorId];
            const classInfo: ClassItem = {
              dayId: currentClass.dayId,
              startTime: makeTime(currentClass.startTime),
              endTime: makeTime(currentClass.endTime),
              colorId: program.colorId || 10,
              bgColor: colorMatch.secondary,
              textColor: colorMatch.primary,
              locationName: program.locationName,
              programName: program.programName,
              startDate: (currentClass.startDate !== this.currentSeason.moreInfo) ? currentClass.startDate : null // if not equal to program startDate
            }
            foundDay.push(classInfo);
          });
        }
      });
      const daysArr: ClassItem[][] = [];
      let maxClasses = 1;
      for (let key in Object.keys(daysObj)) {
        const sortedArr = daysObj[key]
        sortedArr.sort((a: ClassItem, b: ClassItem) => {
            if (a.startTime > b.startTime) return 1;
            if (a.startTime === b.startTime) return 0;
            return -1;
          });
        daysArr.push(sortedArr);
        if (sortedArr.length > maxClasses) {
          maxClasses = sortedArr.length;
        }
      }
      this.maxClassHeight = `${100 / maxClasses}%`;
      this.dayColumns = daysArr;
    }
  }

  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.programSub]);
  }
}
