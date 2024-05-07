import firebase from "firebase/compat";

export class FirebaseUserModel {
    public uid: string;
    public email: string | null; 
  
    constructor(firebaseUser: firebase.User) {
      this.uid = firebaseUser.uid;
      this.email = firebaseUser.email;
    }
  }
  