import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";

interface ResponseFromServerArray {
  photos: ResponseFromServerObject[];
}

interface ResponseFromServerObject {
  "id": number,
  "sol": number,
  "camera": Camera,
  "img_src": string,
  "earth_date": string,
  "rover": {
    "id": number,
    "name": string,
    "landing_date": string,
    "launch_date": string,
    "status": string,
  }
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
  styleUrls: ['./dashboard.component.scss']
})


export class DashboardComponent implements OnInit {

  rover: string = '';
  sol: number = 0;
  maxSol: number = 0;
  response: ResponseFromServerObject[] = [];
  camera: string = '';
  cameras: string[] = [];
  photos: string[] = [];

  APIkey: string = '&api_key=NbgXqrphpscURc7XOcc7vxRS7C7U5Bn9OYKNo9Z5';
  photoUrl: string = 'curiosity/photos?sol=1200';

  constructor(private http: HttpClient) {
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
    this.getPhoto(rover, sol).subscribe(res => {
      this.response = res.photos;
      this.cameras = [...new Set(res.photos.map(element => element.camera.full_name))]
    });
  }

  handlerPhoto(camera: string) {
    this.camera = camera;
    this.photos = [];
    this.photos = this.response.filter(arr => arr.camera.full_name === camera).map(arr => arr.img_src);
  }
}
