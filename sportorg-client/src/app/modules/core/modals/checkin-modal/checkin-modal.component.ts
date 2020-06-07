import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {MemberAttendance, ScreeningAnswer, ScreeningQuestion} from "../../models/data-objects";
import {MembersProxyService} from "../../services/member-proxy.service";
import {Subscription} from "rxjs";
import {StaticValuesService} from "../../services/static-values.service";

@Component({
  selector: 'app-checkin-modal',
  templateUrl: './checkin-modal.component.html',
  styleUrls: ['./checkin-modal.component.scss']
})
export class CheckinModalComponent implements OnInit, OnDestroy {
  constructor(@Inject(MAT_DIALOG_DATA) public data: MemberAttendance,
              public matDialogRef: MatDialogRef<CheckinModalComponent>,
              public memberService: MembersProxyService) {
  }
  ngOnInit() {
    if (this.data && this.data.memberId) {
      this.currentMember = this.data;
    }
    this.questionSub = this.memberService.getScreeningQuestions().subscribe((questions: ScreeningQuestion[]) => {
      this.questions = questions;
    });
  }
  protected questionSub: Subscription;
  public currentMember: MemberAttendance;
  public questions: ScreeningQuestion[];
  public allAnswered: boolean = false;

  protected userAnswers: ScreeningAnswer[];
  public updateAnswers = () => {
    this.userAnswers = [];
    let anyUnanswered = false;
    this.questions.map((question: ScreeningQuestion) => {
      if (question.answers.length > 1) {
        // answer is required
        if (!question.answerValue) {
          anyUnanswered = true;
        } else { // main question answer
          this.userAnswers.push({questionId: question.questionId, answerId: question.answerValue});
        }
      }
      question.childQuestions.map((subQ: ScreeningQuestion) => {
        if (subQ.answers.length > 1) {
          // answer is required
          if (!subQ.answerValue) {
            anyUnanswered = true;
          } else { // main question answer
            this.userAnswers.push({questionId: subQ.questionId, answerId: subQ.answerValue});
          }
        }
      });
    });
    this.allAnswered = !anyUnanswered;
  }


  public saveAttendance = () => {
    if (this.allAnswered) {
      this.currentMember.screeningAnswers = this.userAnswers;
      this.matDialogRef.close(this.currentMember);
    }
  }

  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.questionSub]);
  }

}
