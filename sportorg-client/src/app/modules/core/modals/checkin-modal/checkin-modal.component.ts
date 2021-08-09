import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {MemberAttendance, ScreeningAnswer, ScreeningQuestion} from "../../models/data-objects";
import {MembersProxyService} from "../../services/member-proxy.service";
import {Subscription} from "rxjs";
import {StaticValuesService} from "../../services/static-values.service";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-checkin-modal',
  templateUrl: './checkin-modal.component.html',
  styleUrls: ['./checkin-modal.component.scss']
})
export class CheckinModalComponent implements OnInit, OnDestroy {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public matDialogRef: MatDialogRef<CheckinModalComponent>,
              public memberService: MembersProxyService) {
  }
  ngOnInit() {

    if (this.data && this.data.member && this.data.member.memberId) {
      this.currentMember = this.data.member;
      this.questionGroup = this.data.questions;
      this.title = this.data.title;
    }
    this.questionSub = this.memberService.getScreeningQuestions(this.questionGroup).subscribe((questions: ScreeningQuestion[]) => {
      this.questions = questions;
      this.currentQuestionIndex = 0;
      this.currentQuestionIndex = 0;
    });
  }
  protected questionGroup: string;
  protected questionSub: Subscription;
  public title: string;
  public currentMember: MemberAttendance;
  public questions: ScreeningQuestion[];
  public allAnswered: boolean = false;
  public isMobile = StaticValuesService.isMobile;
  public currentQuestionIndex = 0;
  public currentSubQuestionIndex = 0;
  public stepperRadioGroup = new FormControl();
  public stepperSubRadioGroup = new FormControl();

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

  public updateSingleAnswer = (isSubQuestion: boolean) => {
    this.updateAnswers();
    const currentQuestion = this.questions[this.currentQuestionIndex];
    if (isSubQuestion) {
      if (this.currentSubQuestionIndex < currentQuestion.childQuestions.length - 1) {
        this.currentSubQuestionIndex = this.currentSubQuestionIndex + 1; // advance one subquestion
      } else {
        if (this.currentQuestionIndex < this.questions.length - 1) {
          this.currentQuestionIndex = this.currentQuestionIndex + 1; // advance a major question
          this.currentSubQuestionIndex = 0; // reset sub index
        } else {
          this.currentQuestionIndex = this.questions.length;
        }
      }
    } else {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex = this.currentQuestionIndex + 1; // advance one major question
      } else {
        this.currentQuestionIndex = this.questions.length;
      }
    }
    if (this.questions[this.currentQuestionIndex]) {
      this.stepperRadioGroup.reset();
      if (this.questions[this.currentQuestionIndex].childQuestions && this.questions[this.currentQuestionIndex].childQuestions.length) {
        this.stepperSubRadioGroup.reset();
      }
    }
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
