import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Exercise } from 'src/app/models/exercise.model';
import { TrainingService } from '../services/training.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.scss']
})
export class NewTrainingComponent implements OnInit, OnDestroy {
  exercises: Exercise[];
  exerciseSubscription : Subscription;

  constructor(private trainingService: TrainingService, private db: AngularFirestore) { }

  ngOnInit(): void {
    this.exerciseSubscription = this.trainingService.exercisesChanged.subscribe(exercises => { this.exercises = exercises})
    this.trainingService.fetchAvailableExercises();  
  }

  ngOnDestroy() {
    this.exerciseSubscription.unsubscribe();
  }

  onStartTraining(form: NgForm) {
    this.trainingService.startExercise(form.value.exercise);
  }

}
