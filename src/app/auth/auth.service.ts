import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { AuthData } from "./auth-model";
import { User } from "./user.model";
import { AngularFireAuth } from "@angular/fire/auth";
import { TrainingService } from '../training/services/training.service';

@Injectable()
export class AuthService {
    authChange = new Subject<boolean>();
    private isAuthenticated = false;

    constructor(
      private router: Router,
      private afAuth: AngularFireAuth,
      private trainingService: TrainingService
    ) { }

    initAuthListener() {
      this.afAuth.authState.subscribe(user => {
        if(user) {
          this.isAuthenticated = true;
          this.authChange.next(true);
          this.router.navigate(['/training']);
        } else {
          this.trainingService.cancelSubscriptions();
          this.authChange.next(false);
          this.router.navigate(['/login']);
          this.isAuthenticated = false;
        }
      });
    }

    registerUser(authData: AuthData) {
        this.afAuth.createUserWithEmailAndPassword(
          authData.email,
          authData.password
          ).then(result => {
            console.log(result);
          })
          .catch(err => {
            console.log(err);
          })
    }

    login(authData: AuthData) {
        this.afAuth.signInWithEmailAndPassword(
          authData.email,
          authData.password
          ).then(result => {
            console.log(result);
          })
          .catch(err => {
            console.log(err);
          })
    }

    logout() {
      this.afAuth.signOut();
    }


    isAuth() {
        return this.isAuthenticated;
    }

}
