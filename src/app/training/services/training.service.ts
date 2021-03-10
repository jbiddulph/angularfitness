import { Injectable } from "@angular/core";
import { AngularFirestore } from '@angular/fire/firestore';
import { Subject } from "rxjs/Subject";
import { Subscription } from 'rxjs';
import { Exercise } from "src/app/models/exercise.model";
import { map } from 'rxjs/operators';

@Injectable()

export class TrainingService {
    finishedExercisesChanged = new Subject<Exercise[]>();
    exercisesChanged = new Subject<Exercise[]>();
    exerciseChanged = new Subject<Exercise>();
    private availableExercises: Exercise[] = [];
    private runningExercise: Exercise;
    private fbSubs: Subscription[] = [];

    constructor(private db: AngularFirestore) {}

    fetchAvailableExercises() {
        this.fbSubs.push(this.db
        .collection('availableExercises')
        .snapshotChanges()
        .pipe(
          map(docArray => {
            return docArray.map(doc => {
              const data: any = doc.payload.doc.data();
              return {
                id: doc.payload.doc.id,
                ...data
              }
            })
          })
        )
        .subscribe((exercises: Exercise[]) => {
            console.log(exercises);
            this.availableExercises = exercises;
            this.exercisesChanged.next([...this.availableExercises]);
        }));
    }

    startExercise(selectedId: string) {
      this.db.doc('availableExercises/' + selectedId).update({lastSelected: new Date()})
        this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId);
        this.exerciseChanged.next({...this.runningExercise})
    }

    completeExercise() {
        this.addDataToDatabase({
            ...this.runningExercise,
            date: new Date(),
            state: 'completed'
        });
        this.runningExercise = null;
        this.exerciseChanged.next(null);
    }

    cancelExercise(progress: number) {
        this.addDataToDatabase({
            ...this.runningExercise,
            duration: this.runningExercise.duration * (progress / 100),
            calories: this.runningExercise.calories * (progress / 100),
            date: new Date(),
            state: 'cancelled'
        });
        this.runningExercise = null;
        this.exerciseChanged.next(null);
    }

    getRunningExercise() {
        return {...this.runningExercise};
    }

    fetchCompletedOrCancelledExercises() {
        this.fbSubs.push(this.db
            .collection('finishedExercises')
            .valueChanges()
            .subscribe((exercises: Exercise[]) => {
               this.finishedExercisesChanged.next(exercises)
            }));
    }

    private addDataToDatabase(exercise: Exercise) {
        this.db.collection('finishedExercises').add(exercise);

    }

    cancelSubscriptions() {
      this.fbSubs.forEach(sub => {
        sub.unsubscribe();
      })
    }
}
