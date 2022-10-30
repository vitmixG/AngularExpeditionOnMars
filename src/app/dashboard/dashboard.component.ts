import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {animate, style, transition, trigger} from "@angular/animations";
import {NgxSpinnerService} from "ngx-spinner";

interface ResponseFromServerArray {
  photos: ResponseFromServerObject[];
}

interface ResponseFromServerObject {
  "id": number,
  "sol": number,
  "camera": Camera,
  "img_src": string,
}

interface Camera {
    "id": number,
    "name": string,
    "rover_id": number,
    "full_name": string,
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition('void => *', [
        style({ opacity: 0, transform: "translateY(20)" }),
        animate(2500, style({ opacity: 100, transform: "translateY(-20)" }) ),
      ]),
    ])
  ],
})


export class DashboardComponent implements OnInit {

  rover: string = '';
  sol: number = 0;
  maxSol: number = 0;
  response: ResponseFromServerObject[] = [];
  camera: string = '';
  cameras: string[] = [];
  photos: string[] = [];
  visibleItems: number = 6;
  APIkey: string = '&api_key=NbgXqrphpscURc7XOcc7vxRS7C7U5Bn9OYKNo9Z5';
  photoUrl: string = 'curiosity/photos?sol=1200';
  isLoading: boolean = false;
  hasError: boolean = false;
  error: string = '';

  constructor(private http: HttpClient, private spinner: NgxSpinnerService) {
    this.photoUrl = 'https://api.nasa.gov/mars-photos/api/v1/rovers/';
  }

  ngOnInit(): void {

  }

  private getMaxSol(rover: string) {
    const spiritLandingDate: number = 2004 * 365 + 1 * 31 + 4;
    const curiosityLandingDate: number = 2012 * 365 + 8 * 31 + 6;
    const opportunityLandingDate: number = 2004 * 365 + 1 * 31 + 25;
    const currentDate = new Date;
    const currentDateInDay =
      currentDate.getFullYear()
      * 365 + currentDate.getMonth()
      * 31 + currentDate.getDate();

    switch (rover) {
      case 'curiosity':
        return currentDateInDay - curiosityLandingDate;
      case 'spirit':
        return currentDateInDay - spiritLandingDate;
      case 'opportunity':
        return currentDateInDay - opportunityLandingDate;
      default:
        return 0;
    }
  }

  getPhoto(rover: string, sol: number) {
    return this.http.get<ResponseFromServerArray>(this.photoUrl + rover + '/photos?sol=' + sol + '&' + this.APIkey )
  }

  handlerRover(rover: string) {
    this.photos = [];
    this.rover = rover;
    this.sol = 0;
    this.maxSol = this.getMaxSol(rover)
    this.camera = '';
    this.cameras = [];
  }

  handlerSol(rover: string, sol: number) {
    this.photos = [];
    this.camera = '';
    this.isLoading = true;
    this.getPhoto(rover, sol).subscribe(res => {
      this.spinner.show("mySpinner", {
        type: "line-scale-party",
        size: "default",
        color: "white"});
      this.response = res.photos;
      this.cameras = [...new Set(res.photos.map(element => element.camera.full_name))]
    }, error => {
      this.hasError = true;
      this.error = error;
    },
      () => { this.spinner.hide(); this.isLoading = false; });
  }

  handlerPhoto(camera: string) {
    this.visibleItems = 6;
    this.camera = camera;
    this.photos = [];
    this.photos = this.response.filter(arr => arr.camera.full_name === camera).map(arr => arr.img_src);
  }

  seeMore() {
    this.visibleItems += 6;
  }
}
