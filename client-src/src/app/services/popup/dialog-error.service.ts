import { Injectable, Inject, Component } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DialogErrorService {

  constructor(public dialog: MatDialog) { }

  openErrorDialog(errorMessage: string): void {
    const dialogRef = this.dialog.open(DialogError, {
      data: {errorMessage: errorMessage}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}


@Component({
  selector: 'dialog-error',
  templateUrl: 'dialog-error.html',
})
export class DialogError {

  constructor(
    public dialogRef: MatDialogRef<DialogError>,
    @Inject(MAT_DIALOG_DATA) public data: IDialogError, private router: Router) {}

  onHomeClick(): void {
    this.dialogRef.close();
    this.router.navigateByUrl('/naslovna');
  }
  onReturnClick(): void {
    this.dialogRef.close();
  }

}

interface IDialogError {
  message: string;
}
