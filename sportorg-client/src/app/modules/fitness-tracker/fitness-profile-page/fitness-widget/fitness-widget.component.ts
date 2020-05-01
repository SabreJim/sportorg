import {Component, Input, OnInit} from '@angular/core';
import {ExerciseLogResults, FitnessProfile} from "../../../core/models/fitness-objects";
import {AppUser} from "../../../core/models/authentication";
import {ConfirmModalComponent} from "../../../core/modals/confirm-modal/confirm-modal.component";
import {SnackbarService} from "../../../core/services/snackbar.service";
import {FitnessProxyService} from "../../../core/services/fitness-proxy.service";
import {MatDialog} from "@angular/material";

@Component({
  selector: 'app-fitness-widget',
  templateUrl: './fitness-widget.component.html',
  styleUrls: ['./fitness-widget.component.scss']
})
export class FitnessWidgetComponent implements OnInit {

  @Input() set isActive(active: number) {
  }

  @Input() appUser: AppUser;
  @Input() get profile(): FitnessProfile {
    return this._profile;
  } set profile(newProfile: FitnessProfile) {
    if (!newProfile || !newProfile.athleteId) {
      return; // nothing to do yet
    }
    let tempMax = 1;
    newProfile.stats.map((stat) => {
      if (stat.value > tempMax) tempMax = stat.value;
    });
    this.maxStatValue = tempMax;
    this._profile = newProfile;

  }
  private _profile: FitnessProfile;
  public maxStatValue: number = 1;
  public levelColor: string = 'green';

  public resetProfile = () => {
    // confirm resetting profile
    const dialogRef = this.dialog.open(ConfirmModalComponent,
      { width: '400px', height: '250px', data: { title: `Really reset all progress?`,
          message: `This action will completely reset all progress this athlete has recorded. Fitness level and all stats 
          will be reset to their initial values. Are you sure you want to proceed?`}});
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        // send the request to log exercises
        this.fitnessProxy.resetProfile(this.profile.athleteId).subscribe((result: boolean) => {
          if (result) {
            SnackbarService.notify(`The user's profile has been reset.`);
            this.fitnessProxy.getFitnessProfile(this.profile.athleteId);
          }
        });
      }
    });
  }

  public showHint = () => {
    const randomIndex = Math.floor(Math.random() * Math.floor(this.hintMessages.length));

    this.dialog.open(ConfirmModalComponent,
      { width: '450px', height: '300px', data: { title: `Fitness Tracker Tip`,
          message: this.hintMessages[randomIndex], showCancel: false }});
  }

  protected hintMessages = [
    `<strong>Fitness Level</strong>: this is a measure of how often you have recorded exercises. As you
    progress, the amount of exercises to reach the next level will increase. We add up all the
     exercises you logged <strong>in the last week</strong> to see if you have "leveled up".`,
    `<strong>Stats!</strong> Each exercise increases your progress towards one or more stats improving. Stats
      like "Endurance" or "Balance" represent how much you have been working on improving that part of your fitness.
 Just a reminder that this is just a way to track your work; you won't see anything different in the mirror when you level up!`,
    `<strong>Progress</strong>: Progress is tracked two ways. Your "levels" will improve when you go over a threshold 
for that particular stat in a week. Any exercises you log only count towards your progress for one week, so keep exercising
regularly and to make more progress you will need to exercise more and more.`,
    `<strong>Exercise sets</strong>: Each exercise is broken up into "sets". A set is how many times you need to repeat, or 
how long you need to do the exercise, to be able to count the work. Doing one push-up doesn't really register in this tracker. 
So aim to complete a full set. If you can do more, go for two sets. Or come back later and do another set when you are rested.`,
    `<strong>Upcoming features</strong>: We will be adding quick GIFs to show good examples of each exercise. Speak to Jim if
 you think of other features you would like to see added!`
  ];

  constructor(protected fitnessProxy: FitnessProxyService, protected dialog: MatDialog) { }

  ngOnInit() {
  }

}
